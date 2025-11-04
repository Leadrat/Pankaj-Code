from flask import Blueprint, request
import os
import joblib
import pandas as pd

from utils.data_loader import load_fertilizer_data

recommend_bp = Blueprint('recommend', __name__)

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml_models')
MODEL_PATH = os.path.join(MODEL_DIR, 'fertilizer_model.pkl')


def _ensure_model():
    if not os.path.exists(MODEL_PATH):
        from ml_models.train_fertilizer_model import train_and_save
        os.makedirs(MODEL_DIR, exist_ok=True)
        train_and_save(MODEL_PATH)
    obj = joblib.load(MODEL_PATH)
    return obj


@recommend_bp.route('/api/recommend_fertilizer', methods=['POST'])
def recommend_fertilizer():
    data = request.get_json(force=True) or {}
    crop = (data.get('crop') or '').strip()
    soil_type = (data.get('soil_type') or '').strip()
    moisture = data.get('moisture')  # optional, may be None
    state = (data.get('state') or '').strip()

    if not crop:
        return {"error": "Missing required field: crop"}, 400

    model = _ensure_model()
    by_cs = model.get('by_crop_state')
    by_c = model.get('by_crop')

    # Try crop+state first
    rec = None
    if state:
        m = by_cs[(by_cs['Crop'].str.lower() == crop.lower()) & (by_cs['State'].str.lower() == state.lower())]
        if not m.empty:
            row = m.iloc[0]
            rec = (row['Fertilizer'], float(row['YieldIncrease']))
    # Fallback: crop only
    if rec is None:
        m = by_c[(by_c['Crop'].str.lower() == crop.lower())]
        if not m.empty:
            row = m.iloc[0]
            rec = (row['Fertilizer'], float(row['YieldIncrease']))

    if rec is None:
        return {"error": "No recommendation available for the given inputs."}, 404

    fert, gain = rec
    explanation = "Recommended based on historical average yield increase for similar records"
    addons = []
    if soil_type:
        addons.append(f"soil: {soil_type}")
    if moisture is not None:
        try:
            addons.append(f"moisture: {float(moisture):.0f}%")
        except Exception:
            addons.append("moisture: provided")
    if state:
        addons.append(f"state: {state}")
    if addons:
        explanation += " (" + ", ".join(addons) + ")"

    return {
        "recommended_fertilizer": str(fert),
        "expected_gain": round(gain, 2),
        "unit": "yield increase (dataset units)",
        "explanation": explanation
    }

from flask import Blueprint, request
import os
import joblib
import pandas as pd

from utils.data_loader import load_crop_data, load_rainfall_data, load_climate_data

predict_bp = Blueprint('predict', __name__)

MODEL_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ml_models')
MODEL_PATH = os.path.join(MODEL_DIR, 'yield_model.pkl')


def _ensure_model():
    if not os.path.exists(MODEL_PATH):
        # Train on the fly
        from ml_models.train_yield_model import train_and_save
        os.makedirs(MODEL_DIR, exist_ok=True)
        train_and_save(MODEL_PATH)
    obj = joblib.load(MODEL_PATH)
    return obj.get('pipeline'), obj.get('score')


def _default_features(state: str, crop: str):
    # If user does not pass rainfall/temperature, derive typical values from data
    rain = load_rainfall_data().copy()
    clim = load_climate_data().copy()
    feats = {}
    if not rain.empty:
        r = rain.copy()
        if state:
            r = r[r['State'].str.contains(state, case=False, na=False)]
        feats['Rainfall'] = float(r['Rainfall'].mean()) if not r.empty else None
    else:
        feats['Rainfall'] = None
    if not clim.empty:
        c = clim.copy()
        if state:
            c = c[c['State'].str.contains(state, case=False, na=False)]
        feats['AvgTemp'] = float(c['AvgTemp'].mean()) if not c.empty else None
    else:
        feats['AvgTemp'] = None
    return feats


@predict_bp.route('/api/predict_yield', methods=['POST'])
def predict_yield():
    data = request.get_json(force=True) or {}
    state = (data.get('state') or '').strip()
    crop = (data.get('crop') or '').strip()
    rainfall = data.get('rainfall')
    temperature = data.get('temperature') or data.get('avgtemp')

    if not state or not crop:
        return {"error": "Missing required fields: state, crop"}, 400

    pipe, score = _ensure_model()

    # Fill defaults if missing
    if rainfall is None or temperature is None:
        feats = _default_features(state, crop)
        rainfall = feats['Rainfall'] if rainfall is None else rainfall
        temperature = feats['AvgTemp'] if temperature is None else temperature

    try:
        X = pd.DataFrame([{
            'State': state,
            'Crop': crop,
            'Rainfall': float(rainfall) if rainfall is not None else 0.0,
            'AvgTemp': float(temperature) if temperature is not None else 0.0,
        }])
        y_pred = float(pipe.predict(X)[0])
    except Exception as e:
        return {"error": f"Prediction failed: {e}"}, 500

    # confidence: clamp model score to [0,1] if available
    conf = score
    if conf is None:
        conf = 0.5
    try:
        conf = max(0.0, min(1.0, float(conf)))
    except Exception:
        conf = 0.5

    return {
        "predicted_yield": round(y_pred, 2),
        "unit": "t/ha",
        "confidence": round(conf, 3)
    }

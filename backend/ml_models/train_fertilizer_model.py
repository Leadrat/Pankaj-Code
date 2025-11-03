import os
import joblib
import pandas as pd
from utils.data_loader import load_fertilizer_data

MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, 'fertilizer_model.pkl')


def train_and_save(model_path: str = MODEL_PATH):
    df = load_fertilizer_data().copy()
    if df.empty:
        raise RuntimeError('No data available to train fertilizer model')
    # Expect columns: State, Crop, Fertilizer, YieldIncrease
    # Build a simple lookup: for each (Crop, State) choose Fertilizer with max avg YieldIncrease
    grp = (
        df.groupby(['Crop', 'State', 'Fertilizer'], as_index=False)['YieldIncrease']
        .mean()
        .sort_values(['Crop', 'State', 'YieldIncrease'], ascending=[True, True, False])
    )
    # Take top per (Crop, State)
    best = grp.groupby(['Crop', 'State'], as_index=False).first()
    # Also compute crop-only fallback
    grp2 = (
        df.groupby(['Crop', 'Fertilizer'], as_index=False)['YieldIncrease']
        .mean()
        .sort_values(['Crop', 'YieldIncrease'], ascending=[True, False])
    )
    best_crop = grp2.groupby(['Crop'], as_index=False).first()

    model_obj = {
        'by_crop_state': best,
        'by_crop': best_crop,
    }
    joblib.dump(model_obj, model_path)
    return model_path


if __name__ == '__main__':
    path = train_and_save()
    print(f'Trained fertilizer recommender saved to {path}')

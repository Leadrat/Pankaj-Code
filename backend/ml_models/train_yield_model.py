import os
import joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score

from utils.data_loader import load_crop_data, load_rainfall_data, load_climate_data

MODEL_DIR = os.path.dirname(__file__)
MODEL_PATH = os.path.join(MODEL_DIR, 'yield_model.pkl')


def build_training_frame():
    crop = load_crop_data().copy()
    rain = load_rainfall_data().copy()
    clim = load_climate_data().copy()

    # Aggregate rainfall by State-Year
    if 'Rainfall' in rain.columns:
        rain_agg = rain.groupby(['Year', 'State'], as_index=False)['Rainfall'].mean()
    else:
        rain_agg = pd.DataFrame(columns=['Year', 'State', 'Rainfall'])

    # Aggregate climate temperature by State-Year
    if 'AvgTemp' in clim.columns:
        clim_agg = clim.groupby(['Year', 'State'], as_index=False)['AvgTemp'].mean()
    else:
        clim_agg = pd.DataFrame(columns=['Year', 'State', 'AvgTemp'])

    df = crop.merge(rain_agg, on=['Year', 'State'], how='left')
    df = df.merge(clim_agg, on=['Year', 'State'], how='left')

    # Ensure target exists
    if 'Yield' not in df.columns:
        df['Yield'] = df.apply(lambda r: (r['Production'] / r['Area']) if r.get('Area', 0) else 0, axis=1)

    # Minimal cleaning
    df = df.dropna(subset=['Yield'])
    # Fill numeric predictors with group means
    for col in ['Rainfall', 'AvgTemp']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    df['Rainfall'] = df['Rainfall'].fillna(df['Rainfall'].median())
    df['AvgTemp'] = df['AvgTemp'].fillna(df['AvgTemp'].median())

    return df


def train_and_save(model_path: str = MODEL_PATH):
    df = build_training_frame()
    if df.empty:
        raise RuntimeError('No data available to train yield model')

    X = df[['State', 'Crop', 'Rainfall', 'AvgTemp']].copy()
    y = df['Yield'].values

    cat_features = ['State', 'Crop']
    num_features = ['Rainfall', 'AvgTemp']

    pre = ColumnTransformer([
        ('cat', OneHotEncoder(handle_unknown='ignore'), cat_features)
    ], remainder='passthrough')

    model = RandomForestRegressor(n_estimators=120, random_state=42)

    pipe = Pipeline([
        ('pre', pre),
        ('model', model)
    ])

    pipe.fit(X, y)

    # quick score (in-sample R^2)
    try:
        score = r2_score(y, pipe.predict(X))
    except Exception:
        score = None

    joblib.dump({'pipeline': pipe, 'score': score}, model_path)
    return model_path, score


if __name__ == '__main__':
    path, s = train_and_save()
    print(f'Trained yield model saved to {path} (R2={s:.3f if s is not None else "NA"})')

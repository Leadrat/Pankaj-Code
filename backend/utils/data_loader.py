import os
import pandas as pd

_CACHE = {}
BASE_DIR = os.path.dirname(os.path.dirname(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')


def _load_csv(name: str, dtype=None):
    if name in _CACHE:
        return _CACHE[name]
    path = os.path.join(DATA_DIR, name)
    if not os.path.exists(path):
        raise FileNotFoundError(f"Missing data file: {path}")
    df = pd.read_csv(path, encoding='utf-8', low_memory=False, dtype=dtype)
    _CACHE[name] = df
    return df


def load_all_india_rainfall_history():
    # File: All_India_rainfall_act_dep_1901_2015.csv
    # Columns include:
    # YEAR, Actual Rainfall: JUN,JUL,AUG,SEPT,JUN-SEPT,
    # Departure Percentage: JUN,JUL,AUG,SEP,JUN-SEPT
    df = _load_csv('All_India_rainfall_act_dep_1901_2015.csv')
    # Normalize column names we will use
    ren = {
        'YEAR': 'Year',
        'Actual Rainfall: JUN': 'Jun',
        'Actual Rainfall: JUL': 'Jul',
        'Actual Rainfall: AUG': 'Aug',
        'Actual Rainfall: SEPT': 'Sep',
        'Actual Rainfall: JUN-SEPT': 'MonsoonTotal',
        'Departure Percentage: JUN': 'Dep_Jun',
        'Departure Percentage: JUL': 'Dep_Jul',
        'Departure Percentage: AUG': 'Dep_Aug',
        'Departure Percentage: SEP': 'Dep_Sep',
        'Departure Percentage: JUN-SEPT': 'Dep_Monsoon',
    }
    for k, v in ren.items():
        if k in df.columns:
            df.rename(columns={k: v}, inplace=True)
    # Ensure numeric types
    for col in ['Year','Jun','Jul','Aug','Sep','MonsoonTotal','Dep_Jun','Dep_Jul','Dep_Aug','Dep_Sep','Dep_Monsoon']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    return df


def load_crop_data():
    df = _load_csv('crop_production.csv')
    # Ensure expected columns
    # Columns: Year, State, Crop, Area, Production, Soil, Yield
    if 'Yield' not in df.columns:
        df['Yield'] = df.apply(lambda r: (r['Production'] / r['Area']) if r.get('Area', 0) else 0, axis=1)
    return df


def load_rainfall_data():
    # Columns: Year, State, District, Rainfall
    return _load_csv('rainfall.csv')


def load_fertilizer_data():
    # Columns: State, Crop, Fertilizer, YieldIncrease
    return _load_csv('fertilizer.csv')


def load_climate_data():
    # Columns: Year, State, AvgTemp, Crop, Yield
    return _load_csv('climate.csv')


def load_crop_recommendation_data():
    # Columns: N, P, K, pH, Rainfall, Temperature, Soil, Crop
    return _load_csv('crop_recommendation.csv')


def load_crop_production_detailed():
    # Columns: Crop,Crop_Year,Season,State,Area,Production,Annual_Rainfall,Fertilizer,Pesticide,Yield
    df = _load_csv('crop_production_detailed.csv')
    # Normalize column names for numeric types
    for col in ['Crop_Year', 'Area', 'Production', 'Annual_Rainfall', 'Fertilizer', 'Pesticide', 'Yield']:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors='coerce')
    return df

import re

CROPS = [
    'wheat', 'rice', 'maize', 'cotton', 'sugarcane', 'pulses', 'millet', 'mustard', 'kiwi'
]
CROP_SYNONYMS = {
    'paddy': 'rice',
    'paddy rice': 'rice'
}
STATES = [
    'andhra pradesh','arunachal pradesh','assam','bihar','chhattisgarh','goa','gujarat','haryana','himachal pradesh','jharkhand','karnataka','kerala','madhya pradesh','maharashtra','manipur','meghalaya','mizoram','nagaland','odisha','punjab','rajasthan','sikkim','tamil nadu','telangana','tripura','uttar pradesh','uttarakhand','west bengal'
]
SOILS = ['alluvial', 'black', 'red', 'laterite', 'arid', 'saline', 'peaty', 'marshy', 'loam', 'loamy']
FERTILIZERS = ['urea', 'dap', 'npk', 'mop', 'compost', 'manure']


def _find_in_list(text: str, items: list[str]):
    for it in items:
        if re.search(rf"\b{re.escape(it)}\b", text):
            return it
    return None


def normalize_crop(name: str | None):
    if not name:
        return None
    low = name.lower().strip()
    if low in CROP_SYNONYMS:
        return CROP_SYNONYMS[low]
    return low


def parse_question(q: str):
    text = (q or '').lower().strip()
    # find crop/state/soil/fert names
    crop = normalize_crop(_find_in_list(text, CROPS))
    state = _find_in_list(text, STATES)
    soil = _find_in_list(text, SOILS)
    fert = _find_in_list(text, FERTILIZERS)

    ask_top = bool(re.search(r"\btop\b|\bhighest\b|\bbest\b", text))
    ask_rainfall = bool(re.search(r"rainfall|monsoon|precip", text))
    ask_fertilizer = bool(re.search(r"fertilizer|manure|dap|npk|urea|mop", text))
    ask_schedule = bool(re.search(r"\bschedule\b|\bdose\b|\bsplit\b|\bbasal\b|\btillering\b|\bpanicle\b", text))
    ask_climate = bool(re.search(r"climate|warming|temperature|heatwave|heat stress", text))
    ask_bubble = bool(re.search(r"\bbubble\b|\bscatter\b", text))
    ask_soil_best = bool(re.search(r"best\s+soil|which\s+soil\s+is\s+best|suitable\s+soil", text))
    ask_trend = bool(re.search(r"year[- ]?wise|yearly|trend", text))
    prefer_detailed = bool(re.search(r"detailed", text))
    ask_predict = bool(re.search(r"predict|forecast", text))
    ask_recommend = bool(re.search(r"recommend", text))

    # numbers like 'top 5', 'last 5 years'
    m_top = re.search(r"top\s+(\d+)", text)
    top_n = int(m_top.group(1)) if m_top else None

    m_last = re.search(r"last\s+(\d+)\s+years?", text)
    last_n_years = int(m_last.group(1)) if m_last else None

    # numeric features from free text
    # rainfall in mm (e.g., 650 mm or rainfall 650)
    rainfall_val = None
    m_rf_mm = re.search(r"(\d+(?:\.\d+)?)\s*mm\b", text)
    if m_rf_mm:
        try:
            rainfall_val = float(m_rf_mm.group(1))
        except Exception:
            pass
    if rainfall_val is None:
        m_rf = re.search(r"rainfall\D*(\d+(?:\.\d+)?)", text)
        if m_rf:
            try:
                rainfall_val = float(m_rf.group(1))
            except Exception:
                pass

    # temperature in C (e.g., 27C, 27°c, temperature 27)
    temperature_val = None
    m_tc = re.search(r"(\d+(?:\.\d+)?)\s*°?c\b", text)
    if m_tc:
        try:
            temperature_val = float(m_tc.group(1))
        except Exception:
            pass
    if temperature_val is None:
        m_t = re.search(r"temperature\D*(\d+(?:\.\d+)?)", text)
        if m_t:
            try:
                temperature_val = float(m_t.group(1))
            except Exception:
                pass

    # moisture percent
    moisture_val = None
    m_moist = re.search(r"(\d+(?:\.\d+)?)\s*%", text)
    if m_moist:
        try:
            moisture_val = float(m_moist.group(1))
        except Exception:
            pass

    return {
        'raw': q,
        'crop': crop.title() if crop else None,
        'state': state.title() if state else None,
        'soil': 'loamy' if soil == 'loam' else soil,  # normalize
        'fertilizer': fert,
        'ask_top': ask_top,
        'ask_rainfall': ask_rainfall,
        'ask_fertilizer': ask_fertilizer,
        'ask_schedule': ask_schedule,
        'ask_climate': ask_climate,
        'ask_bubble': ask_bubble,
        'ask_soil_best': ask_soil_best,
        'ask_trend': ask_trend,
        'prefer_detailed': prefer_detailed,
        'ask_predict': ask_predict,
        'ask_recommend': ask_recommend,
        'top_n': top_n,
        'last_n_years': last_n_years,
        'features': {
            'rainfall': rainfall_val,
            'temperature': temperature_val,
            'moisture': moisture_val,
        }
    }

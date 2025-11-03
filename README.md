# Agri Insight

AI-powered full-stack web application to ask agriculture-related questions and get data-driven insights with charts.

## Tech Stack
- Frontend: React (Vite) + Tailwind + Chart.js via react-chartjs-2
- Backend: Flask (Python), Pandas, NumPy, scikit-learn

## Quickstart (Windows)

### 1) Backend
```
# Recommended: Python 3.11 virtual env
py -3.11 -m venv .venv311
\.venv311\Scripts\Activate.ps1
python -m pip install --upgrade pip setuptools wheel
pip install -r backend/requirements.txt
python backend/app.py
```
Backend runs at http://localhost:5001

### 2) Frontend
```
cd frontend
npm install
npm run dev
```
Frontend runs at http://localhost:5173 (auto-opens). It calls the backend at http://localhost:5001 by default.

## APIs

### POST /api/analyze
```
{ "question": "Which crops grow best in loamy soil in Haryana?" }
```
Response
```
{
  "answer": "...",
  "chartData": { "labels": [..], "values": [..], "type": "bar" }
}
```

### POST /api/predict_yield (ML)
Input
```
{ "state": "Punjab", "crop": "Wheat", "rainfall": 650, "temperature": 27 }
```
Response
```
{ "predicted_yield": 4.62, "unit": "t/ha", "confidence": 0.83 }
```

### POST /api/recommend_fertilizer (ML)
Input
```
{ "crop": "Rice", "state": "Punjab", "soil_type": "Loamy", "moisture": 45 }
```
Response
```
{ "recommended_fertilizer": "Urea", "expected_gain": 1.8, "unit": "yield increase (dataset units)", "explanation": "..." }
```

## Example Questions
- Predict wheat yield in Punjab at 650 mm rainfall and 27C.
- Recommend fertilizer for rice in loamy soil (moisture 45%) in Punjab.
- How does rainfall affect wheat yield in Punjab?
- Which state has the highest average temperature over the years?
- Year-wise yield trend for rice in Karnataka from the detailed dataset.

## Notes
- Use Python 3.11 for ML dependencies (scikit-learn wheels). If needed, activate with `\.venv311\Scripts\Activate.ps1`.
- Small sample datasets provided in backend/data for immediate testing. Keep the same columns used in utils/data_loader.py.
- CORS enabled for local development.

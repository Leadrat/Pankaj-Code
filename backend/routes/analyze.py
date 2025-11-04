from flask import Blueprint, request, jsonify, current_app
import pandas as pd
import numpy as np
from utils.data_loader import (
    load_crop_data,
    load_rainfall_data,
    load_fertilizer_data,
    load_climate_data,
    load_crop_production_detailed,
    load_all_india_rainfall_history,
)
from utils.nlp_parser import parse_question
from routes.predict_yield import predict_yield as _predict_yield_api
from routes.recommend_fertilizer import recommend_fertilizer as _recommend_fertilizer_api

analyze_bp = Blueprint('analyze', __name__)


@analyze_bp.route('/api/analyze', methods=['POST'])
def analyze():
    data = request.get_json(force=True) or {}
    question = (data.get('question') or '').strip()
    if not question:
        return jsonify({"error": "Question is required"}), 400

    intent = parse_question(question)

    try:
        response = dispatch_analysis(intent)
        return jsonify(response)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def dispatch_analysis(intent: dict) -> dict:
    crop_df = load_crop_data()

    # Normalize
    state = intent.get('state')
    crop = intent.get('crop')
    soil = intent.get('soil')
    fertilizer = intent.get('fertilizer')
    wants_top = intent.get('top_n') or 5 if intent.get('ask_top') else None

    # ML intents routing
    if intent.get('ask_predict'):
        # Build a request object for the existing Flask handler
        req = {
            'state': state or '',
            'crop': crop or '',
            'rainfall': (intent.get('features') or {}).get('rainfall'),
            'temperature': (intent.get('features') or {}).get('temperature'),
        }
        with current_app.test_request_context(json=req):
            resp = _predict_yield_api()
        # If handler returns tuple (data, status)
        data_out = resp[0] if isinstance(resp, tuple) else resp
        if isinstance(data_out, dict) and 'predicted_yield' in data_out:
            answer = (
                f"Predicted yield for {crop or 'the crop'} in {state or 'the selected region'} is {data_out['predicted_yield']} {data_out.get('unit','units')}. "
                f"Confidence: {data_out.get('confidence','NA')}. "
                "Prediction uses state, crop, rainfall, and temperature features learned from your datasets."
            )
            # Provide a tiny bar-style dataset (predicted only)
            return {
                'answer': answer,
                'chartData': {
                    'labels': ['Predicted'],
                    'values': [data_out['predicted_yield']],
                    'type': 'bar',
                    'title': 'Predicted Yield'
                },
                'predicted_yield': data_out['predicted_yield'],
                'unit': data_out.get('unit')
            }
        # error passthrough
        return {'answer': data_out.get('error', 'Prediction failed.'), 'chartData': {'labels': [], 'values': []}}

    if intent.get('ask_recommend') and (intent.get('ask_fertilizer') or 'fertilizer' in (intent.get('raw') or '').lower()):
        req = {
            'crop': crop or '',
            'soil_type': intent.get('soil') or '',
            'moisture': (intent.get('features') or {}).get('moisture'),
            'state': state or ''
        }
        with current_app.test_request_context(json=req):
            resp = _recommend_fertilizer_api()
        data_out = resp[0] if isinstance(resp, tuple) else resp
        if isinstance(data_out, dict) and 'recommended_fertilizer' in data_out:
            answer = (
                f"Recommended fertilizer for {crop or 'the crop'}{(' in ' + state) if state else ''}: {data_out['recommended_fertilizer']}. "
                f"Reason: {data_out.get('explanation','Based on historical averages')}."
            )
            return {
                'answer': answer,
                'chartData': {'labels': [], 'values': []},
                'recommended_fertilizer': data_out['recommended_fertilizer']
            }
        return {'answer': data_out.get('error', 'No recommendation available.'), 'chartData': {'labels': [], 'values': []}}

    # 0) Fertilizer schedule intent (rules-based fallback)
    if intent.get('ask_schedule'):
        c = (crop or '').lower() if crop else ''
        if c in ['rice']:
            answer = (
                "Recommended fertilizer schedule for rice (general guideline): Apply full P and K as basal at transplanting, and split N as 50% basal, 25% at active tillering (~20–25 DAT), and 25% at panicle initiation (~45 DAT). "
                "As an indicative dose, target around 100:50:50 kg/ha of N:P2O5:K2O using common sources like Urea (N), DAP (P), and MOP (K), adjusting to soil test values and variety duration. "
                "Maintain adequate moisture during top-dress applications and avoid N just before heavy rains to reduce losses. "
                "Treat this as a baseline; refine with local soil tests, water regime, and state recommendations for precise dosing."
            )
        else:
            answer = (
                "Fertilizer schedule guidance currently uses a generic fallback. Provide the crop name for a more tailored plan, or supply a schedule dataset for precise, region-specific doses and timings. "
                "As a baseline approach: apply P and K as basal at planting, and split N into 2–3 applications across early vegetative and pre-flowering stages. "
                "Use soil test results to fine-tune kg/ha targets and synchronize top-dressing with irrigation to minimize volatilization."
            )
        return {"answer": answer, "chartData": {"labels": [], "values": []}}

    # 1) Best soil for a given crop
    if intent.get('ask_soil_best') and (intent.get('crop')):
        df = crop_df.copy()
        crop = intent.get('crop')
        if df['Crop'].str.contains(crop, case=False, na=False).any():
            sub = df[df['Crop'].str.contains(crop, case=False, na=False)]
            grp = sub.groupby('Soil', as_index=False)['Yield'].mean().sort_values('Yield', ascending=False)
            labels = grp['Soil'].tolist()
            values = grp['Yield'].round(2).tolist()
            top_soil = labels[0] if labels else None
            if not labels:
                return {"answer": f"No soil records found for {crop} in the dataset.", "chartData": {"labels": [], "values": []}}
            answer = (
                f"Best soils for {crop} by average yield in the dataset: {', '.join([f'{l} ({v})' for l, v in zip(labels[:5], values[:5])])}. "
                "We filtered records for the crop and ranked soil types by mean yield across available entries. "
                f"The top-ranked soil is {top_soil}, suggesting better performance under those conditions in these data. "
                "Use this as a guide and validate locally with soil testing and variety-specific recommendations."
            )
            return {"answer": answer, "chartData": {"labels": labels[:5], "values": values[:5], "type": "bar", "title": f"Avg Yield by Soil for {crop.title()}"}}
        else:
            c = crop.lower()
            if c == 'kiwi':
                answer = (
                    "Kiwi generally performs best in well‑drained, deep loamy soils with high organic matter. "
                    "A slightly acidic pH around 5.5–6.5 is preferred; avoid waterlogging and heavy clay or saline soils as roots are sensitive to poor drainage. "
                    "In practice, raise beds or ensure slope drainage, incorporate compost, and maintain mulch to conserve moisture. "
                    "Treat this as agronomic guidance; confirm with local soil tests and rootstock/variety recommendations."
                )
                return {"answer": answer, "chartData": {"labels": [], "values": []}}
            # Generic fallback for unknown crops
            answer = (
                f"Dataset has no soil records for {crop}. As a general guideline, well‑drained loamy soils with good organic matter and near‑neutral to slightly acidic pH support most horticultural crops. "
                "Avoid persistent waterlogging or extreme salinity, and adjust amendments based on soil testing. "
                "Consider local agronomy advisories for crop‑ and region‑specific soil/bed preparation."
            )
            return {"answer": answer, "chartData": {"labels": [], "values": []}}

    # 0a) All-India rainfall history (national, 1901-2015)
    if intent.get('ask_all_india_rain') or ((intent.get('ask_rainfall') or intent.get('ask_trend')) and not intent.get('state')):
        try:
            air = load_all_india_rainfall_history().copy()
        except Exception:
            air = None
        if air is not None and not air.empty and 'Year' in air.columns:
            air = air.dropna(subset=['Year']).sort_values('Year')
            month_token = intent.get('month_token')  # 'jun','jul','aug','sep' or None
            ask_departure = intent.get('ask_departure')
            # Choose series
            if month_token:
                col = {'jun':'Jun','jul':'Jul','aug':'Aug','sep':'Sep'}[month_token]
                dep = {'jun':'Dep_Jun','jul':'Dep_Jul','aug':'Dep_Aug','sep':'Dep_Sep'}[month_token]
                ycol = dep if ask_departure and dep in air.columns else col
                ylab = ('Departure % ' + col) if ycol.startswith('Dep_') else (col + ' Rainfall (mm)')
                labels = air['Year'].astype(int).astype(str).tolist()
                values = air[ycol].round(2).tolist()
                title = f"All-India {ylab} over Years"
                answer = (
                    f"All-India {('departure percentage for ' + col) if ycol.startswith('Dep_') else (col + ' rainfall')} across {len(labels)} year(s). "
                    "This uses the national series (1901–2015) and is independent of state/district filters."
                )
                return {"answer": answer, "chartData": {"labels": labels, "values": values, "type": "line", "title": title}}
            else:
                # Monsoon total or its departure
                ycol = 'Dep_Monsoon' if ask_departure and 'Dep_Monsoon' in air.columns else 'MonsoonTotal'
                ylab = 'Monsoon Departure %' if ycol == 'Dep_Monsoon' else 'Monsoon Rainfall (mm)'
                labels = air['Year'].astype(int).astype(str).tolist()
                values = air[ycol].round(2).tolist()
                title = f"All-India {ylab} (Jun–Sep)"
                answer = (
                    f"All-India {ylab.lower()} from {labels[0]} to {labels[-1]} across {len(labels)} year(s). "
                    "Use the line chart to observe long-term monsoon patterns and anomalies."
                )
                return {"answer": answer, "chartData": {"labels": labels, "values": values, "type": "line", "title": title}}

    # 1) Climate impact queries
    if intent.get('ask_climate'):
        cl_df = load_climate_data().copy()
        if state := intent.get('state'):
            cl_df = cl_df[cl_df['State'].str.contains(state, case=False, na=False)]
        if crop := intent.get('crop'):
            cl_df = cl_df[cl_df['Crop'].str.contains(crop, case=False, na=False)]
        if cl_df.empty:
            return {"answer": "No climate records found for the given filters.", "chartData": {"labels": [], "values": []}}

        # Ensure numeric types
        cl_df = cl_df.dropna(subset=['Year', 'AvgTemp'])
        cl_df['Year'] = pd.to_numeric(cl_df['Year'], errors='coerce')
        cl_df['AvgTemp'] = pd.to_numeric(cl_df['AvgTemp'], errors='coerce')
        if 'Yield' in cl_df.columns:
            cl_df['Yield'] = pd.to_numeric(cl_df['Yield'], errors='coerce')

        # Helper: slope via least squares (polyfit)
        def _slope(x, y):
            x = np.asarray(x)
            y = np.asarray(y)
            if len(x) < 2 or len(np.unique(x)) < 2 or len(y) < 2:
                return np.nan
            return float(np.polyfit(x, y, 1)[0])

        # Sub-intent A: Highest average temperature state
        raw = (intent.get('raw') or '').lower()
        if ('highest' in raw or 'top' in raw) and ('state' in raw) and ('avg' in raw or 'average' in raw) and ('temp' in raw or 'temperature' in raw):
            by_state = cl_df.groupby('State', as_index=False)['AvgTemp'].mean().sort_values('AvgTemp', ascending=False)
            if by_state.empty:
                return {"answer": "Not enough records to compute average temperature by state.", "chartData": {"labels": [], "values": []}}
            labels = by_state['State'].head(5).tolist()
            values = by_state['AvgTemp'].head(5).round(2).tolist()
            top_state, top_temp = labels[0], values[0]
            scope = f" for {crop}" if intent.get('crop') else ""
            answer = (
                f"States ranked by highest average temperature{scope}: {', '.join(labels)}. "
                f"We computed mean temperature across all available years per state; the highest is {top_state} at {top_temp}°C. "
                "This ranking reflects the dataset contents and may shift as more years are added. "
                "Use the bar chart to compare the top states side by side and focus follow-up analysis."
            )
            return {"answer": answer, "chartData": {"labels": labels, "values": values, "type": "bar", "title": "States by Avg Temperature (°C)"}}

        # Sub-intent B: Effect of temperature on yield per crop
        if ('affect' in raw or 'effect' in raw or 'impact' in raw) and ('yield' in raw) and ('crop' in raw or 'each crop' in raw or 'per crop' in raw):
            if 'Yield' not in cl_df.columns or cl_df['Yield'].notna().sum() < 2:
                return {"answer": "Insufficient yield data to estimate temperature–yield relationships by crop.", "chartData": {"labels": [], "values": []}}
            sens_crop = (
                cl_df.dropna(subset=['Yield'])
                .groupby('Crop')
                .apply(lambda g: _slope(g['AvgTemp'], g['Yield']))
                .rename('YieldSlope')
                .reset_index()
                .dropna()
                .sort_values('YieldSlope')
            )
            if sens_crop.empty:
                return {"answer": "Could not compute temperature–yield sensitivity by crop due to limited variation.", "chartData": {"labels": [], "values": []}}
            labels = sens_crop['Crop'].tolist()
            values = sens_crop['YieldSlope'].round(3).tolist()
            answer = (
                "Temperature impact on yield by crop: values show the slope of yield per unit change in average temperature (more negative implies stronger adverse effect). "
                "We estimated slopes using linear regression of Yield versus AvgTemp within each crop across available records. "
                "Crops with negative slopes may require heat-resilient varieties or adjusted sowing windows. "
                "Use the bar chart to compare sensitivity and prioritize climate adaptation strategies by crop."
            )
            return {"answer": answer, "chartData": {"labels": labels, "values": values, "type": "bar", "title": "Temperature–Yield Sensitivity by Crop (slope)"}}

        # Default climate view: Warming trend per state: slope of AvgTemp vs Year
        warm = (
            cl_df.groupby('State')
            .apply(lambda g: _slope(g['Year'], g['AvgTemp']))
            .rename('WarmSlope')
            .reset_index()
            .dropna()
            .sort_values('WarmSlope', ascending=False)
        )
        # Yield sensitivity per state: slope of Yield vs AvgTemp (negative is worse)
        sens = pd.DataFrame(columns=['State', 'YieldSlope'])
        if 'Yield' in cl_df.columns and cl_df['Yield'].notna().any():
            sens = (
                cl_df.dropna(subset=['Yield'])
                .groupby('State')
                .apply(lambda g: _slope(g['AvgTemp'], g['Yield']))
                .rename('YieldSlope')
                .reset_index()
                .dropna()
                .sort_values('YieldSlope', ascending=True)  # most negative first
            )

        # Prepare chart: top 5 warming states
        top_warm = warm.head(5)
        labels = top_warm['State'].tolist()
        values = [round(v, 3) for v in top_warm['WarmSlope'].tolist()]

        # Compose answer
        top3_warm = warm.head(3)['State'].tolist()
        if not sens.empty:
            top3_sens = sens.head(3)['State'].tolist()
            extra_line = (
                f"Temperature–yield sensitivity is most adverse in {', '.join(top3_sens)} based on negative yield slopes versus temperature. "
            )
        else:
            extra_line = "Yield sensitivity could not be computed due to limited yield records in the climate dataset. "

        scope = " for " + ", ".join(filter(None, [intent.get('crop'), intent.get('state')])) if (intent.get('crop') or intent.get('state')) else ""
        answer = (
            f"States most affected by climate change in agriculture{scope}: {', '.join(top3_warm)} considering warming trends. "
            f"We estimated a warming slope (°C per year) by regressing average temperature against year for each state, then ranked states by this trend. "
            + extra_line +
            "Use the bar chart to compare warming rates across the top states and prioritize adaptation planning."
        )
        return {"answer": answer, "chartData": {"labels": labels, "values": values, "type": "bar", "title": "Warming Trend (°C/year) by State"}}

    # 2) Bubble view: Rainfall (x) vs Yield (y), bubble size by Area
    if intent.get('ask_bubble'):
        # Prefer detailed dataset if available
        try:
            ddf = load_crop_production_detailed()
            if state:
                ddf = ddf[ddf['State'].str.contains(state, case=False, na=False)]
            if crop:
                ddf = ddf[ddf['Crop'].str.contains(crop, case=False, na=False)]
            ddf2 = ddf.dropna(subset=['Annual_Rainfall', 'Yield', 'Area'])
            if not ddf2.empty:
                max_area = float(ddf2['Area'].max() or 1)
                def _r(a):
                    return 6 + 12 * (float(a) / max_area) if max_area > 0 else 8
                points = [{"x": float(r.Annual_Rainfall), "y": float(r.Yield), "r": _r(r.Area)} for _, r in ddf2.iterrows()]
                labels = (ddf2['Crop_Year'].astype(int).astype(str).tolist() if 'Crop_Year' in ddf2.columns else [])
                scope = " for " + ", ".join(filter(None, [crop, state])) if (crop or state) else ""
                answer = (
                    f"Bubble view of annual rainfall versus yield{scope} using the detailed dataset. "
                    "Each point shows rainfall (x) and yield (y), with bubble size scaled by cultivated area to convey scale. "
                    "This visualization helps assess whether higher rainfall aligns with yield improvements in your filtered scope. "
                    "Hover bubbles to inspect specific years or records."
                )
                return {"answer": answer, "chartData": {"labels": labels, "datasets": [{"label": "Records", "data": points}], "type": "bubble", "title": "Annual Rainfall vs Yield (r = Area)"}}
        except Exception:
            pass

        # Fallback to generic rainfall+yield bubble
        rain_df = load_rainfall_data()
        dfc = crop_df.copy()
        if state:
            dfc = dfc[dfc['State'].str.contains(state, case=False, na=False)]
            rain_df = rain_df[rain_df['State'].str.contains(state, case=False, na=False)]
        if crop:
            dfc = dfc[dfc['Crop'].str.contains(crop, case=False, na=False)]
        prod = dfc.groupby(['Year'], as_index=False).agg({'Production': 'sum', 'Area': 'sum'})
        if prod.empty or rain_df.empty:
            return {"answer": "Insufficient data to build bubble view.", "chartData": {"labels": [], "values": []}}
        prod['Yield'] = prod.apply(lambda r: (r['Production'] / r['Area']) if r['Area'] else 0, axis=1)
        rain = rain_df.groupby(['Year'], as_index=False)['Rainfall'].mean()
        merged = pd.merge(prod[['Year','Area','Yield']], rain, on='Year', how='inner').dropna().sort_values('Year')
        if merged.empty:
            return {"answer": "No overlapping years between rainfall and yield for bubble view.", "chartData": {"labels": [], "values": []}}
        max_area = float(merged['Area'].max() or 1)
        # scale radius between 6 and 18
        def _radius(a):
            return 6 + 12 * (float(a) / max_area) if max_area > 0 else 8
        points = [{"x": float(r.Rainfall), "y": float(r.Yield), "r": _radius(r.Area)} for _, r in merged.iterrows()]
        labels = merged['Year'].astype(str).tolist()
        scope = " for " + ", ".join(filter(None, [crop, state])) if (crop or state) else ""
        answer = (
            f"Bubble view of rainfall versus yield{scope} across {len(points)} year(s). "
            "Each bubble plots the average rainfall on the x-axis and computed yield (production/area) on the y-axis, with bubble size proportional to cultivated area. "
            "This helps you see whether higher rainfall aligns with higher yield while also conveying scale of area planted. "
            "Hover over points to see the year and compare relative sizes for context."
        )
        return {
            "answer": answer,
            "chartData": {
                "labels": labels,
                "datasets": [{"label": "Yearly points", "data": points}],
                "type": "bubble",
                "title": "Rainfall vs Yield (Bubble size = Area)"
            }
        }

    # 2b) Detailed dataset: Rainfall vs Yield bubble (Annual_Rainfall vs Yield, r by Area)
    raw = (intent.get('raw') or '').lower()
    if intent.get('ask_rainfall') and ('bubble' in raw or 'scatter' in raw or 'vs yield' in raw):
        ddf = load_crop_production_detailed()
        if state:
            ddf = ddf[ddf['State'].str.contains(state, case=False, na=False)]
        if crop:
            ddf = ddf[ddf['Crop'].str.contains(crop, case=False, na=False)]
        ddf = ddf.dropna(subset=['Annual_Rainfall', 'Yield', 'Area'])
        if ddf.empty:
            return {"answer": "No detailed records with rainfall, yield, and area to build the bubble view.", "chartData": {"labels": [], "values": []}}
        max_area = float(ddf['Area'].max() or 1)
        def _r(a):
            return 6 + 12 * (float(a) / max_area) if max_area > 0 else 8
        points = [{"x": float(r.Annual_Rainfall), "y": float(r.Yield), "r": _r(r.Area)} for _, r in ddf.iterrows()]
        labels = (ddf['Crop_Year'].astype(int).astype(str).tolist() if 'Crop_Year' in ddf.columns else [])
        scope = " for " + ", ".join(filter(None, [crop, state])) if (crop or state) else ""
        answer = (
            f"Bubble view of annual rainfall versus yield{scope} using the detailed dataset. "
            "Each point shows rainfall (x) and yield (y), with bubble size scaled by cultivated area to convey scale. "
            "This visualization helps assess whether higher rainfall aligns with yield improvements in your filtered scope. "
            "Hover bubbles to inspect specific years or records."
        )
        return {"answer": answer, "chartData": {"labels": labels, "datasets": [{"label": "Records", "data": points}], "type": "bubble", "title": "Annual Rainfall vs Yield (r = Area)"}}

    # 2c) Detailed dataset: Fertilizer amount vs Yield bubble (Fertilizer vs Yield, r by Area)
    if ('fertilizer' in raw and 'yield' in raw) and ('bubble' in raw or 'scatter' in raw or 'vs' in raw):
        ddf = load_crop_production_detailed()
        if state:
            ddf = ddf[ddf['State'].str.contains(state, case=False, na=False)]
        if crop:
            ddf = ddf[ddf['Crop'].str.contains(crop, case=False, na=False)]
        ddf = ddf.dropna(subset=['Fertilizer', 'Yield', 'Area'])
        if ddf.empty:
            return {"answer": "No detailed records with fertilizer amount, yield, and area to build the bubble view.", "chartData": {"labels": [], "values": []}}
        max_area = float(ddf['Area'].max() or 1)
        def _r(a):
            return 6 + 12 * (float(a) / max_area) if max_area > 0 else 8
        points = [{"x": float(r.Fertilizer), "y": float(r.Yield), "r": _r(r.Area)} for _, r in ddf.iterrows()]
        labels = (ddf['Crop_Year'].astype(int).astype(str).tolist() if 'Crop_Year' in ddf.columns else [])
        scope = " for " + ", ".join(filter(None, [crop, state])) if (crop or state) else ""
        answer = (
            f"Bubble view of fertilizer amount versus yield{scope} using the detailed dataset. "
            "Points plot applied fertilizer (x-axis) against yield (y-axis), with bubble size scaled by area to show production context. "
            "Look for upward trends or thresholds where additional fertilizer offers diminishing returns. "
            "Use this as exploratory evidence alongside agronomy recommendations and soil test results."
        )
        return {"answer": answer, "chartData": {"labels": labels, "datasets": [{"label": "Records", "data": points}], "type": "bubble", "title": "Fertilizer vs Yield (r = Area)"}}

    # 2d) Year-wise yield trend (prefer detailed dataset when requested)
    if intent.get('ask_trend'):
        used_detailed = False
        if intent.get('prefer_detailed'):
            try:
                ddf = load_crop_production_detailed()
                if state:
                    ddf = ddf[ddf['State'].str.contains(state, case=False, na=False)]
                if crop:
                    ddf = ddf[ddf['Crop'].str.contains(crop, case=False, na=False)]
                ddf = ddf.dropna(subset=['Crop_Year', 'Yield'])
                if not ddf.empty:
                    trend = ddf.groupby('Crop_Year', as_index=False)['Yield'].mean().sort_values('Crop_Year')
                    labels = trend['Crop_Year'].astype(int).astype(str).tolist()
                    values = trend['Yield'].round(2).tolist()
                    scope = " for " + ", ".join(filter(None, [crop, state])) if (crop or state) else ""
                    answer = (
                        f"Year-wise yield trend{scope} using the detailed dataset. "
                        "We computed average yield per year over the filtered records, then ordered by crop year to reveal the trajectory. "
                        f"The series spans {len(labels)} year(s) and highlights periods of improvement or dips. "
                        "Use the line chart to spot trends and consider overlaying rainfall or inputs in follow-ups."
                    )
                    used_detailed = True
                    return {"answer": answer, "chartData": {"labels": labels, "datasets": [{"label": "Yield", "values": values}], "type": "line", "title": "Year-wise Yield Trend"}}
            except Exception:
                pass
        # Fallback to base dataset
        dfc = crop_df.copy()
        if state:
            dfc = dfc[dfc['State'].str.contains(state, case=False, na=False)]
        if crop:
            dfc = dfc[dfc['Crop'].str.contains(crop, case=False, na=False)]
        if dfc.empty:
            return {"answer": "No records found to compute year-wise yield trend for the given filters.", "chartData": {"labels": [], "values": []}}
        trend = dfc.groupby('Year', as_index=False)['Yield'].mean().sort_values('Year')
        labels = trend['Year'].astype(int).astype(str).tolist()
        values = trend['Yield'].round(2).tolist()
        scope = " for " + ", ".join(filter(None, [crop, state])) if (crop or state) else ""
        answer = (
            f"Year-wise yield trend{scope} using the base dataset. "
            "We averaged yield by year within the selected filters to illustrate how performance evolves over time. "
            f"The chart covers {len(labels)} year(s) and can be paired with rainfall or input views for context. "
            "Use this trendline to identify improving or declining periods for further investigation."
        )
        return {"answer": answer, "chartData": {"labels": labels, "datasets": [{"label": "Yield", "values": values}], "type": "line", "title": "Year-wise Yield Trend"}}

    # 3) Fertilizer impact queries
    if fertilizer or intent.get('ask_fertilizer'):
        fert_df = load_fertilizer_data()
        df = fert_df.copy()
        if crop:
            df = df[df['Crop'].str.contains(crop, case=False, na=False)]
        if state:
            df = df[df['State'].str.contains(state, case=False, na=False)]
        if df.empty:
            answer = "No fertilizer data found for the given filters."
            return {
                "answer": answer,
                "chartData": {"labels": [], "values": []}
            }
        top = df.groupby('Fertilizer', as_index=False)['YieldIncrease'].mean().sort_values('YieldIncrease', ascending=False).head(5)
        labels = top['Fertilizer'].tolist()
        values = top['YieldIncrease'].round(2).tolist()
        answer = (
            f"Top fertilizers by average yield increase{f' for {crop}' if crop else ''}{f' in {state}' if state else ''}: "
            + ", ".join([f"{l} ({v})" for l, v in zip(labels, values)])
            + ". We computed this by grouping records by fertilizer and averaging the reported yield uplift across matching entries. "
            f"The current filter returned {len(df)} record(s), and the best option shows an average increase of {max(values):.2f}. "
            "Use the chart to compare relative gains and pick inputs aligned with your crop and location."
        )
        return {"answer": answer, "chartData": {"labels": labels, "values": values, "type": "bar", "title": "Fertilizer vs Avg Yield Increase"}}

    # 4) Rainfall effect queries
    if intent.get('ask_rainfall'):
        rain_df = load_rainfall_data()
        dfc = crop_df.copy()
        if state:
            dfc = dfc[dfc['State'].str.contains(state, case=False, na=False)]
            rain_df = rain_df[rain_df['State'].str.contains(state, case=False, na=False)]
        if crop:
            dfc = dfc[dfc['Crop'].str.contains(crop, case=False, na=False)]
        # compute yearly yield and average rainfall
        prod = dfc.groupby(['Year'], as_index=False).agg({
            'Production': 'sum',
            'Area': 'sum'
        })
        if prod.empty or rain_df.empty:
            return {"answer": "Insufficient data to analyze rainfall effect.", "chartData": {"labels": [], "values": []}}
        prod['Yield'] = prod.apply(lambda r: (r['Production'] / r['Area']) if r['Area'] else 0, axis=1)
        rain = rain_df.groupby(['Year'], as_index=False)['Rainfall'].mean()
        merged = pd.merge(prod[['Year', 'Yield']], rain, on='Year', how='inner').sort_values('Year')
        corr = merged[['Yield', 'Rainfall']].corr().iloc[0, 1]
        labels = merged['Year'].astype(str).tolist()
        values_yield = merged['Yield'].round(2).tolist()
        values_rain = merged['Rainfall'].round(2).tolist()
        answer = (
            f"Correlation between rainfall and yield{f' for {crop}' if crop else ''}{f' in {state}' if state else ''}: {corr:.2f}. "
            f"We calculated yearly yield (production/area) and joined it with average rainfall, then computed the Pearson correlation over {len(labels)} year(s). "
            "Positive values suggest yield tends to rise with rainfall, while negative values indicate the opposite. "
            "Use the dual-line chart to visually inspect how closely the two series move together over time."
        )
        return {
            "answer": answer,
            "chartData": {
                "labels": labels,
                "datasets": [
                    {"label": "Yield", "values": values_yield},
                    {"label": "Rainfall", "values": values_rain}
                ],
                "type": "line",
                "title": "Yield vs Rainfall Over Years"
            }
        }

    # 5) Soil suitability queries
    if soil:
        df = crop_df.copy()
        if state:
            df = df[df['State'].str.contains(state, case=False, na=False)]
        df = df[df['Soil'].str.contains(soil, case=False, na=False)]
        if df.empty:
            return {"answer": "No matching crops found for soil filter.", "chartData": {"labels": [], "values": []}}
        top = df.groupby('Crop', as_index=False)['Yield'].mean().sort_values('Yield', ascending=False).head(5)
        labels = top['Crop'].tolist()
        values = top['Yield'].round(2).tolist()
        answer = (
            f"Best performing crops for {soil} soil{f' in {state}' if state else ''}: "
            + ", ".join([f"{l} ({v})" for l, v in zip(labels, values)])
            + ". We filtered the dataset by soil type and location (if provided), then ranked crops by mean yield. "
            f"The shortlist shows the top {len(labels)} crop(s) by average yield in the filtered data. "
            "Review the bar chart to compare how each crop performs under the specified soil conditions."
        )
        return {"answer": answer, "chartData": {"labels": labels, "values": values, "type": "bar", "title": "Average Yield by Crop"}}

    # 6) Top crops by production
    if intent.get('ask_top'):
        df = crop_df.copy()
        if state:
            df = df[df['State'].str.contains(state, case=False, na=False)]
        if crop:
            df = df[df['Crop'].str.contains(crop, case=False, na=False)]
        if intent.get('last_n_years'):
            year_cut = df['Year'].max() - intent['last_n_years'] + 1
            df = df[df['Year'] >= year_cut]
        topn = wants_top or 5
        top = df.groupby('Crop', as_index=False)['Production'].sum().sort_values('Production', ascending=False).head(topn)
        labels = top['Crop'].tolist()
        values = top['Production'].round(2).tolist()
        answer = (
            f"Top {topn} crops by total production{f' in {state}' if state else ''}: "
            + ", ".join(labels)
            + ". We summed production across matching records"
            + (f" for the last {intent.get('last_n_years')} year(s)" if intent.get('last_n_years') else " across all available years")
            + ". "
            f"The leading crop shows a total of {max(values):.0f} in the selected scope. "
            "Use the chart to assess the production gap between crops and refine your focus."
        )
        return {"answer": answer, "chartData": {"labels": labels, "values": values, "type": "bar", "title": "Total Production"}}

    # 7) Default: summary of highest yield crops overall
    df = crop_df.copy()
    top = df.groupby('Crop', as_index=False)['Yield'].mean().sort_values('Yield', ascending=False).head(5)
    labels = top['Crop'].tolist()
    values = top['Yield'].round(2).tolist()
    answer = (
        "Top crops by average yield in dataset: "
        + ", ".join(labels)
        + ". This overview ranks crops by mean yield over all available records without additional filters. "
        f"It highlights the top {len(labels)} performer(s) based on average yield levels. "
        "Use this as a starting point before narrowing by state, soil, or time window."
    )
    return {"answer": answer, "chartData": {"labels": labels, "values": values, "type": "bar", "title": "Avg Yield by Crop"}}

from flask import Blueprint, request, jsonify
import os
import re
import json
from utils.nlp_parser import parse_question
from routes.analyze import dispatch_analysis

chatbot_bp = Blueprint('chatbot', __name__)


def _summarize_chart(chart):
    try:
        if not chart:
            return "No chart data."
        ctype = chart.get('type') or ('bubble' if chart.get('datasets') and isinstance(chart['datasets'][0].get('data') or chart['datasets'][0].get('values'), list) and chart['datasets'][0]['data'] and isinstance(chart['datasets'][0]['data'][0], dict) else 'bar')
        title = chart.get('title') or ctype.title()
        if 'datasets' in chart and chart['datasets']:
            ds = chart['datasets'][0]
            data_arr = ds.get('data') or ds.get('values') or []
            if ctype == 'bubble':
                return f"{title}: {len(data_arr)} points (x vs y, size by r)."
            if isinstance(data_arr, list) and all(isinstance(v, (int, float)) for v in data_arr):
                labels = chart.get('labels') or []
                pairs = list(zip(labels, data_arr))
                pairs = sorted(pairs, key=lambda x: (x[1] if isinstance(x[1], (int, float)) else float('nan')), reverse=True)[:5]
                top_str = ", ".join([f"{l} ({v})" for l, v in pairs])
                return f"{title}: top entries — {top_str}."
        # simple labels/values
        labels = chart.get('labels') or []
        values = chart.get('values') or []
        if labels and values:
            pairs = list(zip(labels, values))
            pairs = sorted(pairs, key=lambda x: (x[1] if isinstance(x[1], (int, float)) else float('nan')), reverse=True)[:5]
            top_str = ", ".join([f"{l} ({v})" for l, v in pairs])
            return f"{title}: top entries — {top_str}."
        return f"{title}: summary unavailable."
    except Exception:
        return "Chart summary unavailable."


def _looks_generic(text: str) -> bool:
    if not text:
        return True
    t = text.lower()
    if 'as an ai' in t or 'cannot access' in t or 'i do not have access' in t:
        return True
    # If no numbers and too short, likely generic
    has_number = bool(re.search(r"\d", t))
    return (not has_number) and (len(t.split()) < 25)


def _build_system_prompt(allow_generic: bool):

    return (
        "You are KrishiBot. Answer STRICTLY and ONLY using the provided dataset summary. "
        "Never use external knowledge or assumptions beyond the dataset. "
        "If the dataset lacks the requested information, reply exactly: 'Sorry, we do not have data for what you are asking right now.'\n\n"
        "Provide a detailed, data-rich response with the following structure (when data exists):\n"
        "- Key findings with specific numbers (averages, totals, ranks, slopes, correlations).\n"
        "- Top items or rankings if applicable.\n"
        "- Scope and filters used (e.g., crop, state, years).\n"
        "- Brief method used from the dataset (grouping, averaging, regression).\n"
        "Only suggest a chart type if the user asks; otherwise focus on textual, quantitative findings derived from the dataset summary."
    )


AGRI_KEYWORDS = [
    "crop", "fertilizer", "soil", "yield", "rainfall", "temperature",
    "production", "climate", "wheat", "rice", "maize", "farming", "irrigation",
    "state", "season", "sowing", "harvest", "pulses", "cotton", "sugarcane"
]


def _is_agriculture_query(user_query: str) -> bool:
    uq = (user_query or '').lower()
    return any(k in uq for k in AGRI_KEYWORDS)


def _has_chart_data(chart) -> bool:
    try:
        if not chart:
            return False
        # dataset-based structure
        if chart.get('datasets'):
            ds = chart['datasets'][0] if chart['datasets'] else {}
            arr = ds.get('data') or ds.get('values') or []
            return bool(arr)
        # simple labels/values structure
        labels = chart.get('labels') or []
        values = chart.get('values') or []
        return bool(labels) and (bool(values))
    except Exception:
        return False


@chatbot_bp.route('/api/chat', methods=['POST'])
def chat():
    data = request.get_json(force=True) or {}
    question = (data.get('question') or '').strip()
    history = data.get('history') or []  # list of {role, text}
    allow_generic = bool(data.get('allow_generic', True))
    insight_mode = bool(data.get('insight_mode', True))

    if not question:
        return jsonify({"error": "Question is required"}), 400

    # DATA-ONLY MODE: Always use dataset analysis; do not use AI generation at all
    # Guardrail: dataset is India-focused. If user asks about other countries, reply with apology.
    qlow = question.lower()
    COUNTRY_DENYLIST = [
        'usa','united states','china','pakistan','nepal','bangladesh','sri lanka','uk','england','germany','france','canada','australia',
        'japan','russia','brazil','south africa','indonesia','spain','italy','saudi','uae','qatar','oman','bhutan','myanmar','sri‑lanka'
    ]
    mentions_other_country = any(tok in qlow for tok in COUNTRY_DENYLIST) or any(phrase in qlow for phrase in ['another country','other country','outside india'])
    if mentions_other_country and ('india' not in qlow):
        msg = "Sorry, our datasets cover India only. We don't have data for the country you're asking about."
        return jsonify({
            "aiInsight": None,
            "dataInsight": msg,
            "chartData": {"labels": [], "values": []},
            "note": "Out-of-scope country"
        })

    intent = parse_question(question)
    try:
        baseline = dispatch_analysis(intent)
    except Exception as e:
        baseline = {"answer": f"Data analysis failed: {e}", "chartData": {"labels": [], "values": []}}
    chart_summary = _summarize_chart(baseline.get('chartData'))

    # Dataset-backed reply with Gemini constrained strictly to dataset
    chart = baseline.get('chartData') or {"labels": [], "values": []}
    base_ans = (baseline.get('answer') or '').strip()
    has_data = _has_chart_data(chart)
    low = base_ans.lower()
    looks_empty_msg = any(s in low for s in [
        'no records', 'no data', 'insufficient data', 'not enough records', 'no matching', 'could not compute'
    ])
    if not has_data and (not base_ans or looks_empty_msg):
        msg = "Sorry, we do not have data for what you are asking right now. Please adjust crop/state/year or try a different dataset-backed query."
        return jsonify({
            "aiInsight": None,
            "dataInsight": msg,
            "chartData": {"labels": [], "values": []},
            "note": "No matching dataset entries found."
        })

    api_key = os.environ.get('GEMINI_API_KEY') or os.environ.get('GOOGLE_API_KEY')
    if not api_key:
        # Fall back to baseline text/summary if no key
        base_ans = base_ans or _summarize_chart(chart) or ""
        return jsonify({
            "aiInsight": None,
            "dataInsight": base_ans,
            "chartData": chart,
            "note": "Gemini key not configured; answering from dataset summary."
        })

    strict_prompt = (
        "You are KrishiBot. Answer strictly and only using the provided dataset summary. "
        "Do not use external knowledge. If the dataset lacks the information, reply exactly: "
        "'Sorry, we do not have data for what you are asking right now.' "
        "Keep the answer concise (1–3 short sentences)."
    )
    user_block = (
        f"Dataset summary:\n{_summarize_chart(chart)}\n\n" +
        f"Question: {question}\n"
    )

    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        candidate_models = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-1.0-pro'
        ]
        resp = None
        used_model = None
        last_err = None
        for mid in candidate_models:
            try:
                model = genai.GenerativeModel(mid)
                resp = model.generate_content(f"{strict_prompt}\n\n{user_block}")
                used_model = mid
                break
            except Exception as e:
                last_err = e
                continue
        if resp is None:
            raise last_err or RuntimeError('No Gemini model available')
        gtext = getattr(resp, 'text', None) or (resp.candidates[0].content.parts[0].text if getattr(resp, 'candidates', None) else '')
        txt = (gtext or '').strip() or (base_ans or _summarize_chart(chart) or "")
        return jsonify({
            "aiInsight": None,
            "dataInsight": txt,
            "chartData": chart,
            "modelUsed": used_model
        })
    except Exception as e:
        try:
            print("[KrishiBot] Strict Gemini error:", repr(e))
        except Exception:
            pass
        base_ans = base_ans or _summarize_chart(chart) or ""
        return jsonify({
            "aiInsight": None,
            "dataInsight": base_ans,
            "chartData": chart,
            "note": "Gemini failed; answered from dataset summary.",
            "aiError": str(e)
        })

    # The AI path below is disabled in data-only mode.

    # Call Gemini
    try:
        import google.generativeai as genai
        genai.configure(api_key=api_key)
        # Try multiple model IDs and also auto-discover available ones for this key
        preferred = [
            'gemini-1.5-flash',
            'gemini-1.5-pro',
            'gemini-1.5-flash-8b',
            'gemini-1.0-pro',
            'gemini-pro',
            'gemini-pro-vision',
        ]
        try:
            models = list(genai.list_models())
            available = [
                getattr(m, 'name', '') for m in models
                if 'generateContent' in getattr(m, 'supported_generation_methods', [])
            ]
        except Exception:
            available = []
        # Merge preferred with available, preserving order and removing duplicates
        seen = set()
        candidate_models = []
        for mid in preferred + available:
            if mid and mid not in seen:
                seen.add(mid)
                candidate_models.append(mid)
        full_prompt = sys_prompt
        if convo_text:
            full_prompt += f"\n\nRecent conversation (for context):\n{convo_text}"
        full_prompt += f"\n\n{user_block}"

        last_err = None
        used_model = None
        resp = None
        def try_generate(model_id: str):
            m = genai.GenerativeModel(model_id)
            return m.generate_content(full_prompt)

        for mid in candidate_models:
            try:
                # Try as-is
                resp = try_generate(mid)
                used_model = mid
                break
            except Exception as e_try:
                last_err = e_try
                # If name includes prefix, try stripped; else try with prefix
                alt = mid.split('models/', 1)[1] if mid.startswith('models/') else f"models/{mid}"
                try:
                    resp = try_generate(alt)
                    used_model = alt
                    break
                except Exception as e_try2:
                    last_err = e_try2
                    continue
        if resp is None:
            raise last_err or RuntimeError('No Gemini model available')
        gtext = getattr(resp, 'text', None) or (resp.candidates[0].content.parts[0].text if getattr(resp, 'candidates', None) else '')

        base_ans = baseline.get('answer') or chart_summary

        # Parse Gemini into AI/Data insights
        ai_insight = None
        data_insight = None
        if gtext:
            txt = gtext.strip()
            if is_agri:
                if not _looks_generic(txt):
                    # Expect dual sections
                    parts = re.split(r"Data Insight\s*[:]", txt, flags=re.IGNORECASE)
                    if len(parts) >= 2:
                        m_ai = re.search(r"AI Insight\s*[:]\s*(.*)", parts[0], flags=re.IGNORECASE | re.DOTALL)
                        ai_insight = (m_ai.group(1).strip() if m_ai else parts[0].strip())
                        data_insight = parts[1].strip()
                    else:
                        m_ai2 = re.search(r"AI Insight.*?:\s*(.*)", txt, flags=re.IGNORECASE | re.DOTALL)
                        m_data2 = re.search(r"Data Insight.*?:\s*(.*)", txt, flags=re.IGNORECASE | re.DOTALL)
                        ai_insight = m_ai2.group(1).strip() if m_ai2 else None
                        data_insight = m_data2.group(1).strip() if m_data2 else None
            else:
                # Casual: accept Gemini output as-is (do not generic-filter short replies)
                ai_insight = txt
                data_insight = None

        # Fallbacks
        if is_agri and not data_insight:
            data_insight = base_ans
        if not ai_insight:
            # Provide concise generic guidance if Gemini failed
            ai_insight = ("Hello! I’m KrishiBot. How can I help you today?") if not is_agri else (
                "Consider local climate, soil tests, and variety selection. Split nitrogen applications, ensure adequate drainage during heavy rains, and align planting windows with regional advisories."
            )

        return jsonify({
            "aiInsight": ai_insight,
            "dataInsight": data_insight,
            "chartData": baseline.get('chartData') or {"labels": [], "values": []},
            "modelUsed": used_model
        })
    except Exception as e:
        # Safe fallback — return baseline so user still gets value
        base_ans = (None if not is_agri else (baseline.get('answer') or chart_summary or "No dataset summary available."))
        ai_insight = ("Hello! I’m KrishiBot. How can I help you today?") if not is_agri else (
            "AI generation failed. As general guidance, consider climate suitability, soil test-based fertilization, and staged input management to match growth phases."
        )
        # Log the error to server console for debugging
        try:
            print("[KrishiBot] Gemini error:", repr(e))
        except Exception:
            pass
        return jsonify({
            "aiInsight": ai_insight,
            "dataInsight": base_ans,
            "chartData": baseline.get('chartData') or {"labels": [], "values": []},
            "note": "Gemini generation failed; showing generic AI guidance and data-based summary.",
            "aiError": str(e),
            "modelUsed": None
        })

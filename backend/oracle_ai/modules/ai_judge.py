"""
=========================================================
Oracle AI

AI Judge
Version 3.0.0

Purpose
-------
Acts as Oracle's senior market reviewer.

Oracle creates the prediction.

AI Judge reviews Oracle's prediction.

AI NEVER decides market direction.

Responsibilities
----------------
• Review Prediction
• Identify missing risks
• Challenge weak evidence
• Explain Oracle's reasoning
• Produce institutional commentary
• Safe fallback when AI unavailable

=========================================================
"""

from __future__ import annotations

import json
import logging
import os
import time

from datetime import datetime, timedelta, timezone
from typing import Any

from dotenv import load_dotenv

from models.prediction import Prediction


logger = logging.getLogger(__name__)

if not logging.root.handlers:
    logging.basicConfig(level=logging.INFO)


class AIJudge:

    VERSION = "3.0.0"

    MODELS = [

        "models/gemini-3.6-flash",

        "models/gemini-3.5-flash",

        "models/gemini-flash-latest",

        "models/gemini-2.5-pro",

    ]

    MAX_RETRIES = 3

    # Maximum AI confidence delta allowed vs system confidence
    MAX_AI_CONFIDENCE_DELTA = 5

    MAX_CONFIDENCE_ADJUSTMENT = 5

    VALID_RISKS = {

        "LOW",

        "MEDIUM",

        "HIGH"

    }

    def __init__(self):

        load_dotenv()

        self.enabled = False

        self.client = None
        self.provider = None
        self._has_executed = False

        # Prefer OpenAI if OPENAI_API_KEY is present, otherwise fall back to Gemini
        openai_key = os.getenv("OPENAI_API_KEY")
        gemini_key = os.getenv("GEMINI_API_KEY")

        if openai_key:
            # Use OpenAI via direct HTTP call (no hardcoded key)
            self.openai_key = openai_key
            self.provider = "openai"
            self.enabled = True
            logger.info("AI Judge initialized (OpenAI).")
            return

        if gemini_key:
            try:
                from google import genai

                self.client = genai.Client(api_key=gemini_key)
                self.provider = "gemini"
                self.enabled = True
                logger.info("AI Judge initialized (Gemini).")
                return
            except Exception as e:
                logger.error(e)

        logger.warning("No AI API key found (OPENAI_API_KEY or GEMINI_API_KEY). AI disabled.")

    ########################################################
    # PUBLIC
    ########################################################

    def judge(

        self,

        snapshot,

        prediction: Prediction,

        context: dict | None = None,

        use_ai: bool = True

    ):

        # Initialize per-run execution guard
        self._has_executed = False

        # context may include news and whales and other indicators
        if not use_ai:
            return self.fallback(snapshot, prediction, context)

        if not self.enabled:
            return self.fallback(snapshot, prediction, context)

        try:
            # Use OpenAI if configured, otherwise Gemini
            if self.provider == "openai":
                return ask_openai(self, snapshot, prediction, context)
            else:
                return ask_gemini(self, snapshot, prediction, context)
        except Exception as e:
            logger.exception(e)
            return self.fallback(snapshot, prediction, context)

    ########################################################
    # Prompt Builder
    ########################################################

    def build_prompt(

        self,

        snapshot,

        prediction: Prediction,

        context: dict | None = None

    ) -> str:

        # Consolidate a single 5-minute input payload:
        indicators = (context or {}).get("indicators", {})
        news = (context or {}).get("news", {})
        whales = (context or {}).get("whales", {})

        engine_meta = {
            "prediction": prediction.direction,
            "confidence": prediction.confidence,
            "reliability": prediction.reliability,
            "expected_move": prediction.expected_move,
            "reasons": prediction.reasons,
            "agreement": prediction.metadata.get("agreement"),
            "category_scores": prediction.metadata.get("category_scores"),
            "source_scores": prediction.metadata.get("source_scores"),
            "evidence_count": prediction.metadata.get("evidence_count"),
        }

        # Technical summary (try to extract MACD/RSI/trend if present)
        tech_summary = {}
        try:
            tech = indicators.get("technical", {})
            tech_summary["macd"] = tech.get("macd") or tech.get("MACD")
            tech_summary["rsi"] = tech.get("rsi") or tech.get("RSI")
            tech_summary["trend"] = tech.get("trend") or tech.get("trend_strength")
        except Exception:
            tech_summary = indicators.get("technical", {})

        payload = {
            "window": "5m",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "technical": tech_summary,
            "news_summary": {
                "headlines": news.get("headlines", []),
                "top_relevant": news.get("top_relevant", []),
                "bullish_score": news.get("bullish_score"),
                "bearish_score": news.get("bearish_score"),
            },
            "whales": {
                "buy_volume": whales.get("buy_volume"),
                "sell_volume": whales.get("sell_volume"),
                "bullish_score": whales.get("bullish_score"),
                "bearish_score": whales.get("bearish_score"),
            },
            "engine": engine_meta,
            "full_snapshot": snapshot,
        }

        return f"""
You are Oracle AI's Senior Market Reviewer.

INSTRUCTIONS:
- Oracle has already produced a baseline `engine` prediction. Do NOT change direction.
- You MUST return valid JSON only and keep any adjustments to `confidence_adjustment` within [-5,5].
- Use the single consolidated 5-minute payload below to form your review. Make one short JSON output with fields described in the Return template.

Consolidated 5-minute payload

{json.dumps(payload, indent=2, default=str)}

Return JSON only with the following structure:
{{
  "agreement": true | false,
  "confidence_adjustment": 0,
  "risk": "LOW" | "MEDIUM" | "HIGH",
  "missing_evidence": [],
  "warnings": [],
  "summary": "",
  "market_commentary": ""
}}
"""

    ########################################################
    # Method wrappers for module-level helpers
    ########################################################

    def ask_gemini(self, snapshot, prediction: Prediction, context: dict | None = None):
        return ask_gemini(self, snapshot, prediction, context)

    def clean_response(self, text: str) -> str:
        return clean_response(self, text)

    def metadata(self, model, elapsed_ms):
        return metadata(self, model, elapsed_ms)

    def normalize_response(self, result, prediction: Prediction):
        return normalize_response(self, result, prediction)

    def validate_response(self, result):
        return validate_response(self, result)

    # tests expect a private validator name
    def _validate_response(self, result):
        return validate_response(self, result)

    def fallback(self, snapshot, prediction: Prediction, context: dict | None = None):
        return fallback(self, snapshot, prediction, context)

    @staticmethod
    def clamp(value, minimum, maximum):
        return clamp(value, minimum, maximum)

    @staticmethod
    def safe_float(value, default=0.0):
        return safe_float(value, default)

    def apply_review(self, prediction: Prediction, review: dict) -> Prediction:
        return apply_review(self, prediction, review)

    ########################################################
# Gemini
########################################################

def ask_gemini(

    self,

    snapshot,

    prediction: Prediction,
    context: dict | None = None

):

    prompt = self.build_prompt(

        snapshot,
        prediction,
        context

    )

    # If using Gemini client, preserve previous behavior but enforce single-call guard
    if getattr(self, "provider", None) == "gemini":
        if self._has_executed:
            raise RuntimeError("AIJudge API already executed for this run")
        self._has_executed = True

        start = time.perf_counter()
        response = self.client.models.generate_content(model=self.MODELS[0], contents=prompt)
        elapsed = int((time.perf_counter() - start) * 1000)
        text = self.clean_response(response.text)
        result = json.loads(text)
        result = self.normalize_response(result, prediction)
        self.validate_response(result)
        result["metadata"] = self.metadata(self.MODELS[0], elapsed)
        return result

    # If provider is OpenAI, use a single POST to Chat Completions (no retries)
    raise Exception("Gemini provider not configured for ask_gemini")


def ask_openai(self, snapshot, prediction: Prediction, context: dict | None = None):
    # Build a single consolidated prompt payload
    prompt = self.build_prompt(snapshot, prediction, context)

    if self._has_executed:
        raise RuntimeError("AIJudge API already executed for this run")
    self._has_executed = True

    key = getattr(self, "openai_key", None)
    if not key:
        raise RuntimeError("OPENAI_API_KEY missing")

    import requests

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")
    url = "https://api.openai.com/v1/chat/completions"
    headers = {"Authorization": f"Bearer {key}", "Content-Type": "application/json"}
    body = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 800,
        "temperature": 0.0,
    }

    start = time.perf_counter()
    resp = requests.post(url, headers=headers, json=body, timeout=30)
    elapsed = int((time.perf_counter() - start) * 1000)
    resp.raise_for_status()
    data = resp.json()
    # Support both choices[].message.content and choices[].text
    text = None
    if "choices" in data and len(data["choices"]) > 0:
        ch = data["choices"][0]
        if "message" in ch and "content" in ch["message"]:
            text = ch["message"]["content"]
        elif "text" in ch:
            text = ch["text"]

    if text is None:
        raise RuntimeError("No text returned from OpenAI")

    text = self.clean_response(text)
    result = json.loads(text)
    result = self.normalize_response(result, prediction)
    self.validate_response(result)
    result["metadata"] = self.metadata(model, elapsed)
    return result

    raise Exception(last_error)


########################################################
# Cleaning
########################################################

def clean_response(

    self,

    text: str

) -> str:

    text = text.strip()

    if text.startswith(

        "```json"

    ):

        text = text.replace(

            "```json",

            "",

            1

        )

    if text.startswith(

        "```"

    ):

        text = text.replace(

            "```",

            "",

            1

        )

    if text.endswith(

        "```"

    ):

        text = text[:-3]

    return text.strip()


########################################################
# Metadata
########################################################

def metadata(

    self,

    model,

    elapsed_ms

):

    now = datetime.now(

        timezone.utc

    )

    minute = (

        now.minute // 5

    ) * 5

    start = now.replace(

        minute=minute,

        second=0,

        microsecond=0

    )

    end = start + timedelta(

        minutes=5

    )

    return {

        "timestamp":

            now.isoformat(),

        "model":

            model,

        "response_time_ms":

            elapsed_ms,

        "version":

            self.VERSION,

        "prediction_window": {

            "from":

                start.isoformat(),

            "to":

                end.isoformat()

        }

    }


########################################################
# Normalize
########################################################

def normalize_response(

    self,

    result,

    prediction: Prediction

):

    result.setdefault(

        "agreement",

        True

    )

    result.setdefault(

        "confidence_adjustment",

        0

    )

    result.setdefault(

        "risk",

        "MEDIUM"

    )

    result.setdefault(

        "missing_evidence",

        []

    )

    result.setdefault(

        "warnings",

        []

    )

    result.setdefault(

        "summary",

        ""

    )

    result.setdefault(

        "market_commentary",

        ""

    )

    result["agreement"] = bool(

        result["agreement"]

    )

    result["confidence_adjustment"] = max(

        -5,

        min(

            5,

            float(

                result[

                    "confidence_adjustment"

                ]

            )

        )

    )

    result["risk"] = str(

        result["risk"]

    ).upper()

    if result["risk"] not in self.VALID_RISKS:

        result["risk"] = "MEDIUM"

    return result


########################################################
# Validation
########################################################

def validate_response(

    self,

    result

):

    required = [

        "agreement",

        "confidence_adjustment",

        "risk",

        "missing_evidence",

        "warnings",

        "summary",

        "market_commentary"

    ]

    for field in required:

        if field not in result:

            raise ValueError(

                f"Missing {field}"

            )

    if not isinstance(

        result["warnings"],

        list

    ):

        raise ValueError(

            "warnings must be list"

        )

    if not isinstance(

        result["missing_evidence"],

        list

    ):

        raise ValueError(

            "missing_evidence must be list"

        )

    ########################################################
# Fallback
########################################################

def fallback(

    self,

    snapshot,
    prediction: Prediction,
    context: dict | None = None

):
    # Accept either a Prediction object or a legacy dict
    if isinstance(prediction, dict):
        sys_pred = prediction.get("prediction")
        sys_conf = float(prediction.get("confidence", 0))
    else:
        sys_pred = getattr(prediction, "direction", None)
        sys_conf = getattr(prediction, "confidence", 0.0)

    symbol_price = float(snapshot.get("current_price", snapshot.get("price", 0) or 0))

    # If context provided, build separate decisions for news, whales, indicators
    news_decision = None
    whales_decision = None
    indicators_decision = None

    try:
        if context:
            news = context.get("news", {})
            whales = context.get("whales", {})
            indicators = context.get("indicators", {})

            if news:
                news_decision = "LONG" if news.get("bullish_score", 50) > news.get("bearish_score", 50) else "SHORT"

            if whales:
                whales_decision = "LONG" if whales.get("bullish_score", 50) > whales.get("bearish_score", 50) else "SHORT"

            # indicators: prefer prediction.direction
            indicators_decision = sys_pred
    except Exception:
        news_decision = whales_decision = indicators_decision = None

    # Aggregate weighted vote: indicators 50%, news 30%, whales 20%
    def vote_value(v):
        if v == "LONG":
            return 1
        if v == "SHORT":
            return -1
        return 0

    weights = {"indicators": 0.5, "news": 0.3, "whales": 0.2}
    vote_sum = (
        vote_value(indicators_decision) * weights["indicators"]
        + vote_value(news_decision) * weights["news"]
        + vote_value(whales_decision) * weights["whales"]
    )

    ai_final = "LONG" if vote_sum > 0 else "SHORT" if vote_sum < 0 else sys_pred
    if str(sys_pred).upper() == "SHORT":
        entry = symbol_price
        stop = round(entry * 1.02, 2)
        tp1 = round(entry * 0.99, 2)
        tp2 = round(entry * 0.98, 2)
    else:
        entry = symbol_price
        stop = round(entry * 0.98, 2)
        tp1 = round(entry * 1.01, 2)
        tp2 = round(entry * 1.02, 2)

    # risk_reward: simple estimate
    rr = round(abs((tp1 - entry) / (entry - stop)) if (entry - stop) != 0 else 0, 2)

    trade_setup = {
        "quality": 5.0,
        "trend_strength": 5.0,
        "momentum": 5.0,
        "volatility": 5.0,
        "risk_score": 5.0,
    }

    return {
        "system_prediction": sys_pred,
        "system_confidence": sys_conf,
        "ai_prediction": sys_pred,
        "ai_confidence": sys_conf,
        "agreement": True,
        "confidence_adjustment": 0,
        "risk": "MEDIUM",
        "missing_evidence": [],
        "warnings": ["AI unavailable. Oracle deterministic review used."],
        "summary": "Oracle prediction accepted without AI review.",
        "market_commentary": "Gemini review unavailable. Prediction generated solely by Oracle's Evidence Engine.",
        "news_decision": news_decision,
        "whales_decision": whales_decision,
        "indicators_decision": indicators_decision,
        "ai_prediction": ai_final,
        "ai_confidence": sys_conf,
        "entry_price": entry,
        "stop_loss": stop,
        "take_profit_1": tp1,
        "take_profit_2": tp2,
        "risk_reward": rr,
        "trade_setup": trade_setup,
        "metadata": self.metadata("Oracle Fallback", 0),
    }


########################################################
# Helpers
########################################################

@staticmethod
def clamp(

    value,

    minimum,

    maximum

):

    return max(

        minimum,

        min(

            maximum,

            value

        )

    )


@staticmethod
def safe_float(

    value,

    default=0.0

):

    try:

        return float(value)

    except Exception:

        return default


########################################################
# Apply Review
########################################################

def apply_review(

    self,

    prediction: Prediction,

    review: dict

) -> Prediction:

    adjustment = review.get(

        "confidence_adjustment",

        0

    )

    prediction.confidence = round(

        self.clamp(

            prediction.confidence +

            adjustment,

            0,

            100

        ),

        2

    )

    prediction.metadata[

        "ai_review"

    ] = review

    return prediction

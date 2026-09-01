import requests
from typing import Any, Dict, Optional


class SentimentAnalyst:

    def __init__(self, snapshot: Optional[Dict[str, Any]] = None):
        self.snapshot = snapshot or {}
        self.report = {
            "module": "Sentiment",
            "bullish_score": 0,
            "bearish_score": 0,
            "net_score": 0,
            "confidence": 0,
            "prediction": "NEUTRAL",
            "fear_greed": {},
            "funding": {},
            "btc_dominance": {},
            "whale_activity": {},
            "reasons": [],
            "warnings": []
        }

    def _fetch_fear_greed(self) -> Dict[str, Any]:
        url = "https://api.alternative.me/fng/?limit=1"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        payload = response.json()
        item = payload.get("data", [{}])[0]
        return {
            "value": int(item.get("value", 50)),
            "classification": item.get("value_classification", "Neutral")
        }

    def _fetch_funding_rate(self) -> float:
        url = "https://fapi.binance.com/fapi/v1/fundingRate"
        response = requests.get(url, params={"symbol": "BTCUSDT", "limit": 1}, timeout=10)
        response.raise_for_status()
        data = response.json()
        return float(data[0]["fundingRate"])

    def analyze_fear_greed(self):
        source = self.snapshot.get("fear_greed")
        if isinstance(source, dict) and source.get("value") is not None:
            value = int(source.get("value"))
            classification = source.get("classification", "Neutral")
        else:
            fallback = self._fetch_fear_greed()
            value = fallback["value"]
            classification = fallback["classification"]

        bullish = 0
        bearish = 0
        reasons = []

        if value <= 25:
            bullish += 10
            reasons.append("Extreme Fear")
        elif value <= 45:
            bullish += 5
            reasons.append("Fear")
        elif value >= 75:
            bearish += 10
            reasons.append("Extreme Greed")
        elif value >= 55:
            bearish += 5
            reasons.append("Greed")
        else:
            reasons.append("Neutral fear and greed")

        self.report["fear_greed"] = {
            "value": value,
            "classification": classification,
            "bullish_score": bullish,
            "bearish_score": bearish,
            "reasons": reasons
        }

    def analyze_funding(self):
        funding = self.snapshot.get("funding_rate")
        if funding is None:
            funding = self._fetch_funding_rate()

        bullish = 0
        bearish = 0
        reasons = []

        if funding <= -0.0005:
            bullish += 10
            reasons.append("Extremely negative funding")
        elif funding < -0.0001:
            bullish += 5
            reasons.append("Negative funding")
        elif funding <= 0.0001:
            reasons.append("Neutral funding")
        elif funding < 0.0005:
            bearish += 5
            reasons.append("Positive funding")
        else:
            bearish += 10
            reasons.append("Extremely positive funding")

        self.report["funding"] = {
            "rate": funding,
            "bullish_score": bullish,
            "bearish_score": bearish,
            "reasons": reasons
        }

    def analyze_btc_dominance(self):
        dominance = self.snapshot.get("btc_dominance")
        bullish = 0
        bearish = 0
        reasons = []

        if dominance is None:
            reasons.append("BTC dominance unavailable")
        elif dominance >= 50:
            bullish += 5
            reasons.append("BTC dominance is strong")
        elif dominance <= 40:
            bearish += 5
            reasons.append("BTC dominance is weak")
        else:
            reasons.append("BTC dominance is neutral")

        self.report["btc_dominance"] = {
            "value": dominance,
            "bullish_score": bullish,
            "bearish_score": bearish,
            "reasons": reasons
        }

    def analyze_whale_activity(self):
        activity = self.snapshot.get("whale_activity", {})
        signal = activity.get("signal")
        reasons = []

        if signal == "elevated":
            reasons.append("Elevated whale activity")
        elif signal == "normal":
            reasons.append("Normal whale activity")
        else:
            reasons.append("Whale activity unavailable")

        self.report["whale_activity"] = {
            "signal": signal,
            "bullish_score": 0,
            "bearish_score": 0,
            "reasons": reasons
        }

    def calculate_final_score(self):
        bullish = (
            self.report["fear_greed"]["bullish_score"] +
            self.report["funding"]["bullish_score"] +
            self.report["btc_dominance"]["bullish_score"]
        )
        bearish = (
            self.report["fear_greed"]["bearish_score"] +
            self.report["funding"]["bearish_score"] +
            self.report["btc_dominance"]["bearish_score"]
        )

        total = bullish + bearish
        confidence = round(max(bullish, bearish) / total * 100, 2) if total else 0
        net = bullish - bearish

        if net >= 10:
            prediction = "LONG"
        elif net >= 5:
            prediction = "WEAK LONG"
        elif net <= -10:
            prediction = "SHORT"
        elif net <= -5:
            prediction = "WEAK SHORT"
        else:
            prediction = "NEUTRAL"

        self.report["bullish_score"] = bullish
        self.report["bearish_score"] = bearish
        self.report["net_score"] = net
        self.report["confidence"] = confidence
        self.report["prediction"] = prediction
        self.report["reasons"] = (
            self.report["fear_greed"]["reasons"] +
            self.report["funding"]["reasons"] +
            self.report["btc_dominance"]["reasons"] +
            self.report["whale_activity"]["reasons"]
        )

    def analyze(self) -> Dict[str, Any]:
        self.analyze_fear_greed()
        self.analyze_funding()
        self.analyze_btc_dominance()
        self.analyze_whale_activity()
        self.calculate_final_score()
        return self.report
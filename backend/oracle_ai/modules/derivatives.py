import requests

from modules.market_memory import MarketMemory


class DerivativesAnalyst:

    def __init__(self, market_snapshot):

        self.market = market_snapshot
        self.memory = MarketMemory()

        self.report = {
            "module": "Derivatives",
            "bullish_score": 0,
            "bearish_score": 0,
            "net_score": 0,
            "confidence": 0,
            "prediction": "NEUTRAL",
            "open_interest": {},
            "funding": {},
            "reasons": [],
            "warnings": []
        }

    ##########################################################
    # OPEN INTEREST
    ##########################################################

    def analyze_open_interest(self):
        current = self.market.get("open_interest")
        previous = self.memory.previous()
        bullish = 0
        bearish = 0
        reasons = []
        change = None
        change_pct = None

        if previous and previous.get("open_interest") is not None and current is not None:
            old = float(previous["open_interest"])
            change = current - old
            change_pct = (change / old) * 100 if old else None

            if change_pct is not None:
                if change_pct > 2.0:
                    bullish += 10
                    reasons.append("Open interest rising faster than 2%.")
                elif change_pct < -2.0:
                    bearish += 10
                    reasons.append("Open interest dropping faster than 2%.")
                else:
                    reasons.append("Open interest stable.")
        else:
            reasons.append("No historical open interest available.")

        self.report["open_interest"] = {
            "current": current,
            "previous": previous["open_interest"] if previous else None,
            "change": round(change, 2) if change is not None else None,
            "change_pct": round(change_pct, 2) if change_pct is not None else None,
            "bullish_score": bullish,
            "bearish_score": bearish,
            "reasons": reasons
        }

    ##########################################################
    # FUNDING
    ##########################################################

    def analyze_funding(self):
        funding = self.market.get("funding_rate")
        bullish = 0
        bearish = 0
        reasons = []

        if funding is None:
            reasons.append("Funding rate unavailable.")
        else:
            if funding <= -0.0005:
                bullish += 10
                reasons.append("Extremely negative funding.")
            elif funding < -0.0001:
                bullish += 5
                reasons.append("Negative funding.")
            elif funding <= 0.0001:
                reasons.append("Neutral funding.")
            elif funding < 0.0005:
                bearish += 5
                reasons.append("Positive funding.")
            else:
                bearish += 10
                reasons.append("Extremely positive funding.")

        self.report["funding"] = {
            "rate": funding,
            "bullish_score": bullish,
            "bearish_score": bearish,
            "reasons": reasons
        }

    ##########################################################
    # FINAL SCORE
    ##########################################################

    def analyze_long_short_ratio(self):
        ratio = self.market.get("long_short_ratio")
        bullish = 0
        bearish = 0
        reasons = []

        if ratio is None:
            reasons.append("Long/short ratio unavailable.")
        elif ratio >= 1.2:
            bearish += 5
            reasons.append("Long positions heavily outweigh shorts.")
        elif ratio <= 0.8:
            bullish += 5
            reasons.append("Short positions heavily outweigh longs.")
        else:
            reasons.append("Long/short ratio is balanced.")

        self.report["long_short_ratio"] = {
            "ratio": ratio,
            "bullish_score": bullish,
            "bearish_score": bearish,
            "reasons": reasons
        }

    def analyze_liquidations(self):
        liquidations = self.market.get("liquidations")
        bullish = 0
        bearish = 0
        reasons = []

        if not isinstance(liquidations, dict):
            reasons.append("Liquidation data unavailable.")
        else:
            count = liquidations.get("count")
            if isinstance(count, int) and count >= 3:
                bearish += 5
                reasons.append("Elevated liquidation activity.")
            else:
                reasons.append("Liquidation activity is normal.")

        self.report["liquidations"] = {
            "value": liquidations,
            "bullish_score": bullish,
            "bearish_score": bearish,
            "reasons": reasons
        }

    def calculate_final_score(self):
        bullish = (
            self.report["open_interest"]["bullish_score"] +
            self.report["funding"]["bullish_score"] +
            self.report["long_short_ratio"]["bullish_score"] +
            self.report["liquidations"]["bullish_score"]
        )
        bearish = (
            self.report["open_interest"]["bearish_score"] +
            self.report["funding"]["bearish_score"] +
            self.report["long_short_ratio"]["bearish_score"] +
            self.report["liquidations"]["bearish_score"]
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
            self.report["open_interest"]["reasons"] +
            self.report["funding"]["reasons"] +
            self.report["long_short_ratio"]["reasons"] +
            self.report["liquidations"]["reasons"]
        )

    ##########################################################
    # MAIN
    ##########################################################

    def analyze(self):
        self.analyze_open_interest()
        self.analyze_funding()
        self.analyze_long_short_ratio()
        self.analyze_liquidations()
        self.calculate_final_score()
        return self.report
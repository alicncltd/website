"""
=========================================================
Oracle AI

ADX Analyst

Purpose
-------
Analyzes trend strength.

Produces evidence about:

- Trend Strength
- Trend Quality
- Trend Persistence

Never predicts LONG or SHORT.
=========================================================
"""

from __future__ import annotations

import pandas as pd
from ta.trend import ADXIndicator

from analyst.base_analyst import BaseAnalyst


class ADXAnalyst(BaseAnalyst):

    @property
    def name(self):
        return "ADX Analyst"

    @property
    def category(self):
        return "technical"

    def analyze(self):

        result = self.result()

        history = self.snapshot.history

        if len(history) < 30:

            result.warnings.append(
                "Not enough candles for ADX analysis."
            )

            return result

        df = pd.DataFrame(history)

        for col in (
            "high",
            "low",
            "close",
        ):
            df[col] = df[col].astype(float)

        ####################################################
        # ADX
        ####################################################

        adx = ADXIndicator(

            high=df["high"],

            low=df["low"],

            close=df["close"]

        )

        df["adx"] = adx.adx()

        value = float(df["adx"].iloc[-1])

        ####################################################
        # Trend Strength
        ####################################################

        if value >= 50:

            confidence = 96
            reliability = 96
            importance = 1.20

        elif value >= 35:

            confidence = 90
            reliability = 92
            importance = 1.10

        elif value >= 25:

            confidence = 82
            reliability = 86
            importance = 1.00

        elif value >= 20:

            confidence = 70
            reliability = 78
            importance = 0.80

        else:

            confidence = 55
            reliability = 65
            importance = 0.50

        strength = min(value * 2, 100)

        result.add_evidence(

            self.evidence(

                id="adx_strength",

                name="Trend Strength",

                bullish=strength,

                bearish=100-strength,

                confidence=confidence,

                reliability=reliability,

                importance=importance,

                reason=f"ADX = {value:.2f}",

                metadata={

                    "adx": round(value,2)

                }

            )

        )

        ####################################################
        # Trend Quality
        ####################################################

        quality = min(value * 2.5,100)

        result.add_evidence(

            self.evidence(

                id="trend_quality",

                name="Trend Quality",

                bullish=quality,

                bearish=100-quality,

                confidence=84,

                reliability=88,

                importance=1.0,

                reason="Higher ADX generally indicates cleaner trend.",

                metadata={

                    "quality": round(quality,2)

                }

            )

        )

        ####################################################
        # Trend Persistence
        ####################################################

        recent = df["adx"].tail(5)

        slope = recent.iloc[-1] - recent.iloc[0]

        if slope >= 0:

            bullish = 80
            bearish = 20

            reason = "Trend strength increasing."

        else:

            bullish = 20
            bearish = 80

            reason = "Trend strength weakening."

        result.add_evidence(

            self.evidence(

                id="trend_persistence",

                name="Trend Persistence",

                bullish=bullish,

                bearish=bearish,

                confidence=78,

                reliability=84,

                importance=0.90,

                reason=reason,

                metadata={

                    "adx_slope": round(float(slope),3)

                }

            )

        )

        return result

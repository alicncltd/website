"""
=========================================================
Oracle AI

EMA Analyst

Purpose
-------
Analyzes EMA alignment and trend strength.

Produces ONLY evidence.

Never predicts LONG or SHORT.
=========================================================
"""

from __future__ import annotations

import pandas as pd
from ta.trend import EMAIndicator

from analyst.base_analyst import BaseAnalyst


class EMAAnalyst(BaseAnalyst):

    @property
    def name(self) -> str:
        return "EMA Analyst"

    @property
    def category(self) -> str:
        return "technical"

    def analyze(self):

        result = self.result()

        history = self.snapshot.history

        if len(history) < 200:

            result.warnings.append(
                "Not enough candles for EMA analysis."
            )

            return result

        df = pd.DataFrame(history)

        for col in (
            "close",
            "high",
            "low",
            "open",
            "volume",
        ):
            df[col] = df[col].astype(float)

        ####################################################
        # EMA
        ####################################################

        df["ema20"] = EMAIndicator(
            close=df["close"],
            window=20
        ).ema_indicator()

        df["ema50"] = EMAIndicator(
            close=df["close"],
            window=50
        ).ema_indicator()

        df["ema200"] = EMAIndicator(
            close=df["close"],
            window=200
        ).ema_indicator()

        last = df.iloc[-1]

        ema20 = float(last["ema20"])
        ema50 = float(last["ema50"])
        ema200 = float(last["ema200"])

        ####################################################
        # Alignment
        ####################################################

        if ema20 > ema50 > ema200:

            bullish = 95
            bearish = 5

            confidence = 94
            reliability = 95

            reason = (
                "EMA20 > EMA50 > EMA200 "
                "(strong bullish alignment)"
            )

        elif ema20 < ema50 < ema200:

            bullish = 5
            bearish = 95

            confidence = 94
            reliability = 95

            reason = (
                "EMA20 < EMA50 < EMA200 "
                "(strong bearish alignment)"
            )

        elif ema20 > ema50:

            bullish = 70
            bearish = 30

            confidence = 75
            reliability = 82

            reason = (
                "EMA20 above EMA50."
            )

        elif ema20 < ema50:

            bullish = 30
            bearish = 70

            confidence = 75
            reliability = 82

            reason = (
                "EMA20 below EMA50."
            )

        else:

            bullish = 50
            bearish = 50

            confidence = 55
            reliability = 60

            reason = (
                "Mixed EMA alignment."
            )

        result.add(

            self.evidence(

                id="ema_alignment",

                name="EMA Alignment",

                bullish=bullish,

                bearish=bearish,

                confidence=confidence,

                reliability=reliability,

                reason=reason,

                metadata={

                    "ema20": round(
                        ema20,
                        2
                    ),

                    "ema50": round(
                        ema50,
                        2
                    ),

                    "ema200": round(
                        ema200,
                        2
                    )

                }

            )

        )

        ####################################################
        # EMA Slope
        ####################################################

        slope20 = df["ema20"].iloc[-1] - df["ema20"].iloc[-5]

        if slope20 > 0:

            bullish = min(
                100,
                50 + abs(slope20) * 300
            )

            bearish = 100 - bullish

            reason = "EMA20 rising."

        else:

            bearish = min(
                100,
                50 + abs(slope20) * 300
            )

            bullish = 100 - bearish

            reason = "EMA20 falling."

        result.add(

            self.evidence(

                id="ema_slope",

                name="EMA20 Slope",

                bullish=bullish,

                bearish=bearish,

                confidence=80,

                reliability=85,

                reason=reason,

                metadata={

                    "slope": round(
                        float(slope20),
                        6
                    )

                }

            )

        )

        return result

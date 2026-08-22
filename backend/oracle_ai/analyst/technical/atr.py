"""
=========================================================
Oracle AI

ATR Analyst

Purpose
-------
Analyzes market volatility.

Produces evidence about:

- Volatility Level
- Volatility Expansion
- Volatility Stability

Never predicts LONG or SHORT.
=========================================================
"""

from __future__ import annotations

import pandas as pd
from ta.volatility import AverageTrueRange

from analyst.base_analyst import BaseAnalyst


class ATRAnalyst(BaseAnalyst):

    @property
    def name(self):
        return "ATR Analyst"

    @property
    def category(self):
        return "technical"

    def analyze(self):

        result = self.result()

        history = self.snapshot.history

        if len(history) < 30:

            result.warnings.append(
                "Not enough candles for ATR."
            )

            return result

        df = pd.DataFrame(history)

        for col in (
            "high",
            "low",
            "close",
        ):
            df[col] = df[col].astype(float)

        atr = AverageTrueRange(
            high=df["high"],
            low=df["low"],
            close=df["close"]
        )

        df["atr"] = atr.average_true_range()

        current = float(df["atr"].iloc[-1])

        average = float(df["atr"].tail(20).mean())

        ratio = current / max(average, 1e-9)

        ####################################################
        # Volatility Level
        ####################################################

        score = min(ratio * 50, 100)

        result.add_evidence(

            self.evidence(

                source=self.name,

                id="volatility_level",

                name="Volatility Level",

                bullish=score,

                bearish=100-score,

                confidence=82,

                reliability=88,

                importance=0.90,

                reason=f"ATR is {ratio:.2f}x its 20-period average.",

                metadata={

                    "atr": round(current, 4),

                    "ratio": round(ratio, 3)

                }

            )

        )

        ####################################################
        # Volatility Expansion
        ####################################################

        slope = df["atr"].iloc[-1] - df["atr"].iloc[-5]

        if slope >= 0:

            bullish = 80
            bearish = 20

            reason = "Volatility expanding."

        else:

            bullish = 20
            bearish = 80

            reason = "Volatility contracting."

        result.add_evidence(

            self.evidence(

                source=self.name,

                id="volatility_expansion",

                name="Volatility Expansion",

                bullish=bullish,

                bearish=bearish,

                confidence=78,

                reliability=84,

                importance=0.85,

                reason=reason,

                metadata={

                    "atr_slope": round(float(slope), 4)

                }

            )

        )

        ####################################################
        # Expected Move
        ####################################################

        expected_move = (
            current /
            df["close"].iloc[-1]
        ) * 100

        result.add_evidence(

            self.evidence(

                source=self.name,

                id="expected_move",

                name="Expected Move",

                bullish=50,

                bearish=50,

                confidence=75,

                reliability=90,

                importance=1.10,

                reason=f"Estimated move ±{expected_move:.2f}%",

                metadata={

                    "expected_move_percent":
                        round(expected_move, 3)

                }

            )

        )

        return result

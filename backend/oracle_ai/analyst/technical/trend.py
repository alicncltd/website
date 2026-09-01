"""
=========================================================
Oracle AI

Trend Analyst

Purpose
-------
Analyzes market structure.

Produces evidence about:

- Trend Direction
- Trend Strength
- Higher Highs / Lower Lows

Never predicts LONG or SHORT.
=========================================================
"""

from __future__ import annotations

import pandas as pd

from analyst.base_analyst import BaseAnalyst


class TrendAnalyst(BaseAnalyst):

    @property
    def name(self) -> str:
        return "Trend Analyst"

    @property
    def category(self) -> str:
        return "technical"

    def analyze(self):

        result = self.result()

        history = self.snapshot.history

        if len(history) < 30:

            result.warnings.append(
                "Not enough candles for trend analysis."
            )

            return result

        df = pd.DataFrame(history)

        for col in (
            "open",
            "high",
            "low",
            "close",
            "volume",
        ):
            df[col] = df[col].astype(float)

        ####################################################
        # Higher Highs / Lower Lows
        ####################################################

        highs = df["high"].tail(10).tolist()
        lows = df["low"].tail(10).tolist()

        higher_highs = sum(
            highs[i] > highs[i - 1]
            for i in range(1, len(highs))
        )

        lower_lows = sum(
            lows[i] < lows[i - 1]
            for i in range(1, len(lows))
        )

        total = max(
            higher_highs + lower_lows,
            1
        )

        bullish = round(
            higher_highs / total * 100,
            2
        )

        bearish = round(
            lower_lows / total * 100,
            2
        )

        result.add(

            self.evidence(

                id="trend_structure",

                name="Trend Structure",

                bullish=bullish,

                bearish=bearish,

                confidence=80,

                reliability=88,

                reason=(
                    f"{higher_highs} Higher Highs | "
                    f"{lower_lows} Lower Lows"
                ),

                metadata={

                    "higher_highs": higher_highs,

                    "lower_lows": lower_lows

                }

            )

        )

        ####################################################
        # Price Position
        ####################################################

        highest = df["high"].tail(20).max()
        lowest = df["low"].tail(20).min()

        current = df["close"].iloc[-1]

        position = (
            (current - lowest)
            /
            (highest - lowest + 1e-9)
        ) * 100

        bullish = round(position, 2)
        bearish = round(100 - position, 2)

        result.add(

            self.evidence(

                id="price_position",

                name="Price Position",

                bullish=bullish,

                bearish=bearish,

                confidence=78,

                reliability=84,

                reason="Current position inside 20-candle range.",

                metadata={

                    "position": round(position, 2)

                }

            )

        )

        ####################################################
        # Trend Strength
        ####################################################

        first = df["close"].iloc[-20]
        last = df["close"].iloc[-1]

        move = ((last - first) / first) * 100

        strength = min(
            abs(move) * 20,
            100
        )

        if move >= 0:

            bullish = strength
            bearish = 100 - strength

        else:

            bearish = strength
            bullish = 100 - strength

        result.add(

            self.evidence(

                id="trend_strength",

                name="Trend Strength",

                bullish=round(bullish, 2),

                bearish=round(bearish, 2),

                confidence=82,

                reliability=86,

                reason=f"{move:.2f}% movement over last 20 candles.",

                metadata={

                    "move_percent": round(move, 3)

                }

            )

        )

        return result

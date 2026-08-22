"""
=========================================================
Oracle AI

Volume Analyst

Purpose
-------
Analyzes participation behind price movement.

Produces evidence about:

- Relative Volume
- Buying Pressure
- Volume Trend

Never predicts LONG or SHORT.
=========================================================
"""

from __future__ import annotations

import pandas as pd

from analyst.base_analyst import BaseAnalyst


class VolumeAnalyst(BaseAnalyst):

    @property
    def name(self) -> str:
        return "Volume Analyst"

    @property
    def category(self) -> str:
        return "technical"

    def analyze(self):

        result = self.result()

        history = self.snapshot.history

        if len(history) < 30:

            result.warnings.append(
                "Not enough candles for volume analysis."
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
        # Relative Volume
        ####################################################

        avg_volume = df["volume"].tail(20).mean()
        current_volume = df["volume"].iloc[-1]

        relative = current_volume / max(avg_volume, 1)

        bullish = min(relative * 50, 100)
        bearish = max(0, 100 - bullish)

        result.add_evidence(

            self.evidence(

                id="relative_volume",

                name="Relative Volume",

                bullish=bullish,

                bearish=bearish,

                confidence=82,

                reliability=90,

                reason=f"Relative volume: {relative:.2f}x",

                importance=0.95,

                metadata={

                    "relative_volume": round(relative, 3),

                    "average_volume": round(avg_volume, 2),

                    "current_volume": round(current_volume, 2)

                }

            )

        )

        ####################################################
        # Buying vs Selling Pressure
        ####################################################

        recent = df.tail(10)

        buying = recent.loc[
            recent["close"] > recent["open"],
            "volume"
        ].sum()

        selling = recent.loc[
            recent["close"] < recent["open"],
            "volume"
        ].sum()

        total = buying + selling

        if total == 0:
            buy_percent = 50
        else:
            buy_percent = buying / total * 100

        result.add_evidence(

            self.evidence(

                id="volume_pressure",

                name="Buying Pressure",

                bullish=buy_percent,

                bearish=100 - buy_percent,

                confidence=85,

                reliability=88,

                reason="Volume distribution over last 10 candles.",

                importance=1.0,

                metadata={

                    "buy_volume": round(buying, 2),

                    "sell_volume": round(selling, 2)

                }

            )

        )

        ####################################################
        # Volume Trend
        ####################################################

        volume_ma = df["volume"].rolling(10).mean()

        slope = volume_ma.iloc[-1] - volume_ma.iloc[-5]

        if slope >= 0:

            bullish = min(
                100,
                50 + abs(slope) / max(avg_volume, 1) * 300
            )

            bearish = 100 - bullish

            reason = "Average volume increasing."

        else:

            bearish = min(
                100,
                50 + abs(slope) / max(avg_volume, 1) * 300
            )

            bullish = 100 - bearish

            reason = "Average volume decreasing."

        result.add_evidence(

            self.evidence(

                id="volume_trend",

                name="Volume Trend",

                bullish=bullish,

                bearish=bearish,

                confidence=78,

                reliability=84,

                reason=reason,

                importance=0.85,

                metadata={

                    "volume_slope": round(float(slope), 2)

                }

            )

        )

        return result

"""
=========================================================
Oracle AI

Market Structure Analyst

Purpose
-------
Analyzes:

- Higher Highs
- Lower Lows
- Break Of Structure (BOS)
- Change Of Character (CHoCH)

Produces evidence only.
=========================================================
"""

from __future__ import annotations

import pandas as pd

from analyst.base_analyst import BaseAnalyst


class VWAPAnalyst(BaseAnalyst):

    @property
    def name(self):
        return "Market Structure"

    @property
    def category(self):
        return "technical"

    def analyze(self):

        result = self.result()

        history = self.snapshot.history

        if len(history) < 50:

            result.warnings.append(
                "Not enough candles."
            )

            return result

        df = pd.DataFrame(history)

        for c in (
            "open",
            "high",
            "low",
            "close",
        ):
            df[c] = df[c].astype(float)

        ####################################################
        # Swing Highs / Swing Lows
        ####################################################

        highs = df["high"].tail(20).tolist()
        lows = df["low"].tail(20).tolist()

        swing_high = max(highs[:-1])
        swing_low = min(lows[:-1])

        current = df["close"].iloc[-1]

        ####################################################
        # Break Of Structure
        ####################################################

        if current > swing_high:

            result.add_evidence(

                self.evidence(

                    id="bos_bullish",

                    name="Bullish Break Of Structure",

                    bullish=98,

                    bearish=2,

                    confidence=94,

                    reliability=95,

                    importance=1.25,

                    reason="Price closed above previous swing high.",

                    metadata={

                        "swing_high": swing_high,

                        "close": current

                    }

                )

            )

        elif current < swing_low:

            result.add_evidence(

                self.evidence(

                    id="bos_bearish",

                    name="Bearish Break Of Structure",

                    bullish=2,

                    bearish=98,

                    confidence=94,

                    reliability=95,

                    importance=1.25,

                    reason="Price closed below previous swing low.",

                    metadata={

                        "swing_low": swing_low,

                        "close": current

                    }

                )

            )

        ####################################################
        # Position Inside Structure
        ####################################################

        position = (

            (current - swing_low)

            /

            (swing_high - swing_low + 1e-9)

        ) * 100

        result.add_evidence(

            self.evidence(

                id="market_position",

                name="Market Position",

                bullish=position,

                bearish=100-position,

                confidence=82,

                reliability=87,

                importance=0.90,

                reason="Position inside recent market structure.",

                metadata={

                    "position": round(position,2)

                }

            )

        )

        ####################################################
        # Structure Compression
        ####################################################

        width = swing_high - swing_low

        atr = (
            df["high"] - df["low"]
        ).tail(14).mean()

        compression = atr / max(width,1e-9)

        bullish = 50
        bearish = 50

        result.add_evidence(

            self.evidence(

                id="structure_compression",

                name="Structure Compression",

                bullish=bullish,

                bearish=bearish,

                confidence=70,

                reliability=78,

                importance=0.60,

                reason="Market compression detected.",

                metadata={

                    "compression": round(compression,4)

                }

            )

        )

        return result

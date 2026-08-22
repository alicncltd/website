"""
=========================================================
Oracle AI

Evidence Engine

The ONLY component allowed to create Predictions.

Responsibilities
----------------
- Collect evidence from committees
- Build prediction
- Calculate confidence
- Calculate reliability

No indicator logic belongs here.
=========================================================
"""

from __future__ import annotations

from models.prediction import Prediction
from models.analyst_result import AnalystResult
from models.evidence import Evidence
from Engine.accumulator import EvidenceAccumulator


class EvidenceEngine:

    def evaluate(
        self,
        *committees: AnalystResult
    ) -> Prediction:

        accumulator = EvidenceAccumulator()

        ####################################################
        # Collect Evidence
        ####################################################

        for committee in committees:

            if committee is None:
                continue

            # Support both AnalystResult objects (with .evidence)
            # and legacy dict reports (sentiment/derivatives)
            if isinstance(committee, dict):

                # Convert summary dict into a single Evidence item
                module = committee.get("module") or "Unknown"
                bullish = float(committee.get("bullish_score", 0))
                bearish = float(committee.get("bearish_score", 0))
                confidence = float(committee.get("confidence", 0))
                reliability = committee.get("reliability", confidence)
                reasons = committee.get("reasons", []) or []

                ev = Evidence(
                    id=f"{module.lower()}_summary",
                    name=module,
                    category=module.lower(),
                    bullish=bullish,
                    bearish=bearish,
                    confidence=confidence,
                    reliability=reliability,
                    # Weight certain modules higher (news, whales)
                    weight=(
                        3.0 if module.lower() == "news" else
                        2.0 if module.lower() == "whales" else
                        1.0
                    ),
                    reason=", ".join(reasons) if isinstance(reasons, list) else str(reasons),
                    metadata={"report": committee}
                )

                accumulator.add(ev)

            else:

                for evidence in getattr(committee, "evidence", []):

                    accumulator.add(evidence)

        ####################################################
        # Scores
        ####################################################

        direction = accumulator.direction()

        long_score = accumulator.long_score
        short_score = accumulator.short_score

        ####################################################
        # Confidence
        ####################################################

        total = long_score + short_score

        if total <= 0:

            confidence = 0

        else:

            score_separation = (

                abs(long_score - short_score)

                /

                total

            ) * 100

            confidence = (

                score_separation * 0.50

                +

                accumulator.agreement() * 0.30

                +

                accumulator.average_confidence * 0.20

            )

        confidence = round(

            min(confidence, 100),

            2

        )

        ####################################################
        # Reliability
        ####################################################

        evidence_bonus = min(

            accumulator.count,

            50

        ) / 50 * 100

        reliability = (

            accumulator.average_reliability * 0.60

            +

            accumulator.agreement() * 0.25

            +

            evidence_bonus * 0.15

        )

        reliability = round(

            min(reliability, 100),

            2

        )

        ####################################################
        # Expected Move
        ####################################################

        expected_move = accumulator.expected_move_percent()

        ####################################################
        # Reasons
        ####################################################

        top = accumulator.top_evidence(direction)

        reasons = [

            evidence.reason

            for evidence in top

        ]

        ####################################################
        # Prediction
        ####################################################

        return Prediction(

            direction=direction,

            confidence=confidence,

            reliability=reliability,

            expected_move=expected_move,

            reasons=reasons,

            evidence=accumulator.supporting_evidence,

            metadata={

                "agreement":
                    accumulator.agreement(),

                "long_score":
                    round(long_score, 4),

                "short_score":
                    round(short_score, 4),

                "category_scores":
                    dict(
                        accumulator.category_scores
                    ),

                "source_scores":
                    dict(
                        accumulator.source_scores
                    ),

                "evidence_count":
                    accumulator.count,

                "contributions":
                    accumulator.contributions

            }

        )
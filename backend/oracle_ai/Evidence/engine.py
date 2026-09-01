"""
=========================================================
Oracle AI

Evidence Engine

The ONLY component allowed to create a Prediction.
=========================================================
"""

from __future__ import annotations

from engine.accumulator import EvidenceAccumulator
from models.evidence import Evidence
from models.prediction import Prediction


class EvidenceEngine:

    def evaluate(
        self,
        evidence: list[Evidence]
    ) -> Prediction:

        accumulator = EvidenceAccumulator()

        for item in evidence:

            accumulator.add(item)

        long_score = accumulator.long_score
        short_score = accumulator.short_score

        direction = accumulator.direction()

        agreement = accumulator.agreement()

        ####################################################
        # Confidence
        ####################################################

        total = long_score + short_score

        if total <= 0:

            confidence = 0.0

        else:

            separation = (

                abs(long_score - short_score)

                /

                total

            ) * 100

            quality = (

                accumulator.average_confidence

                * 0.20

                +

                accumulator.average_reliability

                * 0.20

            )

            consensus = agreement * 0.60

            confidence = min(

                100,

                separation * 0.50

                +

                consensus

                +

                quality

            )

        ####################################################
        # Reliability
        ####################################################

        evidence_bonus = min(

            accumulator.count,

            40

        ) / 40 * 100

        reliability = (

            accumulator.average_reliability * 0.60

            +

            agreement * 0.25

            +

            evidence_bonus * 0.15

        )

        ####################################################
        # Top Evidence
        ####################################################

        top = accumulator.top_evidence(
            direction
        )

        reasons = [

            e.reason

            for e in top

        ]

        ####################################################
        # Prediction
        ####################################################

        prediction = Prediction(

            direction=direction,

            confidence=round(
                confidence,
                2
            ),

            reliability=round(
                reliability,
                2
            ),

            expected_move=
            accumulator.expected_move_percent(),

            reasons=reasons,

            evidence=accumulator.supporting_evidence,

            metadata={

                "agreement":
                    agreement,

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

                "contributions":
                    accumulator.contributions,

                "evidence_count":
                    accumulator.count

            }

        )

        return prediction
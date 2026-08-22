"""
=========================================================
Oracle AI

Prediction Model

Represents Oracle's final prediction after evaluating all
available evidence.
=========================================================
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from models.evidence import Evidence


@dataclass(slots=True)
class Prediction:

    # LONG / SHORT / UNCERTAIN
    direction: str

    # Oracle confidence (0-100)
    confidence: float

    # Trustworthiness of evidence (0-100)
    reliability: float

    # Expected move (%)
    expected_move: float = 0.0

    # LOW / MEDIUM / HIGH
    risk: str = "MEDIUM"

    # Human-readable reasoning
    reasons: list[str] = field(default_factory=list)

    # Evidence used to reach this prediction
    evidence: list[Evidence] = field(default_factory=list)

    # Extra metadata
    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):

        self.direction = self.direction.upper()

        if self.direction not in (
            "LONG",
            "SHORT",
            "UNCERTAIN",
        ):
            self.direction = "UNCERTAIN"

        self.confidence = round(
            max(0.0, min(100.0, float(self.confidence))),
            2,
        )

        self.reliability = round(
            max(0.0, min(100.0, float(self.reliability))),
            2,
        )

    @property
    def publish(self) -> bool:

        return (

            self.direction != "UNCERTAIN"

            and

            self.confidence >= 60

            and

            self.reliability >= 60

        )

    def to_dict(self):

        return {

            "direction": self.direction,

            "confidence": self.confidence,

            "reliability": self.reliability,

            "expected_move": self.expected_move,

            "risk": self.risk,

            "publish": self.publish,

            "reasons": self.reasons,

            "evidence": [

                e.to_dict()

                for e in self.evidence

            ],

            "metadata": self.metadata

        }
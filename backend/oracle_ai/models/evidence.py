"""
=========================================================
Oracle AI

Evidence Model

Represents a single piece of evidence produced by an analyst.
=========================================================
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class Evidence:

    id: str

    name: str

    category: str

    bullish: float

    bearish: float

    confidence: float

    reliability: float

    weight: float = 1.0

    reason: str = ""

    metadata: dict[str, Any] = field(default_factory=dict)

    def __post_init__(self):

        self.bullish = float(self.bullish)
        self.bearish = float(self.bearish)
        self.confidence = round(max(0.0, min(100.0, float(self.confidence))), 2)
        self.reliability = round(max(0.0, min(100.0, float(self.reliability))), 2)
        self.weight = float(self.weight)

    @property
    def direction(self) -> str:

        if self.bullish > self.bearish:
            return "LONG"

        if self.bearish > self.bullish:
            return "SHORT"

        return "UNCERTAIN"

    @property
    def effective_score(self) -> float:
        """A blended score representing direction magnitude and trust."""

        magnitude = (self.bullish - self.bearish) / 100.0

        trust = (self.confidence / 100.0) * (self.reliability / 100.0)

        return round(magnitude * trust * self.weight, 6)

    def to_dict(self) -> dict[str, Any]:

        return {
            "id": self.id,
            "name": self.name,
            "category": self.category,
            "bullish": self.bullish,
            "bearish": self.bearish,
            "confidence": self.confidence,
            "reliability": self.reliability,
            "weight": self.weight,
            "reason": self.reason,
            "direction": self.direction,
            "effective_score": self.effective_score,
            "metadata": self.metadata,
        }

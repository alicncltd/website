"""
=========================================================
Oracle AI

Analyst Result Model

Every analyst returns an AnalystResult.

An analyst NEVER returns a prediction.

It only returns evidence.
=========================================================
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any

from models.evidence import Evidence


@dataclass(slots=True)
class AnalystResult:

    # Analyst name
    name: str

    # Category
    # technical
    # derivatives
    # sentiment
    # onchain
    # patterns
    category: str

    # All evidence produced by this analyst
    evidence: list[Evidence] = field(default_factory=list)

    # Optional warnings
    warnings: list[str] = field(default_factory=list)

    # Optional metadata
    metadata: dict[str, Any] = field(default_factory=dict)

    @property
    def evidence_count(self) -> int:
        return len(self.evidence)

    @property
    def average_confidence(self) -> float:

        if not self.evidence:
            return 0.0

        return round(
            sum(e.confidence for e in self.evidence)
            / len(self.evidence),
            2
        )

    @property
    def average_reliability(self) -> float:

        if not self.evidence:
            return 0.0

        return round(
            sum(e.reliability for e in self.evidence)
            / len(self.evidence),
            2
        )

    @property
    def effective_score(self) -> float:

        return round(
            sum(e.effective_score for e in self.evidence),
            4
        )

    def add(self, evidence: Evidence) -> None:
        self.evidence.append(evidence)

    def extend(self, evidence: list[Evidence]) -> None:
        self.evidence.extend(evidence)

    def to_dict(self):

        return {

            "name": self.name,

            "category": self.category,

            "evidence_count": self.evidence_count,

            "average_confidence": self.average_confidence,

            "average_reliability": self.average_reliability,

            "effective_score": self.effective_score,

            "warnings": self.warnings,

            "metadata": self.metadata,

            "evidence": [
                e.to_dict()
                for e in self.evidence
            ]

        }
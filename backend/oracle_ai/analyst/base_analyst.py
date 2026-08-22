"""
=========================================================
Oracle AI

Base Analyst

Every Oracle analyst inherits from this class.

Responsibilities
----------------
- Validate snapshot
- Produce Evidence
- Return AnalystResult

An analyst NEVER makes a prediction.

It only contributes evidence.
=========================================================
"""

from __future__ import annotations

from abc import ABC, abstractmethod

from models.snapshot import Snapshot
from models.evidence import Evidence
from models.analyst_result import AnalystResult


class BaseAnalyst(ABC):

    def __init__(self, snapshot: Snapshot):

        self.snapshot = snapshot

    @property
    @abstractmethod
    def name(self) -> str:
        ...

    @property
    @abstractmethod
    def category(self) -> str:
        ...

    @abstractmethod
    def analyze(self) -> AnalystResult:
        """
        Must return an AnalystResult.
        """
        ...

    #########################################################
    # Helpers
    #########################################################

    def result(self) -> AnalystResult:

        return AnalystResult(

            name=self.name,

            category=self.category

        )

    def evidence(

        self,

        id: str,

        name: str,

        bullish: float,

        bearish: float,

        confidence: float,

        reliability: float,

        reason: str,

        weight: float = 1.0,

        metadata: dict | None = None,

        **kwargs

    ) -> Evidence:

        if metadata is None:
            metadata = {}

        if "importance" in kwargs:
            weight = kwargs.pop("importance")

        for k, v in kwargs.items():
            metadata[k] = v

        return Evidence(

            id=id,

            name=name,

            category=self.category,

            bullish=bullish,

            bearish=bearish,

            confidence=confidence,

            reliability=reliability,

            weight=weight,

            reason=reason,

            metadata=metadata

        )

    @staticmethod
    def normalize(

        value: float,

        minimum: float,

        maximum: float

    ) -> float:
        """
        Normalize a value to 0-100.
        """

        if maximum == minimum:
            return 50.0

        score = (
            (value - minimum)
            /
            (maximum - minimum)
        ) * 100

        return round(

            max(
                0.0,
                min(
                    100.0,
                    score
                )
            ),

            2

        )
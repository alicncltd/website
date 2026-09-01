"""
=========================================================
Oracle AI

Technical Committee

Collects evidence from every technical analyst.

It NEVER makes predictions.
It NEVER scores markets.

Its only responsibility is combining evidence.
=========================================================
"""

from __future__ import annotations

from analyst.base_analyst import BaseAnalyst

from analyst.technical.ema import EMAAnalyst
from analyst.technical.trend import TrendAnalyst
from analyst.technical.volume import VolumeAnalyst
from analyst.technical.market_structure import MarketStructureAnalyst
from analyst.technical.vwap import VWAPAnalyst
from analyst.technical.adx import ADXAnalyst
from analyst.technical.atr import ATRAnalyst


class TechnicalCommittee(BaseAnalyst):

    @property
    def name(self):
        return "Technical Committee"

    @property
    def category(self):
        return "technical"

    def __init__(self, snapshot):

        super().__init__(snapshot)

        self.analysts = [
            EMAAnalyst,
            TrendAnalyst,
            VolumeAnalyst,
            MarketStructureAnalyst,
            VWAPAnalyst,
            ADXAnalyst,
            ATRAnalyst,
        ]

    def analyze(self):

        committee = self.result()

        for analyst_cls in self.analysts:

            try:

                analyst = analyst_cls(
                    self.snapshot
                )

                result = analyst.analyze()

                # AnalystResult exposes `extend` and `add` helpers
                committee.extend(
                    result.evidence
                )

                committee.warnings.extend(
                    result.warnings
                )

                committee.metadata[
                    analyst.name
                ] = {
                    "evidence":
                        result.evidence_count,

                    "confidence":
                        result.average_confidence,

                    "reliability":
                        result.average_reliability,
                }

            except Exception as e:

                committee.warnings.append(
                    f"{analyst_cls.__name__}: {e}"
                )

        return committee

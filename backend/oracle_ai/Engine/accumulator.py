"""
=========================================================
Oracle AI

Evidence Accumulator

Processes every Evidence object exactly once and exposes a
small API used by the EvidenceEngine. This is a minimal,
robust implementation sufficient for tests.
=========================================================
"""

from __future__ import annotations

from collections import defaultdict
from typing import List

from models.evidence import Evidence


class EvidenceAccumulator:

	def __init__(self):

		self.long_score = 0.0
		self.short_score = 0.0

		self.total_confidence = 0.0
		self.total_reliability = 0.0
		self.count = 0

		self.expected_move = 0.0

		self.reasons: List[str] = []
		self.supporting_evidence: List[Evidence] = []

		self.source_scores = defaultdict(float)
		self.category_scores = defaultdict(float)

		self.contributions: List[float] = []
		self._votes: List[str] = []

	def add(self, evidence: Evidence) -> None:

		if evidence is None:
			return

		self.count += 1

		# Contribution based on bullish/bearish percentages and weight
		long_c = (evidence.bullish / 100.0) * evidence.weight
		short_c = (evidence.bearish / 100.0) * evidence.weight

		self.long_score += long_c
		self.short_score += short_c

		self.contributions.append(long_c - short_c)

		self.total_confidence += evidence.confidence
		self.total_reliability += evidence.reliability

		magnitude = abs(evidence.bullish - evidence.bearish) / 100.0
		self.expected_move += magnitude * evidence.weight

		# Track supporting evidence and reasons
		self.supporting_evidence.append(evidence)
		if evidence.reason and evidence.reason not in self.reasons:
			self.reasons.append(evidence.reason)

		# Scores by category and source
		self.category_scores[evidence.category] += long_c - short_c

		source = evidence.metadata.get("module") or evidence.metadata.get("source") or evidence.name
		self.source_scores[source] += long_c - short_c

		# Vote
		if evidence.bullish > evidence.bearish:
			self._votes.append("LONG")
		elif evidence.bearish > evidence.bullish:
			self._votes.append("SHORT")
		else:
			self._votes.append("UNCERTAIN")

	def direction(self) -> str:

		if self.long_score > self.short_score:
			return "LONG"
		if self.short_score > self.long_score:
			return "SHORT"
		return "UNCERTAIN"

	def agreement(self) -> float:

		valid = [v for v in self._votes if v != "UNCERTAIN"]
		if not valid:
			return 0.0
		from collections import Counter

		most = Counter(valid).most_common(1)[0][1]
		return round(most / len(valid) * 100, 2)

	@property
	def average_confidence(self) -> float:
		if self.count == 0:
			return 0.0
		return round(self.total_confidence / self.count, 2)

	@property
	def average_reliability(self) -> float:
		if self.count == 0:
			return 0.0
		return round(self.total_reliability / self.count, 2)

	def expected_move_percent(self) -> float:
		# simple aggregation scaled to percent
		return round(min(self.expected_move * 100, 100.0), 2)

	def top_evidence(self, direction: str, limit: int = 3) -> List[Evidence]:
		# rank by absolute contribution
		ranked = sorted(self.supporting_evidence, key=lambda e: abs(e.bullish - e.bearish) * e.weight, reverse=True)
		return ranked[:limit]

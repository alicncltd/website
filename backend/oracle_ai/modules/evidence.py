"""
=========================================================
Oracle AI
Evidence Engine V2
=========================================================

Purpose
-------
Combine independent analyst opinions into a single
market prediction.

Evidence Engine NEVER calculates indicators.

It only evaluates analyst opinions.
"""

from collections import Counter


class EvidenceEngine:

    MODULE_WEIGHTS = {
        "Technical": 0.40,
        "Sentiment": 0.20,
        "Derivatives": 0.40,
    }

    UNCERTAIN_THRESHOLD = 0.10

    def __init__(self, *reports):
        self.reports = reports

    def _normalize_vote(self, prediction):

        prediction = str(prediction).upper()

        if "LONG" in prediction:
            return "LONG"

        if "SHORT" in prediction:
            return "SHORT"

        return "UNCERTAIN"

    def build(self):

        long_score = 0.0
        short_score = 0.0

        reasons = []
        warnings = []
        modules = []

        votes = []

        for report in self.reports:

            if not report:
                continue

            module = report.get("module", "Unknown")

            vote = self._normalize_vote(
                report.get("prediction")
            )

            confidence = float(
                report.get("confidence", 0)
            )

            weight = self.MODULE_WEIGHTS.get(
                module,
                0.33
            )

            contribution = confidence * weight

            if vote == "LONG":
                long_score += contribution

            elif vote == "SHORT":
                short_score += contribution

            votes.append(vote)

            modules.append({

                "module": module,

                "vote": vote,

                "confidence": confidence,

                "weight": weight,

                "contribution": round(contribution, 2)

            })

            for reason in report.get("reasons", []):

                if reason not in reasons:
                    reasons.append(reason)

            for warning in report.get("warnings", []):

                if warning not in warnings:
                    warnings.append(warning)

        total = long_score + short_score

        if total == 0:

            prediction = "UNCERTAIN"

            confidence = 0

        else:

            long_probability = long_score / total

            short_probability = short_score / total

            confidence = round(
                max(long_probability, short_probability) * 100,
                2
            )

            if abs(long_probability - short_probability) < self.UNCERTAIN_THRESHOLD:

                prediction = "UNCERTAIN"

            elif long_probability > short_probability:

                prediction = "LONG"

            else:

                prediction = "SHORT"

        agreement = 0

        valid_votes = [
            v for v in votes
            if v != "UNCERTAIN"
        ]

        if valid_votes:

            agreement = round(
                Counter(valid_votes).most_common(1)[0][1]
                / len(valid_votes)
                * 100,
                2
            )

        reliability = round(

            sum(
                m["confidence"]
                for m in modules
            ) / len(modules),

            2

        ) if modules else 0

        return {

            "module": "Evidence",

            "prediction": prediction,

            "confidence": confidence,

            "reliability": reliability,

            "agreement": agreement,

            "long_score": round(long_score, 2),

            "short_score": round(short_score, 2),

            "modules": modules,

            "reasons": reasons,

            "warnings": warnings,

        }
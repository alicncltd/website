import pandas as pd


class BacktestEvaluator:

    def __init__(self, results: pd.DataFrame):
        self.results = results.copy()

    def evaluate(self):

        total = len(self.results)

        if total == 0:
            return {
                "total_predictions": 0,
                "published_predictions": 0,
                "win_rate": 0,
                "long_accuracy": 0,
                "short_accuracy": 0,
                "average_confidence": 0,
                "average_reliability": 0,
            }

        published = self.results[
            self.results["publish"] == True
        ]

        published_count = len(published)

        correct = published[
            published["correct"] == True
        ]

        if published_count > 0:
            win_rate = round(
                len(correct) / published_count * 100,
                2
            )
        else:
            win_rate = 0

        longs = published[
            published["prediction"] == "LONG"
        ]

        shorts = published[
            published["prediction"] == "SHORT"
        ]

        if len(longs):
            long_accuracy = round(
                len(
                    longs[longs["correct"]]
                ) / len(longs) * 100,
                2
            )
        else:
            long_accuracy = 0

        if len(shorts):
            short_accuracy = round(
                len(
                    shorts[shorts["correct"]]
                ) / len(shorts) * 100,
                2
            )
        else:
            short_accuracy = 0

        return {

            "total_predictions": total,

            "published_predictions": published_count,

            "withheld_predictions":
                total - published_count,

            "win_rate": win_rate,

            "long_accuracy": long_accuracy,

            "short_accuracy": short_accuracy,

            "average_confidence":
                round(
                    published["confidence"].mean(),
                    2
                ) if published_count else 0,

            "average_reliability":
                round(
                    published["reliability"].mean(),
                    2
                ) if published_count else 0,
        }
class BacktestReport:

    def __init__(self, metrics: dict):
        self.metrics = metrics

    def print(self):

        print("\n" + "=" * 50)
        print("        ORACLE AI BACKTEST REPORT")
        print("=" * 50)

        print(f"Total Predictions     : {self.metrics['total_predictions']}")
        print(f"Published Signals     : {self.metrics['published_predictions']}")
        print(f"Withheld Signals      : {self.metrics['withheld_predictions']}")

        print("-" * 50)

        print(f"Win Rate              : {self.metrics['win_rate']}%")
        print(f"LONG Accuracy         : {self.metrics['long_accuracy']}%")
        print(f"SHORT Accuracy        : {self.metrics['short_accuracy']}%")

        print("-" * 50)

        print(f"Avg Confidence        : {self.metrics['average_confidence']}%")
        print(f"Avg Reliability       : {self.metrics['average_reliability']}%")

        print("=" * 50)
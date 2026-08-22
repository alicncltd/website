from pathlib import Path
import pandas as pd

from brain import Brain
from backtesting.loader import HistoricalDataLoader
from backtesting.historical_snapshot import HistoricalSnapshotBuilder
from backtesting.config import (
    CSV_FILE,
    WINDOW_SIZE,
    LOOKAHEAD,
    RESULT_FILE,
    SAVE_RESULTS,
)


class BacktestEngine:

    def __init__(self):

        self.loader = HistoricalDataLoader(CSV_FILE)
        self.brain = Brain()

        self.results = []

    ###########################################################
    # BACKTEST
    ###########################################################

    def run(self):

        total = self.loader.total_windows(
            WINDOW_SIZE,
            LOOKAHEAD
        )

        print(f"\nRunning {total} backtests...\n")

        for i in range(total):

            history = self.loader.get_window(
                i,
                WINDOW_SIZE
            )

            snapshot = HistoricalSnapshotBuilder(
                history
            ).build()

            report = self.brain.run(
                snapshot,
                backtest=True
            )

            entry = self.loader.current_price(i)

            future = self.loader.future_price(
                i,
                LOOKAHEAD
            )

            ###################################################
            # Actual Direction
            ###################################################

            actual = "LONG" if future > entry else "SHORT"

            ###################################################
            # Oracle Prediction
            ###################################################

            prediction = (
                report["final_prediction"]
                .upper()
                .strip()
            )

            if "LONG" in prediction:
                predicted_side = "LONG"

            elif "SHORT" in prediction:
                predicted_side = "SHORT"

            else:
                predicted_side = "NEUTRAL"

            ###################################################
            # Correct?
            ###################################################

            correct = (
                predicted_side == actual
            )

            ###################################################
            # Save Result
            ###################################################

            self.results.append({

                "index": i,

                "prediction": prediction,

                "predicted_side": predicted_side,

                "actual": actual,

                "correct": correct,

                "confidence":
                    report["confidence"],

                "reliability":
                    report["reliability"],

                "publish":
                    report["publish"],

                "entry":
                    entry,

                "future":
                    future,

            })

            if i % 100 == 0:
                print(f"{i}/{total}")

        #######################################################
        # SAVE RESULTS
        #######################################################

        df = pd.DataFrame(self.results)

        if SAVE_RESULTS:

            Path(
                RESULT_FILE
            ).parent.mkdir(
                parents=True,
                exist_ok=True
            )

            df.to_csv(
                RESULT_FILE,
                index=False
            )

        # Print single best-side accuracy (the side with higher accuracy)
        by_side = df.groupby('predicted_side').agg(accuracy=('correct', 'mean'))
        if not by_side.empty:
            best = by_side['accuracy'].idxmax()
            best_acc = float(by_side.loc[best, 'accuracy'])
            print(f"\nBest side: {best} (accuracy={best_acc:.4f})\n")

        print("\nFinished Backtest.\n")

        return df
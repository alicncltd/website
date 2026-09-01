import pandas as pd

from backtesting.config import (
    CSV_FILE,
    WINDOW_SIZE
)


class HistoricalDataLoader:
    """
    Loads historical Binance candle data and provides
    rolling windows for the backtesting engine.
    """

    def __init__(self, csv_file=CSV_FILE):
        self.csv_file = csv_file
        self.df = None

    ###########################################################
    # LOAD CSV
    ###########################################################

    def load(self):

        self.df = pd.read_csv(self.csv_file)

        numeric_columns = [
            "open",
            "high",
            "low",
            "close",
            "volume"
        ]

        self.df[numeric_columns] = (
            self.df[numeric_columns]
            .astype(float)
        )

        return self.df

    ###########################################################
    # TOTAL WINDOWS
    ###########################################################

    def total_windows(self, window_size, lookahead):

        if self.df is None:
            self.load()

        return max(
            0,
            len(self.df) - window_size - lookahead + 1
        )

    ###########################################################
    # GET WINDOW
    ###########################################################

    def get_window(self, index, window_size):

        if self.df is None:
            self.load()

        start = index
        end = index + window_size

        window = self.df.iloc[start:end].copy()

        history = []

        for _, row in window.iterrows():

            history.append({
                "timestamp": row["timestamp"],
                "open": float(row["open"]),
                "high": float(row["high"]),
                "low": float(row["low"]),
                "close": float(row["close"]),
                "volume": float(row["volume"])
            })

        return history

    ###########################################################
    # ENTRY PRICE
    ###########################################################

    def current_price(self, index):

        if self.df is None:
            self.load()

        return float(
            self.df.iloc[
                index + WINDOW_SIZE - 1
            ]["close"]
        )

    ###########################################################
    # FUTURE PRICE
    ###########################################################

    def future_price(self, index, lookahead):

        if self.df is None:
            self.load()

        future_index = (
            index +
            WINDOW_SIZE +
            lookahead -
            1
        )

        if future_index >= len(self.df):
            return None

        return float(
            self.df.iloc[
                future_index
            ]["close"]
        )
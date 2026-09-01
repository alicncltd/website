import csv
import time
from datetime import datetime, UTC

import requests

from backtesting.config import (
    CSV_FILE,
    SYMBOL,
    INTERVAL,
)

BASE_URL = "https://fapi.binance.com/fapi/v1/klines"
LIMIT = 1500


class BinanceDownloader:
    """
    Downloads historical Binance Futures candles and saves them to CSV.
    """

    def __init__(self):
        self.symbol = SYMBOL
        self.interval = INTERVAL

    def fetch(self, start_time=None):
        """
        Fetch one batch of candles from Binance.
        """

        params = {
            "symbol": self.symbol,
            "interval": self.interval,
            "limit": LIMIT,
        }

        if start_time is not None:
            params["startTime"] = start_time

        response = requests.get(BASE_URL, params=params, timeout=20)
        response.raise_for_status()

        return response.json()

    def download(self):

        CSV_FILE.parent.mkdir(parents=True, exist_ok=True)

        rows = []
        start_time = None

        print(f"\nDownloading {self.symbol} ({self.interval})...\n")

        while True:

            candles = self.fetch(start_time)

            if not candles:
                break

            for candle in candles:

                timestamp = datetime.fromtimestamp(
                    candle[0] / 1000,
                    tz=UTC
                ).strftime("%Y-%m-%d %H:%M:%S")

                rows.append([
                    timestamp,
                    float(candle[1]),  # Open
                    float(candle[2]),  # High
                    float(candle[3]),  # Low
                    float(candle[4]),  # Close
                    float(candle[5]),  # Volume
                ])

            print(f"Downloaded {len(rows):,} candles...", end="\r")

            # Next batch starts after the final candle
            start_time = candles[-1][0] + 1

            # Prevent API spam
            time.sleep(0.25)

            # Finished downloading
            if len(candles) < LIMIT:
                break

        with open(CSV_FILE, "w", newline="", encoding="utf-8") as file:

            writer = csv.writer(file)

            writer.writerow([
                "timestamp",
                "open",
                "high",
                "low",
                "close",
                "volume",
            ])

            writer.writerows(rows)

        print("\n")
        print("=" * 45)
        print("DOWNLOAD COMPLETE")
        print("=" * 45)
        print(f"Symbol : {self.symbol}")
        print(f"Interval : {self.interval}")
        print(f"Candles : {len(rows):,}")
        print(f"Saved To : {CSV_FILE}")
        print("=" * 45)


if __name__ == "__main__":
    BinanceDownloader().download()
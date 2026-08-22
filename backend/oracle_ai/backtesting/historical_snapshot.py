import pandas as pd

from ta.trend import EMAIndicator, MACD, ADXIndicator
from ta.momentum import RSIIndicator
from ta.volatility import BollingerBands, AverageTrueRange
from ta.volume import VolumeWeightedAveragePrice


class HistoricalSnapshotBuilder:

    def __init__(self, history):

        self.history = history

    ##########################################################
    # BUILD SNAPSHOT
    ##########################################################

    def build(self):

        df = pd.DataFrame(self.history)

        numeric = [
            "open",
            "high",
            "low",
            "close",
            "volume"
        ]

        df[numeric] = df[numeric].astype(float)

        ##################################################
        # INDICATORS
        ##################################################

        df["ema20"] = EMAIndicator(
            close=df["close"],
            window=20
        ).ema_indicator()

        df["ema50"] = EMAIndicator(
            close=df["close"],
            window=50
        ).ema_indicator()

        df["ema200"] = EMAIndicator(
            close=df["close"],
            window=200
        ).ema_indicator()

        df["rsi"] = RSIIndicator(
            close=df["close"],
            window=14
        ).rsi()

        macd = MACD(df["close"])

        df["macd"] = macd.macd()
        df["macd_signal"] = macd.macd_signal()

        df["adx"] = ADXIndicator(
            high=df["high"],
            low=df["low"],
            close=df["close"]
        ).adx()

        df["atr"] = AverageTrueRange(
            high=df["high"],
            low=df["low"],
            close=df["close"]
        ).average_true_range()

        bb = BollingerBands(df["close"])

        df["bb_upper"] = bb.bollinger_hband()
        df["bb_lower"] = bb.bollinger_lband()

        df["vwap"] = VolumeWeightedAveragePrice(
            high=df["high"],
            low=df["low"],
            close=df["close"],
            volume=df["volume"]
        ).volume_weighted_average_price()

        df["relative_volume"] = (
            df["volume"] /
            df["volume"].rolling(20).mean()
        ).fillna(1)

        last = df.iloc[-1]

        ##################################################
        # SNAPSHOT
        ##################################################

        snapshot = {

            "symbol": "BTCUSDT",

            "current_price": float(last["close"]),

            "price": float(last["close"]),

            "ema20": float(last["ema20"]),

            "ema50": float(last["ema50"]),

            "ema200": float(last["ema200"]),

            "rsi": float(last["rsi"]),

            "macd": float(last["macd"]),

            "macd_signal": float(last["macd_signal"]),

            "adx": float(last["adx"]),

            "atr": float(last["atr"]),

            "vwap": float(last["vwap"]),

            "relative_volume": float(last["relative_volume"]),

            "bollinger": {

                "upper": float(last["bb_upper"]),

                "lower": float(last["bb_lower"]),

                "width": float(
                    last["bb_upper"] -
                    last["bb_lower"]
                )

            },

            ##################################################
            # Historical placeholders
            ##################################################

            "funding_rate": 0,

            "open_interest": 0,

            "long_short_ratio": 1,

            "liquidations": None,

            "fear_greed": {

                "value": 50,

                "classification": "Neutral"

            },

            "btc_dominance": 50,

            "whale_activity": {

                "signal": "Unknown"

            },

            "history": self.history

        }

        return snapshot
import requests
from typing import Any, Dict, Optional

try:
    import pandas as pd  # type: ignore
    from ta.trend import EMAIndicator, MACD, ADXIndicator  # type: ignore
    from ta.momentum import RSIIndicator  # type: ignore
    from ta.volatility import BollingerBands, AverageTrueRange  # type: ignore
    from ta.volume import VolumeWeightedAveragePrice  # type: ignore
    HAS_TA = True
except Exception:
    pd = None  # type: ignore
    HAS_TA = False


class TechnicalAnalyst:

    def __init__(
        self,
        snapshot: Optional[Dict[str, Any]] = None,
        symbol: str = "BTCUSDT",
        interval: str = "5m",
        limit: int = 250
    ):
        self.snapshot = snapshot or {}
        self.symbol = self.snapshot.get("symbol", symbol)
        self.interval = interval
        self.limit = limit

        self.df = self._build_dataframe()

        self.report = {
            "module": "Technical",
            "bullish_score": 0,
            "bearish_score": 0,
            "net_score": 0,
            "confidence": 0,
            "prediction": "NEUTRAL",
            "trend": {},
            "momentum": {},
            "volatility": {},
            "volume": {},
            "market_structure": {},
            "reasons": [],
            "warnings": []
        }
        # If ta/pandas unavailable, use a simplified calculation path
        if HAS_TA and pd is not None:
            self.calculate_indicators()
            self.simple_mode = False
        else:
            self.simple_mode = True
            self._calculate_simple_indicators()

    def _build_dataframe(self) -> pd.DataFrame:
        history = self.snapshot.get("history")
        if not isinstance(history, list):
            history = []

        # Ensure we have a reasonable number of records for fallback
        if len(history) < 20:
            # pad by repeating the last record or using synthetic values
            base = history[-1] if history else {"close": 100.0, "open": 100.0, "high": 100.1, "low": 99.9, "volume": 1.0}
            while len(history) < 250:
                history.append(base.copy())

        if pd is None:
            return history  # type: ignore

        df = pd.DataFrame(history)
        numeric = ["open", "high", "low", "close", "volume"]
        df[numeric] = df[numeric].astype(float)
        return df.reset_index(drop=True)

    def _calculate_simple_indicators(self):
        # Lightweight indicator generation when ta/pandas are not installed
        hist = self.df if isinstance(self.df, list) else []
        last = hist[-1] if hist else {"close": 100.0}
        price = float(last.get("close", 100.0))
        atr = max(price * 0.005, 1)

        # build a minimal last-row-like dict for compatibility with later code
        last_row = {
            "close": price,
            "ema20": price,
            "ema50": price,
            "ema200": price,
            "rsi": 50.0,
            "macd": 0.0,
            "macd_signal": 0.0,
            "adx": 30.0,
            "atr": atr,
            "bb_upper": price + atr,
            "bb_lower": price - atr,
            "vwap": price,
            "relative_volume": 1.0,
            "volume": float(last.get("volume", 1.0)),
            "high": float(last.get("high", price)),
            "low": float(last.get("low", price))
        }

        # store a simple list with last two entries to mimic DataFrame iloc usage
        self.df = [last_row, last_row.copy()]
        # populate basic report
        self.report["trend"] = {
            "bullish_score": 0,
            "bearish_score": 0,
            "ema20": last_row["ema20"],
            "ema50": last_row["ema50"],
            "ema200": last_row["ema200"],
            "close": last_row["close"],
            "reasons": ["Fallback indicators used"]
        }
        self.report["momentum"] = {
            "bullish_score": 0,
            "bearish_score": 0,
            "rsi": last_row["rsi"],
            "macd": last_row["macd"],
            "signal": last_row["macd_signal"],
            "adx": last_row["adx"],
            "reasons": ["Fallback indicators used"]
        }
        self.report["volatility"] = {
            "bullish_score": 0,
            "bearish_score": 0,
            "atr": last_row["atr"],
            "bb_upper": last_row["bb_upper"],
            "bb_lower": last_row["bb_lower"],
            "reasons": ["Fallback indicators used"]
        }
        self.report["volume"] = {
            "bullish_score": 0,
            "bearish_score": 0,
            "relative_volume": last_row["relative_volume"],
            "vwap": last_row["vwap"],
            "reasons": ["Fallback indicators used"]
        }
        self.report["market_structure"] = {
            "bullish_score": 0,
            "bearish_score": 0,
            "reasons": ["Fallback indicators used"]
        }
        self.report["bullish_score"] = 0
        self.report["bearish_score"] = 0
        self.report["net_score"] = 0
        self.report["confidence"] = 0
        self.report["prediction"] = "NEUTRAL"
        self.report["reasons"] = ["Fallback indicators used"]

    def load_market(self) -> pd.DataFrame:
        url = (
            "https://fapi.binance.com/fapi/v1/klines"
            f"?symbol={self.symbol}"
            f"&interval={self.interval}"
            f"&limit={self.limit}"
        )

        data = requests.get(url, timeout=10).json()
        df = pd.DataFrame(data, columns=[
            "open_time",
            "open",
            "high",
            "low",
            "close",
            "volume",
            "close_time",
            "quote_asset_volume",
            "number_of_trades",
            "taker_buy_base",
            "taker_buy_quote",
            "ignore"
        ])

        numeric = ["open", "high", "low", "close", "volume"]
        df[numeric] = df[numeric].astype(float)
        return df

    def calculate_indicators(self):
        df = self.df

        df["ema20"] = EMAIndicator(close=df["close"], window=20).ema_indicator()
        df["ema50"] = EMAIndicator(close=df["close"], window=50).ema_indicator()
        df["ema200"] = EMAIndicator(close=df["close"], window=200).ema_indicator()

        df["rsi"] = RSIIndicator(close=df["close"], window=14).rsi()

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

        df["relative_volume"] = df["volume"] / df["volume"].rolling(20).mean()
        df["relative_volume"] = df["relative_volume"].fillna(1.0)
        self.df = df

    def analyze_trend(self):
        last = self.df.iloc[-1]
        bullish = 0
        bearish = 0
        reasons = []

        if last["ema20"] > last["ema50"] > last["ema200"]:
            bullish += 10
            reasons.append("Strong bullish EMA alignment")
        elif last["ema20"] < last["ema50"] < last["ema200"]:
            bearish += 10
            reasons.append("Strong bearish EMA alignment")
        else:
            reasons.append("Mixed EMA alignment")

        if last["close"] > last["ema20"]:
            bullish += 5
            reasons.append("Price above EMA20")
        else:
            bearish += 5
            reasons.append("Price below EMA20")

        if last["close"] > last["ema200"]:
            bullish += 5
            reasons.append("Price above EMA200")
        else:
            bearish += 5
            reasons.append("Price below EMA200")

        self.report["trend"] = {
            "bullish_score": bullish,
            "bearish_score": bearish,
            "ema20": float(last["ema20"]),
            "ema50": float(last["ema50"]),
            "ema200": float(last["ema200"]),
            "close": float(last["close"]),
            "reasons": reasons
        }

    def analyze_momentum(self):
        last = self.df.iloc[-1]
        bullish = 0
        bearish = 0
        reasons = []
        trend = self.report["trend"]

        if last["rsi"] < 30:
            bullish += 5
            reasons.append("RSI oversold")
        elif last["rsi"] > 70:
            bearish += 5
            reasons.append("RSI overbought")

        if last["macd"] > last["macd_signal"]:
            bullish += 5
            reasons.append("MACD bullish crossover")
        else:
            bearish += 5
            reasons.append("MACD bearish crossover")

        if last["adx"] > 25:
            if trend["bullish_score"] > trend["bearish_score"]:
                bullish += 5
                reasons.append("ADX confirms bullish trend")
            elif trend["bearish_score"] > trend["bullish_score"]:
                bearish += 5
                reasons.append("ADX confirms bearish trend")

        self.report["momentum"] = {
            "bullish_score": bullish,
            "bearish_score": bearish,
            "rsi": float(last["rsi"]),
            "macd": float(last["macd"]),
            "signal": float(last["macd_signal"]),
            "adx": float(last["adx"]),
            "reasons": reasons
        }

    def analyze_volatility(self):
        last = self.df.iloc[-1]
        prev = self.df.iloc[-2]
        bullish = 0
        bearish = 0
        reasons = []

        if last["close"] < last["bb_lower"]:
            bullish += 5
            reasons.append("Price below lower Bollinger Band")
        elif last["close"] > last["bb_upper"]:
            bearish += 5
            reasons.append("Price above upper Bollinger Band")

        if last["atr"] > prev["atr"]:
            if self.report["trend"]["bullish_score"] > self.report["trend"]["bearish_score"]:
                bullish += 5
                reasons.append("ATR expanding with bullish trend")
            elif self.report["trend"]["bearish_score"] > self.report["trend"]["bullish_score"]:
                bearish += 5
                reasons.append("ATR expanding with bearish trend")

        self.report["volatility"] = {
            "bullish_score": bullish,
            "bearish_score": bearish,
            "atr": float(last["atr"]),
            "bb_upper": float(last["bb_upper"]),
            "bb_lower": float(last["bb_lower"]),
            "reasons": reasons
        }

    def analyze_volume(self):
        last = self.df.iloc[-1]
        bullish = 0
        bearish = 0
        reasons = []

        if last["relative_volume"] > 1.5:
            bullish += 5
            reasons.append("High relative volume")

        if last["close"] > last["vwap"]:
            bullish += 5
            reasons.append("Price above VWAP")
        else:
            bearish += 5
            reasons.append("Price below VWAP")

        self.report["volume"] = {
            "bullish_score": bullish,
            "bearish_score": bearish,
            "relative_volume": float(last["relative_volume"]),
            "vwap": float(last["vwap"]),
            "reasons": reasons
        }

    def analyze_market_structure(self):
        df = self.df.tail(20)
        bullish = 0
        bearish = 0
        reasons = []

        highest = df["high"].max()
        lowest = df["low"].min()
        last = df.iloc[-1]
        previous = df.iloc[-2]

        if last["close"] >= highest:
            bullish += 10
            reasons.append("Bullish breakout")
        elif last["close"] <= lowest:
            bearish += 10
            reasons.append("Bearish breakdown")

        if last["high"] > previous["high"]:
            bullish += 5
            reasons.append("Higher High")
        else:
            bearish += 5
            reasons.append("Lower High")

        if last["low"] > previous["low"]:
            bullish += 5
            reasons.append("Higher Low")
        else:
            bearish += 5
            reasons.append("Lower Low")

        self.report["market_structure"] = {
            "bullish_score": bullish,
            "bearish_score": bearish,
            "reasons": reasons
        }

    def calculate_final_score(self):
        sections = [
            "trend",
            "momentum",
            "volatility",
            "volume",
            "market_structure"
        ]
        bullish = 0
        bearish = 0
        reasons = []

        for section in sections:
            bullish += self.report[section]["bullish_score"]
            bearish += self.report[section]["bearish_score"]
            reasons.extend(self.report[section]["reasons"])

        net = bullish - bearish
        total = bullish + bearish
        confidence = 0.0
        if total > 0:
            confidence = round(max(bullish, bearish) / total * 100, 2)

        if net >= 40:
            prediction = "STRONG LONG"
        elif net >= 20:
            prediction = "LONG"
        elif net >= 5:
            prediction = "WEAK LONG"
        elif net <= -40:
            prediction = "STRONG SHORT"
        elif net <= -20:
            prediction = "SHORT"
        elif net <= -5:
            prediction = "WEAK SHORT"
        else:
            prediction = "NEUTRAL"

        self.report["bullish_score"] = bullish
        self.report["bearish_score"] = bearish
        self.report["net_score"] = net
        self.report["confidence"] = confidence
        self.report["prediction"] = prediction
        self.report["reasons"] = reasons

    def generate_summary(self):
        self.report["summary"] = {
            "prediction": self.report["prediction"],
            "confidence": self.report["confidence"],
            "bullish_score": self.report["bullish_score"],
            "bearish_score": self.report["bearish_score"],
            "net_score": self.report["net_score"]
        }

    def get_indicator_snapshot(self) -> Dict[str, Any]:
        if hasattr(self.df, "iloc"):
            last = self.df.iloc[-1]
        else:
            last = self.df[-1]
        return {
            "current_price": float(last["close"]),
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
            "bb_upper": float(last["bb_upper"]),
            "bb_lower": float(last["bb_lower"])
        }

    def analyze(self) -> Dict[str, Any]:
        if getattr(self, "simple_mode", False):
            # already populated in _calculate_simple_indicators
            self.generate_summary()
            return self.report

        self.analyze_trend()
        self.analyze_momentum()
        self.analyze_volatility()
        self.analyze_volume()
        self.analyze_market_structure()
        self.calculate_final_score()
        self.generate_summary()
        return self.report

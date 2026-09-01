import logging
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

import pandas as pd
import requests
from ta.momentum import RSIIndicator
from ta.trend import ADXIndicator, EMAIndicator, MACD
from ta.volatility import AverageTrueRange, BollingerBands
from ta.volume import VolumeWeightedAveragePrice

logger = logging.getLogger(__name__)


class MarketSnapshotBuilder:
    SYMBOL = "BTCUSDT"
    INTERVAL = "5m"
    LIMIT = 250
    # For live snapshots prefer last 100 candles to keep payload small
    LIMIT = 100

    PRICE_URL = "https://api.binance.com/api/v3/ticker/price"
    OPEN_INTEREST_URL = "https://fapi.binance.com/fapi/v1/openInterest"
    FUNDING_URL = "https://fapi.binance.com/fapi/v1/fundingRate"
    KLINES_URL = "https://fapi.binance.com/fapi/v1/klines"
    BTC_DOMINANCE_URL = "https://api.coingecko.com/api/v3/global"
    LIQUIDATIONS_URL = "https://fapi.binance.com/fapi/v1/allForceOrders"
    LONG_SHORT_URL = "https://fapi.binance.com/futures/data/globalLongShortAccountRatio"

    def __init__(self, symbol: str = SYMBOL):
        self.symbol = symbol

    def build(self) -> Dict[str, Any]:
        history = self.fetch_history()
        indicators = self.compute_indicators(history)

        snapshot = {
            "symbol": self.symbol,
            "current_price": indicators["close"].iloc[-1],
            "price": indicators["close"].iloc[-1],
            "ema20": float(indicators["ema20"].iloc[-1]),
            "ema50": float(indicators["ema50"].iloc[-1]),
            "ema200": float(indicators["ema200"].iloc[-1]),
            "rsi": float(indicators["rsi"].iloc[-1]),
            "macd": float(indicators["macd"].iloc[-1]),
            "macd_signal": float(indicators["macd_signal"].iloc[-1]),
            "adx": float(indicators["adx"].iloc[-1]),
            "atr": float(indicators["atr"].iloc[-1]),
            "vwap": float(indicators["vwap"].iloc[-1]),
            "relative_volume": float(indicators["relative_volume"].iloc[-1]),
            "bollinger": {
                "upper": float(indicators["bb_upper"].iloc[-1]),
                "lower": float(indicators["bb_lower"].iloc[-1]),
                "width": float(
                    indicators["bb_upper"].iloc[-1] -
                    indicators["bb_lower"].iloc[-1]
                )
            },
            "funding_rate": self.fetch_funding_rate(),
            "open_interest": self.fetch_open_interest(),
            "long_short_ratio": self.fetch_long_short_ratio(),
            "liquidations": self.fetch_liquidations(),
            "fear_greed": self.fetch_fear_greed(),
            "btc_dominance": self.fetch_btc_dominance(),
            "whale_activity": self.estimate_whale_activity(history),
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "history": self.history_to_dicts(history)
        }

        return snapshot

    def fetch_price(self) -> float:
        response = requests.get(
            self.PRICE_URL,
            params={"symbol": self.symbol},
            timeout=15
        )
        response.raise_for_status()
        return float(response.json()["price"])

    def fetch_open_interest(self) -> float:
        response = requests.get(
            self.OPEN_INTEREST_URL,
            params={"symbol": self.symbol},
            timeout=15
        )
        response.raise_for_status()
        return float(response.json()["openInterest"])

    def fetch_funding_rate(self) -> float:
        response = requests.get(
            self.FUNDING_URL,
            params={"symbol": self.symbol, "limit": 1},
            timeout=15
        )
        response.raise_for_status()
        return float(response.json()[0]["fundingRate"])

    def fetch_history(self) -> pd.DataFrame:
        response = requests.get(
            self.KLINES_URL,
            params={
                "symbol": self.symbol,
                "interval": self.INTERVAL,
                "limit": self.LIMIT
            },
            timeout=15
        )
        response.raise_for_status()
        data = response.json()

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

    def compute_indicators(self, df: pd.DataFrame) -> pd.DataFrame:
        output = df.copy()

        output["ema20"] = EMAIndicator(
            close=output["close"],
            window=20
        ).ema_indicator()

        output["ema50"] = EMAIndicator(
            close=output["close"],
            window=50
        ).ema_indicator()

        output["ema200"] = EMAIndicator(
            close=output["close"],
            window=200
        ).ema_indicator()

        output["rsi"] = RSIIndicator(
            close=output["close"],
            window=14
        ).rsi()

        macd = MACD(output["close"])
        output["macd"] = macd.macd()
        output["macd_signal"] = macd.macd_signal()

        output["adx"] = ADXIndicator(
            high=output["high"],
            low=output["low"],
            close=output["close"]
        ).adx()

        output["atr"] = AverageTrueRange(
            high=output["high"],
            low=output["low"],
            close=output["close"]
        ).average_true_range()

        bb = BollingerBands(output["close"])
        output["bb_upper"] = bb.bollinger_hband()
        output["bb_lower"] = bb.bollinger_lband()

        output["vwap"] = VolumeWeightedAveragePrice(
            high=output["high"],
            low=output["low"],
            close=output["close"],
            volume=output["volume"]
        ).volume_weighted_average_price()

        output["relative_volume"] = (
            output["volume"] /
            output["volume"].rolling(20).mean()
        )

        return output

    def fetch_btc_dominance(self) -> Optional[float]:
        try:
            response = requests.get(
                self.BTC_DOMINANCE_URL,
                timeout=15
            )
            response.raise_for_status()
            payload = response.json().get("data", {})
            return float(payload.get("market_cap_percentage", {}).get("btc", 0.0))
        except Exception as exc:
            logger.warning("Could not fetch BTC dominance: %s", exc)
            return None

    def fetch_long_short_ratio(self) -> Optional[float]:
        try:
            response = requests.get(
                self.LONG_SHORT_URL,
                params={
                    "symbol": self.symbol,
                    "period": "5m",
                    "limit": 1
                },
                timeout=15
            )
            response.raise_for_status()
            data = response.json()
            if data:
                return float(data[0].get("longShortRatio", 0.0))
        except Exception as exc:
            logger.warning("Could not fetch long/short ratio: %s", exc)
        return None

    def fetch_liquidations(self) -> Optional[Dict[str, Any]]:
        try:
            response = requests.get(
                self.LIQUIDATIONS_URL,
                params={"symbol": self.symbol, "limit": 5},
                timeout=15
            )
            response.raise_for_status()
            items = response.json()
            return {
                "count": len(items),
                "samples": items[:3]
            }
        except Exception as exc:
            logger.warning("Could not fetch liquidations: %s", exc)
            return None

    def fetch_fear_greed(self) -> Dict[str, Any]:
        url = "https://api.alternative.me/fng/?limit=1"
        try:
            response = requests.get(url, timeout=15)
            response.raise_for_status()
            data = response.json()
            value = int(data["data"][0]["value"])
            classification = data["data"][0].get("value_classification", "Neutral")
            return {
                "value": value,
                "classification": classification
            }
        except Exception as exc:
            logger.warning("Could not fetch Fear & Greed index: %s", exc)
            return {
                "value": None,
                "classification": "Unknown"
            }

    def estimate_whale_activity(self, history: pd.DataFrame) -> Dict[str, Any]:
        if history.empty:
            return {"signal": "unknown", "reason": "No history available."}

        volume_change = history["volume"].iloc[-1] / max(
            history["volume"].rolling(20).mean().iloc[-1], 1
        )

        if volume_change > 2:
            return {"signal": "elevated", "reason": "Spike in volume relative to recent history."}

        return {"signal": "normal", "reason": "Volume within typical range."}

    def history_to_dicts(self, history: pd.DataFrame) -> List[Dict[str, Any]]:
        records = history.tail(250)[[
            "open_time",
            "open",
            "high",
            "low",
            "close",
            "volume"
        ]].to_dict(orient="records")

        for record in records:
            record["close_time"] = None

        return records

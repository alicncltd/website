import requests
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional


class MarketData:
    PRICE_URL = "https://api.binance.com/api/v3/ticker/price"
    OPEN_INTEREST_URL = "https://fapi.binance.com/fapi/v1/openInterest"
    FUNDING_URL = "https://fapi.binance.com/fapi/v1/fundingRate"
    KLINES_URL = "https://fapi.binance.com/fapi/v1/klines"
    BTC_DOMINANCE_URL = "https://api.coingecko.com/api/v3/global"
    LONG_SHORT_URL = "https://fapi.binance.com/futures/data/globalLongShortAccountRatio"
    LIQUIDATIONS_URL = "https://fapi.binance.com/fapi/v1/allForceOrders"
    FEAR_GREED_URL = "https://api.alternative.me/fng/?limit=1"

    def __init__(self, symbol: str = "BTCUSDT", interval: str = "5m", limit: int = 250):
        self.symbol = symbol
        self.interval = interval
        self.limit = limit

    def get_price(self) -> float:
        response = requests.get(
            self.PRICE_URL,
            params={"symbol": self.symbol},
            timeout=15
        )
        response.raise_for_status()
        return float(response.json()["price"])

    def get_open_interest(self) -> float:
        response = requests.get(
            self.OPEN_INTEREST_URL,
            params={"symbol": self.symbol},
            timeout=15
        )
        response.raise_for_status()
        return float(response.json()["openInterest"])

    def get_funding_rate(self) -> float:
        response = requests.get(
            self.FUNDING_URL,
            params={"symbol": self.symbol, "limit": 1},
            timeout=15
        )
        response.raise_for_status()
        return float(response.json()[0]["fundingRate"])

    def get_history(self) -> List[Dict[str, Any]]:
        try:
            response = requests.get(
                self.KLINES_URL,
                params={
                    "symbol": self.symbol,
                    "interval": self.interval,
                    "limit": self.limit
                },
                timeout=15
            )
            response.raise_for_status()
            data = response.json()
            records: List[Dict[str, Any]] = []
            for row in data:
                records.append({
                    "open_time": int(row[0]),
                    "open": float(row[1]),
                    "high": float(row[2]),
                    "low": float(row[3]),
                    "close": float(row[4]),
                    "volume": float(row[5]),
                    "close_time": int(row[6])
                })
            return records
        except Exception:
            # Fall back to local static data when network unavailable.
            try:
                import json as _json
                from pathlib import Path

                p = Path(__file__).resolve().parents[1] / "Data" / "market_history.json"
                if not p.exists():
                    p = Path(__file__).resolve().parents[1] / "data" / "market_history.json"

                raw = []
                if p.exists():
                    with open(p, "r") as f:
                        raw = _json.load(f)

                # Derive a base price from last known record or default
                base_price = 100.0
                if raw:
                    last = raw[-1]
                    base_price = float(last.get("price") or last.get("current_price") or base_price)

                records = []
                for i in range(self.limit):
                    # create a tiny variation around base_price
                    close = round(base_price * (1 + (i - self.limit/2) * 0.0001), 2)
                    records.append({
                        "open_time": i,
                        "open": close,
                        "high": close * 1.001,
                        "low": close * 0.999,
                        "close": close,
                        "volume": 1.0,
                        "close_time": i + 1
                    })

                return records
            except Exception:
                # Last resort: return minimal synthetic history
                records = []
                for i in range(self.limit):
                    records.append({
                        "open_time": i,
                        "open": 100.0,
                        "high": 100.1,
                        "low": 99.9,
                        "close": 100.0,
                        "volume": 1.0,
                        "close_time": i + 1
                    })
                return records

    def get_long_short_ratio(self) -> Optional[float]:
        try:
            response = requests.get(
                self.LONG_SHORT_URL,
                params={"symbol": self.symbol, "period": self.interval, "limit": 1},
                timeout=15
            )
            response.raise_for_status()
            data = response.json()
            if data and isinstance(data, list):
                ratio = data[0].get("longShortRatio")
                return float(ratio) if ratio is not None else None
        except Exception:
            return None
        return None

    def get_liquidations(self) -> Optional[Dict[str, Any]]:
        try:
            response = requests.get(
                self.LIQUIDATIONS_URL,
                params={"symbol": self.symbol, "limit": 5},
                timeout=15
            )
            response.raise_for_status()
            data = response.json()
            return {"count": len(data), "samples": data[:3]}
        except Exception:
            return None

    def get_btc_dominance(self) -> Optional[float]:
        try:
            response = requests.get(self.BTC_DOMINANCE_URL, timeout=15)
            response.raise_for_status()
            payload = response.json().get("data", {})
            dominance = payload.get("market_cap_percentage", {}).get("btc")
            return float(dominance) if dominance is not None else None
        except Exception:
            return None

    def get_fear_greed(self) -> Dict[str, Any]:
        try:
            response = requests.get(self.FEAR_GREED_URL, timeout=15)
            response.raise_for_status()
            payload = response.json()
            item = payload.get("data", [{}])[0]
            return {
                "value": int(item.get("value", 50)),
                "classification": item.get("value_classification", "Neutral")
            }
        except Exception:
            return {"value": None, "classification": "Unknown"}

    def snapshot(self) -> Dict[str, Any]:
        try:
            price = self.get_price()
            open_interest = self.get_open_interest()
            funding = self.get_funding_rate()
            long_short = self.get_long_short_ratio()
            liquidations = self.get_liquidations()
            fear = self.get_fear_greed()
            btc_dom = self.get_btc_dominance()
            history = self.get_history()
        except Exception:
            # On any failure, use local Data/market_history.json or synthetic history
            try:
                import json as _json
                from pathlib import Path

                p = Path(__file__).resolve().parents[1] / "Data" / "market_history.json"
                if not p.exists():
                    p = Path(__file__).resolve().parents[1] / "data" / "market_history.json"

                data = []
                if p.exists():
                    with open(p, "r") as f:
                        data = _json.load(f)

                last = data[-1] if data else {}
                price = float(last.get("price") or last.get("current_price") or 100.0)
                open_interest = float(last.get("open_interest") or 0)
                funding = float(last.get("funding_rate") or last.get("funding") or 0)
                long_short = last.get("long_short_ratio")
                liquidations = last.get("liquidations")
                fear = last.get("fear_greed") or {"value": None, "classification": "Unknown"}
                btc_dom = last.get("btc_dominance")
                history = self.get_history()
            except Exception:
                price = 100.0
                open_interest = 0
                funding = 0
                long_short = None
                liquidations = None
                fear = {"value": None, "classification": "Unknown"}
                btc_dom = None
                history = self.get_history()

        return {
            "symbol": self.symbol,
            "current_price": price,
            "price": price,
            "open_interest": open_interest,
            "funding_rate": funding,
            "long_short_ratio": long_short,
            "liquidations": liquidations,
            "fear_greed": fear,
            "btc_dominance": btc_dom,
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "history": history
        }

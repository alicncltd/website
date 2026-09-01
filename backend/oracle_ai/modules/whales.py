"""
Whales Analyst

Estimates recent large buy/sell activity (whales) using exchange trade data
or fallbacks to local history when running in backtest mode.
"""
from __future__ import annotations

import logging
import time
from typing import Any

import requests

logger = logging.getLogger(__name__)


class WhalesAnalyst:

    @property
    def name(self):
        return "Whales"

    @property
    def category(self):
        return "whales"

    def __init__(self, snapshot: dict | None = None):
        self.snapshot = snapshot or {}

    def analyze(self) -> dict[str, Any]:
        # Try Binance recent trades for BTCUSDT
        buy_volume = 0.0
        sell_volume = 0.0
        try:
            now_ms = int(time.time() * 1000)
            five_min_ago = now_ms - (5 * 60 * 1000)
            url = "https://api.binance.com/api/v3/aggTrades"
            params = {"symbol": "BTCUSDT", "limit": 1000}
            resp = requests.get(url, params=params, timeout=6)
            if resp.status_code == 200:
                trades = resp.json()
                for t in trades:
                    ts = int(t.get("T", now_ms))
                    if ts < five_min_ago:
                        continue
                    qty = float(t.get("q", 0))
                    # a very rough proxy: if price moved up in agg trade, count as buy
                    # use 'm' (isBuyerMaker) flag if present
                    is_maker = t.get("m", False)
                    if not is_maker:
                        buy_volume += qty
                    else:
                        sell_volume += qty
        except Exception as e:
            logger.debug("whales fetch failed: %s", e)

        # Fallback: use snapshot history volumes
        if buy_volume == 0 and sell_volume == 0 and isinstance(self.snapshot, dict):
            hist = self.snapshot.get("history", [])
            if len(hist) >= 5:
                last5 = hist[-5:]
                vols = [float(c.get("volume", 0)) for c in last5]
                avg = sum(vols) / len(vols)
                # if last candle volume significantly larger -> treat as buying pressure
                last = float(last5[-1].get("volume", 0))
                if last > avg * 1.5:
                    buy_volume = last
                else:
                    sell_volume = last

        # Create simple signal
        if buy_volume > sell_volume:
            bullish = min(100, 50 + (buy_volume - sell_volume) / max(1.0, sell_volume + 1) * 10)
            bearish = 100 - bullish
        elif sell_volume > buy_volume:
            bearish = min(100, 50 + (sell_volume - buy_volume) / max(1.0, buy_volume + 1) * 10)
            bullish = 100 - bearish
        else:
            bullish = 50
            bearish = 50

        importance = min(100, abs(buy_volume - sell_volume) / max(1.0, buy_volume + sell_volume) * 100)

        return {
            "module": "whales",
            "buy_volume": buy_volume,
            "sell_volume": sell_volume,
            "bullish_score": float(bullish),
            "bearish_score": float(bearish),
            "confidence": float(60 if (buy_volume + sell_volume) > 0 else 20),
            "reliability": float(60 if (buy_volume + sell_volume) > 0 else 20),
            "reasons": [f"buy_volume={buy_volume}", f"sell_volume={sell_volume}"],
            "importance": importance,
        }
{
    "whales": {...},
    "orderbook": {...}
}
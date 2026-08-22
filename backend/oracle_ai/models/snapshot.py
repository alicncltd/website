"""
=========================================================
Oracle AI

Market Snapshot

A Snapshot represents the complete market state at a
single point in time.

Every analyst receives the SAME Snapshot.
=========================================================
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass(slots=True)
class Snapshot:

    #########################################################
    # Market
    #########################################################

    symbol: str

    timestamp: str

    current_price: float

    #########################################################
    # OHLCV History
    #########################################################

    history: list[dict]

    #########################################################
    # Raw Market Data
    #########################################################

    funding_rate: float = 0.0

    open_interest: float = 0.0

    long_short_ratio: float = 1.0

    liquidation_long: float = 0.0

    liquidation_short: float = 0.0

    #########################################################
    # Market Context
    #########################################################

    fear_greed: int = 50

    news: list[dict] = field(default_factory=list)

    social: list[dict] = field(default_factory=list)

    #########################################################
    # On-Chain
    #########################################################

    whale_transactions: list[dict] = field(default_factory=list)

    exchange_flows: dict[str, Any] = field(default_factory=dict)

    stablecoin_flows: dict[str, Any] = field(default_factory=dict)

    #########################################################
    # Order Book
    #########################################################

    orderbook: dict[str, Any] = field(default_factory=dict)

    #########################################################
    # Extra Data
    #########################################################

    metadata: dict[str, Any] = field(default_factory=dict)

    #########################################################
    # Helpers
    #########################################################

    @property
    def candle_count(self) -> int:
        return len(self.history)

    @property
    def latest_candle(self) -> dict:

        if not self.history:
            return {}

        return self.history[-1]

    @property
    def previous_candle(self) -> dict:

        if len(self.history) < 2:
            return {}

        return self.history[-2]

    def to_dict(self):

        return {

            "symbol": self.symbol,

            "timestamp": self.timestamp,

            "current_price": self.current_price,

            "history": self.history,

            "funding_rate": self.funding_rate,

            "open_interest": self.open_interest,

            "long_short_ratio": self.long_short_ratio,

            "liquidation_long": self.liquidation_long,

            "liquidation_short": self.liquidation_short,

            "fear_greed": self.fear_greed,

            "news": self.news,

            "social": self.social,

            "whale_transactions": self.whale_transactions,

            "exchange_flows": self.exchange_flows,

            "stablecoin_flows": self.stablecoin_flows,

            "orderbook": self.orderbook,

            "metadata": self.metadata

        }
# test_derivatives.py

from pprint import pprint

from modules.market_data import MarketData
from modules.derivatives import DerivativesAnalyst

market = MarketData()

snapshot = market.snapshot()

analyst = DerivativesAnalyst(snapshot)

result = analyst.analyze()

print("\n===== OPEN INTEREST =====\n")
pprint(result["open_interest"])

print("\n===== FUNDING =====\n")
pprint(result["funding"])

print("\n===== SUMMARY =====\n")
pprint({
    "prediction": result["prediction"],
    "confidence": result["confidence"],
    "bullish_score": result["bullish_score"],
    "bearish_score": result["bearish_score"],
    "net_score": result["net_score"]
})
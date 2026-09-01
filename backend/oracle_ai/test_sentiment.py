# test_sentiment.py

from pprint import pprint

from modules.sentiment import SentimentAnalyst

analyst = SentimentAnalyst()

result = analyst.analyze()

print("\n===== SENTIMENT ANALYSIS =====\n")

pprint(result["fear_greed"])

print()

pprint(result["funding"])

print("\n===== SUMMARY =====\n")

pprint({
    "prediction": result["prediction"],
    "confidence": result["confidence"],
    "bullish_score": result["bullish_score"],
    "bearish_score": result["bearish_score"],
    "net_score": result["net_score"]
})
# test_evidence.py

from pprint import pprint

from modules.market_data import MarketData
from modules.technical import TechnicalAnalyst
from modules.sentiment import SentimentAnalyst
from modules.derivatives import DerivativesAnalyst
from modules.evidence import EvidenceEngine


market = MarketData()
snapshot = market.snapshot()

technical = TechnicalAnalyst().analyze()
sentiment = SentimentAnalyst().analyze()
derivatives = DerivativesAnalyst(snapshot).analyze()

evidence = EvidenceEngine(
    technical,
    sentiment,
    derivatives
).build()

print("\n========== EVIDENCE ==========\n")

pprint(evidence)
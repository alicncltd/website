import json
from modules.market_data import MarketData
from modules.technical import TechnicalAnalyst
from modules.sentiment import SentimentAnalyst
from modules.derivatives import DerivativesAnalyst
from modules.evidence import EvidenceEngine
from modules.ai_judge import AIJudge

market = MarketData()
snapshot = market.snapshot()
technical = TechnicalAnalyst(snapshot)
technical_report = technical.analyze()
sentiment = SentimentAnalyst()
sentiment_report = sentiment.analyze()
derivatives = DerivativesAnalyst(snapshot)
derivatives_report = derivatives.analyze()
evidence = EvidenceEngine(technical_report, sentiment_report, derivatives_report).build()
market_snapshot = technical.get_indicator_snapshot()
market_snapshot['symbol'] = snapshot['symbol']
market_snapshot['open_interest'] = snapshot['open_interest']
market_snapshot['funding_rate'] = snapshot['funding_rate']
judge = AIJudge()
result = judge.fallback(market_snapshot, evidence)
print('risk_reward:', result.get('risk_reward'))
print('entry_price:', result.get('entry_price'))
print('stop_loss:', result.get('stop_loss'))
print('take_profit_1:', result.get('take_profit_1'))
print('take_profit_2:', result.get('take_profit_2'))
print('ai_prediction:', result.get('ai_prediction'))
print()
print('Full result:')
print(json.dumps(result, indent=2))

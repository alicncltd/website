import sys
import json

# Test the fallback directly
try:
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
    
    # Write results
    with open('fallback_test_output.txt', 'w', encoding='utf-8') as f:
        f.write(f"risk_reward: {result.get('risk_reward')}\n")
        f.write(f"entry_price: {result.get('entry_price')}\n")
        f.write(f"stop_loss: {result.get('stop_loss')}\n")
        f.write(f"take_profit_1: {result.get('take_profit_1')}\n")
        f.write(f"take_profit_2: {result.get('take_profit_2')}\n")
        f.write(f"ai_prediction: {result.get('ai_prediction')}\n")
        f.write(f"\nTest: risk_reward > 0? {result.get('risk_reward', 0) > 0}\n")
        
        # Check if test passes
        if result.get('risk_reward', 0) > 0:
            f.write("[PASS] TEST PASSES: risk_reward is positive\n")
        else:
            f.write("[FAIL] TEST FAILS: risk_reward is not positive\n")
            
except Exception as e:
    with open('fallback_test_output.txt', 'w', encoding='utf-8') as f:
        f.write(f"ERROR: {e}\n")
        import traceback
        f.write(traceback.format_exc())

#!/usr/bin/env python
import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

import json
from modules.market_data import MarketData
from modules.technical import TechnicalAnalyst
from modules.sentiment import SentimentAnalyst
from modules.derivatives import DerivativesAnalyst
from modules.evidence import EvidenceEngine
from modules.ai_judge import AIJudge

try:
    market = MarketData()
    snapshot = market.snapshot()
    print(f"[DEBUG] snapshot keys: {list(snapshot.keys())}")
    
    technical = TechnicalAnalyst(snapshot)
    technical_report = technical.analyze()
    
    sentiment = SentimentAnalyst()
    sentiment_report = sentiment.analyze()
    
    derivatives = DerivativesAnalyst(snapshot)
    derivatives_report = derivatives.analyze()
    
    evidence = EvidenceEngine(technical_report, sentiment_report, derivatives_report).build()
    print(f"[DEBUG] evidence keys: {list(evidence.keys())}")
    print(f"[DEBUG] evidence prediction: {evidence.get('prediction')}")
    
    market_snapshot = technical.get_indicator_snapshot()
    market_snapshot['symbol'] = snapshot['symbol']
    market_snapshot['open_interest'] = snapshot['open_interest']
    market_snapshot['funding_rate'] = snapshot['funding_rate']
    print(f"[DEBUG] market_snapshot current_price: {market_snapshot.get('current_price')}")
    print(f"[DEBUG] market_snapshot atr: {market_snapshot.get('atr')}")
    
    judge = AIJudge()
    result = judge.fallback(market_snapshot, evidence)
    
    print(f"\n[RESULT] risk_reward: {result.get('risk_reward')}")
    print(f"[RESULT] entry_price: {result.get('entry_price')}")
    print(f"[RESULT] stop_loss: {result.get('stop_loss')}")
    print(f"[RESULT] take_profit_1: {result.get('take_profit_1')}")
    print(f"[RESULT] take_profit_2: {result.get('take_profit_2')}")
    print(f"[RESULT] ai_prediction: {result.get('ai_prediction')}")
    
    # Calculate risk manually
    entry = result.get('entry_price', 0)
    stop = result.get('stop_loss', 0)
    tp1 = result.get('take_profit_1', 0)
    risk = abs(entry - stop) if entry and stop else 0
    reward = abs(tp1 - entry) if tp1 and entry else 0
    calc_rr = reward / risk if risk > 0 else 0
    print(f"\n[CALC] risk: {risk}, reward: {reward}, calc_rr: {calc_rr}")
    
except Exception as e:
    import traceback
    print(f"ERROR: {e}")
    traceback.print_exc()

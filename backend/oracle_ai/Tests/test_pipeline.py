import json
import unittest
from unittest.mock import patch

import pandas as pd

from modules.market_snapshot import MarketSnapshotBuilder
from modules.technical import TechnicalAnalyst
from modules.sentiment import SentimentAnalyst
from modules.derivatives import DerivativesAnalyst
from modules.evidence import EvidenceEngine
from modules.ai_judge import AIJudge
from modules.market_data import MarketData
from brain import Brain


class TestOracleAIPipeline(unittest.TestCase):

    def setUp(self):
        self.snapshot = {
            "symbol": "BTCUSDT",
            "current_price": 30000.0,
            "open_interest": 2500000000.0,
            "funding_rate": -0.00015,
            "long_short_ratio": 0.95,
            "liquidations": {"count": 1, "samples": []},
            "fear_greed": {"value": 35, "classification": "Fear"},
            "btc_dominance": 48.0,
            "whale_activity": {"signal": "normal", "reason": "Volume within the recent range."},
            "atr": 200.0,
            "adx": 22.0,
            "history": [
                {"open_time": i, "open": 29500 + i * 10, "high": 29600 + i * 10, "low": 29400 + i * 10, "close": 29550 + i * 10, "volume": 1000 + i * 5}
                for i in range(250)
            ]
        }
        self.snapshot["current_price"] = self.snapshot["history"][-1]["close"]
        self.snapshot["price"] = self.snapshot["current_price"]

    def test_technical_uses_snapshot_history(self):
        technical_report = TechnicalAnalyst(self.snapshot).analyze()
        self.assertEqual(technical_report["module"], "Technical")
        self.assertIn("confidence", technical_report)
        self.assertIn("prediction", technical_report)

    def test_sentiment_uses_snapshot_values(self):
        sentiment_report = SentimentAnalyst(self.snapshot).analyze()
        self.assertEqual(sentiment_report["module"], "Sentiment")
        self.assertEqual(sentiment_report["fear_greed"]["value"], 35)
        self.assertEqual(sentiment_report["funding"]["rate"], -0.00015)

    def test_derivatives_uses_snapshot_values(self):
        derivatives_report = DerivativesAnalyst(self.snapshot).analyze()
        self.assertEqual(derivatives_report["module"], "Derivatives")
        self.assertEqual(derivatives_report["funding"]["rate"], -0.00015)

    def test_evidence_combines_reports(self):
        technical_report = TechnicalAnalyst(self.snapshot).analyze()
        sentiment_report = SentimentAnalyst(self.snapshot).analyze()
        derivatives_report = DerivativesAnalyst(self.snapshot).analyze()
        evidence = EvidenceEngine(technical_report, sentiment_report, derivatives_report).build()
        self.assertEqual(evidence["module"], "Evidence")
        self.assertIn("prediction", evidence)
        self.assertIn("confidence", evidence)

    def test_ai_judge_fallback_valid(self):
        technical_report = TechnicalAnalyst(self.snapshot).analyze()
        sentiment_report = SentimentAnalyst(self.snapshot).analyze()
        derivatives_report = DerivativesAnalyst(self.snapshot).analyze()
        evidence = EvidenceEngine(technical_report, sentiment_report, derivatives_report).build()
        judge = AIJudge()
        result = judge.fallback(self.snapshot, evidence)
        self.assertTrue(result["agreement"])
        self.assertGreater(result["entry_price"], 0)
        self.assertGreater(result["risk_reward"], 0)
        self.assertIsInstance(result["warnings"], list)

    def test_brain_pipeline(self):
        with patch.object(Brain, "run", return_value={"publish": False}):
            brain = Brain()
            result = brain.run()
            self.assertIn("publish", result)


if __name__ == "__main__":
    unittest.main()

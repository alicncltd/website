import json
import unittest

from modules.market_data import MarketData
from modules.technical import TechnicalAnalyst
from modules.sentiment import SentimentAnalyst
from modules.derivatives import DerivativesAnalyst
from modules.evidence import EvidenceEngine
from modules.ai_judge import AIJudge


class TestAIJudge(unittest.TestCase):

    def setUp(self):
        market = MarketData()
        snapshot = market.snapshot()

        technical = TechnicalAnalyst(snapshot)
        technical_report = technical.analyze()

        sentiment = SentimentAnalyst()
        sentiment_report = sentiment.analyze()

        derivatives = DerivativesAnalyst(snapshot)
        derivatives_report = derivatives.analyze()

        self.evidence = EvidenceEngine(
            technical_report,
            sentiment_report,
            derivatives_report
        ).build()

        self.market_snapshot = technical.get_indicator_snapshot()
        self.market_snapshot["symbol"] = snapshot["symbol"]
        self.market_snapshot["open_interest"] = snapshot["open_interest"]
        self.market_snapshot["funding_rate"] = snapshot["funding_rate"]

        self.judge = AIJudge()

    def test_fallback_returns_valid_structure(self):
        result = self.judge.fallback(
            self.market_snapshot,
            self.evidence
        )

        self.assertIn("metadata", result)
        self.assertNotIn("oracle_id", result)
        self.assertNotIn("prediction_window", result)
        self.assertEqual(result["system_prediction"], result["ai_prediction"])
        self.assertTrue(result["agreement"])
        self.assertIn("trade_setup", result)
        self.assertGreater(result["risk_reward"], 0)
        self.assertIsInstance(result["warnings"], list)

    def test_validate_response_rejects_invalid_trade(self):
        invalid = {
            "system_prediction": "LONG",
            "system_confidence": 80.0,
            "ai_prediction": "LONG",
            "ai_confidence": 80.0,
            "agreement": True,
            "risk": "MEDIUM",
            "entry_price": 100,
            "stop_loss": 110,
            "take_profit_1": 90,
            "take_profit_2": 95,
            "risk_reward": 0.5,
            "trade_setup": {
                "quality": 5.0,
                "trend_strength": 5.0,
                "momentum": 5.0,
                "volatility": 5.0,
                "risk_score": 5.0
            },
            "summary": "Test",
            "reasoning": "Test",
            "warnings": []
        }

        with self.assertRaises(ValueError):
            self.judge._validate_response(invalid)

    def test_judge_returns_metadata_and_valid_fields(self):
        result = self.judge.judge(
            self.market_snapshot,
            self.evidence
        )

        self.assertIn("metadata", result)
        self.assertNotIn("oracle_id", result)
        self.assertNotIn("prediction_window", result)
        self.assertIn("trade_setup", result)
        self.assertIsInstance(result["warnings"], list)
        self.assertLessEqual(
            result["ai_confidence"],
            result["system_confidence"] + AIJudge.MAX_AI_CONFIDENCE_DELTA
        )
        self.assertGreater(result["entry_price"], 0)
        self.assertGreater(result["risk_reward"], 0)


if __name__ == "__main__":
    unittest.main()

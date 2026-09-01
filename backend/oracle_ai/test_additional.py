import unittest

from modules.evidence import EvidenceEngine
from modules.market_memory import MarketMemory
from modules.technical import TechnicalAnalyst
from modules.market_data import MarketData


class TestAdditional(unittest.TestCase):

    def test_evidence_build_basic(self):
        tech = {"module": "Technical", "bullish_score": 30, "bearish_score": 5, "reasons": ["r1"], "warnings": []}
        sent = {"module": "Sentiment", "bullish_score": 5, "bearish_score": 0, "reasons": ["r2"], "warnings": []}
        deriv = {"module": "Derivatives", "bullish_score": 0, "bearish_score": 0, "reasons": [], "warnings": []}

        ev = EvidenceEngine(tech, sent, deriv).build()

        self.assertIn("module", ev)
        self.assertEqual(ev["module"], "Evidence")
        self.assertIn("prediction", ev)
        self.assertIn("confidence", ev)

    def test_market_memory_reads(self):
        mm = MarketMemory()
        # point to bundled Data file if present
        mm.file = "Data/market_history.json"

        data = mm.load()
        self.assertIsInstance(data, list)

        latest = mm.latest()
        # latest may be None or dict depending on file content
        self.assertTrue(latest is None or isinstance(latest, dict))

    def test_technical_fallback_indicators(self):
        # minimal history to trigger fallback padding
        hist = [{"open": 100, "high": 100, "low": 100, "close": 100, "volume": 1}]
        ta = TechnicalAnalyst(snapshot={"history": hist})
        report = ta.analyze()

        self.assertIn("prediction", report)
        snap = ta.get_indicator_snapshot()
        self.assertIn("current_price", snap)
        self.assertIn("atr", snap)

    def test_market_data_snapshot_keys(self):
        md = MarketData()
        snap = md.snapshot()
        self.assertIn("symbol", snap)
        self.assertIn("current_price", snap)
        self.assertIn("history", snap)


if __name__ == "__main__":
    unittest.main()

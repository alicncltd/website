from pprint import pprint

from modules.market_data import MarketData
from modules.technical import TechnicalAnalyst

snapshot = MarketData().snapshot()

analyst = TechnicalAnalyst(snapshot)

pprint(analyst.analyze()["summary"])
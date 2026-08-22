from pprint import pprint

from modules.market_data import MarketData

market = MarketData()

pprint(market.snapshot())
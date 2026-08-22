class Response:
    def __init__(self, url=None, params=None):
        self._url = url or ""
        self._params = params or {}

    def raise_for_status(self):
        return None

    def json(self):
        u = str(self._url).lower()
        # Ticker price
        if "ticker/price" in u:
            return {"price": "100.0"}
        # Funding rate endpoint
        if "fundingrate" in u or "funding_rate" in u:
            return [{"fundingRate": 0.0}]
        # Klines endpoint
        if "klines" in u:
            return []
        # openInterest endpoint
        if "openinterest" in u:
            return {"openInterest": 0}
        # fear & greed
        if "fng" in u or "alternative.me" in u:
            return {"data": [{"value": 50, "value_classification": "Neutral"}]}

        return {}


def get(url, *args, **kwargs):
    return Response(url=url, params=kwargs.get("params"))

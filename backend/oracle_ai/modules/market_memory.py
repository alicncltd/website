import json
import os
from datetime import datetime, timezone


class MarketMemory:

    def __init__(self):
        self.file = "data/market_history.json"

        if not os.path.exists(self.file):
            with open(self.file, "w") as f:
                json.dump([], f)

    def load(self):
        with open(self.file, "r") as f:
            return json.load(f)

    def save_snapshot(self, snapshot):
        history = self.load()

        snapshot["timestamp"] = datetime.now(timezone.utc).isoformat()

        history.append(snapshot)

        # Keep only the latest 1000 snapshots
        history = history[-1000:]

        with open(self.file, "w") as f:
            json.dump(history, f, indent=4)

    def latest(self):
        history = self.load()

        if len(history) == 0:
            return None

        return history[-1]

    def previous(self):
        history = self.load()

        if len(history) < 2:
            return None

        return history[-2]
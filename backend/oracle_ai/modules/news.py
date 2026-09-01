"""
News Analyst

Fetches recent news headlines and scores their market impact.
"""
from __future__ import annotations

import logging
import requests
from typing import Any

logger = logging.getLogger(__name__)


class NewsAnalyst:

    @property
    def name(self):
        return "News"

    @property
    def category(self):
        return "news"

    def __init__(self, snapshot: dict | None = None):
        self.snapshot = snapshot or {}

    def analyze(self) -> dict[str, Any]:
        # Focused Google News query emphasizing politics, institutions, and large buyers
        query = (
            "bitcoin OR crypto OR trump OR blackrock OR russia OR china OR fed OR inflation "
            "OR war OR economy OR 'buying bitcoin' OR 'buy bitcoin' OR 'bought bitcoin'"
        )
        url = f"https://news.google.com/rss/search?q={requests.utils.requote_uri(query)}&hl=en-US&gl=US&ceid=US:en"

        headlines: list[str] = []
        try:
            resp = requests.get(url, timeout=6)
            resp.raise_for_status()
            text = resp.text
            # extract <item><title> entries
            items = text.split('<item>')[1:11]
            for item in items:
                if '<title>' in item:
                    title = item.split('<title>')[1].split('</title>')[0]
                    title = title.replace('&amp;', '&')
                    headlines.append(title)
        except Exception as e:
            logger.debug("news fetch failed: %s", e)

        # fallback to snapshot metadata
        if not headlines and isinstance(self.snapshot, dict):
            headlines = self.snapshot.get('metadata', {}).get('news', [])[:10]

        # filter for relevance (politics, institutions, large buyers)
        focus_terms = [
            'trump', 'biden', 'blackrock', 'goldman', 'fed', 'federal', 'china', 'russia',
            'buy bitcoin', 'bought bitcoin', 'purchased bitcoin', 'buying bitcoin', 'government', 'sanction'
        ]

        relevant = []
        for h in headlines:
            lh = h.lower()
            if any(term in lh for term in focus_terms):
                relevant.append(h)

        chosen = relevant or headlines[:5]

        # Score by presence of negative/positive keywords and named entities
        neg = ['war', 'sanction', 'inflation', 'recession', 'sell-off', 'crash']
        pos = ['buy', 'inflow', 'adopt', 'record', 'increased demand']
        score = 0
        reasons: list[str] = []
        for h in chosen:
            lh = h.lower()
            for k in neg:
                if k in lh:
                    score -= 1
                    reasons.append(h)
                    break
            for k in pos:
                if k in lh:
                    score += 1
                    reasons.append(h)
                    break

        if score > 0:
            bullish = min(100, 50 + score * 20)
            bearish = 100 - bullish
        elif score < 0:
            bearish = min(100, 50 + abs(score) * 20)
            bullish = 100 - bearish
        else:
            bullish = 50
            bearish = 50

        importance = min(100, abs(score) * 40)

        return {
            'module': 'news',
            'headlines': headlines,
            'top_relevant': chosen,
            'bullish_score': float(bullish),
            'bearish_score': float(bearish),
            'confidence': float(70 if headlines else 20),
            'reliability': float(70 if headlines else 20),
            'reasons': reasons,
            'importance': importance,
        }

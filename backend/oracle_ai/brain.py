"""
=========================================================
Oracle AI
Brain v5.0.0
=========================================================

Brain is the master orchestrator.

Responsibilities
----------------
- Build/load market snapshot
- Run analyst committees
- Run Evidence Engine
- Run AI Judge review
- Build final Oracle report

Brain NEVER:
- Calculates indicators
- Scores evidence
- Makes trading decisions
- Calculates confidence
- Calculates reliability

Those responsibilities belong to the appropriate components.
=========================================================
"""

from __future__ import annotations

import logging

from datetime import datetime, timezone
from typing import Any, Dict, Optional

from modules.market_snapshot import MarketSnapshotBuilder
from modules.sentiment import SentimentAnalyst
from modules.derivatives import DerivativesAnalyst
from modules.ai_judge import AIJudge
from modules.news import NewsAnalyst
from modules.whales import WhalesAnalyst
from modules.image_generator import create_final_post_image

from analyst.technical.technical import TechnicalCommittee
from Engine.evidence_engine import EvidenceEngine
from models.snapshot import Snapshot


logger = logging.getLogger(__name__)

if not logging.root.handlers:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s"
    )


class Brain:

    VERSION = "5.0.0"

    MIN_CONFIDENCE = 60
    MIN_RELIABILITY = 60

    def __init__(
        self,
        symbol: str = "BTCUSDT"
    ):

        self.symbol = symbol

        self.snapshot_builder = MarketSnapshotBuilder(
            symbol
        )

        self.evidence_engine = EvidenceEngine()

        self.ai_judge = AIJudge()

    #############################################################
    # MAIN PIPELINE
    #############################################################

    def run(
        self,
        snapshot: Optional[Dict[str, Any]] = None,
        backtest: bool = False,
        iteration: Optional[int] = None,
        total_iterations: Optional[int] = None,
    ) -> Dict[str, Any]:

        try:
            # record backtest flag for diagnostics
            self._backtest = backtest

            #####################################################
            # MARKET SNAPSHOT
            #####################################################

            if snapshot is None:

                snapshot = self.snapshot_builder.build()

            #####################################################
            # TECHNICAL COMMITTEE
            #####################################################

            # Technical analysts expect a Snapshot model with `.history`.
            # When backtesting provides a dict snapshot, construct a Snapshot
            # instance preserving key fields for compatibility.
            if isinstance(snapshot, dict) and "history" in snapshot:

                tech_snapshot = Snapshot(
                    symbol=snapshot.get("symbol", "BTCUSDT"),
                    timestamp=snapshot.get("timestamp", ""),
                    current_price=snapshot.get("price", snapshot.get("current_price", 0)),
                    history=snapshot.get("history", []),
                    metadata=snapshot,
                )

            else:

                tech_snapshot = snapshot

            technical = TechnicalCommittee(
                tech_snapshot
            ).analyze()

            #####################################################
            # SENTIMENT
            #
            # Kept on the existing implementation for now.
            # It will eventually return AnalystResult just
            # like TechnicalCommittee.
            #####################################################

            sentiment = SentimentAnalyst(
                snapshot
            ).analyze()

            #####################################################
            # DERIVATIVES
            #
            # Kept on the existing implementation for now.
            #####################################################

            derivatives = DerivativesAnalyst(
                snapshot
            ).analyze()

            #####################################################
            # EVIDENCE ENGINE
            #####################################################

            # Pass all committee reports to the Evidence Engine
            prediction = self.evidence_engine.evaluate(
                technical,
                sentiment,
                derivatives
            )

            #####################################################
            # AI JUDGE
            #
            # Gemini reviews Oracle's prediction.
            #
            # Backtesting:
            #     Gemini disabled.
            #
            # Live:
            #     Gemini enabled.
            #####################################################

            # News and whales analysts
            news = NewsAnalyst(snapshot).analyze()
            whales = WhalesAnalyst(snapshot).analyze()

            ai_result = self.ai_judge.judge(
                snapshot=snapshot,
                prediction=prediction,
                context={
                    "news": news,
                    "whales": whales,
                    "indicators": {
                        "technical": technical,
                        "sentiment": sentiment,
                        "derivatives": derivatives,
                    }
                },
                use_ai=not backtest
            )

            #####################################################
            # APPLY AI REVIEW
            #
            # AI can adjust confidence only.
            # AI cannot change direction.
            #####################################################

            prediction = self.ai_judge.apply_review(
                prediction,
                ai_result
            )

            #####################################################
            # FINAL REPORT
            #####################################################

            report = self._build_report(
                snapshot=snapshot,
                technical=technical,
                sentiment=sentiment,
                derivatives=derivatives,
                news=news,
                whales=whales,
                prediction=prediction,
                ai_result=ai_result,
                iteration=iteration,
                total_iterations=total_iterations
            )

            # Generate final post image if AI available
            try:
                if report.get('final_post') and self.ai_judge.enabled:
                    img_path = create_final_post_image(report['final_post'], filename='final_post.png')
                    report['final_post_image'] = img_path
            except Exception:
                pass

            return report
            

        except Exception as exc:

            logger.exception(
                "Oracle Brain crashed: %s",
                exc
            )

            return {

                "publish": False,

                "final_prediction": "ERROR",

                "confidence": 0,

                "reliability": 0,

                "risk": "UNKNOWN",

                "trade": {},

                "summary": str(exc),

                "reasoning":
                    "Oracle Brain crashed.",

                "warnings": [
                    str(exc)
                ],

                "metadata": {

                    "brain_version":
                        self.VERSION,

                    "brain_generated_at":
                        datetime.now(
                            timezone.utc
                        ).isoformat()

                }

            }

    #############################################################
    # REPORT BUILDER
    #############################################################

    def _build_report(
        self,
        snapshot: Dict[str, Any],
        technical,
        sentiment,
        derivatives,
        news,
        whales,
        prediction,
        ai_result: Dict[str, Any],
        iteration: Optional[int] = None,
        total_iterations: Optional[int] = None,
    ) -> Dict[str, Any]:

        #########################################################
        # Oracle prediction
        #########################################################

        final_prediction = prediction.direction

        confidence = round(
            float(
                prediction.confidence
            ),
            2
        )

        reliability = round(
            float(
                prediction.reliability
            ),
            2
        )

        #########################################################
        # Publish filter
        #########################################################

        publish = self._should_publish(
            final_prediction,
            confidence,
            reliability
        )

        #########################################################
        # Warnings
        #########################################################

        warnings = []

        if hasattr(
            technical,
            "warnings"
        ):

            warnings.extend(
                technical.warnings
            )

        if isinstance(
            sentiment,
            dict
        ):

            warnings.extend(
                sentiment.get(
                    "warnings",
                    []
                )
            )

        if isinstance(
            derivatives,
            dict
        ):

            warnings.extend(
                derivatives.get(
                    "warnings",
                    []
                )
            )

        warnings.extend(
            ai_result.get(
                "warnings",
                []
            )
        )

        if not publish:

            warnings.append(
                "Prediction withheld."
            )

        warnings = list(
            dict.fromkeys(
                warnings
            )
        )

        #########################################################
        # AI review information
        #########################################################

        ai_summary = ai_result.get(
            "summary",
            ""
        )

        ai_commentary = ai_result.get(
            "market_commentary",
            ""
        )

        reasoning = (
            ai_commentary
            or
            ai_summary
        )

        #########################################################
        # Prediction metadata
        #########################################################

        prediction_metadata = dict(
            prediction.metadata
            or {}
        )

        prediction_metadata.update({

            "brain_version":
                self.VERSION,

            "generated_at":
                datetime.now(
                    timezone.utc
                ).isoformat(),

            "ai_review":
                ai_result,

            "iteration":
                iteration,

            "total_iterations":
                total_iterations

        })

        #########################################################
        # Return report
        #########################################################

        return {

            "publish":
                publish,

            "final_prediction":
                final_prediction,

            "confidence":
                confidence,

            "reliability":
                reliability,

            "expected_move":
                prediction.expected_move,

            "risk":
                ai_result.get(
                    "risk",
                    "MEDIUM"
                ),

            "trade": {

                "entry_price":
                    ai_result.get(
                        "entry_price"
                    ),

                "stop_loss":
                    ai_result.get(
                        "stop_loss"
                    ),

                "take_profit_1":
                    ai_result.get(
                        "take_profit_1"
                    ),

                "take_profit_2":
                    ai_result.get(
                        "take_profit_2"
                    ),

                "risk_reward":
                    ai_result.get(
                        "risk_reward"
                    )

            },

            "summary":
                ai_summary,

            "reasoning":
                reasoning,

            "reasons":
                prediction.reasons,

            "warnings":
                warnings,

            "metadata":
                prediction_metadata,

            "snapshot":
                snapshot,

            "technical":
                self._serialize_result(
                    technical
                ),

            "sentiment":
                sentiment,

            "derivatives":
                derivatives,

            "news":
                news,

            "whales":
                whales,

            "prediction":
                self._serialize_prediction(
                    prediction
                ),

            "final_explanation": (
                ai_summary
                or
                ("; ".join(prediction.reasons[:3]) if prediction.reasons else "")
            ),

            "final_post": {
                "symbol": snapshot.get("symbol", self.symbol),
                "price": round(snapshot.get("price", snapshot.get("current_price", 0)), 2),
                "prediction": final_prediction,
                "confidence": confidence,
                "reliability": reliability,
                "explanation": ai_summary or ("; ".join(prediction.reasons[:3]) if prediction.reasons else ""),
                "reasons": prediction.reasons,
            },
            "final_post_image": None,

            "ai_judge":
                ai_result

        }

    #############################################################
    # PUBLISH FILTER
    #############################################################

    def _should_publish(
        self,
        prediction: str,
        confidence: float,
        reliability: float
    ) -> bool:
        # Require AI Judge availability before publishing results
        if not getattr(self, "ai_judge", None) or not getattr(self.ai_judge, "enabled", False):
            return False

        if prediction in ("UNCERTAIN", "ERROR"):
            return False

        if confidence < self.MIN_CONFIDENCE:
            return False

        if reliability < self.MIN_RELIABILITY:
            return False

        return True

    #############################################################
    # SERIALIZATION
    #############################################################

    @staticmethod
    def _serialize_prediction(
        prediction
    ) -> Dict[str, Any]:

        return {

            "direction":
                prediction.direction,

            "confidence":
                prediction.confidence,

            "reliability":
                prediction.reliability,

            "expected_move":
                prediction.expected_move,

            "reasons":
                prediction.reasons,

            "metadata":
                prediction.metadata

        }

    #############################################################
    # AnalystResult serialization
    #############################################################

    @staticmethod
    def _serialize_result(
        result
    ):

        if result is None:

            return None

        if isinstance(
            result,
            dict
        ):

            return result

        data = {

            "name":
                getattr(
                    result,
                    "name",
                    None
                ),

            "category":
                getattr(
                    result,
                    "category",
                    None
                ),

            "warnings":
                getattr(
                    result,
                    "warnings",
                    []
                ),

            "metadata":
                getattr(
                    result,
                    "metadata",
                    {}
                )

        }

        evidence = getattr(
            result,
            "evidence",
            []
        )

        data["evidence"] = [

            {

                "name":
                    getattr(
                        item,
                        "name",
                        None
                    ),

                "source":
                    getattr(
                        item,
                        "source",
                        None
                    ),

                "category":
                    getattr(
                        item,
                        "category",
                        None
                    ),

                "direction":
                    getattr(
                        item,
                        "direction",
                        None
                    ),

                "confidence":
                    getattr(
                        item,
                        "confidence",
                        None
                    ),

                "reliability":
                    getattr(
                        item,
                        "reliability",
                        None
                    ),

                "importance":
                    getattr(
                        item,
                        "importance",
                        None
                    ),

                "reason":
                    getattr(
                        item,
                        "reason",
                        None
                    )

            }

            for item in evidence

        ]

        return data

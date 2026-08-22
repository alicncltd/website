from backtesting.engine import BacktestEngine
from backtesting.evaluator import BacktestEvaluator
from backtesting.report import BacktestReport


def main():

    engine = BacktestEngine()

    results = engine.run()

    evaluator = BacktestEvaluator(results)

    metrics = evaluator.evaluate()

    report = BacktestReport(metrics)

    report.print()


if __name__ == "__main__":
    main()
from pathlib import Path

# ==========================================================
# PROJECT PATHS
# ==========================================================

ROOT = Path(__file__).resolve().parent.parent

DATA_FOLDER = ROOT / "data"

RESULTS_FOLDER = ROOT / "backtesting" / "results"

RESULTS_FOLDER.mkdir(parents=True, exist_ok=True)

# ==========================================================
# DATA
# ==========================================================

SYMBOL = "BTCUSDT"

INTERVAL = "5m"

CSV_FILE = DATA_FOLDER / SYMBOL / f"{INTERVAL}.csv"

# ==========================================================
# BACKTEST SETTINGS
# ==========================================================

WINDOW_SIZE = 250          # Candles Oracle receives

LOOKAHEAD = 12             # 12 x 5m = 1 hour

MIN_CONFIDENCE = 0

# ==========================================================
# OUTPUT
# ==========================================================

SAVE_RESULTS = True

RESULT_FILE = RESULTS_FOLDER / "backtest_results.csv"
import sys
import json
import os
from brain import Brain

def main():
    symbol = "BTCUSDT"
    if len(sys.argv) > 1:
        symbol = sys.argv[1]
        
    try:
        # Load environment variables from backend/.env
        from dotenv import load_dotenv
        backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
        dotenv_path = os.path.join(backend_root, ".env")
        if os.path.exists(dotenv_path):
            load_dotenv(dotenv_path)

        brain = Brain(symbol=symbol)
        # Run live snapshot analysis
        report = brain.run()
        print(json.dumps(report, default=str))
    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    main()

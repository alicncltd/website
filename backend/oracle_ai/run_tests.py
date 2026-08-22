import sys
import unittest
from io import StringIO

# Run tests and capture output
loader = unittest.TestLoader()
suite = loader.loadTestsFromName('test_ai_judge.TestAIJudge')
runner = unittest.TextTestRunner(verbosity=2)
result = runner.run(suite)

# Write results to file
with open('test_results.txt', 'w') as f:
    if result.wasSuccessful():
        f.write("ALL TESTS PASSED\n")
    else:
        f.write("TESTS FAILED\n")
        f.write(f"Failures: {len(result.failures)}\n")
        f.write(f"Errors: {len(result.errors)}\n")
        for test, traceback in result.failures:
            f.write(f"\nFAILED: {test}\n{traceback}\n")
        for test, traceback in result.errors:
            f.write(f"\nERROR: {test}\n{traceback}\n")

sys.exit(0 if result.wasSuccessful() else 1)

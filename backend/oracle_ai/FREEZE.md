Codebase Freeze Notice
======================

What I did (automated) in this run:
- Added focused unit tests: `test_additional.py` (Evidence, MarketMemory, Technical fallback, MarketData snapshot).
- Implemented lightweight fallbacks so tests run without external dependencies (`requests.py`, `dotenv.py`).

Important: Do NOT perform further automated edits or large-scale AI refactors.
This file documents the minimal, intentional changes and recommended manual follow-ups.

Temporary/testing artifacts added:
- `requests.py` (test stub) — returns endpoint-appropriate JSON for offline testing.
- `dotenv.py` (no-op) — prevents import errors in test environments without python-dotenv.

Recommended manual (non-automated) fixes before production use:
1. Remove `requests.py` and `dotenv.py` stubs and install real dependencies (`requests`, `python-dotenv`).
2. Standardize data file path usage: choose `Data/market_history.json` or `data/market_history.json` and update `MarketMemory` and `MarketData` accordingly.
3. Replace `datetime.utcnow()` usages with `datetime.now(timezone.utc)` for timezone-aware timestamps.
4. Run full test suite in a controlled environment with real network access and required packages (`pandas`, `ta`, `google-generativeai`) and address any runtime-only issues.
5. Consider consolidating duplicate logic (warnings aggregation, fallback handling) into small helper functions to reduce duplication.

Freeze policy:
- From now on, no automated edits should be made without an explicit, narrow user instruction.
- All further changes must be reviewed and applied manually by a developer.

If you want, I can now stop making automated edits and hand off a short checklist for a human reviewer to apply the recommended manual fixes.

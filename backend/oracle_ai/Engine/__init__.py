"""Compatibility package re-exporting `Engine` modules.

This package exists to satisfy imports using the lowercase
`engine` package while the codebase contains an `Engine` folder.
"""

from . import accumulator  # noqa: F401
from . import evidence_engine  # noqa: F401

__all__ = ["accumulator", "evidence_engine"]

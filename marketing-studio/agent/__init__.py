"""
LangGraph Marketing Agent package.
Why it exists: Exposes the compiled agent graph for LangGraph Studio.
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from agent.graph import app

__all__ = ["app"]

#!/bin/bash
# Helper script to run LangGraph Studio
# Why it exists: Makes it easy to launch the agent without worrying about PATH

cd "$(dirname "$0")"

# Try to find langgraph in common locations
if command -v langgraph &> /dev/null; then
    LANGGRAPH_CMD="langgraph"
elif [ -f "/Users/priyankalalge/miniconda3/bin/langgraph" ]; then
    LANGGRAPH_CMD="/Users/priyankalalge/miniconda3/bin/langgraph"
else
    echo "Error: langgraph not found. Install with: pip install langgraph-cli"
    exit 1
fi

echo "Starting LangGraph Studio..."
echo "Opening at http://localhost:8123"
echo ""

$LANGGRAPH_CMD dev


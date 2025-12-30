#!/bin/bash
# Helper script to run LangGraph Studio
# Why it exists: Makes it easy to launch the agent without worrying about PATH or Python version

cd "$(dirname "$0")"

# Activate virtual environment if it exists
if [ -d "venv" ]; then
    source venv/bin/activate
    echo "✓ Activated virtual environment (Python 3.11)"
else
    echo "⚠ Warning: Virtual environment not found. Creating one..."
    python3.11 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install "langgraph-cli[inmem]"
    pip install -r requirements.txt
    echo "✓ Created and activated virtual environment"
fi

echo "Starting LangGraph Studio..."
echo "Opening at http://localhost:8123"
echo ""

langgraph dev

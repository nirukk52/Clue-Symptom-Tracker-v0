"""
Agent state schema for LangGraph.
Why it exists: Defines the typed state that flows through the agent graph,
including messages, RAG context, and generated artifacts.
"""
from typing import TypedDict, Annotated, List, Dict, Any, Optional
from langgraph.graph.message import add_messages


class AgentState(TypedDict):
    """
    State that flows through the marketing agent graph.

    Why it exists: LangGraph requires a typed state schema to track
    information across nodes. This state accumulates context and artifacts
    as the agent processes a query.
    """

    # Chat messages (automatically merged using add_messages)
    messages: Annotated[List, add_messages]

    # RAG retrieval results from knowledge base
    context: List[Dict[str, Any]]

    # Generated artifacts (campaigns, images, etc.)
    artifacts: List[Dict[str, Any]]

    # Current iteration count (for loop detection)
    iteration: int

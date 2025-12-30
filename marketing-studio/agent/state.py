"""
Agent state schema for LangGraph.
Why it exists: Defines the typed state that flows through the agent graph,
including messages, RAG context, and generated artifacts. The messages key
enables chat functionality by maintaining conversation history.
"""
from typing import TypedDict, Annotated, List, Dict, Any, Optional
from langgraph.graph.message import add_messages
from langchain_core.messages import BaseMessage


class AgentState(TypedDict):
    """
    State that flows through the marketing agent graph.

    Why it exists: LangGraph requires a typed state schema to track
    information across nodes. This state accumulates context and artifacts
    as the agent processes a query. The messages key with add_messages reducer
    enables natural chat flow by automatically merging new messages into
    the conversation history.

    Usage:
        # Input messages (HumanMessage, AIMessage, etc.)
        result = app.invoke({"messages": [HumanMessage(content="Hello")]})

        # Messages are automatically merged and maintained across nodes
    """

    # Chat messages (automatically merged using add_messages reducer)
    # Accepts: HumanMessage, AIMessage, ToolMessage, SystemMessage, etc.
    messages: Annotated[List[BaseMessage], add_messages]

    # RAG retrieval results from knowledge base
    context: List[Dict[str, Any]]

    # Generated artifacts (campaigns, images, etc.)
    artifacts: List[Dict[str, Any]]

    # Current iteration count (for loop detection)
    iteration: int

"""
LangGraph agent definition.
Why it exists: Defines the agent as a state graph with nodes for
retrieval, reasoning, and tool execution. This is the main entry
point for LangGraph Studio. The graph uses a messages key for chat
functionality, allowing natural conversation flow.
"""
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from agent.state import AgentState
from agent.nodes import retrieve_node, agent_node, should_continue


def create_tools():
    """
    Create the tools list for the agent.
    Why it exists: Tools need to be created at runtime to avoid
    circular imports and ensure proper initialization.
    """
    from tools import generate_image, create_campaign, analyze_copy, generate_utm_url
    from langchain_core.tools import tool
    from rag.retriever import search_knowledge as _search_knowledge

    @tool
    def search_knowledge(query: str) -> str:
        """Search the marketing knowledge base for relevant information about campaigns, brand guidelines, pain points, and more."""
        results = _search_knowledge(query, k=3)
        formatted = []
        for r in results:
            formatted.append(f"[{r['source']}]\n{r['text']}")
        return "\n\n---\n\n".join(formatted) if formatted else "No results found."

    return [search_knowledge, generate_image, create_campaign, analyze_copy, generate_utm_url]


def create_graph() -> StateGraph:
    """
    Build the LangGraph agent graph with messages-based chat.

    Why it exists: Defines the flow:
    1. retrieve: Get relevant context from knowledge base based on messages
    2. agent: Reason and decide on actions using messages and context
    3. tools: Execute any requested tools
    4. Loop back to agent or end

    The graph accepts messages as input (HumanMessage, AIMessage, etc.)
    and maintains conversation history through the messages key in state.

    Returns:
        Compiled StateGraph ready for execution with chat support
    """
    # Create the graph
    graph = StateGraph(AgentState)

    # Add nodes
    graph.add_node("retrieve", retrieve_node)
    graph.add_node("agent", agent_node)
    graph.add_node("tools", ToolNode(create_tools()))

    # Set entry point - retrieve node will extract query from messages
    graph.set_entry_point("retrieve")

    # Add edges
    graph.add_edge("retrieve", "agent")

    # Conditional edge from agent
    graph.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            "end": END,
        }
    )

    # Tools always go back to agent
    graph.add_edge("tools", "agent")

    return graph.compile()


# The compiled graph - this is what LangGraph Studio uses
app = create_graph()

"""
Node functions for the LangGraph agent.
Why it exists: Each node performs a specific step in the agent's reasoning
process - retrieval, thinking, tool execution.
"""
import os
from typing import Dict, Any, Literal

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from dotenv import load_dotenv

from agent.state import AgentState

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from rag.retriever import search_knowledge


load_dotenv()


# System prompt that defines the agent's personality and capabilities
SYSTEM_PROMPT = """You are a marketing expert for Chronic Life, a chat-first symptom tracker for people managing chronic conditions like endometriosis, PCOS, fibromyalgia, and long COVID.

## Your Knowledge Base
You have access to a curated knowledge base containing:
- **Research**: Pain points from Reddit communities, ranked by severity
- **Brand**: Colors, typography, voice guidelines, value propositions
- **Campaigns**: Past campaign briefs, UTM conventions, performance data
- **Prompts**: Successful image generation prompts for ads
- **Workflows**: Step-by-step processes for campaign creation

The RAG context below contains relevant excerpts. ALWAYS cite your sources when referencing knowledge (e.g., "According to pain-points.md, Pain #1...").

## Your Tools
- `search_knowledge`: Search the knowledge base for more context
- `generate_image`: Create ad images using Imagen 3
- `create_campaign`: Generate a structured campaign brief
- `analyze_copy`: Score copy for Spoonie-friendliness
- `generate_utm_url`: Create trackable URLs

## Your Principles
1. **Spoonie-Friendly**: Low-energy audience, no guilt-inducing copy
2. **No Toxic Positivity**: "We understand" not "Just think positive!"
3. **Doctor-Trust Focus**: Help users communicate with healthcare providers
4. **Community-First**: Authentic engagement over hard selling
5. **Evidence-Grounded**: Always cite sources from knowledge base

## Output Style
- Be concise but thorough
- Use markdown formatting for readability
- When creating campaigns, follow the workflow in knowledge/workflows/
- Always provide UTM URLs following the conventions in knowledge

## Error Handling
- If a tool fails, explain the error clearly to the user
- Suggest alternatives (e.g., if image generation fails, offer to create copy or UTM URLs instead)
- Include helpful troubleshooting hints from tool error responses
- Never expose raw API errors - translate them into user-friendly messages
"""


def get_llm():
    """
    Get the configured LLM instance.
    Why it exists: Centralized LLM configuration for the agent.
    """
    return ChatGoogleGenerativeAI(
        model="gemini-2.0-flash",
        temperature=0.7,
        google_api_key=os.getenv("GOOGLE_API_KEY"),
    )


def retrieve_node(state: AgentState) -> Dict[str, Any]:
    """
    RAG retrieval node - automatically retrieves relevant context.

    Why it exists: Every conversation turn should have relevant
    knowledge context injected before the agent reasons.
    """
    messages = state.get("messages", [])

    # Get the last human message for the query
    query = ""
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage) or (hasattr(msg, "type") and msg.type == "human"):
            query = msg.content if hasattr(msg, "content") else str(msg)
            break

    if not query:
        return {"context": [], "iteration": state.get("iteration", 0)}

    # Search knowledge base
    context = search_knowledge(query, k=5)

    return {
        "context": context,
        "iteration": state.get("iteration", 0) + 1,
    }


def agent_node(state: AgentState) -> Dict[str, Any]:
    """
    Main reasoning node - LLM with tools.

    Why it exists: This is the brain of the agent. It receives context
    from RAG, reasons about the user's request, and decides whether
    to use tools or respond directly.
    """
    from tools import generate_image, create_campaign, analyze_copy, generate_utm_url
    from langchain_core.tools import tool
    from rag.retriever import search_knowledge as _search_knowledge

    # Wrap search_knowledge as a LangChain tool
    @tool
    def search_knowledge(query: str) -> str:
        """Search the marketing knowledge base for relevant information."""
        results = _search_knowledge(query, k=3)
        formatted = []
        for r in results:
            formatted.append(f"[{r['source']}]\n{r['text']}")
        return "\n\n---\n\n".join(formatted) if formatted else "No results found."

    # All available tools
    tools = [search_knowledge, generate_image, create_campaign, analyze_copy, generate_utm_url]

    # Build messages with system prompt and RAG context
    context = state.get("context", [])
    context_text = ""
    if context:
        context_parts = []
        for c in context:
            if "error" not in c:
                context_parts.append(f"[{c.get('source', 'unknown')}]\n{c.get('text', '')}")
        if context_parts:
            context_text = "\n\n---\n\n".join(context_parts)

    system_content = SYSTEM_PROMPT
    if context_text:
        system_content += f"\n\n## RAG Context\n{context_text}"

    messages = [SystemMessage(content=system_content)] + list(state.get("messages", []))

    # Get LLM with tools bound
    llm = get_llm()
    llm_with_tools = llm.bind_tools(tools)

    # Invoke LLM
    response = llm_with_tools.invoke(messages)

    return {"messages": [response]}


def should_continue(state: AgentState) -> Literal["tools", "end"]:
    """
    Routing function - decide whether to execute tools or finish.

    Why it exists: After the agent node, we need to check if it wants
    to call tools (has tool_calls) or if it's done responding.
    """
    messages = state.get("messages", [])
    if not messages:
        return "end"

    last_message = messages[-1]

    # Check for tool calls
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"

    # Safety: prevent infinite loops
    if state.get("iteration", 0) > 10:
        return "end"

    return "end"

"""
Knowledge retriever for semantic search.
Why it exists: Provides the search_knowledge tool that the agent uses
to find relevant context from the marketing knowledge base.
"""
from pathlib import Path
from typing import List, Dict, Any

import lancedb

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from rag.embeddings import embed_single


# Path configuration
BASE_DIR = Path(__file__).parent.parent
VECTORSTORE_DIR = BASE_DIR / "vectorstore"


def search_knowledge(query: str, k: int = 5) -> List[Dict[str, Any]]:
    """
    Semantic search over the marketing knowledge base.

    Why it exists: Powers RAG retrieval - finds relevant context
    from research, brand guidelines, campaigns, etc. based on
    semantic similarity to the user's query.

    Args:
        query: Search query (natural language)
        k: Number of results to return (default 5)

    Returns:
        List of dicts with:
        - text: The relevant chunk content
        - source: File path within knowledge/
        - category: Top-level folder (research, brand, etc.)
        - relevance: Similarity score (lower is more similar)
    """
    try:
        db = lancedb.connect(str(VECTORSTORE_DIR))
        table = db.open_table("knowledge")
    except Exception as e:
        return [{
            "text": f"Knowledge base not indexed. Run: python -m rag.indexer",
            "source": "error",
            "category": "error",
            "relevance": 0.0,
            "error": str(e)
        }]

    # Embed the query
    query_embedding = embed_single(query)

    # Search
    results = (
        table.search(query_embedding)
        .limit(k)
        .to_list()
    )

    return [
        {
            "text": r["text"],
            "source": r["source"],
            "category": r["category"],
            "relevance": r.get("_distance", 0.0),
        }
        for r in results
    ]


def search_by_category(query: str, category: str, k: int = 5) -> List[Dict[str, Any]]:
    """
    Search within a specific knowledge category.

    Why it exists: Sometimes the agent needs to search only within
    a specific section (e.g., only brand guidelines, only research).

    Args:
        query: Search query
        category: Category to filter (research, brand, campaigns, etc.)
        k: Number of results

    Returns:
        Filtered search results
    """
    try:
        db = lancedb.connect(str(VECTORSTORE_DIR))
        table = db.open_table("knowledge")
    except Exception as e:
        return [{"error": str(e)}]

    query_embedding = embed_single(query)

    results = (
        table.search(query_embedding)
        .where(f"category = '{category}'")
        .limit(k)
        .to_list()
    )

    return [
        {
            "text": r["text"],
            "source": r["source"],
            "category": r["category"],
            "relevance": r.get("_distance", 0.0),
        }
        for r in results
    ]


def get_all_sources() -> List[str]:
    """
    List all indexed knowledge sources.

    Why it exists: Useful for debugging and showing the agent
    what knowledge is available.

    Returns:
        List of unique source file paths
    """
    try:
        db = lancedb.connect(str(VECTORSTORE_DIR))
        table = db.open_table("knowledge")
        df = table.to_pandas()
        return sorted(df["source"].unique().tolist())
    except Exception:
        return []

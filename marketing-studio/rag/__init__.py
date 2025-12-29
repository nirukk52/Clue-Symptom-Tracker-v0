"""
RAG (Retrieval Augmented Generation) package.
Why it exists: Provides semantic search over the marketing knowledge base.
"""
from rag.embeddings import embed_texts
from rag.retriever import search_knowledge

__all__ = ["embed_texts", "search_knowledge"]

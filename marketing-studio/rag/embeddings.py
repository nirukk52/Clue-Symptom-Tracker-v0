"""
Gemini embeddings for RAG semantic search.
Why it exists: Provides vector representations of text for similarity search
over the marketing knowledge base using Google's text-embedding-004 model.
"""
import os
from typing import List
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


@lru_cache(maxsize=1)
def _get_client():
    """
    Lazy initialization of the Genai client.
    Why it exists: Avoids import-time errors if API key isn't set.
    """
    from google import genai
    return genai.Client()


def embed_texts(texts: List[str]) -> List[List[float]]:
    """
    Generate embeddings for a list of texts using Gemini text-embedding-004.

    Args:
        texts: List of strings to embed

    Returns:
        List of embedding vectors (768 dimensions each)
    """
    if not texts:
        return []

    client = _get_client()

    # Gemini has a limit on batch size, process in chunks of 100
    all_embeddings = []
    batch_size = 100

    for i in range(0, len(texts), batch_size):
        batch = texts[i:i + batch_size]
        result = client.models.embed_content(
            model="text-embedding-004",
            contents=batch
        )
        batch_embeddings = [e.values for e in result.embeddings]
        all_embeddings.extend(batch_embeddings)

    return all_embeddings


def embed_single(text: str) -> List[float]:
    """
    Generate embedding for a single text.

    Args:
        text: String to embed

    Returns:
        Embedding vector (768 dimensions)
    """
    embeddings = embed_texts([text])
    return embeddings[0] if embeddings else []

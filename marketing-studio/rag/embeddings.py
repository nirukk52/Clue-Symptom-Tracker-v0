"""
Gemini embeddings for RAG semantic search.
Why it exists: Provides vector representations of text for similarity search
over the marketing knowledge base using Google's text-embedding-004 model.
"""
import os
from typing import List, Union
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

    Why it exists: Converts text chunks into vector embeddings for semantic
    search. The embeddings are used to find relevant knowledge base content
    based on semantic similarity to user queries.

    Args:
        texts: List of strings to embed (must be plain strings, not message objects)

    Returns:
        List of embedding vectors (768 dimensions each)
    """
    if not texts:
        return []

    client = _get_client()

    # Ensure all inputs are plain strings (not message objects or nested structures)
    clean_texts = []
    for text in texts:
        if isinstance(text, str):
            clean_texts.append(text)
        elif isinstance(text, dict):
            # Handle case where text might be wrapped in a dict with 'text' key
            if 'text' in text:
                clean_texts.append(str(text['text']))
            elif 'content' in text:
                clean_texts.append(str(text['content']))
            else:
                clean_texts.append(str(text))
        elif isinstance(text, list):
            # Handle nested lists - extract the actual text
            if text and isinstance(text[0], dict) and 'text' in text[0]:
                clean_texts.append(str(text[0]['text']))
            else:
                clean_texts.append(str(text))
        else:
            # Convert anything else to string
            clean_texts.append(str(text))

    # Gemini has a limit on batch size, process in chunks of 100
    all_embeddings = []
    batch_size = 100

    for i in range(0, len(clean_texts), batch_size):
        batch = clean_texts[i:i + batch_size]
        # Ensure batch is a flat list of strings, not nested
        batch = [str(t) for t in batch]

        try:
            # Try the standard API format first (list of strings)
            result = client.models.embed_content(
                model="text-embedding-004",
                contents=batch
            )
            if hasattr(result, 'embeddings') and result.embeddings:
                batch_embeddings = [e.values for e in result.embeddings]
                all_embeddings.extend(batch_embeddings)
            else:
                # Fallback if structure is different
                print(f"Warning: Unexpected result structure from embed_content")
                for _ in batch:
                    all_embeddings.append([0.0] * 768)
        except (TypeError, ValueError) as e:
            # If the API format has changed, try using Content objects
            try:
                from google.genai import types
                # Convert strings to Content objects
                content_objects = [types.Content(parts=[types.Part(text=t)]) for t in batch]
                result = client.models.embed_content(
                    model="text-embedding-004",
                    contents=content_objects
                )
                if hasattr(result, 'embeddings') and result.embeddings:
                    batch_embeddings = [e.values for e in result.embeddings]
                    all_embeddings.extend(batch_embeddings)
                else:
                    raise ValueError("No embeddings in result")
            except Exception as content_error:
                # If Content objects also fail, try embedding one at a time
                print(f"Warning: Batch embedding failed with both formats, trying individual: {content_error}")
                for single_text in batch:
                    try:
                        single_text_str = str(single_text)
                        result = client.models.embed_content(
                            model="text-embedding-004",
                            contents=[single_text_str]
                        )
                        if result.embeddings and len(result.embeddings) > 0:
                            all_embeddings.append(result.embeddings[0].values)
                        else:
                            all_embeddings.append([0.0] * 768)
                    except Exception as single_error:
                        print(f"Error embedding text '{single_text[:50]}...': {single_error}")
                        all_embeddings.append([0.0] * 768)
        except Exception as e:
            # Generic error handling
            print(f"Warning: Batch embedding failed: {e}")
            # Try embedding one at a time as fallback
            for single_text in batch:
                try:
                    single_text_str = str(single_text)
                    result = client.models.embed_content(
                        model="text-embedding-004",
                        contents=[single_text_str]
                    )
                    if result.embeddings and len(result.embeddings) > 0:
                        all_embeddings.append(result.embeddings[0].values)
                    else:
                        all_embeddings.append([0.0] * 768)
                except Exception as single_error:
                    print(f"Error embedding text '{single_text[:50]}...': {single_error}")
                    all_embeddings.append([0.0] * 768)

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

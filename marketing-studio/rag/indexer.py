"""
Knowledge base indexer for LanceDB.
Why it exists: Converts markdown files into vector embeddings stored in LanceDB
for semantic search during agent conversations.
"""
import os
import re
from pathlib import Path
from typing import List, Dict, Any

import lancedb

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))

from rag.embeddings import embed_texts


# Path configuration
BASE_DIR = Path(__file__).parent.parent
KNOWLEDGE_DIR = BASE_DIR / "knowledge"
VECTORSTORE_DIR = BASE_DIR / "vectorstore"


def chunk_markdown(content: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
    """
    Split markdown content into overlapping chunks.

    Why it exists: LLMs have context limits and embeddings work better
    on focused chunks than entire documents.

    Args:
        content: Full markdown text
        chunk_size: Target characters per chunk
        overlap: Characters to overlap between chunks

    Returns:
        List of text chunks
    """
    # Split on headers and paragraphs
    sections = re.split(r'\n(?=#{1,3}\s)', content)

    chunks = []
    for section in sections:
        section = section.strip()
        if not section:
            continue

        # If section is small enough, keep as-is
        if len(section) <= chunk_size:
            chunks.append(section)
            continue

        # Split larger sections by paragraphs
        paragraphs = section.split('\n\n')
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk) + len(para) <= chunk_size:
                current_chunk += "\n\n" + para if current_chunk else para
            else:
                if current_chunk:
                    chunks.append(current_chunk)
                current_chunk = para

        if current_chunk:
            chunks.append(current_chunk)

    return chunks


def extract_metadata(file_path: Path) -> Dict[str, str]:
    """
    Extract metadata from file path for better retrieval.

    Why it exists: Source attribution helps the agent cite its sources
    and provides context about what type of knowledge was retrieved.
    """
    relative_path = file_path.relative_to(KNOWLEDGE_DIR)
    parts = relative_path.parts

    return {
        "source": str(relative_path),
        "category": parts[0] if parts else "unknown",
        "filename": file_path.stem,
    }


def index_knowledge(knowledge_dir: Path = None) -> Dict[str, Any]:
    """
    Index all markdown files from knowledge directory into LanceDB.

    Why it exists: Creates the vector database that powers RAG retrieval.
    Run this after adding or modifying knowledge base files.

    Args:
        knowledge_dir: Path to knowledge folder (defaults to ./knowledge)

    Returns:
        Dict with indexing stats
    """
    knowledge_dir = knowledge_dir or KNOWLEDGE_DIR
    VECTORSTORE_DIR.mkdir(exist_ok=True)

    db = lancedb.connect(str(VECTORSTORE_DIR))

    documents = []
    file_count = 0
    chunk_count = 0

    for md_file in knowledge_dir.rglob("*.md"):
        try:
            content = md_file.read_text(encoding="utf-8")
            metadata = extract_metadata(md_file)
            chunks = chunk_markdown(content)

            for i, chunk in enumerate(chunks):
                documents.append({
                    "text": chunk,
                    "source": metadata["source"],
                    "category": metadata["category"],
                    "filename": metadata["filename"],
                    "chunk_id": i,
                })

            file_count += 1
            chunk_count += len(chunks)
            print(f"  Indexed: {metadata['source']} ({len(chunks)} chunks)")

        except Exception as e:
            print(f"  Error indexing {md_file}: {e}")

    if not documents:
        return {"status": "error", "message": "No documents found to index"}

    # Generate embeddings for all chunks
    print(f"\nGenerating embeddings for {len(documents)} chunks...")
    texts = [doc["text"] for doc in documents]
    embeddings = embed_texts(texts)

    # Add embeddings to documents
    for doc, emb in zip(documents, embeddings):
        doc["vector"] = emb

    # Create or overwrite the table
    table = db.create_table("knowledge", documents, mode="overwrite")

    # Create vector index for faster search (only if enough rows)
    # LanceDB requires at least 256 rows for PQ training
    index_created = False
    if len(documents) >= 256:
        try:
            table.create_index(
                metric="cosine",
                num_partitions=2,
                num_sub_vectors=8,
            )
            index_created = True
        except Exception as e:
            print(f"Warning: Could not create index: {e}")

    return {
        "status": "success",
        "files_indexed": file_count,
        "chunks_created": chunk_count,
        "vectorstore_path": str(VECTORSTORE_DIR),
        "index_created": index_created,
        "note": "Index not created (need 256+ chunks)" if not index_created else None,
    }


if __name__ == "__main__":
    """
    Run directly to re-index knowledge base:
    python -m rag.indexer
    """
    print("Indexing knowledge base...")
    result = index_knowledge()
    print(f"\nResult: {result}")

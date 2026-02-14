"""
Pinecone vector database client.

Manages the connection to Pinecone and provides
upsert / query helpers for plant care guide embeddings.
"""

import os
from pinecone import Pinecone, ServerlessSpec
from typing import List, Dict, Any

INDEX_NAME = "plant-care-guides"
EMBEDDING_DIM = 512

_pc = None
_index = None


def _get_client() -> Pinecone:
    """Get or create the Pinecone client."""
    global _pc
    if _pc is None:
        api_key = os.getenv("PINECONE_API_KEY")
        if not api_key:
            raise RuntimeError("PINECONE_API_KEY env var is not set")
        _pc = Pinecone(api_key=api_key)
    return _pc


def _get_index():
    """Get or create the Pinecone index."""
    global _index
    if _index is None:
        pc = _get_client()

        # Create index if it doesn't exist
        existing = [idx.name for idx in pc.list_indexes()]
        if INDEX_NAME not in existing:
            print(f"Creating Pinecone index '{INDEX_NAME}'...")
            pc.create_index(
                name=INDEX_NAME,
                dimension=EMBEDDING_DIM,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1"),
            )
            print(f"Index '{INDEX_NAME}' created.")

        _index = pc.Index(INDEX_NAME)
    return _index


def upsert_guides(guides: List[Dict[str, Any]], embeddings: List[List[float]]):
    """
    Upsert plant care guides into Pinecone.

    Each guide should have: { id, text, category, ... }
    """
    index = _get_index()
    vectors = []
    for guide, embedding in zip(guides, embeddings):
        vectors.append({
            "id": guide["id"],
            "values": embedding,
            "metadata": {
                "text": guide["text"],
                "title": guide.get("title", ""),
                "category": guide.get("category", ""),
            },
        })

    # Upsert in batches of 100
    batch_size = 100
    for i in range(0, len(vectors), batch_size):
        batch = vectors[i : i + batch_size]
        index.upsert(vectors=batch)

    print(f"Upserted {len(vectors)} guides into Pinecone.")


def query_similar(embedding: List[float], top_k: int = 5) -> List[Dict[str, Any]]:
    """
    Query Pinecone for the most similar plant care guides.

    Returns a list of matches with id, score, and metadata.
    """
    index = _get_index()
    results = index.query(vector=embedding, top_k=top_k, include_metadata=True)

    matches = []
    for match in results.matches:
        matches.append({
            "id": match.id,
            "score": match.score,
            "title": match.metadata.get("title", ""),
            "text": match.metadata.get("text", ""),
            "category": match.metadata.get("category", ""),
        })
    return matches

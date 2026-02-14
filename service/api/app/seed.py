"""
Seed script to embed plant care guides and upsert them into Pinecone.

Run inside the api container:
    python -m app.seed
"""

import os
import sys

# Ensure the app module is importable
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.data.plant_guides import PLANT_GUIDES
from app.services.clip_service import embed_texts
from app.services.pinecone_client import upsert_guides


def main():
    print(f"Seeding {len(PLANT_GUIDES)} plant care guides...")

    texts = [guide["text"] for guide in PLANT_GUIDES]
    print("Embedding texts with CLIP...")
    embeddings = embed_texts(texts)
    print(f"Generated {len(embeddings)} embeddings (dim={len(embeddings[0])})")

    print("Upserting into Pinecone...")
    upsert_guides(PLANT_GUIDES, embeddings)

    print("Done! Plant care guides are now in Pinecone.")


if __name__ == "__main__":
    main()

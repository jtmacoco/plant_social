# Plant Social — AI Pipeline Documentation

## Overview

This document explains how the **image → CLIP → Pinecone → care tips** pipeline works.
When a user takes a photo of their plant, the backend uses an AI model called **CLIP** to
understand what's in the image, then searches a **Pinecone vector database** for the most
relevant plant care guides and returns them to the app.

---

## Table of Contents

1. [Architecture](#architecture)
2. [What is CLIP?](#what-is-clip)
3. [What is Pinecone?](#what-is-pinecone)
4. [How the Pipeline Works](#how-the-pipeline-works)
5. [Backend Code Walkthrough](#backend-code-walkthrough)
   - [clip_service.py](#clip_servicepy)
   - [pinecone_client.py](#pinecone_clientpy)
   - [plant_guides.py](#plant_guidespy)
   - [seed.py](#seedpy)
   - [images.py (route)](#imagespy-route)
6. [Frontend Code Walkthrough](#frontend-code-walkthrough)
   - [api.ts](#apits)
   - [index.tsx (home screen)](#indextsx-home-screen)
7. [Environment Variables](#environment-variables)
8. [Commands Reference](#commands-reference)

---

## Architecture

```
┌─────────────┐       POST /images        ┌─────────────────┐
│             │  ───────────────────────►  │                 │
│  Expo App   │      (image file)          │  FastAPI Server │
│  (Frontend) │                            │   (Backend)     │
│             │  ◄───────────────────────  │                 │
└─────────────┘    { tips: [...] }         └────────┬────────┘
                                                    │
                                           ┌────────▼────────┐
                                           │   CLIP Model    │
                                           │  (ViT-B-32)     │
                                           │                 │
                                           │ Converts image  │
                                           │ into a 512-dim  │
                                           │ vector          │
                                           └────────┬────────┘
                                                    │
                                           ┌────────▼────────┐
                                           │    Pinecone     │
                                           │  Vector DB      │
                                           │                 │
                                           │ Finds closest   │
                                           │ matching plant  │
                                           │ care guides     │
                                           └─────────────────┘
```

---

## What is CLIP?

**CLIP** (Contrastive Language-Image Pre-training) is an AI model by OpenAI that understands
both **images** and **text**. It was trained on millions of image-text pairs from the internet.

### The Key Idea

CLIP converts both images and text into **vectors** (lists of 512 numbers) in the **same
mathematical space**. This means:

- A photo of a succulent → `[0.12, -0.45, 0.78, ...]` (512 numbers)
- The text "Succulents need infrequent watering" → `[0.11, -0.43, 0.80, ...]` (512 numbers)

Because the succulent photo and the succulent care text are **semantically similar**, their
vectors end up **close together** in this 512-dimensional space. We measure closeness using
**cosine similarity** (a score from 0 to 1, where 1 = identical).

### Why This Matters

This lets us do **cross-modal search**: upload an image and find relevant text without ever
needing to label the image. CLIP "understands" what's in the photo and matches it to text
that describes similar things.

### Our Model

We use `ViT-B-32` from the `open_clip` library (open-source CLIP implementation):
- **ViT** = Vision Transformer (the image encoder architecture)
- **B-32** = Base model, 32×32 patch size
- **512** = output embedding dimension
- **Pretrained on**: LAION-2B dataset (2 billion image-text pairs)

---

## What is Pinecone?

**Pinecone** is a managed **vector database**. Unlike a regular database that stores rows
and columns, Pinecone stores **vectors** (lists of numbers) and lets you search by
**similarity**.

### How It Works

1. **Store**: You give Pinecone a vector + metadata (like the guide text, title, category)
2. **Search**: You give Pinecone a query vector, and it returns the closest stored vectors

### Our Setup

- **Index name**: `plant-care-guides`
- **Dimension**: 512 (matches CLIP's output)
- **Metric**: Cosine similarity
- **Spec**: Serverless on AWS us-east-1 (free tier)

Each record in Pinecone looks like this:

```json
{
  "id": "guide_001",
  "values": [0.12, -0.45, 0.78, ...],      // 512-dim CLIP embedding of the guide text
  "metadata": {
    "title": "Overwatering Signs",
    "text": "Yellow leaves combined with soggy soil...",
    "category": "watering"
  }
}
```

---

## How the Pipeline Works

### One-Time Setup: Seeding

Before the app can return tips, the plant care guides need to be embedded and stored:

```
plant_guides.py          clip_service.py           pinecone_client.py
┌──────────────┐        ┌─────────────────┐       ┌──────────────────┐
│ 20 text      │        │                 │       │                  │
│ guides with  │───────►│ embed_texts()   │──────►│ upsert_guides()  │
│ title, text, │  text   │ CLIP encodes   │ vecs   │ Store vectors +  │
│ category     │  strings│ all 20 texts   │        │ metadata in      │
└──────────────┘        │ into 512-dim    │       │ Pinecone         │
                        │ vectors         │       └──────────────────┘
                        └─────────────────┘
```

This is run once with: `docker compose exec api python -m app.seed`

### Per-Request: Image Upload

Every time a user takes a photo:

```
1. User takes photo
         │
         ▼
2. Frontend sends image to POST /images
         │
         ▼
3. Backend reads image bytes
         │
         ▼
4. clip_service.embed_image() converts image → 512-dim vector
         │
         ▼
5. pinecone_client.query_similar() sends vector to Pinecone
         │
         ▼
6. Pinecone returns top 3 most similar guide vectors (by cosine similarity)
         │
         ▼
7. Backend returns tips (title, text, category, match score) as JSON
         │
         ▼
8. Frontend renders the tip cards on screen
```

---

## Backend Code Walkthrough

All backend code lives in `service/api/app/`.

### clip_service.py

**Location**: `service/api/app/services/clip_service.py`

This module wraps the CLIP model. It exposes three functions:

| Function | Input | Output | Used For |
|----------|-------|--------|----------|
| `embed_text(text)` | A single string | `List[float]` (512 numbers) | Embedding one guide |
| `embed_texts(texts)` | List of strings | `List[List[float]]` | Batch embedding all guides during seeding |
| `embed_image(image_bytes)` | Raw image bytes | `List[float]` (512 numbers) | Embedding a user's uploaded photo |

**Key details:**

- **Lazy loading**: The model is loaded only on first use (`_load_model()`), not at import
  time. This avoids slowing down the API startup if the endpoint isn't hit yet.
- **Singleton pattern**: The model, preprocessor, and tokenizer are stored in module-level
  globals (`_model`, `_preprocess`, `_tokenizer`) so they're loaded once and reused.
- **Normalization**: After encoding, vectors are **normalized** (divided by their norm).
  This ensures cosine similarity works correctly — when vectors are unit length, the dot
  product equals cosine similarity.
- **`torch.no_grad()`**: Disables gradient computation since we're only doing inference,
  not training. This saves memory and is faster.

```python
# How normalization works:
text_features /= text_features.norm(dim=-1, keepdim=True)
# This makes every vector have length = 1
# So cosine_similarity(a, b) = dot_product(a, b)
```

---

### pinecone_client.py

**Location**: `service/api/app/services/pinecone_client.py`

This module manages the Pinecone connection. It exposes two main functions:

#### `upsert_guides(guides, embeddings)`

Used during seeding. Takes the guide dictionaries and their CLIP embeddings, then stores
them in Pinecone. Each vector gets:

- `id` — unique guide ID (e.g., `"guide_001"`)
- `values` — the 512-dim embedding
- `metadata` — the text, title, and category (stored alongside the vector so Pinecone
  returns it with search results)

Upserts in batches of 100 (Pinecone best practice for large datasets).

#### `query_similar(embedding, top_k=5)`

Used at request time. Takes the image embedding and asks Pinecone: "What are the `top_k`
closest vectors to this one?" Returns matches with:

- `id` — which guide matched
- `score` — cosine similarity (0.0 to 1.0, higher = more relevant)
- `title`, `text`, `category` — the guide content from metadata

**Key details:**

- **Auto-creates index**: If the `plant-care-guides` index doesn't exist in Pinecone,
  `_get_index()` creates it automatically.
- **Singleton pattern**: The Pinecone client and index objects are cached in module globals.
- **API key from env**: Reads `PINECONE_API_KEY` from environment variables (set in
  docker-compose.yml from your `.env` file).

---

### plant_guides.py

**Location**: `service/api/app/data/plant_guides.py`

A simple Python list of 20 plant care guide dictionaries. Each guide has:

```python
{
    "id": "guide_001",           # Unique ID (used as Pinecone vector ID)
    "title": "Overwatering Signs",  # Short title
    "category": "watering",      # Category for display
    "text": "Yellow leaves..."   # The actual care tip (this gets embedded by CLIP)
}
```

**Categories covered:**
- `watering` — overwatering, underwatering, technique
- `light` — low light, bright indirect, full sun, sunburn
- `soil` — repotting, soil mix
- `pests` — spider mites, fungus gnats, mealybugs
- `plant_type` — succulents, tropical, herbs, flowering
- `health` — brown tips, leggy growth, wilting
- `nutrition` — fertilizing basics

---

### seed.py

**Location**: `service/api/app/seed.py`

The seeding script that populates Pinecone. Run it once (or whenever you update the guides).

**What it does step by step:**

1. Imports all 20 guides from `plant_guides.py`
2. Extracts just the `text` field from each guide
3. Passes all 20 texts to `embed_texts()` → gets 20 vectors (each 512-dim)
4. Calls `upsert_guides()` → stores all 20 vectors + metadata in Pinecone

**Run with:**
```bash
docker compose exec api python -m app.seed
```

**Output should look like:**
```
Seeding 20 plant care guides...
Embedding texts with CLIP...
Loading CLIP model...
CLIP model loaded.
Generated 20 embeddings (dim=512)
Upserting into Pinecone...
Creating Pinecone index 'plant-care-guides'...   # (only first time)
Index 'plant-care-guides' created.                # (only first time)
Upserted 20 guides into Pinecone.
Done! Plant care guides are now in Pinecone.
```

---

### images.py (route)

**Location**: `service/api/app/routes/images.py`

The FastAPI route that handles image uploads.

#### `POST /images`

1. **Validates** the uploaded file is an image (checks `content_type`)
2. **Reads** the raw image bytes with `await file.read()`
3. **Embeds** the image using `embed_image(image_bytes)` → 512-dim vector
4. **Searches** Pinecone using `query_similar(image_embedding, top_k=3)` → top 3 matches
5. **Returns** JSON:

```json
{
  "content_type": "image/jpeg",
  "tips": [
    {
      "id": "guide_013",
      "score": 0.287,
      "title": "Succulent Care",
      "text": "Succulents store water in their thick leaves...",
      "category": "plant_type"
    },
    {
      "id": "guide_006",
      "score": 0.264,
      "title": "Full Sun Plants",
      "text": "Succulents, cacti, and herbs like basil need 6+ hours...",
      "category": "light"
    },
    ...
  ]
}
```

---

## Frontend Code Walkthrough

### api.ts

**Location**: `app/plant-social-app/lib/api.ts`

Defines the TypeScript types and the `uploadImage()` function.

**Types:**
- `PlantTip` — matches the backend response shape (id, score, title, text, category)
- `UploadImageResponse` — the full response with content_type and tips array

**`uploadImage(uri)`:**
- On **web**: Fetches the image URI as a blob, appends to FormData
- On **native (iOS/Android)**: Uses React Native's `{uri, type, name}` format
- Sends via `httpClient.upload()` (which uses `fetch` with no Content-Type header,
  letting the browser set the multipart boundary automatically)

### index.tsx (home screen)

**Location**: `app/plant-social-app/app/(tabs)/index.tsx`

**State:**
- `showCamera` — toggles the camera view
- `loading` — shows a spinner while waiting for the API
- `tips` — array of `PlantTip` objects returned from the API

**Flow:**
1. User taps "Get Plant Tips" → `setShowCamera(true)` → camera opens
2. User takes photo and taps "Use Photo" → `handlePhotoTaken(uri)` fires
3. Camera closes, loading spinner shows
4. `uploadImage(uri)` sends the image to the backend
5. Response comes back → `setTips(result.tips)` → tip cards render
6. User sees top 3 matching care guides with title, category, match %, and full text
7. "Clear" button resets tips

---

## Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `PINECONE_API_KEY` | `.env` | Authenticates with Pinecone API |
| `EXPO_PUBLIC_API_URL` | `.env` | Tells the frontend where the backend is |
| `LANIP` | `.env` | Your local network IP for phone testing |

These are passed into Docker via `docker-compose.yml`:
```yaml
api:
  environment:
    - PINECONE_API_KEY=${PINECONE_API_KEY}
```

---

## Commands Reference

```bash
# Build API container (needed after changing requirements.txt)
docker compose build api

# Start all services
docker compose up

# Seed plant guides into Pinecone (one-time, run after build)
docker compose exec api python -m app.seed

# Stop all services
docker compose down

# View API logs only
docker compose logs api

# Re-seed after updating plant_guides.py
docker compose exec api python -m app.seed
```

---

## Adding More Guides

To add new plant care tips:

1. Edit `service/api/app/data/plant_guides.py`
2. Add new entries to the `PLANT_GUIDES` list with a unique `id`
3. Re-run the seed command:
   ```bash
   docker compose exec api python -m app.seed
   ```

The upsert is idempotent — running it again updates existing guides and adds new ones
without duplicating.

"""
CLIP embedding service.

Uses open_clip to embed both text and images into the same vector space.
This allows us to search text plant care guides using an image query.
"""

import open_clip
import torch
from PIL import Image
from io import BytesIO
from typing import List

# Load model once at module level
_model = None
_preprocess = None
_tokenizer = None

CLIP_MODEL = "ViT-B-32"
CLIP_PRETRAINED = "laion2b_s34b_b79k"
EMBEDDING_DIM = 512


def _load_model():
    """Lazy-load the CLIP model."""
    global _model, _preprocess, _tokenizer
    if _model is None:
        print("Loading CLIP model...")
        _model, _, _preprocess = open_clip.create_model_and_transforms(
            CLIP_MODEL, pretrained=CLIP_PRETRAINED
        )
        _tokenizer = open_clip.get_tokenizer(CLIP_MODEL)
        _model.eval()
        print("CLIP model loaded.")
    return _model, _preprocess, _tokenizer


def embed_text(text: str) -> List[float]:
    """Embed a text string into a CLIP vector."""
    model, _, tokenizer = _load_model()
    tokens = tokenizer([text])
    with torch.no_grad():
        text_features = model.encode_text(tokens)
        text_features /= text_features.norm(dim=-1, keepdim=True)
    return text_features[0].tolist()


def embed_texts(texts: List[str]) -> List[List[float]]:
    """Embed multiple text strings into CLIP vectors."""
    model, _, tokenizer = _load_model()
    tokens = tokenizer(texts)
    with torch.no_grad():
        text_features = model.encode_text(tokens)
        text_features /= text_features.norm(dim=-1, keepdim=True)
    return text_features.tolist()


def embed_image(image_bytes: bytes) -> List[float]:
    """Embed an image (bytes) into a CLIP vector."""
    model, preprocess, _ = _load_model()
    image = Image.open(BytesIO(image_bytes)).convert("RGB")
    image_tensor = preprocess(image).unsqueeze(0)
    with torch.no_grad():
        image_features = model.encode_image(image_tensor)
        image_features /= image_features.norm(dim=-1, keepdim=True)
    return image_features[0].tolist()

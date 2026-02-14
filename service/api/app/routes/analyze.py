# services/api/app/api/v1/analyze.py
from fastapi import APIRouter, UploadFile, File, HTTPException
from PIL import Image
import io

from app.ml.clip_embedder import CLIPEmbedder

router = APIRouter(prefix="/analyze", tags=["analyze"])
clip = CLIPEmbedder()  # loads once when module imports (or do it in startup)

@router.post("")
async def analyze(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image")

    emb = clip.image_embedding(img)  # list[float]

    # NEXT: store `emb` in Actian VectorAI DB OR use it to query VectorAI
    return {
        "embedding_dim": len(emb),
        "embedding_preview": emb[:8],  # don’t return full vector in production
    }
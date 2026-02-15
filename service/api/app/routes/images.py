from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import FileResponse
from pathlib import Path
import uuid
from ..services.clip_service import embed_image
from ..services.pinecone_client import query_similar

router = APIRouter(prefix="/images", tags=["images"])
UPLOAD_DIR = Path("data/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_BYTES = 8 * 1024 * 1024


@router.post("")
async def upload_image(file: UploadFile = File(...), user_id:str | None = Form(None)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    # save file / stream to S3 / etc
    contents = await file.read()
    if len(contents) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File must be less than 8MB")
    contents = await file.read()
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid image")

    emb = clip.image_embedding(img) 

    return {
        "embedding_dim": len(emb),
        "embedding_preview": emb[:8],  
    }
    

@router.get("/{image_id}")
async def get_image(image_id: str):
    #TODO
    return {"image_id": image_id}
from fastapi import APIRouter, UploadFile, File, HTTPException
from ..services.clip_service import embed_image
from ..services.pinecone_client import query_similar

router = APIRouter(prefix="/images", tags=["images"])


@router.post("")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    # Read image bytes
    image_bytes = await file.read()

    # Embed the image with CLIP
    image_embedding = embed_image(image_bytes)

    # Search Pinecone for similar plant care guides
    matches = query_similar(image_embedding, top_k=3)

    return {
        "content_type": file.content_type,
        "tips": matches,
    }


@router.get("/{image_id}")
async def get_image(image_id: str):
    return {"image_id": image_id}
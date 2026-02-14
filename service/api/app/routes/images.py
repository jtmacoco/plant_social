from fastapi import APIRouter, UploadFile, File, HTTPException

router = APIRouter(prefix="/images", tags=["images"])

@router.post("")
async def upload_image(file: UploadFile = File(...)):
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    # save file / stream to S3 / etc
    return {"id": "abc123", "content_type": file.content_type}

@router.get("/{image_id}")
async def get_image(image_id: str):
    # return FileResponse(...) or RedirectResponse(...) or StreamingResponse(...)
    return {"image_id": image_id}
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from typing import Optional
from ..services.gemini_service import analyze_plant_image

router = APIRouter(prefix="/plant-doctor", tags=["plant-doctor"])


@router.post("")
async def diagnose_plant(
    file: UploadFile = File(...),
    context: Optional[str] = Form(""),
):
    """Upload a plant image and get AI-powered diagnosis and care tips from Gemini."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")

    image_bytes = await file.read()
    mime_type = file.content_type or "image/jpeg"

    try:
        result = await analyze_plant_image(image_bytes, mime_type, context or "")
    except Exception as e:
        raise HTTPException(
            status_code=502,
            detail=f"Gemini analysis failed: {str(e)}",
        )

    return result

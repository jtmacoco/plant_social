from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..services.gemini_service import analyze_sensor_data

router = APIRouter(prefix="/sensor-ai", tags=["sensor-ai"])

class AnalysisRequest(BaseModel):
    plant_type: str
    voltage: int

@router.post("/analyze")
async def analyze_sensor(request: AnalysisRequest):
    """
    Uses Gemini to analyze raw sensor voltage for a specific plant type.
    """
    if not request.plant_type:
        raise HTTPException(status_code=400, detail="Plant type is required")
        
    return await analyze_sensor_data(request.plant_type, request.voltage)
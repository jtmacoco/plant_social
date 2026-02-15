from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/sensors", tags=["sensors"])

class MoistureReading(BaseModel):
    sensor_id: str = Field(..., description="Unique ID of the ESP32 or sensor")
    moisture_value: int = Field(..., description="Moisture reading (0-100% or raw analog value)")
    battery_level: Optional[float] = Field(None, description="Battery voltage if battery powered")

@router.post("/moisture")
async def receive_moisture_data(reading: MoistureReading):
    """
    Receives moisture data from ESP32 sensors.
    """
    # In a real application, you would save this to a database here.
    print(f"[{datetime.now()}] Received data from {reading.sensor_id}: {reading.moisture_value}")

    # Simple logic to determine plant status
    # Assuming 0 = dry, 100 = wet
    needs_water = False
    status = "healthy"

    if reading.moisture_value < 30:
        needs_water = True
        status = "thirsty"
    elif reading.moisture_value > 80:
        status = "overwatered"

    return {
        "status": "success",
        "server_time": datetime.now().isoformat(),
        "plant_status": status,
        "command": "WATER_ON" if needs_water else "WATER_OFF"
    }
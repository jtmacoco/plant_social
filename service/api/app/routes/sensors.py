from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

router = APIRouter(prefix="/sensors", tags=["sensors"])

# In-memory store for the latest sensor readings
sensor_readings = {}

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

    # Update the in-memory store
    sensor_readings[reading.sensor_id] = {
        "id": reading.sensor_id,
        "moisture": reading.moisture_value,
        "status": status,
        "needs_water": needs_water,
        "updated_at": datetime.now().isoformat()
    }

    return {
        "status": "success",
        "server_time": datetime.now().isoformat(),
        "plant_status": status,
        "command": "WATER_ON" if needs_water else "WATER_OFF"
    }

@router.get("/status")
async def get_sensors_status():
    """Returns the latest status of all connected sensors."""
    return list(sensor_readings.values())
from fastapi import FastAPI, Query
from pydantic import BaseModel
import os
import random

app = FastAPI(title="Weather Service")

@app.get("/weather", response_model=dict)
async def get_weather(
    city: str = Query(..., description="City to get weather for")
):
    # Mock data to avoid requiring a real API key for testing
    temps = [28, 30, 32, 25, 22]
    conditions = ["Sunny", "Cloudy", "Rainy", "Clear"]
    
    return {
        "temperature": f"{random.choice(temps)}°C",
        "condition": random.choice(conditions),
        "city": city
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "weather"}

from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Hotel Service")

class Hotel(BaseModel):
    name: str
    price_per_night: int
    rating: float

@app.get("/hotels", response_model=dict)
async def get_hotels(
    city: str = Query(..., description="City to search hotels in")
):
    # Mock data
    hotels = [
        {"name": "Beach Resort", "price_per_night": 3500, "rating": 4.5},
        {"name": "Sea View Hotel", "price_per_night": 2800, "rating": 4.0},
        {"name": "Luxury Inn", "price_per_night": 5500, "rating": 4.8}
    ]
    return {"hotels": hotels}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "hotels"}

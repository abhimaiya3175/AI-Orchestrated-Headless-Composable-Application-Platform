from fastapi import FastAPI, Query
from pydantic import BaseModel
from typing import List

app = FastAPI(title="Flight Service")

class Flight(BaseModel):
    airline: str
    price: int
    duration_hrs: float

@app.get("/flights", response_model=dict)
async def get_flights(
    source: str = Query(..., description="Source city code (e.g., hyd)"),
    destination: str = Query(..., description="Destination city code (e.g., goa)")
):
    # Mock data for demonstration
    flights = [
        {"airline": "IndiGo", "price": 4500, "duration_hrs": 1.5},
        {"airline": "Air India", "price": 4800, "duration_hrs": 1.7},
        {"airline": "SpiceJet", "price": 4100, "duration_hrs": 1.6}
    ]
    return {"flights": flights}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "flights"}

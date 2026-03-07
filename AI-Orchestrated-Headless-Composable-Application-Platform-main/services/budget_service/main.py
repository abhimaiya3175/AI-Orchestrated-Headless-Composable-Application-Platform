from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="Budget Service")

class BudgetRequest(BaseModel):
    flights_cost: int = 0
    hotels_cost_per_night: int = 0
    num_days: int = 1
    daily_activities_cost: int = 1500

@app.post("/budget", response_model=dict)
async def estimate_budget(request: BudgetRequest):
    hotel_total = request.hotels_cost_per_night * request.num_days
    activities_total = request.daily_activities_cost * request.num_days
    grand_total = request.flights_cost + hotel_total + activities_total
    
    return {
        "estimated_budget": grand_total,
        "breakdown": {
            "flights": request.flights_cost,
            "hotels": hotel_total,
            "activities": activities_total
        }
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "budget"}

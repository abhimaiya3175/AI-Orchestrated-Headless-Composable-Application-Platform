from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

# Add parent directory to path to import orchestrator
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from orchestrator.planner import TravelOrchestrator

app = FastAPI(title="AI Travel Planner Gateway")

# Allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

orchestrator = TravelOrchestrator()

# Store last workflow trace in memory (for demo purposes)
last_trace = {}

class PlanRequest(BaseModel):
    query: str
    source: str = "hyd"
    num_days: int = 2
    budget: int = 15000

@app.post("/plan")
async def plan_trip(request: PlanRequest):
    try:
        response = await orchestrator.orchestrate(request.model_dump())
        global last_trace
        if "trip_plan" in response and "workflow_explanation" in response["trip_plan"]:
            last_trace = response["trip_plan"]["workflow_explanation"]
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/workflow-trace")
async def get_workflow_trace():
    return last_trace

@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "gateway": "active"
    }

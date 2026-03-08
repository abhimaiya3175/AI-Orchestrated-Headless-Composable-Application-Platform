from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

# Add parent directory to path to import orchestrator
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from orchestrator.planner import TravelOrchestrator

# Global orchestrator instance
orchestrator: TravelOrchestrator = None

# Store last workflow trace in memory (for demo purposes)
last_trace: dict = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage orchestrator lifecycle — init on startup, cleanup on shutdown."""
    global orchestrator
    orchestrator = TravelOrchestrator()
    yield
    await orchestrator.close()


app = FastAPI(
    title="AI Travel Planner Gateway",
    description="Gateway that routes requests to the AI Travel Orchestrator",
    version="1.1",
    lifespan=lifespan
)

# Allow frontend to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PlanRequest(BaseModel):
    query: str
    source: str = "hyd"
    num_days: int = 2
    budget: int = 15000


@app.post("/plan")
async def plan_trip(request: PlanRequest):
    global last_trace
    try:
        response = await orchestrator.orchestrate(request.model_dump())

        # Cache workflow trace for /workflow-trace endpoint
        if "trip_plan" in response and "workflow_explanation" in response["trip_plan"]:
            last_trace = response["trip_plan"]["workflow_explanation"]

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/workflow-trace")
async def get_workflow_trace():
    """Returns the workflow trace from the last /plan call."""
    if not last_trace:
        return {"message": "No workflow trace available yet. Call /plan first."}
    return last_trace


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "gateway": "active",
        "services": {
            "flights": os.getenv("FLIGHTS_SERVICE_URL", "http://localhost:8001"),
            "hotels": os.getenv("HOTELS_SERVICE_URL", "http://localhost:8002"),
            "weather": os.getenv("WEATHER_SERVICE_URL", "http://localhost:8003"),
            "places": os.getenv("PLACES_SERVICE_URL", "http://localhost:8004"),
            "budget": os.getenv("BUDGET_SERVICE_URL", "http://localhost:8005"),
        }
    }
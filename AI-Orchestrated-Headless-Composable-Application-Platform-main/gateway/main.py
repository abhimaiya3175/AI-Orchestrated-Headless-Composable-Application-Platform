import os
import json
import hashlib
import logging
import asyncio
from typing import Optional

from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import redis.asyncio as redis
from jose import jwt, JWTError
import httpx

# Import the orchestrator (adjust path if needed based on your setup)
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from orchestrator.planner import TravelOrchestrator

logger = logging.getLogger("gateway")
logging.basicConfig(level=logging.INFO)

# --- Configuration ---
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "ai-travel-planner-secret-change-in-prod")
ALGORITHM = "HS256"
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
USER_SERVICE_URL = os.getenv("USER_SERVICE_URL", "http://localhost:8006")

# --- Infrastructure Setup ---
limiter = Limiter(key_func=get_remote_address)
redis_client = redis.from_url(REDIS_URL, decode_responses=True)
orchestrator = TravelOrchestrator()

app = FastAPI(title="AI Travel Planner API Gateway")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production (e.g., ["http://localhost:3000"])
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Middleware: Optional JWT Auth ---
@app.middleware("http")
async def optional_jwt_middleware(request: Request, call_next):
    # Skip auth for docs, websockets, and health checks
    if request.url.path in ["/docs", "/openapi.json", "/status", "/ws/plan"]:
        return await call_next(request)

    token = request.headers.get("Authorization")
    request.state.user = None

    if token and token.startswith("Bearer "):
        token = token.split(" ")[1]
        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
            request.state.user = {
                "id": payload.get("sub"),
                "email": payload.get("email")
            }
        except JWTError:
            logger.warning("Invalid JWT token provided.")
            # We don't block the request here because auth is optional
            # The orchestrator will just use default budget/city settings
            
    response = await call_next(request)
    return response

# --- Caching Helper ---
def generate_cache_key(data: dict) -> str:
    """Creates a deterministic hash of the request payload for Redis keys."""
    serialized = json.dumps(data, sort_keys=True)
    return "plan_cache:" + hashlib.md5(serialized.encode()).hexdigest()

# --- Endpoints ---

@app.get("/status")
@limiter.limit("20/minute")
async def health_dashboard(request: Request):
    """Pings all microservices to report system health."""
    services = {
        "flights": os.getenv("FLIGHTS_SERVICE_URL", "http://localhost:8001"),
        "hotels": os.getenv("HOTELS_SERVICE_URL", "http://localhost:8002"),
        "weather": os.getenv("WEATHER_SERVICE_URL", "http://localhost:8003"),
        "places": os.getenv("PLACES_SERVICE_URL", "http://localhost:8004"),
        "budget": os.getenv("BUDGET_SERVICE_URL", "http://localhost:8005"),
        "users": USER_SERVICE_URL
    }
    
    statuses = {}
    async with httpx.AsyncClient(timeout=3.0) as client:
        for name, url in services.items():
            try:
                resp = await client.get(f"{url}/health")
                statuses[name] = "online" if resp.status_code == 200 else "degraded"
            except Exception:
                statuses[name] = "offline"
                
    return {"gateway": "online", "services": statuses}

@app.post("/plans/generate")
@limiter.limit("10/minute")
async def generate_plan(request: Request):
    """Standard REST endpoint for generating a trip plan (with Redis caching)."""
    payload = await request.json()
    
    # 1. Check Cache
    cache_key = generate_cache_key(payload)
    cached_plan = await redis_client.get(cache_key)
    if cached_plan:
        logger.info(f"Cache hit for query: {payload.get('query')}")
        return json.loads(cached_plan)
        
    # 2. Inject user defaults if authenticated
    user = request.state.user
    if user and not payload.get("budget"):
        # You could dynamically fetch the user's preferred_budget from USER_SERVICE here
        pass

    # 3. Call Orchestrator
    plan = await orchestrator.orchestrate(payload)
    
    # 4. Save to Cache (TTL = 30 minutes)
    await redis_client.setex(cache_key, 1800, json.dumps(plan))
    
    return plan

@app.get("/plans/share/{plan_id}")
async def share_plan(plan_id: str):
    """Fetches a saved plan from the user_service without requiring auth."""
    async with httpx.AsyncClient() as client:
        try:
            # We bypass standard auth headers here specifically for sharing
            response = await client.get(f"{USER_SERVICE_URL}/plans/{plan_id}")
            response.raise_for_status()
            return response.json()
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 404:
                raise HTTPException(status_code=404, detail="Shared plan not found")
            raise HTTPException(status_code=500, detail="Error fetching plan")

# --- WebSockets ---

@app.websocket("/ws/plan")
async def websocket_plan_endpoint(websocket: WebSocket):
    """
    Real-time streaming endpoint. Streams updates as the orchestrator 
    processes the intent, contacts services, and generates the itinerary.
    """
    await websocket.accept()
    try:
        data = await websocket.receive_json()
        query = data.get("query", "")
        session_id = data.get("session_id", "")
        
        await websocket.send_json({"event": "status", "message": "Analyzing intent..."})
        
        # 1. Detect Intent
        intent = await orchestrator.detect_intent_and_services(query, session_id)
        await websocket.send_json({
            "event": "intent_detected",
            "data": intent
        })
        
        # 2. Execute Services (Simulating streaming progression for the UI)
        services_to_call = intent.get("services", [])
        await websocket.send_json({"event": "status", "message": f"Contacting services: {', '.join(services_to_call)}"})
        
        # Note: True parallel streaming requires modifying orchestrator._orchestrate_single 
        # to yield async generators. For now, we await the heavy lifting and send the final block,
        # but the UI gets the early intent detection immediately to start rendering skeletons.
        
        plan = await orchestrator.orchestrate(data)
        
        await websocket.send_json({
            "event": "plan_complete",
            "data": plan
        })
        
    except WebSocketDisconnect:
        logger.info("Client disconnected from WebSocket")
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
        await websocket.send_json({"event": "error", "message": "An error occurred during planning."})
        
# --- Lifecycle ---
@app.on_event("shutdown")
async def shutdown_event():
    await orchestrator.close()
    await redis_client.aclose()
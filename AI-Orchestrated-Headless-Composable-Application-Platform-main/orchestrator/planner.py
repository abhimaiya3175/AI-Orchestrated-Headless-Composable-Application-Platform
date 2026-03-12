import os
import asyncio
import httpx
import json
import logging
import time

from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

logger = logging.getLogger("travel_orchestrator")
logging.basicConfig(level=logging.INFO)

# ------------------------------
# Service URLs
# ------------------------------

FLIGHTS_URL = os.getenv("FLIGHTS_SERVICE_URL", "http://localhost:8001")
HOTELS_URL = os.getenv("HOTELS_SERVICE_URL", "http://localhost:8002")
WEATHER_URL = os.getenv("WEATHER_SERVICE_URL", "http://localhost:8003")
PLACES_URL = os.getenv("PLACES_SERVICE_URL", "http://localhost:8004")
BUDGET_URL = os.getenv("BUDGET_SERVICE_URL", "http://localhost:8005")


class TravelOrchestrator:

    def __init__(self):

        provider = os.getenv("LLM_PROVIDER", "local").lower()

        if provider == "local":
            model = os.getenv("LLM_MODEL", "llama2")
            base_url = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

            self.llm = ChatOllama(
                model=model,
                base_url=base_url,
                format="json"
            )
        else:
            self.llm = ChatOpenAI(
                model_name="gpt-3.5-turbo",
                response_format={"type": "json_object"}
            )

        # Shared HTTP client (connection pooling)
        self.client = httpx.AsyncClient(timeout=10)

    async def close(self):
        await self.client.aclose()

    # --------------------------------------------------
    # Robust HTTP GET
    # --------------------------------------------------

    async def _fetch_data(self, url: str, params: dict = None):

        start = time.time()

        try:
            response = await self.client.get(url, params=params)
            response.raise_for_status()
            latency = round((time.time() - start) * 1000, 2)

            return {
                "data": response.json(),
                "latency_ms": latency,
                "error": None
            }

        except Exception as e:
            logger.error(f"Service call failed: {url} | {str(e)}")
            return {
                "data": {},
                "latency_ms": None,
                "error": str(e)
            }

    # --------------------------------------------------
    # Robust HTTP POST
    # --------------------------------------------------

    async def _post_data(self, url: str, payload: dict):

        start = time.time()

        try:
            response = await self.client.post(url, json=payload)
            response.raise_for_status()
            latency = round((time.time() - start) * 1000, 2)

            return {
                "data": response.json(),
                "latency_ms": latency,
                "error": None
            }

        except Exception as e:
            logger.error(f"POST failed: {url} | {str(e)}")
            return {
                "data": {},
                "latency_ms": None,
                "error": str(e)
            }

    # --------------------------------------------------
    # Intent Detection
    # --------------------------------------------------

    async def detect_intent_and_services(self, query: str):

        prompt = PromptTemplate.from_template(
            """
You are an AI Travel Planning Orchestrator.

Parse the user's request and extract:
- destination
- source
- num_days
- budget
- preferences

Return ONLY valid JSON. No explanation. No markdown. No text outside JSON.

{{
  "destination": "...",
  "source": "...",
  "num_days": 2,
  "budget": 15000,
  "preferences": "general",
  "services": ["flights","hotels","weather","places"]
}}

User query: {query}
"""
        )

        chain = prompt | self.llm | StrOutputParser()

        result = await chain.ainvoke({"query": query})

        try:
            parsed = json.loads(result)
            # Validate required keys exist
            parsed.setdefault("destination", "Goa")
            parsed.setdefault("source", "hyd")
            parsed.setdefault("num_days", 2)
            parsed.setdefault("budget", 15000)
            parsed.setdefault("preferences", "general")
            parsed.setdefault("services", ["flights", "hotels", "weather", "places"])
            return parsed

        except Exception:
            logger.warning("LLM JSON parse failed, using defaults")
            return {
                "destination": "Goa",
                "source": "hyd",
                "num_days": 2,
                "budget": 15000,
                "preferences": "general",
                "services": ["flights", "hotels", "weather", "places"]
            }

    # --------------------------------------------------
    # Budget-aware optimization
    # --------------------------------------------------

    def optimize_for_budget(self, flights: list, hotels: list, days: int, user_budget: int):

        if not flights or not hotels:
            return (flights[0] if flights else None), (hotels[0] if hotels else None)

        for flight in flights:
            for hotel in hotels:
                estimated_total = (
                    flight.get("price", 0) +
                    (hotel.get("price_per_night", 0) * days) +
                    (1500 * days)
                )
                if estimated_total <= user_budget:
                    return flight, hotel

        # fallback: cheapest combo regardless of budget
        return flights[0], hotels[0]

    # --------------------------------------------------
    # Main orchestration
    # --------------------------------------------------

    async def orchestrate(self, request_data: dict):

        query = request_data.get("query", "")
        fallback_source = request_data.get("source", "hyd")
        fallback_days = request_data.get("num_days", 2)
        fallback_budget = request_data.get("budget", 15000)

        # ------------------------
        # Intent Detection
        # ------------------------

        intent = await self.detect_intent_and_services(query)

        dest = intent.get("destination", "Goa")
        src = intent.get("source") or fallback_source
        if not src or src.lower() == "unknown":
            src = fallback_source

        days = int(intent.get("num_days") or fallback_days)
        budget = int(intent.get("budget") or fallback_budget)
        preferences = intent.get("preferences", "general")

        workflow_trace = [
            {"step": "Intent Detection", "status": "completed", "latency_ms": None}
        ]

        # ------------------------
        # Parallel service calls
        # ------------------------

        tasks = [
            self._fetch_data(f"{FLIGHTS_URL}/flights", {"source": src, "destination": dest}),
            self._fetch_data(f"{HOTELS_URL}/hotels", {"city": dest}),
            self._fetch_data(f"{WEATHER_URL}/weather", {"city": dest}),
            self._fetch_data(f"{PLACES_URL}/places", {"city": dest}),
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        safe_results = []
        for r in results:
            if isinstance(r, Exception):
                logger.error(f"Service exception: {str(r)}")
                safe_results.append({"data": {}, "latency_ms": None, "error": str(r)})
            else:
                safe_results.append(r)

        flights_res, hotels_res, weather_res, places_res = safe_results

        # --- Extract data safely from each response ---

        # Flights: { "flights": [...], "metadata": {...} }
        flights_data = flights_res.get("data", {})
        flights = flights_data.get("flights", [])

        # Hotels: { "hotels": [...], "metadata": {...} }
        hotels_data = hotels_res.get("data", {})
        hotels = hotels_data.get("hotels", [])

        # Weather: { "temperature": "...", "condition": "...", "city": "...", ... }
        weather = weather_res.get("data", {})

        # Places: { "places": [...], "metadata": {...} }
        places_data = places_res.get("data", {})
        # places returns list of name strings (see places_service)
        places_raw = places_data.get("places", [])
        # Normalize: could be list of strings or list of dicts
        attractions = []
        for p in places_raw:
            if isinstance(p, str):
                attractions.append(p)
            elif isinstance(p, dict):
                attractions.append(p.get("name", ""))

        # Sort flights and hotels by price
        flights.sort(key=lambda x: x.get("price", 0))
        hotels.sort(key=lambda x: x.get("price_per_night", 0))

        # Build workflow trace entries
        workflow_trace.append({
            "step": "Flights Service",
            "status": "completed" if flights else "failed",
            "latency_ms": flights_res.get("latency_ms"),
            "error": flights_res.get("error")
        })
        workflow_trace.append({
            "step": "Hotels Service",
            "status": "completed" if hotels else "failed",
            "latency_ms": hotels_res.get("latency_ms"),
            "error": hotels_res.get("error")
        })
        workflow_trace.append({
            "step": "Weather Service",
            "status": "completed" if weather else "failed",
            "latency_ms": weather_res.get("latency_ms"),
            "error": weather_res.get("error")
        })
        workflow_trace.append({
            "step": "Places Service",
            "status": "completed" if attractions else "failed",
            "latency_ms": places_res.get("latency_ms"),
            "error": places_res.get("error")
        })

        # ------------------------
        # Budget-aware optimization
        # ------------------------

        best_flight, best_hotel = self.optimize_for_budget(flights, hotels, days, budget)

        flight_cost = best_flight.get("price", 0) if best_flight else 0
        hotel_cost_per_night = best_hotel.get("price_per_night", 0) if best_hotel else 0

        # ------------------------
        # Budget service call
        # ------------------------

        budget_res = await self._post_data(
            f"{BUDGET_URL}/budget",
            {
                "flights_cost": flight_cost,
                "hotels_cost_per_night": hotel_cost_per_night,
                "num_days": days,
                "daily_activities_cost": 1500,
                "max_budget": budget
            }
        )

        workflow_trace.append({
            "step": "Budget Service",
            "status": "completed" if budget_res.get("data") else "failed",
            "latency_ms": budget_res.get("latency_ms"),
            "error": budget_res.get("error")
        })

        budget_data = budget_res.get("data", {})

        # Budget response shape: { estimated_budget, breakdown, metrics, evaluation, metadata }
        estimated_budget = budget_data.get("estimated_budget", 0)
        budget_breakdown = budget_data.get("breakdown", {})
        budget_metrics = budget_data.get("metrics", {})
        budget_evaluation = budget_data.get("evaluation", None)

        # ------------------------
        # Build weather payload for frontend
        # ------------------------

        weather_payload = {
            "temperature": weather.get("temperature", ""),
            "condition": weather.get("condition", ""),
            "city": weather.get("city", dest),
            "humidity": weather.get("humidity"),
            "wind_kph": weather.get("wind_kph"),
            "forecast": weather.get("forecast", [])
        }

        # ------------------------
        # Final response
        # ------------------------

        return {
            "status": "success",
            "trip_plan": {
                "destination": dest,
                "source": src,
                "duration": f"{days} days",
                "preferences": preferences,

                # Return top 3 flights with all fields intact
                "flights": flights[:3],

                # Return top 3 hotels with all fields intact
                "hotels": hotels[:3],

                # Full weather object
                "weather": weather_payload,

                # Attractions as list of strings
                "attractions": attractions[:4],

                # Budget summary
                "estimated_budget": estimated_budget,
                "budget_breakdown": budget_breakdown,
                "budget_metrics": budget_metrics,
                "budget_evaluation": budget_evaluation,

                # Optimized picks
                "recommended": {
                    "flight": best_flight,
                    "hotel": best_hotel
                },

                "workflow_explanation": {
                    "reasoning": (
                        f"AI detected a {days}-day trip from {src} to {dest} "
                        f"with ₹{budget} budget. Flights and hotels were sorted by price "
                        f"and the best combination within budget was selected."
                    ),
                    "trace": workflow_trace
                }
            }
        }
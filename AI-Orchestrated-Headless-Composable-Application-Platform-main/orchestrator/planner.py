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
    # Intent Detection (Dynamic Service Selection)
    # --------------------------------------------------

    async def detect_intent_and_services(self, query: str):

        prompt = PromptTemplate.from_template(
            """
You are an AI Travel Planning Orchestrator. Your job is to understand the user's
travel-related request and decide WHICH microservices are needed.

Available services:
- "flights"  → use when the user wants to TRAVEL somewhere (needs transport)
- "hotels"   → use when the user needs ACCOMMODATION (staying overnight)
- "weather"  → use when the user wants to know the WEATHER or CLIMATE
- "places"   → use when the user wants ATTRACTIONS, SIGHTSEEING, or ACTIVITIES

Rules for selecting services:
1. If the user asks to "plan a trip" or "travel", include ALL relevant services.
2. If the user ONLY asks about weather, include ONLY "weather".
3. If the user ONLY asks about places/attractions, include ONLY "places".
4. If the user asks about flights only, include ONLY "flights".
5. If the user asks about hotels only, include ONLY "hotels".
6. If a budget is mentioned AND flights+hotels are selected, the budget service
   will be called automatically — do NOT include "budget" in the services list.

Parse the query and extract:
- destination (city name)
- source (origin city, default "hyd" if not mentioned)
- num_days (number of days, default 2)
- budget (budget amount, default 15000)
- preferences (general, beach, historic, nature, etc.)
- services (list of services to call based on the rules above)

Return ONLY valid JSON. No explanation. No markdown. No text outside JSON.

{{
  "destination": "...",
  "source": "...",
  "num_days": 2,
  "budget": 15000,
  "preferences": "general",
  "services": ["flights", "hotels", "weather", "places"]
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

            # Normalize services to lowercase list
            raw_services = parsed.get("services", [])
            if isinstance(raw_services, list):
                parsed["services"] = [s.lower().strip() for s in raw_services if isinstance(s, str)]
            else:
                parsed["services"] = ["flights", "hotels", "weather", "places"]

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
    # Main orchestration (DYNAMIC)
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
        selected_services = intent.get("services", ["flights", "hotels", "weather", "places"])

        logger.info(f"AI selected services: {selected_services} for query: '{query}'")

        workflow_trace = [
            {"step": "Intent Detection", "status": "completed", "latency_ms": None}
        ]

        # --------------------------------------------------
        # Dynamic Service Registry
        # --------------------------------------------------

        service_registry = {
            "flights": lambda: self._fetch_data(
                f"{FLIGHTS_URL}/flights", {"source": src, "destination": dest}
            ),
            "hotels": lambda: self._fetch_data(
                f"{HOTELS_URL}/hotels", {"city": dest}
            ),
            "weather": lambda: self._fetch_data(
                f"{WEATHER_URL}/weather", {"city": dest}
            ),
            "places": lambda: self._fetch_data(
                f"{PLACES_URL}/places", {"city": dest}
            ),
        }

        ALL_SERVICES = ["flights", "hotels", "weather", "places"]

        # Build tasks only for AI-selected services
        task_keys = []
        tasks = []
        for svc in ALL_SERVICES:
            if svc in selected_services:
                task_keys.append(svc)
                tasks.append(service_registry[svc]())

        # Execute only the selected services in parallel
        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)
        else:
            results = []

        # Map results back to service names
        service_results = {}
        for idx, key in enumerate(task_keys):
            r = results[idx]
            if isinstance(r, Exception):
                logger.error(f"Service exception ({key}): {str(r)}")
                service_results[key] = {"data": {}, "latency_ms": None, "error": str(r)}
            else:
                service_results[key] = r

        # Build workflow trace for ALL services (called or skipped)
        for svc in ALL_SERVICES:
            if svc in service_results:
                res = service_results[svc]
                has_data = bool(res.get("data"))
                workflow_trace.append({
                    "step": f"{svc.title()} Service",
                    "status": "completed" if has_data else "failed",
                    "latency_ms": res.get("latency_ms"),
                    "error": res.get("error")
                })
            else:
                workflow_trace.append({
                    "step": f"{svc.title()} Service",
                    "status": "skipped",
                    "latency_ms": None,
                    "error": None
                })

        # --------------------------------------------------
        # Extract data safely from each response
        # --------------------------------------------------

        # Flights
        flights_res = service_results.get("flights", {"data": {}, "latency_ms": None, "error": None})
        flights_data = flights_res.get("data", {})
        flights = flights_data.get("flights", [])

        # Hotels
        hotels_res = service_results.get("hotels", {"data": {}, "latency_ms": None, "error": None})
        hotels_data = hotels_res.get("data", {})
        hotels = hotels_data.get("hotels", [])

        # Weather
        weather_res = service_results.get("weather", {"data": {}, "latency_ms": None, "error": None})
        weather = weather_res.get("data", {})

        # Places
        places_res = service_results.get("places", {"data": {}, "latency_ms": None, "error": None})
        places_data = places_res.get("data", {})
        places_raw = places_data.get("places", [])
        attractions = []
        for p in places_raw:
            if isinstance(p, str):
                attractions.append(p)
            elif isinstance(p, dict):
                attractions.append(p.get("name", ""))

        # Sort flights and hotels by price
        flights.sort(key=lambda x: x.get("price", 0))
        hotels.sort(key=lambda x: x.get("price_per_night", 0))

        # --------------------------------------------------
        # Budget-aware optimization (conditional)
        # --------------------------------------------------

        best_flight = None
        best_hotel = None
        estimated_budget = 0
        budget_breakdown = {}
        budget_metrics = {}
        budget_evaluation = None

        # Only compute budget if BOTH flights and hotels were fetched
        if "flights" in selected_services and "hotels" in selected_services:
            best_flight, best_hotel = self.optimize_for_budget(flights, hotels, days, budget)

            flight_cost = best_flight.get("price", 0) if best_flight else 0
            hotel_cost_per_night = best_hotel.get("price_per_night", 0) if best_hotel else 0

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
            estimated_budget = budget_data.get("estimated_budget", 0)
            budget_breakdown = budget_data.get("breakdown", {})
            budget_metrics = budget_data.get("metrics", {})
            budget_evaluation = budget_data.get("evaluation", None)
        else:
            workflow_trace.append({
                "step": "Budget Service",
                "status": "skipped",
                "latency_ms": None,
                "error": None
            })

        # --------------------------------------------------
        # Build weather payload for frontend
        # --------------------------------------------------

        weather_payload = {
            "temperature": weather.get("temperature", ""),
            "condition": weather.get("condition", ""),
            "city": weather.get("city", dest),
            "humidity": weather.get("humidity"),
            "wind_kph": weather.get("wind_kph"),
            "forecast": weather.get("forecast", [])
        }

        # --------------------------------------------------
        # Build dynamic reasoning string
        # --------------------------------------------------

        called_names = [s.title() for s in selected_services]
        skipped_names = [s.title() for s in ALL_SERVICES if s not in selected_services]

        reasoning = (
            f"AI detected intent for destination '{dest}' from '{src}'. "
            f"Services dynamically selected: {', '.join(called_names)}. "
        )
        if skipped_names:
            reasoning += f"Services skipped (not needed): {', '.join(skipped_names)}. "
        if "flights" in selected_services and "hotels" in selected_services:
            reasoning += (
                f"Budget optimization applied for {days}-day trip with ₹{budget} budget."
            )

        # --------------------------------------------------
        # Final response
        # --------------------------------------------------

        return {
            "status": "success",
            "trip_plan": {
                "destination": dest,
                "source": src,
                "duration": f"{days} days",
                "preferences": preferences,
                "services_called": selected_services,

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
                    "reasoning": reasoning,
                    "trace": workflow_trace
                }
            }
        }
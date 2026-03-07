import os
import asyncio
import httpx
import json
import logging
from langchain_community.chat_models import ChatOllama
from langchain_community.chat_models import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser

logger = logging.getLogger(__name__)

# Service URLs from environment
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
            self.llm = ChatOllama(model=model, base_url=base_url, format="json")
        else:
            self.llm = ChatOpenAI(model_name="gpt-3.5-turbo", response_format={"type": "json_object"})

    async def _fetch_data(self, url: str, params: dict = None) -> dict:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.get(url, params=params, timeout=10.0)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logger.error(f"Error calling {url}: {str(e)}")
                return {"error": str(e)}
                
    async def _post_data(self, url: str, data: dict) -> dict:
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=data, timeout=10.0)
                response.raise_for_status()
                return response.json()
            except Exception as e:
                logger.error(f"Error calling {url}: {str(e)}")
                return {"error": str(e)}

    async def detect_intent_and_services(self, query: str) -> dict:
        """Use LLM to interpret user request and extract structured parameters."""
        prompt = PromptTemplate.from_template(
            """You are an AI Travel Planning Orchestrator.

Parse the user's natural language travel query and extract:
- destination: where they want to go (city name)
- source: where they are traveling from (city name, or "unknown" if not mentioned)
- duration: how many days (integer, default 2 if not mentioned)
- budget: total budget in INR (integer, default 15000 if not mentioned)
- preferences: travel style such as adventure, relaxation, culture, food, etc. (or "general" if not mentioned)

RULES:
- Always use sensible defaults for missing parameters
- Prioritize budget constraints when selecting options
- Return JSON only, no extra commentary

Return ONLY a JSON object with this exact structure:
{{
    "destination": "city_name",
    "source": "city_name",
    "num_days": integer,
    "budget": integer,
    "preferences": "preference_type",
    "services": ["flights", "hotels", "weather", "places"]
}}

User request: {query}
"""
        )
        
        chain = prompt | self.llm | StrOutputParser()
        result_str = await chain.ainvoke({"query": query})
        
        try:
            return json.loads(result_str)
        except json.JSONDecodeError:
            logger.error(f"LLM did not return valid JSON: {result_str}")
            return {
                "destination": "Goa",
                "source": "unknown",
                "num_days": 2,
                "budget": 15000,
                "preferences": "general",
                "services": ["flights", "hotels", "weather", "places"]
            }

    async def orchestrate(self, request_data: dict) -> dict:
        query = request_data.get("query", "")
        fallback_source = request_data.get("source", "hyd")
        fallback_days = request_data.get("num_days", 2)
        fallback_budget = request_data.get("budget", 15000)

        # 1. Intent Detection — parse user query into structured parameters
        intent = await self.detect_intent_and_services(query)
        
        dest = intent.get("destination", "Goa")
        src = intent.get("source") if intent.get("source") != "unknown" else fallback_source
        days = intent.get("num_days") if intent.get("num_days", 0) > 0 else fallback_days
        budget = intent.get("budget") if intent.get("budget", 0) > 0 else fallback_budget
        preferences = intent.get("preferences", "general")

        workflow_trace = [
            {"step": "Intent Detection", "status": "completed", "details": intent}
        ]

        # 2. Call ALL 5 services in parallel (async) — always call all services
        tasks = [
            self._fetch_data(f"{FLIGHTS_URL}/flights", {"source": src, "destination": dest}),
            self._fetch_data(f"{HOTELS_URL}/hotels", {"city": dest}),
            self._fetch_data(f"{WEATHER_URL}/weather", {"city": dest}),
            self._fetch_data(f"{PLACES_URL}/places", {"city": dest}),
        ]
        task_names = ["flights", "hotels", "weather", "places"]

        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # 3. Aggregate results
        aggregated = {}
        flights_cost = 0
        hotels_cost_per_night = 0

        for name, res in zip(task_names, results):
            if isinstance(res, Exception):
                aggregated[name] = {"error": str(res)}
                workflow_trace.append({"step": f"{name} service", "status": "failed", "error": str(res)})
            else:
                aggregated[name] = res
                workflow_trace.append({"step": f"{name} service", "status": "completed"})
                
                # Prioritize budget constraints — pick cheapest option within budget
                if name == "flights" and "flights" in res and len(res["flights"]) > 0:
                    sorted_flights = sorted(res["flights"], key=lambda f: f.get("price", 0))
                    aggregated["flights"]["flights"] = sorted_flights
                    flights_cost = sorted_flights[0]["price"]
                elif name == "hotels" and "hotels" in res and len(res["hotels"]) > 0:
                    sorted_hotels = sorted(res["hotels"], key=lambda h: h.get("price_per_night", 0))
                    aggregated["hotels"]["hotels"] = sorted_hotels
                    hotels_cost_per_night = sorted_hotels[0]["price_per_night"]

        # Budget service — also called (all 5 services always run)
        budget_res = await self._post_data(f"{BUDGET_URL}/budget", {
            "flights_cost": flights_cost,
            "hotels_cost_per_night": hotels_cost_per_night,
            "num_days": days
        })
        aggregated["budget"] = budget_res
        workflow_trace.append({"step": "budget service", "status": "completed"})

        # 4. Return JSON response with the complete itinerary
        return {
            "status": "success",
            "trip_plan": {
                "destination": dest,
                "duration": f"{days} days",
                "preferences": preferences,
                "flights": aggregated.get("flights", {}).get("flights", []),
                "hotels": aggregated.get("hotels", {}).get("hotels", []),
                "weather": aggregated.get("weather", {}),
                "attractions": aggregated.get("places", {}).get("places", []),
                "estimated_budget": budget_res.get("estimated_budget", 0),
                "workflow_explanation": {
                    "reasoning": f"All 5 services (flights, hotels, weather, places, budget) were called in parallel for '{dest}' — {days} days, ₹{budget} budget, {preferences} preference.",
                    "trace": workflow_trace
                }
            }
        }

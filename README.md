# AI-Orchestrated Smart Travel Planner

## Implementation Plan

---

# 1. Project Overview

The **AI-Orchestrated Smart Travel Planner** demonstrates a system where an AI engine dynamically composes workflows across multiple microservices to generate a complete travel plan.

Instead of manually searching across multiple apps (flights, hotels, weather, attractions), the user simply asks:

> *"Plan a 2-day trip to Goa under ₹15000 with beach activities."*

The system then:

1. Understands user intent using an LLM.
2. Determines required services.
3. Calls the relevant microservices.
4. Aggregates results.
5. Returns a unified travel plan.

This demonstrates **dynamic AI service orchestration**.

---

# 2. System Architecture

```
Frontend (Chat UI)
        │
        ▼
FastAPI Gateway
        │
        ▼
AI Orchestrator (LLM + LangChain)
        │
 ┌──────┼───────┬────────┬────────┐
 ▼      ▼       ▼        ▼
Flights Hotels Weather Places
Service Service Service Service
        │
        ▼
Budget Calculator
        │
        ▼
Final Travel Plan Response
```

---

# 3. Technology Stack

## Frontend

Simple chat interface for user queries.

Technologies:

* HTML
* Tailwind CSS
* JavaScript

Optional upgrade:

* Next.js
* React

---

## Backend API Gateway

Handles incoming requests and forwards them to the AI orchestrator.

Technology:

* **FastAPI**

Responsibilities:

* Accept user requests
* Forward request to orchestrator
* Return final response

---

## AI Orchestration Layer

Responsible for interpreting the user request and composing the workflow.

Technologies:

* **LangChain**
* **OpenAI API / Llama / Local LLM**
* Python

Responsibilities:

* Intent detection
* Service selection
* Workflow composition
* Aggregating results

---

## Microservices

Each capability runs as an independent API.

Each service will be implemented using **FastAPI**.

Minimal services:

| Service         | Endpoint   | Purpose                    |
| --------------- | ---------- | -------------------------- |
| Flight Service  | `/flights` | Return flight options      |
| Hotel Service   | `/hotels`  | Return hotel options       |
| Weather Service | `/weather` | Get weather information    |
| Places Service  | `/places`  | Return tourist attractions |
| Budget Service  | `/budget`  | Estimate trip budget       |

---

# 4. Microservice APIs

## Flight Service

Example endpoint:

```
GET /flights?source=hyd&destination=goa
```

Response:

```json
{
  "flights": [
    {"airline": "IndiGo", "price": 4500},
    {"airline": "Air India", "price": 4800}
  ]
}
```

---

## Hotel Service

```
GET /hotels?city=goa
```

Example response:

```json
{
  "hotels": [
    {"name": "Beach Resort", "price_per_night": 3500},
    {"name": "Sea View Hotel", "price_per_night": 2800}
  ]
}
```

---

## Weather Service

Uses real API:

* **OpenWeather API**

Endpoint:

```
GET /weather?city=goa
```

Example response:

```json
{
  "temperature": "30°C",
  "condition": "Sunny"
}
```

---

## Places Service

```
GET /places?city=goa
```

Example response:

```json
{
  "places": [
    "Baga Beach",
    "Calangute Beach",
    "Fort Aguada"
  ]
}
```

---

## Budget Service

Calculates estimated trip cost.

Example logic:

```
budget = flight_cost + hotel_cost + activities
```

---

# 5. AI Orchestration Logic

Workflow process:

```
User Query
     ↓
LLM extracts intent
     ↓
Determine required services
     ↓
Call services via APIs
     ↓
Aggregate results
     ↓
Generate travel plan
```

---

# 6. Example Workflow

User input:

```
Plan a 2-day trip to Goa
```

AI selects services:

```
Flight Service
Hotel Service
Weather Service
Places Service
Budget Service
```

Execution flow:

```
1. Fetch flights
2. Fetch hotels
3. Fetch weather
4. Fetch attractions
5. Calculate budget
6. Combine results
```

---

# 7. Example Output

```
Trip Plan: Goa (2 Days)

Flights
HYD → GOA ₹4500

Hotel
Beach Resort ₹3500/night

Weather
Sunny 30°C

Places to Visit
- Baga Beach
- Calangute Beach
- Fort Aguada

Estimated Budget
₹11,500
```

---

# 8. Project Folder Structure

```
ai-platform/

frontend/
   index.html
   script.js

gateway/
   main.py

orchestrator/
   planner.py

services/
   flight_service.py
   hotel_service.py
   weather_service.py
   places_service.py

data/
   flights.json
   hotels.json
```

---

# 9. 15-Day Execution Plan

| Day | Task                            |
| --- | ------------------------------- |
| 1   | Project design                  |
| 2–3 | Build microservices             |
| 4   | Implement FastAPI gateway       |
| 5–6 | Integrate LangChain             |
| 7–8 | Implement orchestration logic   |
| 9   | Connect services                |
| 10  | Build frontend chat UI          |
| 11  | Testing                         |
| 12  | Add logs + workflow explanation |
| 13  | Optimize orchestration          |
| 14  | Prepare demo                    |
| 15  | Documentation                   |

---

# 10. Explainable AI Workflow (Optional Feature)

To make the system more research-grade, show how the AI decided the workflow.

Example output:

```
AI Workflow Explanation

Detected Intent:
Travel Planning

Selected Services:
1. Flight Service
2. Hotel Service
3. Weather Service
4. Places Service

Reason:
These services are required to generate a complete travel plan.
```

---

# 11. Expected Outcomes

The prototype demonstrates:

* AI-driven workflow orchestration
* Headless architecture
* Composable microservices
* Intelligent service selection

This architecture closely resembles **modern AI agent systems** used in industry.

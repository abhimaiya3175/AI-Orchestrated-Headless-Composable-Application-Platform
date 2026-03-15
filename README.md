# AI-Orchestrated Smart Travel Planner

## Recent Updates (March 2026)
* **AI Architecture — RAG**: Integrated **ChromaDB** for Retrieval-Augmented Generation.
* **AI Architecture — Memory**: Added **Conversation Memory** for multi-turn sessions.
* **Microservices — User & Auth**: New **User Service** (Port 8006) for JWT auth and saved plans.
* **Frontend**: Modern Next.js 14 UI with real-time **WebSockets** and **Redis caching**.

---

# 1. Project Overview

The **AI-Orchestrated Smart Travel Planner** demonstrates a system where an AI engine dynamically composes workflows across multiple microservices to generate a complete travel plan.

Instead of manually searching across multiple apps (flights, hotels, weather, attractions), the user simply asks:

> *"Plan a 2-day trip to Goa under ₹15000 with beach activities."*

The system then:
1. Understands user intent using an LLM.
2. Determines required services.
3. Calls the relevant microservices concurrently.
4. Aggregates results and injects local knowledge (RAG).
5. Returns a unified travel plan with budget advice and an itinerary.

---

# 2. System Architecture

```
    Frontend (Chat UI)
            │
            ▼
    FastAPI Gateway <───> Redis Cache
            │
            ▼
    AI Orchestrator (LLM + LangChain) <───> ChromaDB (RAG)
            │
     ┌──────┴───────┬────────┬────────┬────────┬────────┐
     ▼              ▼        ▼        ▼        ▼        ▼
Flights Service  Hotels   Weather  Places   Budget   User & Auth
                Service  Service  Service  Service   Service
     │              │        │        │        │        │
     └──────────────┴────────┴────┬───┴────────┴────────┘
                                  ▼
                      Final Travel Plan Response
```

---

# 3. Microservices

| Service         | Endpoint   | Purpose                         | Port |
| --------------- | ---------- | ------------------------------- | ---- |
| API Gateway     | `/plans`   | Main entry point & WebSockets   | 8000 |
| Flight Service  | `/flights` | Return flight options           | 8001 |
| Hotel Service   | `/hotels`  | Return hotel options            | 8002 |
| Weather Service | `/weather` | Get weather information         | 8003 |
| Places Service  | `/places`  | Return tourist attractions      | 8004 |
| Budget Service  | `/budget`  | Estimate trip budget            | 8005 |
| User Service    | `/auth`    | JWT Auth & Saved Plans          | 8006 |

---

# 4. Project Folder Structure

```
ai-platform/
├── frontend/                # Next.js 14 + Tailwind CSS
├── gateway/                 # FastAPI Gateway + WebSockets
├── orchestrator/            # LangChain + RAG Engine
├── services/
│   ├── flight_service/      # Microservice 1
│   ├── hotel_service/       # Microservice 2
│   ├── weather_service/     # Microservice 3
│   ├── places_service/      # Microservice 4
│   ├── budget_service/      # Microservice 5
│   └── user_service/        # Microservice 6 (Auth/History)
├── data/
│   ├── knowledge/           # Markdown files for RAG
│   └── chroma_db/           # Persistent Vector DB
└── start_backend.py         # Launch script for all 7 services
```

---

# 5. Quick Start

### Step 1: Clone & Setup
```bash
git clone https://github.com/abhimaiya3175/AI-Orchestrated-Headless-Composable-Application-Platform.git
cd AI-Orchestrated-Headless-Composable-Application-Platform
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate on Windows
pip install -r AI-Orchestrated-Headless-Composable-Application-Platform-main/requirements.txt
```

### Step 2: Run All Services
```bash
cd AI-Orchestrated-Headless-Composable-Application-Platform-main
python start_backend.py
```

### Step 3: Start Frontend
```bash
cd ../frontend
npm install
npm run dev
```

---

# 6. Documentation

For detailed implementation details, API specifications, and troubleshooting, please refer to the [Main README](AI-Orchestrated-Headless-Composable-Application-Platform-main/README.md).

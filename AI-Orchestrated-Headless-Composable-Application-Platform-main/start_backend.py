import subprocess
import sys
import time

services = [
    ("Flights_Service", "8001", "services/flight_service"),
    ("Hotels_Service", "8002", "services/hotel_service"),
    ("Weather_Service", "8003", "services/weather_service"),
    ("Places_Service", "8004", "services/places_service"),
    ("Budget_Service", "8005", "services/budget_service"),
    ("Gateway", "8000", "gateway")
]

processes = []
print("🚀 Starting all AI Travel Planner backend services...")

try:
    for name, port, path in services:
        print(f"⏳ Starting {name} on port {port}...")
        p = subprocess.Popen([sys.executable, "-m", "uvicorn", "main:app", "--port", port], cwd=path)
        processes.append(p)
        time.sleep(0.5) # Slight delay to avoid console text overlapping

    print("\n✅ All backend services are running!")
    print("🌍 API Gateway is available at: http://localhost:8000")
    print("\nPress Ctrl+C to stop all services.")
    
    for p in processes:
        p.wait()

except KeyboardInterrupt:
    print("\n🛑 Stopping all services...")
    for p in processes:
        p.terminate()
    print("Goodbye!")

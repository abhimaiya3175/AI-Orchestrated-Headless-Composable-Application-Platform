import subprocess
import sys
import time

services = [
    ("Flights Service", "uvicorn services.flight_service.main:app --port 8001 --reload"),
    ("Hotels Service", "uvicorn services.hotel_service.main:app --port 8002 --reload"),
    ("Weather Service", "uvicorn services.weather_service.main:app --port 8003 --reload"),
    ("Places Service", "uvicorn services.places_service.main:app --port 8004 --reload"),
    ("Budget Service", "uvicorn services.budget_service.main:app --port 8005 --reload"),
    ("Gateway", "uvicorn gateway.main:app --port 8000 --reload"),
]

processes = []

print("\n🚀 Starting AI Travel Planner Backend\n")

for name, command in services:
    print(f"Starting {name}...")
    process = subprocess.Popen(command, shell=True)
    processes.append(process)
    time.sleep(1)

print("\n✅ All services started!")
print("Press CTRL+C to stop everything.\n")

try:
    while True:
        time.sleep(1)
except KeyboardInterrupt:
    print("\n🛑 Shutting down services...\n")
    for p in processes:
        p.terminate()
    sys.exit()
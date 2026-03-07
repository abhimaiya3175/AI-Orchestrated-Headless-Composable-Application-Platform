from fastapi import FastAPI, Query

app = FastAPI(title="Places Service")

@app.get("/places", response_model=dict)
async def get_places(
    city: str = Query(..., description="City to discover places in")
):
    # Mock data
    places_db = {
        "goa": ["Baga Beach", "Calangute Beach", "Fort Aguada", "Dudhsagar Falls", "Basilica of Bom Jesus"],
        "paris": ["Eiffel Tower", "Louvre Museum", "Notre-Dame", "Arc de Triomphe"],
        "hyd": ["Charminar", "Golconda Fort", "Ramoji Film City", "Hussain Sagar"]
    }
    
    city_lower = city.lower()
    places = places_db.get(city_lower, [f"Central Park {city}", f"Main Museum {city}", f"Downtown {city}"])
    
    # Return 3 to 4 random or top places
    return {"places": places[:4]}

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "places"}

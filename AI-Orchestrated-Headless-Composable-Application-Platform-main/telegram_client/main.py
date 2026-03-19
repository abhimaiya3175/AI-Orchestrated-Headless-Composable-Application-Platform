import os
import logging
import asyncio
import httpx
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import CommandStart
from aiogram.client.default import DefaultBotProperties
from aiogram.enums import ParseMode
from dotenv import load_dotenv

# Load root .env from the parent directory
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost:8000")

if not TELEGRAM_BOT_TOKEN:
    logger.error("TELEGRAM_BOT_TOKEN is missing in the environment variables.")
    exit(1)

# Initialize Bot and Dispatcher
bot = Bot(token=TELEGRAM_BOT_TOKEN, default=DefaultBotProperties(parse_mode=ParseMode.MARKDOWN))
dp = Dispatcher()

# ----------------------------------------------------------------------
# Markdown Formatter for Trip Plan
# ----------------------------------------------------------------------
def format_trip_plan(plan: dict) -> str:
    """Formats the JSON trip plan into a beautiful Telegram Markdown message."""
    dest = plan.get("destination", "Destination")
    src = plan.get("source", "Origin")
    duration = plan.get("duration", "N/A")
    estimated_budget = plan.get("estimated_budget", 0)
    
    msg = f"🌍 *Travel Plan to {dest}* from _{src}_\n"
    msg += f"⏳ *Duration:* {duration} | 💰 *Budget:* ₹{estimated_budget:,}\n\n"
    
    # Best Flight Component (Headless Service Output)
    flight = plan.get("recommended", {}).get("flight")
    if flight:
        msg += "✈️ *Best Flight Option*\n"
        msg += f"Airline: {flight.get('airline')} ({flight.get('duration_hrs')}h)\n"
        msg += f"Price: ₹{flight.get('price', 0):,}\n\n"
        
    # Best Hotel Component
    hotel = plan.get("recommended", {}).get("hotel")
    if hotel:
        msg += "🏨 *Hotel Recommendation*\n"
        msg += f"Name: {hotel.get('name')}\n"
        msg += f"Price: ₹{hotel.get('price_per_night', 0):,}/night\n\n"
        
    # Weather Service Output
    weather = plan.get("weather", {})
    if weather and weather.get("temperature"):
        msg += "🌤️ *Current Weather*\n"
        msg += f"{weather.get('temperature')} — {weather.get('condition')}\n\n"
        
    # Output the dynamic generated Itinerary
    itinerary = plan.get("itinerary", "")
    if itinerary:
        msg += "📋 *AI Generated Itinerary*\n"
        msg += f"{itinerary}\n"
        
    return msg

# ----------------------------------------------------------------------
# Handlers
# ----------------------------------------------------------------------
@dp.message(CommandStart())
async def cmd_start(message: types.Message):
    """Greeting the user and explicitly displaying the repository project."""
    welcome_text = (
        "👋 Welcome to the **Headless Telegram Client**!\n\n"
        "This bot is powered by the *AI-Orchestrated Headless Composable Application Platform*.\n\n"
        "It operates as a completely decoupled UI branch. All travel planning relies on the core microservices (Flights, Hotels, Weather, Budget) running behind the API Gateway.\n\n"
        "**Try saying something like:**\n"
        "👉 *Plan a 3-day trip to Goa under 20000*"
    )
    await message.answer(welcome_text)

@dp.message(F.text)
async def handle_trip_query(message: types.Message):
    """Intercept text messages, send them to the headless API gateway, and return the plan."""
    query = message.text
    session_id = str(message.chat.id) # Use the Telegram chat ID as the session memory ID!
    
    # Notify user that the orchestrator is working
    status_msg = await message.answer("⚙️ *Orchestrating Microservices...*\nConnecting to the AI Gateway to build your plan. Please wait.")
    
    try:
        async with httpx.AsyncClient(timeout=300.0) as client:
            payload = {
                "query": query,
                "session_id": session_id
                # Note: Origin location tracking via GPS isn't readily available for standard Telegram text messages,
                # but the LLM intent detection or standard defaults will catch it!
            }
            
            # Send API request to the Headless Backend Gateway
            response = await client.post(f"{GATEWAY_URL}/plans/generate", json=payload)
            response.raise_for_status()
            
            plan_data = response.json()
            actual_plan = plan_data.get("trip_plan", plan_data)
            
            # Format and send the response
            formatted_message = format_trip_plan(actual_plan)
            await message.answer(formatted_message)
            
    except httpx.ReadTimeout:
        await message.answer("⚠️ *Timeout Error:* The local Ollama LLM took too long to generate the detailed itinerary. Please try again.")
    except Exception as e:
        logger.error(f"Error connecting to backend: {e}")
        await message.answer(f"⚠️ *Gateway Error:* Cannot connect to the headless backend (`{GATEWAY_URL}`). Make sure `start_backend.py` is running.")
    finally:
        # Remove the orchestrating status message
        try:
            await status_msg.delete()
        except:
            pass

# ----------------------------------------------------------------------
# Main Runner
# ----------------------------------------------------------------------
async def main():
    logger.info("Starting up Telegram Headless Client...")
    # Drop pending updates
    await bot.delete_webhook(drop_pending_updates=True)
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())

import os
import logging
from dotenv import load_dotenv
from pyrogram import Client, filters
from pyrogram.types import Message
from apscheduler.schedulers.background import BackgroundScheduler
import time

# Load environment variables
load_dotenv()

# Setup Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Retrieve the bot token and mongo URI from the .env file
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
MONGO_URI = os.getenv("MONGO_URI")

# Initialize Pyrogram Client
bot = Client("my_bot", bot_token=TELEGRAM_BOT_TOKEN)

# Command handler for the /start command
@bot.on_message(filters.command("start"))
async def start(client, message: Message):
    await message.reply("Hello, I am your verification bot. Send a math sum to get the access key!")

# Command handler for verifying math sum
@bot.on_message(filters.text)
async def verify_math_sum(client, message: Message):
    user_answer = message.text.strip()
    
    # A simple math sum for verification (e.g., 3 + 2)
    correct_answer = "5"  # You can make this dynamic based on a function

    if user_answer == correct_answer:
        access_key = "https://aklinksz1.site/home?key=your_generated_key_here"
        await message.reply(f"Correct! Here's your access key: {access_key}")
    else:
        await message.reply("Incorrect answer, try again!")

# Scheduler to run tasks
def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(monitor_bot, 'interval', seconds=10)  # Monitor every 10 seconds
    scheduler.start()

# Bot function to monitor or log the status
def monitor_bot():
    logger.info(f"Bot running... {time.ctime()}")

# Start bot and scheduler
if __name__ == "__main__":
    start_scheduler()  # Start the background task scheduler
    bot.run()  # Run the bot

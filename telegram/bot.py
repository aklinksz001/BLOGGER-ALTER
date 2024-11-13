

import os
import hashlib
import time
import telegram
from dotenv import load_dotenv
from mongodb.database import save_hash_to_db  # Import MongoDB function to save generated hash

# Load environment variables from .env file
load_dotenv()

# Telegram Bot Token (from .env)
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
ADMIN_ID = os.getenv("ADMIN_ID")  # The Telegram user ID for the bot admin
WEBSITE_URL = os.getenv("WEBSITE_URL")  # Get the updated website URL from .env

# Initialize the Telegram bot
bot = telegram.Bot(token=TELEGRAM_TOKEN)

# Generate a time-based access hash for Telegram users
def generate_hash():
    timestamp = int(time.time())  # Current Unix timestamp
    hash_object = hashlib.sha256((str(timestamp) + os.getenv("SECRET_KEY")).encode())  # Secret key and timestamp
    hash_value = hash_object.hexdigest()[:6]  # Use the first 6 characters as the hash
    expiry_time = timestamp + 300  # Valid for 5 minutes (300 seconds)
    
    # Save hash and expiry time to the database
    save_hash_to_db(hash_value, expiry_time)
    
    return hash_value

# Send a message with a time-based link to Telegram users
def send_access_link(chat_id):
    hash_value = generate_hash()  # Generate the hash
    access_link = f"{WEBSITE_URL}?hash={hash_value}"  # Construct the access link using the updated website URL
    message = f"Your time-based access link: {access_link}\nThis link will expire in 5 minutes."
    
    # Send the message to the Telegram user
    bot.send_message(chat_id=chat_id, text=message)

# Command handler for the bot to generate and send the access link
def handle_message(update, context):
    user_id = update.message.chat_id
    text = update.message.text

    if text.lower() == "/getlink":
        send_access_link(user_id)  # Send access link when the command /getlink is received

# Set up the bot to listen for commands
from telegram.ext import Updater, CommandHandler

def start_bot():
    updater = Updater(token=TELEGRAM_TOKEN, use_context=True)
    dispatcher = updater.dispatcher
    
    # Add command handler for /getlink
    dispatcher.add_handler(CommandHandler("getlink", handle_message))

    # Start the bot
    updater.start_polling()

if __name__ == '__main__':
    start_bot()
  

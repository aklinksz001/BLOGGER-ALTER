import os
import hashlib
import time
import random
import string
import telegram
from dotenv import load_dotenv
from mongodb.database import save_hash_to_db

load_dotenv()
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
ADMIN_ID = os.getenv("ADMIN_ID")
WEBSITE_URL = os.getenv("WEBSITE_URL")

bot = telegram.Bot(token=TELEGRAM_TOKEN)

def generate_secret_key(length=16):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choices(characters, k=length))

def generate_hash():
    timestamp = int(time.time())
    secret_key = generate_secret_key()
    hash_object = hashlib.sha256((str(timestamp) + secret_key).encode())
    hash_value = hash_object.hexdigest()[:6]
    expiry_time = timestamp + 300
    save_hash_to_db(hash_value, expiry_time, secret_key)
    return hash_value

def send_access_link(chat_id):
    try:
        hash_value = generate_hash()
        access_link = f"{WEBSITE_URL}?hash={hash_value}"
        message = f"Your access link: {access_link}\nValid for 5 minutes."
        bot.send_message(chat_id=chat_id, text=message)
    except Exception as e:
        bot.send_message(chat_id=chat_id, text=f"Error: {str(e)}")

from telegram.ext import Updater, CommandHandler

def handle_message(update, context):
    chat_id = update.message.chat_id
    if update.message.text.lower() == "/getlink":
        send_access_link(chat_id)

def start_bot():
    updater = Updater(TELEGRAM_TOKEN, use_context=True)
    dispatcher = updater.dispatcher
    dispatcher.add_handler(CommandHandler("getlink", handle_message))

    print("Bot is starting...")
    updater.start_polling()

if __name__ == '__main__':
    start_bot()

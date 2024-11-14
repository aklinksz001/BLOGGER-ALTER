import http.server
import socketserver
import os
from urllib.parse import parse_qs
from pymongo import MongoClient
from dotenv import load_dotenv
import datetime
import threading
from telegram.ext import Updater, CommandHandler

# Load environment variables from .env
load_dotenv()

# Fetch MongoDB URI, website URL, and Telegram bot token from environment variables
MONGO_URI = os.getenv("MONGO_URI")
WEBSITE_URL = os.getenv("WEBSITE_URL")
DB_NAME = os.getenv("DB_NAME")  # Fetch database name from .env
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")  # Telegram bot token
PORT = int(os.getenv("PORT", 8080))  # Port for the HTTP server

# MongoDB setup
client = MongoClient(MONGO_URI)
db = client[DB_NAME]  # Specify the database name explicitly
password_collection = db["passwords"]
access_collection = db["access_links"]

# Custom request handler to handle incoming HTTP requests
class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/verify"):
            # Handle verification of password or hash code
            query_components = parse_qs(self.path[8:])  # Remove '/verify?' from the path
            user_input = query_components.get("input", [None])[0]  # Get the user input (password or hash)
            
            if user_input:
                # Verify if the input is valid as a password or an access code
                if self.verify_password(user_input) or self.verify_hash(user_input):
                    self.send_response(200)
                    self.send_header("Content-type", "text/html")
                    self.end_headers()
                    self.wfile.write(b"valid")
                else:
                    self.send_response(403)
                    self.send_header("Content-type", "text/html")
                    self.end_headers()
                    self.wfile.write(b"invalid")
            else:
                self.send_response(400)
                self.send_header("Content-type", "text/html")
                self.end_headers()
                self.wfile.write(b"Invalid request")
        else:
            super().do_GET()  # For other requests, just handle normally

    def verify_password(self, input):
        """Check if the input matches the current daily password."""
        password_doc = password_collection.find_one({"status": "active"})
        if password_doc and input == password_doc["password"]:
            return True
        return False

    def verify_hash(self, input):
        """Check if the input matches a valid access hash."""
        hash_doc = access_collection.find_one({"access_code": input})
        if hash_doc:
            # Check if the hash is still within the 5-minute validity
            expiration_time = hash_doc["expires_at"]
            if expiration_time > datetime.datetime.now():
                return True
            else:
                # If expired, delete the hash from the database
                access_collection.delete_one({"access_code": input})
        return False

# Start the Telegram Bot
def start_bot():
    def start(update, context):
        update.message.reply_text("Bot is working!")

    updater = Updater(token=TELEGRAM_TOKEN, use_context=True)
    dp = updater.dispatcher
    dp.add_handler(CommandHandler("start", start))
    updater.start_polling()
    updater.idle()  # Keep the bot running

# Start the Web Server (HTTP Server)
def start_server():
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

# Function to start both server and bot concurrently
def start_services():
    # Run both the bot and the server in separate threads
    bot_thread = threading.Thread(target=start_bot)
    server_thread = threading.Thread(target=start_server)

    bot_thread.start()
    server_thread.start()

    bot_thread.join()
    server_thread.join()

if __name__ == '__main__':
    # Start both bot and server concurrently
    start_services()

import http.server
import socketserver
import os
import subprocess
from dotenv import load_dotenv
import threading

# Load environment variables
load_dotenv()

PORT = int(os.getenv("PORT", 8080))
TELEGRAM_BOT_PATH = "telegram/bot.py"

# Define the HTTP server handler
class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = 'others/Password.html'  # Serve Password.html as the landing page
        return super().do_GET()

# Function to start the HTTP server
def start_server():
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Serving at port {PORT}")
        httpd.serve_forever()

# Function to start the Telegram bot
def start_bot():
    print("Starting Telegram bot...")
    subprocess.run(["python", TELEGRAM_BOT_PATH])

# Main function to start both server and bot
if __name__ == "__main__":
    # Run the server and bot in separate threads
    server_thread = threading.Thread(target=start_server)
    bot_thread = threading.Thread(target=start_bot)

    server_thread.start()
    bot_thread.start()

    # Wait for both threads to complete
    server_thread.join()
    bot_thread.join()

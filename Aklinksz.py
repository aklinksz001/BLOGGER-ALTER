
import http.server
import socketserver
import os
import hashlib
import time
from urllib.parse import urlparse, parse_qs
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Secret key for hash generation (from .env file)
SECRET_KEY = os.getenv("SECRET_KEY")

# Define the port to serve on
PORT = int(os.getenv("PORT", 8080))

# Generate a time-based hash for access
def generate_hash():
    timestamp = int(time.time())  # Get the current Unix timestamp
    hash_object = hashlib.sha256((str(timestamp) + SECRET_KEY).encode())  # Hash based on timestamp and SECRET_KEY
    hash_value = hash_object.hexdigest()[:6]  # Take first 6 characters as the access hash
    expiry_time = timestamp + 300  # Valid for 5 minutes (300 seconds)
    return hash_value, expiry_time

# Validate the access hash from the URL query string
def validate_hash(hash_from_url):
    timestamp = int(time.time())  # Get the current timestamp
    hash_object = hashlib.sha256((str(timestamp) + SECRET_KEY).encode())
    valid_hash = hash_object.hexdigest()[:6]  # Generate the expected valid hash

    return hash_from_url == valid_hash  # Return True if the hash matches

# Define the request handler for serving files and validating the hash
class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        query_params = parse_qs(parsed_url.query)

        # Check if there's a 'hash' parameter in the URL
        if 'hash' in query_params:
            hash_value = query_params['hash'][0]  # Get the hash value from the URL query parameter
            if validate_hash(hash_value):
                # If the hash is valid, allow access by serving the Index.html page
                self.path = 'others/Index.html'
            else:
                # If the hash is invalid, redirect to the Password.html page
                self.path = 'others/Password.html'
        
        # Serve the requested file
        return super().do_GET()

# Create and run the HTTP server
with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()

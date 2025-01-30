import http.server
import socketserver
import os
import urllib.parse
from Bot import database # Importing the database functions

# Define the port to serve on
PORT = 8080

# Define the handler to serve files
class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urllib.parse.urlparse(self.path)
        query_params = urllib.parse.parse_qs(parsed_url.query)

        # Extract key from URL
        key = query_params.get("key", [None])[0]

        # Check key validity
        if key:
            valid, _ = database.check_key_validity(key)
            if not valid:
                self.path = "others/Expired.html"  # Redirect to expired page if key is invalid
        else:
            self.path = "others/Date-Verify.html"  # Redirect to verification page if no key

        return super().do_GET()

# Create the server
with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()

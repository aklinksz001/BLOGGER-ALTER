import http.server
import socketserver
import os
from mongodb.database import verify_hash
from dotenv import load_dotenv

load_dotenv()
PORT = int(os.getenv("PORT", 8080))
STATIC_PASSWORD = os.getenv("PASSWORD")

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = 'others/Password.html'

        elif self.path.startswith("/verify"):
            query = self.path.split("?")[1]
            params = dict(param.split("=") for param in query.split("&"))
            password = params.get("password")
            hash_value = params.get("hash")

            # Check for static password or hash verification
            if password == STATIC_PASSWORD:
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"valid")

            elif hash_value and verify_hash(hash_value):
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b"valid")

            else:
                self.send_response(403)
                self.end_headers()
                self.wfile.write(b"invalid")

        else:
            super().do_GET()

with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()

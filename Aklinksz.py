import http.server
import socketserver
import os 

# Define the port to serve on
PORT = 8085

# Define the handler to serve files
class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/':
            self.path = 'others/Date-Verify.html'  # Serve Password.html as the landing page
        return super().do_GET()

# Create the server
with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()

import http.server
import socketserver
import os

# Define the port to serve on
PORT = int(os.environ.get('PORT', 8000))

# Define the handler to serve files
Handler = http.server.SimpleHTTPRequestHandler

# Create the server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()
  

import http.server
import socketserver
import os
from jinja2 import Environment, FileSystemLoader
import config

# Define the port to serve on
PORT = int(os.environ.get('PORT', 8000))

# Define the handler to serve files
Handler = http.server.SimpleHTTPRequestHandler

# Set up Jinja2 environment
file_loader = FileSystemLoader('templates')
env = Environment(loader=file_loader)

# Dictionary of templates and their corresponding output paths
file_paths = {
    'posts/Anime-English.html': 'output/posts/Anime-English.html',
    'posts/1500-Webseries/BBB.html': 'output/posts/1500-Webseries/BBB.html',
    'Webseries-Files/Numbers.html': 'output/Webseries-Files/Numbers.html',
    # Add more templates and output paths as needed
}

# Function to generate HTML files from templates
def generate_html_files(file_paths):
    for template_name, output_path in file_paths.items():
        # Load the template
        template = env.get_template(template_name)
        
        # Render the template with the domain value from config.py
        output = template.render(DOMAIN=config.DOMAIN)
        
        # Ensure the output directory exists
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # Write the rendered HTML to the output file
        with open(output_path, 'w', encoding='utf-8') as file:
            file.write(output)
        
        print(f"HTML file generated successfully at {output_path}!")

# Generate HTML files before starting the server
generate_html_files(file_paths)

# Create the server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()

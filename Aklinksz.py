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
file_loader = FileSystemLoader('.')  # Load from the current directory (project root)
env = Environment(loader=file_loader)

# Dictionary of templates and their corresponding output paths
file_paths = {
    'posts/Anime-English.html': 'output/Anime-English.html',
    'posts/Filmography.html': 'output/Filmography.html',
    # Add more templates and output paths as needed
}

# Function to ensure directory exists
def ensure_directory_exists(path):
    directory = os.path.dirname(path)
    if not os.path.exists(directory):
        print(f"Creating directory: {directory}")
        os.makedirs(directory, exist_ok=True)
    else:
        print(f"Directory already exists: {directory}")

# Function to generate HTML files from templates
def generate_html_files(file_paths):
    for template_name, output_path in file_paths.items():
        try:
            # Load the template
            print(f"Loading template: {template_name}")
            template = env.get_template(template_name)
            
            # Render the template with the domain value from config.py
            output = template.render(DOMAIN=config.DOMAIN)
            
            # Debug: print the rendered output
            print(f"Rendered output:\n{output}")
            
            # Ensure the output directory exists
            ensure_directory_exists(output_path)
            
            # Write the rendered HTML to the output file
            with open(output_path, 'w', encoding='utf-8') as file:
                file.write(output)
            
            print(f"HTML file generated successfully at {output_path}!")
        except Exception as e:
            print(f"Error processing template {template_name}: {e}")

# Generate HTML files before starting the server
generate_html_files(file_paths)

# Create the server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()

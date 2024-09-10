import http.server
import socketserver
import os
from string import Template

# Define the port to serve on
PORT = int(os.environ.get('PORT', 8000))

# Define the handler to serve files
Handler = http.server.SimpleHTTPRequestHandler

# Domain value from config
DOMAIN = 'https://aklinksz.cfd'  # Change to your desired domain

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

# Function to replace placeholders in the template files using string.Template
def generate_html_files(file_paths, domain):
    for template_path, output_path in file_paths.items():
        try:
            # Read the template file
            with open(template_path, 'r', encoding='utf-8') as file:
                content = file.read()
            
            # Create a Template object
            template = Template(content)
            
            # Substitute the placeholder with the actual domain
            content = template.substitute(DOMAIN=domain)
            
            # Ensure the output directory exists
            ensure_directory_exists(output_path)
            
            # Write the updated content to the output file
            with open(output_path, 'w', encoding='utf-8') as file:
                file.write(content)
            
            print(f"HTML file generated successfully at {output_path}!")
        except Exception as e:
            print(f"Error processing file {template_path}: {e}")

# Generate HTML files before starting the server
generate_html_files(file_paths, DOMAIN)

# Create the server
with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving at port {PORT}")
    httpd.serve_forever()

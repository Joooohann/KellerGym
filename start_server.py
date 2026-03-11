import http.server
import socketserver
import mimetypes
import os

PORT = 5500

# Fix MIME types explicitly
mimetypes.init()
mimetypes.add_type('application/javascript', '.js')
mimetypes.add_type('text/css', '.css')

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = http.server.SimpleHTTPRequestHandler.extensions_map.copy()
    extensions_map['.js'] = 'application/javascript'
    
    def end_headers(self):
        # Allow CORS just in case
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Server gestartet auf Port {PORT}")
    print(f"Bitte öffne: http://localhost:{PORT}/index.html")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nServer gestoppt.")

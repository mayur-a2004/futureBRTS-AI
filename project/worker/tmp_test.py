import base64
import zlib
import requests

KROKI_URL = "https://kroki.io"
diagram_code = "graph TD\n  A --> B"
format = "png"

# Standard Zlib + Base64 (RFC 1950)
compressed = zlib.compress(diagram_code.encode('utf-8'))
encoded = base64.urlsafe_b64encode(compressed).decode('ascii').rstrip('=')
url = f"{KROKI_URL}/mermaid/{format}/{encoded}"
print(f"URL 1 (zlib): {url}")
resp = requests.get(url)
print(f"Status 1: {resp.status_code}")

# Raw Deflate (RFC 1951)
deflate_compress = zlib.compressobj(wbits=-15)
payload = deflate_compress.compress(diagram_code.encode('utf-8')) + deflate_compress.flush()
encoded2 = base64.urlsafe_b64encode(payload).decode('ascii').rstrip('=')
url2 = f"{KROKI_URL}/mermaid/{format}/{encoded2}"
print(f"URL 2 (raw deflate): {url2}")
resp2 = requests.get(url2)
print(f"Status 2: {resp2.status_code}")

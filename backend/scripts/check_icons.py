import json
import urllib.request
import urllib.error
import ssl
from concurrent.futures import ThreadPoolExecutor

apps_json_path = r'd:\web project\multi app downloader\frontend\mock\apps.json'

with open(apps_json_path, 'r', encoding='utf-8') as f:
    apps = json.load(f)

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def check_icon(app):
    url = app.get('iconPlaceholder')
    if not url:
        return app['name'], 'No URL'
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
            status = response.getcode()
            # For icon.horse, it returns 200 even for fallbacks, but we can check headers
            # However, let's just check if it fails to load at all (404, 403, etc)
            if status != 200:
                return app['name'], f'HTTP {status}'
            # check content length or type if we want to detect generic fallbacks
            return None
    except Exception as e:
        return app['name'], str(e)

broken = []
with ThreadPoolExecutor(max_workers=20) as executor:
    results = executor.map(check_icon, apps)
    for res in results:
        if res:
            broken.append(res)

print(f"Found {len(broken)} broken icons:")
for name, err in broken:
    print(f"- {name}: {err}")

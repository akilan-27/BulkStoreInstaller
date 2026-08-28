import json
import sqlite3
import urllib.request
import os
import base64
from pathlib import Path
import ssl

JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'
DB_PATH = r'd:\web project\multi app downloader\backend\appstore.db'
STATIC_DIR = r'd:\web project\multi app downloader\backend\static\logos'
BASE_URL = 'http://localhost:8000/static/logos'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

os.makedirs(STATIC_DIR, exist_ok=True)

with open(JSON_PATH, 'r', encoding='utf-8') as f:
    apps = json.load(f)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

def get_extension(url, content_type):
    if 'image/svg+xml' in content_type or url.endswith('.svg') or url.endswith('/default'):
        return '.svg'
    elif 'image/png' in content_type or url.endswith('.png'):
        return '.png'
    elif 'image/webp' in content_type or url.endswith('.webp'):
        return '.webp'
    elif 'image/jpeg' in content_type or url.endswith('.jpg'):
        return '.jpg'
    return '.png' # fallback

success_count = 0
failed_count = 0

for app in apps:
    url = app.get('iconPlaceholder')
    if not url:
        continue
    
    # Skip if it's already a local URL
    if url.startswith(BASE_URL):
        continue
        
    file_ext = '.png'
    content = None
    
    try:
        if url.startswith('data:image'):
            # Parse data URI
            header, encoded = url.split(',', 1)
            content = base64.b64decode(encoded)
            if 'image/svg+xml' in header:
                file_ext = '.svg'
            elif 'image/webp' in header:
                file_ext = '.webp'
            elif 'image/jpeg' in header:
                file_ext = '.jpg'
        else:
            # Download from web
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
                content = response.read()
                content_type = response.headers.get('Content-Type', '')
                file_ext = get_extension(url, content_type)
        
        file_name = f"{app['id']}{file_ext}"
        file_path = os.path.join(STATIC_DIR, file_name)
        
        with open(file_path, 'wb') as f:
            f.write(content)
            
        new_url = f"{BASE_URL}/{file_name}"
        
        # Update app entry
        app['iconPlaceholder'] = new_url
        cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE id = ?", (new_url, app['id']))
        success_count += 1
        
    except Exception as e:
        print(f"Failed to download logo for {app['name']} ({url}): {e}")
        failed_count += 1

conn.commit()
conn.close()

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(apps, f, indent=2, ensure_ascii=False)

print(f"\nMigration complete. Successfully downloaded {success_count} logos. Failed: {failed_count}.")

import json
import sqlite3
import urllib.request
import os
import ssl

JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'
DB_PATH = r'd:\web project\multi app downloader\backend\appstore.db'
STATIC_DIR = r'd:\web project\multi app downloader\backend\static\logos'

updates = {
    'anythingllm': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNmx_n1bMCEwQZsZ0_akIrQ0NkdEmHd9thWhOC05BDrA&s=10'
}

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with open(JSON_PATH, 'r', encoding='utf-8') as f:
    apps = json.load(f)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

updated_count = 0

for app in apps:
    app_name_lower = app['name'].lower()
    
    target_url = None
    if 'anything' in app_name_lower and 'llm' in app_name_lower:
        target_url = updates['anythingllm']
        
    if target_url:
        print(f"Updating {app['name']}...")
        req = urllib.request.Request(target_url, headers={'User-Agent': 'Mozilla/5.0'})
        try:
            with urllib.request.urlopen(req, context=ctx) as response:
                content = response.read()
                
            file_name = f"{app['id']}.png"
            file_path = os.path.join(STATIC_DIR, file_name)
            
            with open(file_path, 'wb') as f:
                f.write(content)
                
            new_url = f"http://localhost:8000/static/logos/{file_name}"
            app['iconPlaceholder'] = new_url
            cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE id = ?", (new_url, app['id']))
            updated_count += 1
            print(f" -> Success: {new_url}")
        except Exception as e:
            print(f" -> Failed: {e}")

conn.commit()
conn.close()

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(apps, f, indent=2, ensure_ascii=False)

print(f"Finished. Updated {updated_count} apps.")

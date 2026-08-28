import json
import sqlite3
import urllib.request
import os
import ssl

JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'
DB_PATH = r'd:\web project\multi app downloader\backend\appstore.db'
STATIC_DIR = r'd:\web project\multi app downloader\backend\static\logos'

url = 'https://keepassxc.org/assets/img/keepassxc.svg'
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

with open(JSON_PATH, 'r', encoding='utf-8') as f:
    apps = json.load(f)

app_id = None
for app in apps:
    if 'keepass' in app['name'].lower():
        app_id = app['id']
        break

if not app_id:
    print("Could not find KeePassXC")
    exit(1)

req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
with urllib.request.urlopen(req, context=ctx) as response:
    content = response.read()

file_name = f"{app_id}.svg"
file_path = os.path.join(STATIC_DIR, file_name)

with open(file_path, 'wb') as f:
    f.write(content)

new_url = f"http://localhost:8000/static/logos/{file_name}"

for app in apps:
    if app['id'] == app_id:
        app['iconPlaceholder'] = new_url

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()
cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE id = ?", (new_url, app_id))
conn.commit()
conn.close()

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(apps, f, indent=2, ensure_ascii=False)

print(f"Successfully updated KeePassXC logo to {new_url}")

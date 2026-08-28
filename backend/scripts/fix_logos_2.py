import json
import sqlite3

# Mapping of App Name to Logo URL
logo_map = {
    'Ollama': 'https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-avatar/avatars/ollama.webp',
    'Cline': 'https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-avatar/avatars/cline.webp',
    'Windsurf': 'https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-avatar/avatars/windsurf.webp',
    'Cursor': 'https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-avatar/avatars/cursor.webp'
}

JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'
DB_PATH = r'd:\web project\multi app downloader\backend\appstore.db'

# 1. Update JSON
with open(JSON_PATH, 'r', encoding='utf-8') as f:
    apps = json.load(f)

for app in apps:
    if app.get('name') in logo_map:
        app['iconPlaceholder'] = logo_map[app['name']]

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(apps, f, indent=2, ensure_ascii=False)

# 2. Update DB
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

for name, url in logo_map.items():
    cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE name = ?", (url, name))

conn.commit()
conn.close()

print("Successfully updated problematic logos to solid background versions.")

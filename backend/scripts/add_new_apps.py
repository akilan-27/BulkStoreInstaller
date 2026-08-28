import json
import re
import sqlite3

apps_json_path = r'd:\web project\multi app downloader\frontend\mock\apps.json'
md_file_path = r'c:\Users\raaki\Downloads\winget_recommended_apps.md'
db_path = r'd:\web project\multi app downloader\backend\appstore.db'

# Read current apps
with open(apps_json_path, 'r', encoding='utf-8') as f:
    apps = json.load(f)

# Get the max ID number
max_id = 0
for app in apps:
    match = re.search(r'app-(\d+)', app['id'])
    if match:
        max_id = max(max_id, int(match.group(1)))

new_id = max_id + 1

# Parse markdown
with open(md_file_path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

current_category = ""
new_apps = []

for line in lines:
    line = line.strip()
    if line.startswith('## '):
        # Extract category name, removing emojis
        cat = line[3:]
        cat = re.sub(r'^[^\w\s]+\s*', '', cat)
        current_category = cat
    elif line.startswith('|') and not line.startswith('| Application') and not line.startswith('|-'):
        parts = [p.strip() for p in line.split('|')]
        if len(parts) >= 4:
            name = parts[1].replace('**', '').strip()
            if not name:
                continue
            winget_id = parts[2].replace('`', '').strip()
            desc = parts[3].strip()
            
            # Check if app already exists in apps.json by wingetId
            exists = any(a.get('wingetId') == winget_id for a in apps)
            if not exists:
                new_app = {
                    "id": f"app-{new_id}",
                    "name": name,
                    "publisher": winget_id.split('.')[0] if '.' in winget_id else name,
                    "category": current_category,
                    "description": desc,
                    "wingetId": winget_id,
                    "iconPlaceholder": f"https://icon.horse/icon/{name.replace(' ', '').lower()}.com",
                    "verified": True
                }
                apps.append(new_app)
                new_apps.append(new_app)
                new_id += 1

# Save back to apps.json
with open(apps_json_path, 'w', encoding='utf-8') as f:
    json.dump(apps, f, indent=2, ensure_ascii=False)

print(f"Added {len(new_apps)} new apps to apps.json")

# Update the SQLite database
try:
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    for app in new_apps:
        cursor.execute("""
            INSERT INTO app (id, wingetId, name, publisher, description, category, iconPlaceholder)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (app['id'], app['wingetId'], app['name'], app['publisher'], app['description'], app['category'], app['iconPlaceholder']))

    conn.commit()
    conn.close()
    print("Added new apps to SQLite database")
except Exception as e:
    print("Failed to update SQLite:", e)

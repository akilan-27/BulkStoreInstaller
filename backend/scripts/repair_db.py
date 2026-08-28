import json
import sqlite3

apps_json_path = r'd:\web project\multi app downloader\frontend\mock\apps.json'
db_path = r'd:\web project\multi app downloader\backend\appstore.db'

with open(apps_json_path, 'r', encoding='utf-8') as f:
    apps = json.load(f)

for a in apps:
    # If clearbit returned None or icon.horse is still present
    if not a.get('iconPlaceholder') or 'icon.horse' in a.get('iconPlaceholder', ''):
        domain = a['name'].replace(' ', '').lower() + '.com'
        a['iconPlaceholder'] = f"https://s2.googleusercontent.com/s2/favicons?domain={domain}&sz=128"

with open(apps_json_path, 'w', encoding='utf-8') as f:
    json.dump(apps, f, indent=2, ensure_ascii=False)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
for a in apps:
    cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE id = ?", (a['iconPlaceholder'], a['id']))
conn.commit()
conn.close()

print('DB updated successfully!')

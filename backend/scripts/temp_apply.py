import sqlite3
import json

TXT_PATH = r'c:\Users\raaki\OneDrive\Desktop\Logo Audit Results.txt'
DB_PATH = r'd:\web project\multi app downloader\backend\appstore.db'
JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'

mapping = {}
with open(TXT_PATH, 'r', encoding='utf-8') as f:
    for line in f:
        if '=' in line:
            parts = line.split('=', 1)
            app_name = parts[0].strip()
            url = parts[1].strip().strip('\"')
            if url.startswith('http'):
                mapping[app_name] = url

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

with open(JSON_PATH, 'r', encoding='utf-8') as f:
    apps = json.load(f)

updated = 0
for app in apps:
    if app['name'] in mapping:
        app['iconPlaceholder'] = mapping[app['name']]
        cursor.execute('UPDATE app SET iconPlaceholder = ? WHERE name = ?', (mapping[app['name']], app['name']))
        updated += 1

conn.commit()
conn.close()

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(apps, f, indent=2, ensure_ascii=False)

print(f'Updated {updated} apps from {len(mapping)} mappings found in text file.')

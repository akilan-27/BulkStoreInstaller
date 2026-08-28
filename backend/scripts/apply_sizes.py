import json
import sqlite3
import os

sizes_path = r'C:\Users\raaki\Downloads\app_download_sizes_fixed.md'
json_path = r'd:\web project\multi app downloader\frontend\mock\apps.json'
db_path = r'd:\web project\multi app downloader\backend\appstore.db'

# 1. Parse sizes
sizes = {}
with open(sizes_path, 'r', encoding='utf-8') as f:
    for line in f:
        if '|' in line and not line.startswith('| App Name') and not line.startswith('|---'):
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 3 and parts[1] and parts[2]:
                app_name = parts[1].replace('&#124;', '|')
                size_str = parts[2]
                sizes[app_name] = '~' + size_str

# 2. Update apps.json
with open(json_path, 'r', encoding='utf-8') as f:
    apps = json.load(f)

for app in apps:
    # Set size if it exists
    if app['name'] in sizes:
        app['size'] = sizes[app['name']]
    
    # Fix ChatGPT wingetId
    if app['name'].lower() == 'chatgpt':
        app['wingetId'] = '9PLM9XGG6VKS'

with open(json_path, 'w', encoding='utf-8') as f:
    json.dump(apps, f, indent=2)

print(f"Updated apps.json with sizes and ChatGPT ID.")

# 3. Update appstore.db
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Add size column if it doesn't exist
try:
    c.execute('ALTER TABLE app ADD COLUMN size TEXT')
    print("Added size column to app table.")
except sqlite3.OperationalError:
    print("Size column already exists.")

# Update sizes and ChatGPT ID in db
for app in apps:
    c.execute('UPDATE app SET size = ? WHERE id = ?', (app.get('size'), app['id']))
    if app['name'].lower() == 'chatgpt':
        c.execute('UPDATE app SET wingetId = ? WHERE id = ?', ('9PLM9XGG6VKS', app['id']))

conn.commit()
conn.close()
print("Updated appstore.db successfully.")

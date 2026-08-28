import json
import sqlite3
import urllib.parse
import re

TXT_PATH = r'c:\Users\raaki\OneDrive\Desktop\Logo Audit Results.txt'
DB_PATH = r'd:\web project\multi app downloader\backend\appstore.db'
JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'

mapping = {}
with open(TXT_PATH, 'r', encoding='utf-8') as f:
    for line in f:
        if '=' in line:
            # Handle possible ="URL" or = "URL"
            parts = line.split('=', 1)
            app_name = parts[0].strip()
            raw_url = parts[1].strip().strip('"')
            
            # Extract actual image URL if it's a google image search result
            if raw_url.startswith('https://www.google.com/imgres'):
                parsed_url = urllib.parse.urlparse(raw_url)
                query_params = urllib.parse.parse_qs(parsed_url.query)
                if 'imgurl' in query_params:
                    url = query_params['imgurl'][0]
                else:
                    url = raw_url
            else:
                url = raw_url
                
            mapping[app_name] = url

# Update DB
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

updated_db = 0
for app_name, url in mapping.items():
    cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE name = ?", (url, app_name))
    updated_db += cursor.rowcount

conn.commit()
conn.close()

# Update JSON
with open(JSON_PATH, 'r', encoding='utf-8') as f:
    apps = json.load(f)

updated_json = 0
for app in apps:
    if app['name'] in mapping:
        app['iconPlaceholder'] = mapping[app['name']]
        updated_json += 1

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(apps, f, indent=2, ensure_ascii=False)

print(f'Parsed {len(mapping)} mappings from text file.')
print(f'Updated {updated_db} apps in DB and {updated_json} apps in JSON.')

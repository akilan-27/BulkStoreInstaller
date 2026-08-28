import json
import sqlite3

JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'
DB_PATH = r'd:\web project\multi app downloader\backend\appstore.db'

# Specific replacements for known black/white SVGs
specific_map = {
    'Perplexity': 'https://raw.githubusercontent.com/lobehub/lobe-icons/refs/heads/master/packages/static-avatar/avatars/perplexity.webp',
    'AnythingLLM Desktop': 'https://avatars.githubusercontent.com/u/133504381?s=200&v=4',
    'Insomnia': 'https://avatars.githubusercontent.com/u/23307682?s=200&v=4',
    'KeePassXC': 'https://avatars.githubusercontent.com/u/24227743?s=200&v=4'
}

with open(JSON_PATH, 'r', encoding='utf-8') as f:
    apps = json.load(f)

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

updated = 0
for app in apps:
    url = app.get('iconPlaceholder')
    if not url: continue
    
    new_url = None
    if app['name'] in specific_map:
        new_url = specific_map[app['name']]
    # Fix all simpleicons to use their official brand color instead of black/white
    elif 'cdn.simpleicons.org' in url and not url.endswith('/default'):
        # Just in case the URL has query params or something
        if '?' in url:
            base, query = url.split('?', 1)
            new_url = base + '/default?' + query
        else:
            new_url = url + '/default'
        
    if new_url:
        app['iconPlaceholder'] = new_url
        cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE name = ?", (new_url, app['name']))
        updated += 1

conn.commit()
conn.close()

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(apps, f, indent=2, ensure_ascii=False)

print(f"Updated {updated} problematic logos.")

import json
import urllib.request
import urllib.parse
import re
import time
import sqlite3

apps_json_path = r'd:\web project\multi app downloader\frontend\mock\apps.json'
db_path = r'd:\web project\multi app downloader\backend\appstore.db'

with open(apps_json_path, 'r', encoding='utf-8') as f:
    apps = json.load(f)

def search_domain(app_name):
    query = urllib.parse.quote(f"{app_name} official site")
    url = f"https://html.duckduckgo.com/html/?q={query}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=5) as response:
            html = response.read().decode('utf-8')
            match = re.search(r'class="result__url"[^>]*>\s*([^\s<]+)', html)
            if match:
                domain = match.group(1).strip()
                domain = re.sub(r'^https?://', '', domain)
                domain = domain.split('/')[0]
                return domain
    except Exception as e:
        print(f"Error searching {app_name}: {e}")
    return app_name.replace(' ', '').lower() + '.com'

print("Searching domains and updating icons...")
updated_count = 0

for app in apps:
    if 'icon.horse' in app.get('iconPlaceholder', ''):
        domain = search_domain(app['name'])
        app['iconPlaceholder'] = f"https://s2.googleusercontent.com/s2/favicons?domain={domain}&sz=128"
        print(f"Updated {app['name']} -> {domain}")
        updated_count += 1
        time.sleep(1)

if updated_count > 0:
    with open(apps_json_path, 'w', encoding='utf-8') as f:
        json.dump(apps, f, indent=2, ensure_ascii=False)
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        for app in apps:
            if 's2.googleusercontent.com' in app.get('iconPlaceholder', ''):
                cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE id = ?", (app['iconPlaceholder'], app['id']))
        conn.commit()
        conn.close()
    except Exception as e:
        print("DB error:", e)

print(f"Successfully updated {updated_count} logos!")

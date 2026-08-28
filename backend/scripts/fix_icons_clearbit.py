import json
import urllib.request
import urllib.parse
import sqlite3
import time

apps_json_path = r'd:\web project\multi app downloader\frontend\mock\apps.json'
db_path = r'd:\web project\multi app downloader\backend\appstore.db'

with open(apps_json_path, 'r', encoding='utf-8') as f:
    apps = json.load(f)

def search_clearbit(app_name, publisher):
    # Try searching by app name first
    query = urllib.parse.quote(app_name)
    url = f"https://autocomplete.clearbit.com/v1/companies/suggest?query={query}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode('utf-8'))
            if data and len(data) > 0:
                return data[0]['logo']
    except Exception:
        pass
        
    # If no results, try searching by publisher
    if publisher and publisher != app_name:
        query = urllib.parse.quote(publisher)
        url = f"https://autocomplete.clearbit.com/v1/companies/suggest?query={query}"
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=5) as response:
                data = json.loads(response.read().decode('utf-8'))
                if data and len(data) > 0:
                    return data[0]['logo']
        except Exception:
            pass
            
    # Fallback to Google Favicon with a best-guess domain
    guess_domain = app_name.replace(' ', '').lower() + '.com'
    return f"https://s2.googleusercontent.com/s2/favicons?domain={guess_domain}&sz=128"

print("Finding official logos via Clearbit...")
updated_count = 0

for app in apps:
    if 'icon.horse' in app.get('iconPlaceholder', ''):
        logo = search_clearbit(app['name'], app['publisher'])
        app['iconPlaceholder'] = logo
        print(f"Updated {app['name']} -> {logo}")
        updated_count += 1
        time.sleep(0.1)

if updated_count > 0:
    with open(apps_json_path, 'w', encoding='utf-8') as f:
        json.dump(apps, f, indent=2, ensure_ascii=False)
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        for app in apps:
            if 'icon.horse' not in app.get('iconPlaceholder', ''):
                cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE id = ?", (app['iconPlaceholder'], app['id']))
        conn.commit()
        conn.close()
    except Exception as e:
        print("DB error:", e)

print(f"Successfully updated {updated_count} logos!")

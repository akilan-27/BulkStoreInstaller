import sqlite3
import json
import re
import urllib.request
import urllib.error
import hashlib
import ssl
from concurrent.futures import ThreadPoolExecutor

MD_PATH = r'c:\Users\raaki\Downloads\bulk-installer-app-favicons-v2.md'
DB_PATH = r'd:\web project\multi app downloader\backend\appstore.db'
JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'

def parse_markdown():
    mapping = {}
    with open(MD_PATH, 'r', encoding='utf-8') as f:
        for line in f:
            if line.startswith('|') and not line.startswith('| # |') and not line.startswith('|---'):
                parts = [p.strip() for p in line.split('|')]
                if len(parts) >= 4:
                    app_name = parts[2]
                    url_part = parts[3]
                    # Extract URL from backticks or raw
                    url_match = re.search(r'`([^`]+)`', url_part)
                    if url_match:
                        url = url_match.group(1)
                    else:
                        url = url_part
                    mapping[app_name] = url
    return mapping

def update_db_and_json(mapping):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        apps = json.load(f)
        
    for app in apps:
        if app['name'] in mapping:
            app['iconPlaceholder'] = mapping[app['name']]
            cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE name = ?", (mapping[app['name']], app['name']))
            
    conn.commit()
    conn.close()
    
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(apps, f, indent=2, ensure_ascii=False)
        
    return apps

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    req = urllib.request.Request('https://www.google.com/s2/favicons?domain=this-domain-does-not-exist-12345.com&sz=128', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
        content = response.read()
        DEFAULT_HASH = hashlib.md5(content).hexdigest()
except:
    DEFAULT_HASH = None

def check_logo(app):
    url = app.get('iconPlaceholder')
    if not url:
        return app['name'], 'No URL'
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
            status = response.getcode()
            if status != 200:
                return app['name'], f'HTTP {status}'
            
            content = response.read()
            img_hash = hashlib.md5(content).hexdigest()
            
            if DEFAULT_HASH and img_hash == DEFAULT_HASH and ('googleusercontent' in url or 'google.com/s2' in url):
                return app['name'], 'Generic fallback (Hash match)'
            return None
    except Exception as e:
        return app['name'], str(e)

def main():
    mapping = parse_markdown()
    print(f"Parsed {len(mapping)} logos from markdown.")
    
    apps = update_db_and_json(mapping)
    print("Updated database and JSON.")
    
    print("Auditing all logos...")
    missing = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        results = executor.map(check_logo, apps)
        for res in results:
            if res:
                missing.append(res)
                print(f"Missing: {res[0]} - {res[1]}")
                
    with open('d:\\web project\\multi app downloader\\backend\\still_missing.json', 'w', encoding='utf-8') as f:
        json.dump(missing, f, indent=2)
        
    print(f"Audit complete. Found {len(missing)} still missing/broken logos.")

if __name__ == "__main__":
    main()

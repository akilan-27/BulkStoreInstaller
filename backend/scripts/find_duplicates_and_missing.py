import json
import urllib.request
import urllib.error
import hashlib
import ssl
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor

JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'

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
        return {'app': app['name'], 'status': 'no_url', 'hash': None, 'url': None}
    
    # If base64, hash it directly
    if url.startswith('data:image'):
        try:
            base64_data = url.split(',')[1]
            import base64
            content = base64.b64decode(base64_data)
            return {'app': app['name'], 'status': 'ok', 'hash': hashlib.md5(content).hexdigest(), 'url': url}
        except Exception as e:
            return {'app': app['name'], 'status': 'error', 'hash': None, 'url': url, 'error': str(e)}

    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            status = response.getcode()
            if status != 200:
                return {'app': app['name'], 'status': 'error', 'hash': None, 'url': url, 'error': f'HTTP {status}'}
            
            content = response.read()
            img_hash = hashlib.md5(content).hexdigest()
            
            if DEFAULT_HASH and img_hash == DEFAULT_HASH and ('googleusercontent' in url or 'google.com/s2' in url):
                return {'app': app['name'], 'status': 'missing_fallback', 'hash': img_hash, 'url': url}
                
            return {'app': app['name'], 'status': 'ok', 'hash': img_hash, 'url': url}
    except Exception as e:
        return {'app': app['name'], 'status': 'error', 'hash': None, 'url': url, 'error': str(e)}

def main():
    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        apps = json.load(f)
        
    print(f"Auditing {len(apps)} apps...")
    
    results = []
    with ThreadPoolExecutor(max_workers=20) as executor:
        for res in executor.map(check_logo, apps):
            results.append(res)
            
    missing_apps = []
    hash_groups = defaultdict(list)
    
    for res in results:
        if res['status'] in ['no_url', 'error', 'missing_fallback']:
            missing_apps.append(res['app'])
        elif res['status'] == 'ok':
            hash_groups[res['hash']].append(res)
            
    # Find duplicates
    duplicates = []
    for h, group in hash_groups.items():
        if len(group) > 1:
            duplicates.append([item['app'] for item in group])
            
    output = {
        "missing": missing_apps,
        "duplicates": duplicates
    }
    
    with open('d:\\web project\\multi app downloader\\backend\\audit_results.json', 'w', encoding='utf-8') as f:
        json.dump(output, f, indent=2)
        
    print(f"Audit complete. Found {len(missing_apps)} missing logos and {len(duplicates)} sets of duplicate logos.")

if __name__ == "__main__":
    main()

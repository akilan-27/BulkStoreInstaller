import json
import urllib.request
import urllib.error
import hashlib
import ssl
from concurrent.futures import ThreadPoolExecutor

APPS_JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'
MISSING_LOGOS_PATH = r'd:\web project\multi app downloader\backend\missing_logos.json'

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    req = urllib.request.Request('https://s2.googleusercontent.com/s2/favicons?domain=this-domain-does-not-exist-12345.com&sz=128', headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
        content = response.read()
        DEFAULT_HASH = hashlib.md5(content).hexdigest()
except urllib.error.HTTPError as e:
    DEFAULT_HASH = None
except Exception as e:
    DEFAULT_HASH = None

def check_logo(app):
    url = app.get('iconPlaceholder')
    if not url:
        return app['name'], 'No URL'
    
    if 's2.googleusercontent.com' in url or 'logo.clearbit.com' in url:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
                status = response.getcode()
                if status != 200:
                    return app['name'], f'HTTP {status}'
                
                content = response.read()
                img_hash = hashlib.md5(content).hexdigest()
                
                if DEFAULT_HASH and img_hash == DEFAULT_HASH:
                    return app['name'], 'Generic Globe Icon (Hash match)'
                
                return None
        except urllib.error.HTTPError as e:
            return app['name'], f'HTTP {e.code}'
        except Exception as e:
            return app['name'], str(e)
    else:
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ctx, timeout=5) as response:
                if response.getcode() != 200:
                    return app['name'], f'HTTP {response.getcode()}'
        except urllib.error.HTTPError as e:
            return app['name'], f'HTTP {e.code}'
        except Exception as e:
            return app['name'], str(e)
    
    return None

def main():
    with open(APPS_JSON_PATH, 'r', encoding='utf-8') as f:
        apps = json.load(f)
    
    print(f"Auditing {len(apps)} apps. Default hash: {DEFAULT_HASH}")
    
    broken_apps = []
    with ThreadPoolExecutor(max_workers=10) as executor:
        results = executor.map(check_logo, apps)
        for res in results:
            if res:
                broken_apps.append({'name': res[0], 'error': res[1]})
                print(f"Broken: {res[0]} - {res[1]}")
    
    with open(MISSING_LOGOS_PATH, 'w', encoding='utf-8') as f:
        json.dump(broken_apps, f, indent=2)
    
    print(f"Found {len(broken_apps)} broken logos. Saved to missing_logos.json.")

if __name__ == "__main__":
    main()

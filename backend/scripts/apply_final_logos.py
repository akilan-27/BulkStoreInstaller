import sqlite3
import json
import re
import urllib.request
import urllib.error
import hashlib
import ssl
from concurrent.futures import ThreadPoolExecutor

MD_TEXT = """
| App Name | Official Logo URL |
| :--- | :--- |
| **PuTTY** | `https://images-eds-ssl.xboxlive.com/image?url=4rt9.lXDC4H_93laV1_eHHFT949fUipzkiFOBH3fAiZZUCdYojwUyX2aTonS1aIwMrx6NUIsHfUHSLzjGJFxxrDCrF4C8KvxYUkHBppqZeaAHgtS.ICnnhnhe3lX0zv1SxVjkHhP1OzDXPQnBsn3EJQ9pIsOO89zmh3bNP4GJlk-&format=source&h=170` |
| **KeePassXC** | `https://raw.githubusercontent.com/keepassxreboot/keepassxc/develop/share/icons/application/128x128/keepassxc.png` |
| **PotPlayer** | `https://upload.wikimedia.org/wikipedia/commons/9/9d/PotPlayer_Icon.svg` |
| **Microsoft Office** | `https://upload.wikimedia.org/wikipedia/commons/a/a0/Microsoft_Office_Logo_%282019%29.png` |
| **SpaceSniffer** | `https://www.spacesniffer.com/favicon.ico` |
| **Mailspring** | `https://getmailspring.com/favicon.ico` |
| **Fluent Reader** | `https://raw.githubusercontent.com/yang991178/fluent-reader/master/build/icon.png` |
| **QuiteRSS** | `https://appstream.pureos.net/q/qu/quiterss.desktop/67381868facf27e4751cb87bdace3693/icons/128x128/quiterss_quiterss.png` |
| **GitHub Desktop** | `https://desktop.github.com/images/desktop-icon.svg` |
| **JetBrains Toolbox** | `https://resources.jetbrains.com/storage/products/toolbox/img/meta/toolbox_64x64.png` |
| **IntelliJ IDEA Community** | `https://github.com/JetBrains/intellij-community/raw/master/platform/icons/src/logo/idea_community_logo.png` |
| **PyCharm Community** | `https://upload.wikimedia.org/wikipedia/commons/1/1d/PyCharm_Icon.svg` |
| **NVM for Windows** | `https://raw.githubusercontent.com/coreybutler/nvm-windows/master/nvm.png` |
| **MusicBee** | `https://www.getmusicbee.com/favicon.ico` |
| **Clementine** | `https://github.com/clementine-player/Clementine/raw/master/data/icon.svg` |
| **MakeMKV** | `https://raw.githubusercontent.com/jlesage/docker-templates/master/jlesage/images/makemkv-icon.png` |
| **Avidemux** | `https://github.com/mean00/avidemux2/blob/master/avidemux_icon.png?raw=true` |
| **ThisIsWin11** | `https://raw.githubusercontent.com/builtbybel/ThisIsWin11/main/src/ThisIsWin11/Assets/thisiswin11.png` |
| **Mark Text** | `https://raw.githubusercontent.com/marktext/marktext/develop/static/icon.png` |
| **Ghostwriter** | `https://appstream.debian.org/bookworm/main/metainfo/g/gh/ghostwriter.desktop/dfb9551f010c2e41751265d77dee1d52/icons/128x128/ghostwriter_ghostwriter.png` |
| **SpeedCrunch** | `https://speedcrunch.org/gfx/speedcrunch.svg` |
| **Flow Launcher** | `https://user-images.githubusercontent.com/6903107/144858082-8b654daf-60fb-4ee6-89b2-6183b73510d1.png` |
| **Glary Utilities** | `https://www.glarysoft.com/favicon.ico` |
| **WampServer** | `https://www.wampserver.com/favicon.ico` |
| **scrcpy** | `https://raw.githubusercontent.com/Genymobile/scrcpy/master/app/data/icon.png` |
| **QtScrcpy** | `https://raw.githubusercontent.com/barry-ran/QtScrcpy/master/res/icon.png` |
| **ModernFlyouts** | `https://raw.githubusercontent.com/ModernFlyouts-Community/ModernFlyouts/main/ModernFlyouts/Assets/ModernFlyouts.png` |
"""

DB_PATH = r'd:\web project\multi app downloader\backend\appstore.db'
JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'

def parse_markdown():
    mapping = {}
    for line in MD_TEXT.strip().split('\n'):
        if line.startswith('|') and not line.startswith('| App Name') and not line.startswith('| :---'):
            parts = [p.strip() for p in line.split('|')]
            if len(parts) >= 3:
                app_name = parts[1].replace('**', '')
                url_part = parts[2]
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
    
    # We only care about checking the newly mapped 27 apps to see if the new URLs are broken
    # However, it's easier to check just the ones in `MD_TEXT` mapping
    # So we'll pass the mapping to filter below
    pass

def verify_new_urls(mapping):
    missing = []
    def check_url(item):
        name, url = item
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
                status = response.getcode()
                if status != 200:
                    return name, f'HTTP {status}'
        except Exception as e:
            return name, str(e)
        return None

    with ThreadPoolExecutor(max_workers=10) as executor:
        results = executor.map(check_url, mapping.items())
        for res in results:
            if res:
                missing.append(res)
    return missing

def main():
    mapping = parse_markdown()
    print(f"Parsed {len(mapping)} logos from markdown.")
    
    apps = update_db_and_json(mapping)
    print("Updated database and JSON.")
    
    print("Auditing new logos...")
    missing = verify_new_urls(mapping)
    for res in missing:
        print(f"Broken: {res[0]} - {res[1]}")
    print(f"Total remaining broken logos: {len(missing)}")

if __name__ == "__main__":
    main()

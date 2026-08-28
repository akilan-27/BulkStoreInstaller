import json

with open(r'd:\web project\multi app downloader\frontend\mock\apps.json', 'r', encoding='utf-8') as f:
    apps = json.load(f)

for app in apps:
    url = app.get('iconPlaceholder')
    if url:
        if 'simpleicons.org' in url or url.endswith('.svg') or 'githubusercontent.com' in url or 'insomnia.rest' in url or 'keepassxc.org' in url:
            print(f"{app['name']}: {url}")

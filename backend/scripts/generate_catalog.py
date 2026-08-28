import json
from collections import defaultdict
import os

JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'
OUTPUT_PATH = r'C:\Users\raaki\.gemini\antigravity-ide\brain\1d2fd362-84c2-45d4-90f8-8d2154c022e7\app_catalog.md'

with open(JSON_PATH, 'r', encoding='utf-8') as f:
    apps = json.load(f)

categories = defaultdict(list)
for app in apps:
    categories[app.get('category', 'Uncategorized')].append(app)

with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
    f.write('# App Catalog\n\n')
    f.write(f'This catalog currently contains **{len(apps)} applications**, organized by category.\n\n')

    for category in sorted(categories.keys()):
        f.write(f'## {category} ({len(categories[category])} apps)\n')
        f.write('| App Name | Publisher |\n')
        f.write('| :--- | :--- |\n')
        for app in sorted(categories[category], key=lambda x: x['name']):
            f.write(f'| **{app["name"]}** | {app["publisher"]} |\n')
        f.write('\n')

print(f'Successfully generated {OUTPUT_PATH}')

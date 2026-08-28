import json
import sqlite3

# Mapping of App Name to Logo URL
logo_map = {
    'ChatGPT': 'https://upload.wikimedia.org/wikipedia/commons/0/04/ChatGPT_logo.svg',
    'Claude': 'https://cdn.simpleicons.org/anthropic',
    'Google Gemini': 'https://upload.wikimedia.org/wikipedia/commons/8/8a/Google_Gemini_logo.svg',
    'Microsoft Copilot': 'https://cdn.simpleicons.org/microsoftcopilot',
    'Perplexity': 'https://cdn.simpleicons.org/perplexity',
    'LM Studio': 'https://avatars.githubusercontent.com/u/132035985?s=200&v=4',
    'Ollama': 'https://cdn.simpleicons.org/ollama',
    'AnythingLLM Desktop': 'https://raw.githubusercontent.com/Mintplex-Labs/anything-llm/master/frontend/public/favicon.ico',
    'Cursor': 'https://cdn.simpleicons.org/cursor',
    'Windsurf': 'https://avatars.githubusercontent.com/u/120281699?s=200&v=4',
    'Cline': 'https://avatars.githubusercontent.com/u/173000624?s=200&v=4'
}

JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'
DB_PATH = r'd:\web project\multi app downloader\backend\appstore.db'

# 1. Update JSON
with open(JSON_PATH, 'r', encoding='utf-8') as f:
    apps = json.load(f)

for app in apps:
    # Rename category
    if app.get('category') == '🤖 AI & AI Assistants':
        app['category'] = 'AI & AI Assistants'
    
    # Update logo
    if app.get('name') in logo_map:
        app['iconPlaceholder'] = logo_map[app['name']]

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(apps, f, indent=2, ensure_ascii=False)

# 2. Update DB
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Rename category
cursor.execute("UPDATE app SET category = 'AI & AI Assistants' WHERE category = '🤖 AI & AI Assistants'")

# Update logos
for name, url in logo_map.items():
    cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE name = ?", (url, name))

conn.commit()
conn.close()

print("Successfully renamed category and updated logos.")

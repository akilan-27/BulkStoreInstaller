import json
import sqlite3

apps_to_add = [
    {"name": "ChatGPT", "publisher": "OpenAI", "wingetId": "OpenAI.ChatGPT"},
    {"name": "Claude", "publisher": "Anthropic", "wingetId": "Anthropic.Claude"},
    {"name": "Google Gemini", "publisher": "Google", "wingetId": "Google.Gemini"},
    {"name": "Microsoft Copilot", "publisher": "Microsoft", "wingetId": "Microsoft.Copilot"},
    {"name": "Perplexity", "publisher": "Perplexity", "wingetId": "Perplexity.Perplexity"},
    {"name": "LM Studio", "publisher": "LM Studio", "wingetId": "LMStudio.LMStudio"},
    {"name": "Ollama", "publisher": "Ollama", "wingetId": "Ollama.Ollama"},
    {"name": "AnythingLLM Desktop", "publisher": "Mintplex Labs", "wingetId": "MintplexLabs.AnythingLLMDesktop"},
    {"name": "Cursor", "publisher": "Anysphere", "wingetId": "Anysphere.Cursor"},
    {"name": "Windsurf", "publisher": "Codeium", "wingetId": "Codeium.Windsurf"},
    {"name": "Cline", "publisher": "Cline", "wingetId": "Cline.Cline"},
    {"name": "antigravity", "publisher": "antigravity IDE", "wingetId": "antigravityIDE.antigravity"}
]

CATEGORY = "🤖 AI & AI Assistants"

JSON_PATH = r'd:\web project\multi app downloader\frontend\mock\apps.json'
DB_PATH = r'd:\web project\multi app downloader\backend\appstore.db'

# Update JSON
with open(JSON_PATH, 'r', encoding='utf-8') as f:
    existing_apps = json.load(f)

# find highest id
max_id = 0
for app in existing_apps:
    if app['id'].startswith('app-'):
        try:
            num = int(app['id'].split('-')[1])
            max_id = max(max_id, num)
        except ValueError:
            pass

next_id = max_id + 1
new_app_entries = []

for new_app in apps_to_add:
    app_id = f"app-{next_id}"
    next_id += 1
    app_obj = {
        "id": app_id,
        "name": new_app["name"],
        "publisher": new_app["publisher"],
        "category": CATEGORY,
        "description": f"AI Assistant by {new_app['publisher']}",
        "wingetId": new_app["wingetId"],
        "iconPlaceholder": None,
        "verified": True
    }
    existing_apps.append(app_obj)
    new_app_entries.append(app_obj)

with open(JSON_PATH, 'w', encoding='utf-8') as f:
    json.dump(existing_apps, f, indent=2, ensure_ascii=False)

# Update DB
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

for app in new_app_entries:
    cursor.execute('''
        INSERT INTO app (id, wingetId, name, publisher, description, category, iconPlaceholder)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (app['id'], app['wingetId'], app['name'], app['publisher'], app['description'], app['category'], app['iconPlaceholder']))

conn.commit()
conn.close()

print(f"Successfully added {len(new_app_entries)} apps to the database and JSON.")

import json
import sqlite3

with open('../frontend/mock/apps.json', 'r', encoding='utf-8') as f:
    apps = json.load(f)

conn = sqlite3.connect('appstore.db')
cursor = conn.cursor()

for app in apps:
    cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE id = ?", (app.get('iconPlaceholder'), app.get('id')))

conn.commit()
conn.close()
print("Icons updated successfully!")

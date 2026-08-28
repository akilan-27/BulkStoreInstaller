import sqlite3
conn = sqlite3.connect('appstore.db')
cursor = conn.cursor()
cursor.execute("SELECT id, name, iconPlaceholder FROM app WHERE name LIKE '%Bleach%'")
print(cursor.fetchall())

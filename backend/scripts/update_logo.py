import sqlite3
import time

conn = sqlite3.connect('appstore.db')
cursor = conn.cursor()
ts = int(time.time())
new_url = f"http://localhost:8000/static/logos/app-219.png?v={ts}"
cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE id = 'app-219'", (new_url,))
conn.commit()
print("Updated BleachBit logo URL to:", new_url)

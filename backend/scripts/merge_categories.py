import sqlite3
import json
import os

DB_PATH = "appstore.db"
JSON_PATH = "../frontend/mock/apps.json"

MAPPING = {
    "Browsers & Internet": ["Browsers", "Browser Extensions & Tools", "RSS & News Readers"],
    "Communication": ["Communication", "Communication (Additional)", "Email Clients"],
    "Media & Audio": ["Audio & Music Tools", "Audio Configuration", "Media", "Streaming & Recording", "Video Tools"],
    "Design & Photography": ["Color & Design Utilities", "Design", "Icon & Font Tools", "Image Viewers & Photo Tools"],
    "Developer Tools": ["Developer Tools", "Developer Tools & IDEs", "Web Development Servers", "Virtualization & Containers", "Database Tools"],
    "Productivity & Office": ["Productivity", "Clipboard & Productivity", "Calendar & Planning", "Office Suites & PDF", "Printing & PDF Creation", "Writing & Markdown", "Diagramming & Whiteboarding"],
    "Cloud & Storage": ["Cloud Storage & Sync", "Backup & Recovery", "Compression & Archiving"],
    "Security & Privacy": ["Security & Privacy", "Password Managers"],
    "Gaming": ["Gaming", "Gaming Tools"],
    "Education, Science & Devices": ["Education & Reference", "Scientific & Engineering", "Finance", "Mobile Device Tools"],
    "Utilities & System": ["Utilities", "Miscellaneous Utilities", "System Utilities & Hardware Monitoring", "Windows Enhancement Tools", "Cleaning & Maintenance", "Network & Remote Access", "File Management & Search", "Calculators & Math", "Search & Launchers", "Screenshot & Screen Tools"]
}

# Reverse mapping for O(1) lookup
REVERSE_MAP = {}
for new_cat, old_cats in MAPPING.items():
    for old_cat in old_cats:
        REVERSE_MAP[old_cat.lower()] = new_cat

def update_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT id, category FROM app")
    rows = cursor.fetchall()
    
    updates = 0
    for app_id, old_cat in rows:
        old_lower = (old_cat or "").lower()
        new_cat = REVERSE_MAP.get(old_lower)
        if not new_cat:
            # Fallback to Utilities & System if not mapped
            new_cat = "Utilities & System"
        
        if new_cat != old_cat:
            cursor.execute("UPDATE app SET category = ? WHERE id = ?", (new_cat, app_id))
            updates += 1
            
    conn.commit()
    conn.close()
    print(f"Updated {updates} rows in database.")

def regenerate_json():
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        apps_data = json.load(f)
        
    for app in apps_data:
        old_lower = (app.get("category") or "").lower()
        new_cat = REVERSE_MAP.get(old_lower)
        if not new_cat:
            new_cat = "Utilities & System"
        app["category"] = new_cat
        
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(apps_data, f, indent=2, ensure_ascii=False)
        
    print(f"Regenerated {JSON_PATH} with {len(apps_data)} apps.")

if __name__ == "__main__":
    print("Updating categories in database...")
    update_db()
    print("Regenerating JSON...")
    regenerate_json()
    print("Done!")

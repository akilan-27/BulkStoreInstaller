import sqlite3
import json

DB_PATH = "appstore.db"
JSON_PATH = "../frontend/mock/apps.json"

DOMAIN_MAPPING = {
    "Adobe Acrobat Reader": "adobe.com",
    "Anki": "ankiweb.net",
    "Apache NetBeans": "netbeans.apache.org",
    "Apache OpenOffice": "openoffice.org",
    "Autoruns": "microsoft.com",
    "Avidemux": "avidemux.org",
    "Azure Data Studio": "microsoft.com",
    "Battle.net": "battle.net",
    "Bullzip PDF Printer": "bullzip.com",
    "Calibre": "calibre-ebook.com",
    "Clementine": "clementine-player.org",
    "Cobian Backup": "cobiansoft.com",
    "CrystalDiskInfo": "crystalmark.info",
    "Double Commander": "doublecmd.sourceforge.io",
    "GeoGebra": "geogebra.org",
    "GitHub Desktop": "github.com",
    "IntelliJ IDEA Community": "jetbrains.com",
    "JetBrains Toolbox": "jetbrains.com",
    "KiCad": "kicad.org",
    "Lucidchart": "lucidchart.com",
    "Microsoft Office": "microsoft.com",
    "MSI Afterburner": "msi.com",
    "Nmap": "nmap.org",
    "Notepad++": "notepad-plus-plus.org",
    "Parsec": "parsec.app",
    "PeaZip": "peazip.github.io",
    "PyCharm Community": "jetbrains.com",
    "QtScrcpy": "github.com",
    "RawTherapee": "rawtherapee.com",
    "Shotcut": "shotcut.org",
    "VB-Cable": "vb-audio.com",
    "WizTree": "diskanalyzer.com",
    "qBittorrent": "qbittorrent.org"
}

def get_logo_url(domain):
    return f"https://s2.googleusercontent.com/s2/favicons?domain={domain}&sz=128"

def update_logos():
    # 1. Update SQLite DB
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    updates = 0
    for app_name, domain in DOMAIN_MAPPING.items():
        new_url = get_logo_url(domain)
        # We also try Clearbit for better quality if it's a major domain
        if domain in ["adobe.com", "microsoft.com", "battle.net", "lucidchart.com", "github.com", "jetbrains.com"]:
            new_url = f"https://logo.clearbit.com/{domain}"
            
        cursor.execute("UPDATE app SET iconPlaceholder = ? WHERE name = ?", (new_url, app_name))
        updates += cursor.rowcount
        
    conn.commit()
    print(f"Updated {updates} rows in database.")
    
    # 2. Update apps.json directly to preserve other fields
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        apps_data = json.load(f)
        
    json_updates = 0
    for app in apps_data:
        if app["name"] in DOMAIN_MAPPING:
            domain = DOMAIN_MAPPING[app["name"]]
            new_url = get_logo_url(domain)
            if domain in ["adobe.com", "microsoft.com", "battle.net", "lucidchart.com", "github.com", "jetbrains.com"]:
                new_url = f"https://logo.clearbit.com/{domain}"
            
            app["iconPlaceholder"] = new_url
            json_updates += 1
            
    with open(JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(apps_data, f, indent=2, ensure_ascii=False)
        
    print(f"Regenerated {JSON_PATH}, updated {json_updates} logos.")
    conn.close()

if __name__ == "__main__":
    update_logos()
    print("Done!")

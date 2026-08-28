import json
import sqlite3
import subprocess
import time
from concurrent.futures import ThreadPoolExecutor

json_path = r'd:\web project\multi app downloader\frontend\mock\apps.json'
db_path = r'd:\web project\multi app downloader\backend\appstore.db'

def check_winget(app):
    winget_id = app.get('wingetId')
    if not winget_id:
        return app, False
    
    try:
        cmd = ["winget", "show", "--id", winget_id, "--exact", "--accept-source-agreements"]
        result = subprocess.run(cmd, capture_output=True, text=True, errors='ignore', creationflags=subprocess.CREATE_NO_WINDOW)
        return app, result.returncode == 0
    except Exception:
        return app, False

if __name__ == "__main__":
    start_time = time.time()
    
    with open(json_path, 'r', encoding='utf-8') as f:
        apps = json.load(f)
        
    print(f"Loaded {len(apps)} apps. Validating winget IDs...")
    
    valid_apps = []
    invalid_apps = []
    
    with ThreadPoolExecutor(max_workers=25) as executor:
        results = list(executor.map(check_winget, apps))
        
    for app, is_valid in results:
        if is_valid:
            valid_apps.append(app)
        else:
            invalid_apps.append(app)
            
    print(f"Validation complete in {time.time() - start_time:.2f} seconds.")
    print(f"Found {len(invalid_apps)} invalid apps.")
    for ia in invalid_apps:
        print(f" - {ia['name']} ({ia.get('wingetId')})")
        
    if not invalid_apps:
        print("All apps are valid. Exiting.")
        exit(0)
        
    print("Updating apps.json...")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(valid_apps, f, indent=2)
        
    print("Updating appstore.db...")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    
    for ia in invalid_apps:
        c.execute("DELETE FROM app WHERE id = ?", (ia['id'],))
        
    conn.commit()
    conn.close()
    
    print("Successfully pruned invalid apps!")

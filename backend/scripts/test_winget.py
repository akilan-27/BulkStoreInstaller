import subprocess
import time

def check_winget(winget_id):
    try:
        # --accept-source-agreements is useful to prevent prompts
        cmd = ["winget", "show", "--id", winget_id, "--exact", "--accept-source-agreements"]
        # Use CREATE_NO_WINDOW to avoid popping up windows if run in background
        result = subprocess.run(cmd, capture_output=True, text=True, creationflags=subprocess.CREATE_NO_WINDOW)
        return result.returncode == 0
    except Exception as e:
        return False

start = time.time()
print("Valid:", check_winget("Mozilla.Firefox"))
print("Invalid:", check_winget("Cline.Cline"))
print(f"Took {time.time() - start:.2f} seconds")

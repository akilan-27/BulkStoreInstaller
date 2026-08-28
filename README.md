# Multi App Downloader

A premium web application for downloading and installing multiple Windows applications simultaneously using the BulkStoreInstaller Companion.

## Project Structure

- **frontend/**: The Next.js web application for browsing and selecting apps.
- **backend/**: Python FastApi backend. Includes maintenance scripts in `backend/scripts/`.
- **companion/**: Source code for the locally installed C# companion tool that runs Winget.

## Getting Started

### 1. Web Application (Frontend & Backend)
Rename `.env.example` to `.env` and fill in any required variables.

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 2. Windows Companion
To actually download and install applications on your Windows machine, you must run the local companion application.
Download the latest `BulkStoreInstallerCompanionSetup.exe` from the [GitHub Releases](../../releases) page and install it.

## License
MIT License

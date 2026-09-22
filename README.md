<div align="center">

<img src="https://raw.githubusercontent.com/akilan-27/BulkStoreInstaller/main/frontend/app/icon.png" alt="BulkStoreInstaller Logo" width="96" />

# BulkStoreInstaller

### Browse once. Select multiple apps. Install them through Winget.

A modern Windows application discovery and bulk-installation platform built with **Next.js**, **FastAPI**, and a local **.NET Windows Bridge**.

[![Live Demo](https://img.shields.io/badge/Live_Demo-bulk--store--installer.vercel.app-000000?style=for-the-badge&logo=vercel)](https://bulk-store-installer.vercel.app/)
[![GitHub Release](https://img.shields.io/badge/Bridge-v1.2.0-2ea44f?style=for-the-badge&logo=github)](https://github.com/akilan-27/BulkStoreInstaller/releases/tag/1.2.0)
[![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)](LICENSE)

</div>

---

## Overview

**BulkStoreInstaller** is a hybrid web + Windows desktop project designed to make setting up a Windows PC faster and easier.

Instead of visiting multiple websites, downloading installers one by one, and manually launching every setup file, users can browse a curated application catalog in the web interface, add the applications they want to a cart, and start a batch installation.

The web application does **not** directly execute Windows commands. Installation is handled by a lightweight local Windows application called **BulkStoreInstaller Bridge**. The bridge runs on the user's computer, listens only on the local machine, validates requested applications against its bundled catalog, and executes the corresponding packages through Microsoft's **Windows Package Manager (`winget`)**.

The project is therefore split into three major parts:

1. **Next.js frontend** — application catalog, search, categories, cart, installation UI, feedback/reporting, and communication with the local bridge.
2. **FastAPI backend** — application catalog API, categories, search, bundles, database models, and catalog seeding.
3. **Windows Bridge** — local .NET tray application that checks installed applications, executes Winget installations, tracks progress, and supports cancellation.

> **Live application:** https://bulk-store-installer.vercel.app/  
> **Repository:** https://github.com/akilan-27/BulkStoreInstaller

---

## Why BulkStoreInstaller?

Setting up a new Windows computer often means repeating the same workflow:

- search for each application,
- make sure the download source is correct,
- download installers individually,
- open each installer,
- wait for each installation,
- repeat.

BulkStoreInstaller turns that workflow into a single application-selection experience.

Users choose the software they need from one interface, and the local bridge converts that selection into validated Winget installation jobs.

The project is especially useful for:

- new Windows PC setup,
- developer workstation setup,
- student/lab computer preparation,
- restoring commonly used applications,
- creating reusable collections of software,
- demonstrating secure communication between a web application and a native Windows process.

---

## Key Features

### Application discovery

- Browse a curated Windows application catalog.
- Filter applications by category.
- Sort application results.
- Search applications by name, publisher, or description.
- Responsive application-card layout.
- Progressive rendering for larger catalogs.
- Skeleton loading states and empty-result handling.

### Multi-app cart

- Add multiple applications to a cart before installation.
- Remove applications before starting the job.
- Keep the installation workflow separate from normal browsing.
- Review selected applications before sending them to the bridge.

### Installed-app detection

When the Windows Bridge is connected, BulkStoreInstaller can compare the catalog against software already installed on the computer.

The bridge uses:

```bash
winget list --accept-source-agreements
```

and maps discovered Winget package IDs back to the applications displayed in the web interface.

Installed-app results are cached briefly by the bridge to avoid repeatedly running `winget list`.

### Local Windows installation bridge

The Windows Bridge:

- runs as a Windows tray application,
- listens on `127.0.0.1:4545`,
- maintains a single active installation job,
- validates app IDs and Winget IDs against a bundled catalog,
- executes Winget locally,
- tracks application state,
- parses Winget output,
- exposes installation status to the frontend,
- supports cancellation,
- refreshes installed-app information when a job completes.

### Real installation stages

BulkStoreInstaller does not rely entirely on fake timer-based installation progress.

The bridge parses Winget output and maps it into stages such as:

```text
Preparing → Downloading → Installing → Verifying → Completed
```

When Winget provides percentage output, the bridge also captures the reported percentage.

### Sequential installation queue

Users can select many applications in one batch, but the Windows Bridge processes the installation queue **sequentially**.

This keeps the process easier to track and avoids launching many installers at the same time.

Each item can be represented as:

```text
Pending
Installing
Success
Failed
Cancelled
```

### Cancellation and retry support

The frontend can request cancellation of an active job.

The bridge then:

- cancels the job token,
- stops the active Winget process when possible,
- marks pending/active items as cancelled,
- preserves already completed installations.

The frontend also contains logic for retrying failed items.

### Companion/Bridge status handling

The frontend understands multiple bridge states, including:

- checking,
- connected,
- offline,
- timed out,
- version mismatch,
- Winget unavailable,
- unauthorized,
- configuration error.

This allows the UI to guide the user instead of silently failing when the native bridge is unavailable.

### Feedback and reporting

The Next.js application contains a server-side report endpoint powered by **Resend**.

It supports project feedback such as:

- missing application reports,
- bug reports,
- feature suggestions,
- security reports,
- other feedback.

Basic in-memory request rate limiting is included in the current implementation.

### Mock and API modes

The frontend can run without a live backend by using local mock data.

This is useful for:

- UI development,
- demos,
- Vercel previews,
- frontend testing.

When mock mode is disabled, the frontend communicates with the FastAPI backend.

---

## How It Works

```mermaid
flowchart LR
    U[User] --> W[Next.js Web App]

    W --> C[Application Catalog / Cart]
    C --> B[Local Windows Bridge<br/>127.0.0.1:4545]

    B --> V[Catalog Validation]
    V --> Q[Installation Queue]
    Q --> G[Winget]
    G --> A[Installed Windows Apps]

    B --> S[Status / Progress / Installed-App Check]
    S --> W

    W --> API[FastAPI Backend]
    API --> DB[(SQLite / PostgreSQL)]

    W --> R[Next.js Report API]
    R --> E[Resend]

    W --> D[Bridge Download API]
    D --> GH[GitHub Release]
```

### Installation flow

```text
1. User opens BulkStoreInstaller.
2. User browses or searches for applications.
3. User adds applications to the cart.
4. Frontend checks whether the Windows Bridge is available.
5. Selected app IDs and Winget IDs are sent to the local bridge.
6. Bridge validates every requested application against catalog.json.
7. Bridge creates an installation job.
8. Applications are processed one by one.
9. Bridge runs Winget with the validated package ID.
10. Winget output is parsed into status/progress information.
11. Frontend polls the bridge while the job is active.
12. Installed-app information is refreshed when installation completes.
```

---

## Architecture

### 1. Frontend

The frontend is located in:

```text
frontend/
```

It is built using the **Next.js App Router** and React.

Main responsibilities:

- application browsing,
- categories,
- sorting,
- search,
- cart state,
- theme handling,
- application installation UI,
- bridge health checks,
- installed-app verification,
- installation progress polling,
- feedback/report submission,
- download redirection for the Windows Bridge.

Important frontend areas:

```text
frontend/
├── app/
│   ├── api/
│   │   ├── download/bridge/
│   │   └── report/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── cards/
│   ├── dialogs/
│   ├── feedback/
│   ├── inputs/
│   ├── layout/
│   ├── navigation/
│   ├── providers/
│   └── ui/
├── constants/
├── contexts/
├── hooks/
├── lib/
│   ├── bridge/
│   └── companion/
├── mock/
├── services/
└── types/
```

The project uses **TanStack Query** for asynchronous state and polling, including:

- application data,
- bridge health,
- installed apps,
- installation status.

---

### 2. FastAPI backend

The backend is located in:

```text
backend/
```

It provides API support for the application catalog.

Core technologies:

- FastAPI
- Uvicorn
- SQLModel
- Pydantic
- HTTPX
- APScheduler
- SQLite by default
- PostgreSQL-compatible configuration through `DATABASE_URL`

Main API areas include:

```text
/api/apps
/api/categories
/api/search
/api/bundles
/api/health
```

The database contains models for:

- applications,
- bundles,
- application-to-bundle relationships.

When the backend starts, it creates the required database tables and seeds the application catalog if the database is empty.

For local development, the default database is:

```text
sqlite:///./appstore.db
```

A production database can be supplied using:

```text
DATABASE_URL
```

---

### 3. Windows Bridge

The native bridge is located in:

```text
windows-bridge/
```

The current bridge is a self-contained **.NET 10 Windows x64** application.

It uses:

- Windows Forms for tray integration,
- ASP.NET Core/Kestrel for the localhost HTTP service,
- Winget for package installation,
- Inno Setup for creating the Windows installer.

The project is configured as:

```text
Target framework: net10.0-windows
Runtime: win-x64
Self-contained: true
Single-file publishing: true
```

Because the bridge is self-contained, users do not need to separately install the .NET runtime for the packaged release.

The bridge installer places the application under the current user's local application directory and adds an HKCU startup entry so the bridge can start when the user signs in.

---

## Windows Bridge API

The bridge listens locally on:

```text
http://127.0.0.1:4545
```

### `GET /health`

Used by the frontend to determine whether the bridge is running.

Example response shape:

```json
{
  "ready": true,
  "service": "BulkStoreInstaller.Bridge",
  "bridgeVersion": "1.0.0",
  "apiVersion": "1",
  "wingetAvailable": true,
  "activeJob": false
}
```

### `POST /verify`

Receives application IDs and Winget IDs and compares them against applications detected by `winget list`.

### `POST /install`

Creates a new installation job after validating the requested application IDs against the bridge catalog.

Only one active installation job is allowed at a time.

### `GET /status`

Returns the current installation queue and job progress.

### `POST /cancel`

Requests cancellation of the current installation job.

> Protected bridge endpoints expect the `X-BulkStoreInstaller-Client: web-v1` request header.

---

## Winget Execution

For each validated application, the bridge executes a command equivalent to:

```bash
winget install \
  --id <PACKAGE_ID> \
  --exact \
  --accept-package-agreements \
  --accept-source-agreements \
  --disable-interactivity
```

The package ID is supplied through `ProcessStartInfo.ArgumentList` rather than by constructing a raw shell command string.

This reduces the risk of command-line injection and ensures the bridge only passes structured arguments to Winget.

Before a package can enter the installation queue, the submitted application ID and Winget ID must match an entry inside the bridge's bundled:

```text
Assets/catalog.json
```

This prevents the `/install` endpoint from being used as a general-purpose arbitrary command executor.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 15 |
| UI runtime | React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS 4 |
| Components | shadcn/ui / Base UI |
| Animation | Framer Motion |
| Smooth scrolling | Lenis |
| Icons | Lucide React |
| Async state | TanStack Query |
| Forms | React Hook Form + Zod |
| Theme | next-themes / custom theme context |
| Frontend hosting | Vercel |
| Frontend server routes | Next.js Route Handlers |
| Email/reporting | Resend |
| Backend | FastAPI |
| Backend language | Python |
| ORM/models | SQLModel |
| Local database | SQLite |
| Production DB support | PostgreSQL |
| Native bridge | .NET 10 / C# |
| Bridge server | ASP.NET Core Kestrel |
| Desktop integration | Windows Forms system tray |
| Package manager | Microsoft Winget |
| Windows installer | Inno Setup |

---

## Current Release

### Windows Bridge v1.2.0

The current published bridge release is:

```text
Version: 1.2.0
Asset: BulkStoreInstallerBridgeSetup.exe
Platform: Windows x64
```

Release page:

https://github.com/akilan-27/BulkStoreInstaller/releases/tag/1.2.0

SHA-256 for the v1.2.0 installer asset:

```text
858de0cf33ebf30ebdec3e8a801a78eba528eaac24f9c66cb7fd7d819bb8ef56
```

Users can compare this checksum with the downloaded installer when they want to verify file integrity.

---

## Requirements

### For normal users

You need:

- Windows,
- Winget / Windows Package Manager,
- a modern web browser,
- BulkStoreInstaller Bridge.

The packaged bridge is self-contained.

### For frontend development

Recommended:

```text
Node.js 20+
npm
Git
```

### For backend development

Recommended:

```text
Python 3.10+
pip
```

### For bridge development

Required:

```text
Windows
.NET 10 SDK
Winget
```

To create the `.exe` installer package, install **Inno Setup** as well.

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/akilan-27/BulkStoreInstaller.git
cd BulkStoreInstaller
```

---

## Frontend Setup

Move into the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create:

```text
frontend/.env.local
```

A typical local configuration is:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_USE_MOCK=true

# Used by the Next.js bridge download route
BRIDGE_DOWNLOAD_URL=https://github.com/akilan-27/BulkStoreInstaller/releases/download/1.2.0/BulkStoreInstallerBridgeSetup.exe

# Optional: required for real report-email delivery
RESEND_API_KEY=
```

Run development mode:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

### Frontend scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
```

> The repository's root `.env.example` also contains `NEXT_PUBLIC_COMPANION_URL`. The current bridge client implementation itself uses the fixed loopback address `http://127.0.0.1:4545`, so changing that environment variable alone does not currently change the bridge endpoint.

---

## Backend Setup

Open another terminal:

```bash
cd backend
```

Create a virtual environment:

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

### macOS/Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run FastAPI:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Health endpoint:

```text
http://127.0.0.1:8000/api/health
```

Interactive FastAPI documentation is normally available at:

```text
http://127.0.0.1:8000/docs
```

To use a different database:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

If `DATABASE_URL` is not provided, SQLite is used.

---

## Windows Bridge Development

Move to the bridge project:

```bash
cd windows-bridge/src/BulkStoreInstaller.Bridge
```

Restore/build:

```bash
dotnet restore
dotnet build -c Release
```

Run the bridge during development:

```bash
dotnet run
```

The local server should become available at:

```text
http://127.0.0.1:4545/health
```

### Publish the Windows Bridge

```bash
dotnet publish -c Release -r win-x64 --self-contained true
```

The project is configured for self-contained single-file publishing.

### Build the installer

The Inno Setup script is located at:

```text
windows-bridge/installer/BulkStoreInstallerBridge.iss
```

After publishing the bridge, compile the `.iss` script with Inno Setup.

The generated installer is configured as:

```text
BulkStoreInstallerBridgeSetup.exe
```

and is written to:

```text
windows-bridge/dist/
```

---

## Environment Variables

| Variable | Scope | Purpose |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend | FastAPI base URL |
| `NEXT_PUBLIC_USE_MOCK` | Frontend | Enables local mock catalog data |
| `NEXT_PUBLIC_COMPANION_URL` | Frontend config | Intended bridge URL configuration; current bridge client uses fixed loopback `127.0.0.1:4545` |
| `BRIDGE_DOWNLOAD_URL` | Next.js server | Target installer URL for `/api/download/bridge` |
| `RESEND_API_KEY` | Next.js server | Enables report emails through Resend |
| `DATABASE_URL` | FastAPI backend | Overrides the default SQLite database |

Never commit real secrets or production credentials to Git.

---

## Deployment

### Frontend — Vercel

The live frontend is deployed at:

https://bulk-store-installer.vercel.app/

For a Vercel deployment, use the `frontend` directory as the application root when necessary.

Recommended environment configuration depends on the deployment mode.

### Frontend-only / demo mode

```env
NEXT_PUBLIC_USE_MOCK=true
```

This allows catalog browsing without a separately deployed FastAPI service.

The local Windows Bridge can still handle installations.

### Full backend mode

```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=https://your-backend.example.com
```

Also configure:

```env
BRIDGE_DOWNLOAD_URL=<published bridge installer URL>
RESEND_API_KEY=<server-side Resend key>
```

### Backend

The backend contains both:

```text
Dockerfile
docker-compose.yml
```

so it can be containerized for deployment.

When exposing the backend publicly, configure production-safe CORS rules and a production database.

---

## Bridge Download Routing

The frontend provides:

```text
GET /api/download/bridge
```

This route reads the server-side:

```text
BRIDGE_DOWNLOAD_URL
```

and returns a temporary `307` redirect.

This means the website can keep a stable download button while the actual GitHub Release asset changes between versions.

When a new bridge release is published, the deployment can update `BRIDGE_DOWNLOAD_URL` without changing frontend UI code.

---

## Reporting API

The project includes:

```text
POST /api/report
```

The endpoint:

1. accepts report details,
2. performs basic validation,
3. applies a lightweight per-IP in-memory rate limit,
4. formats the report as HTML,
5. sends it through Resend when `RESEND_API_KEY` is configured.

If the key is missing, the current development implementation simulates a successful submission rather than sending an email.

For a larger production deployment, persistent rate limiting using Redis, Vercel KV, or a database would be more appropriate than process-local memory.

---

## Project Structure

```text
BulkStoreInstaller/
│
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
│
├── frontend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── download/
│   │   │   │   └── bridge/
│   │   │   └── report/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── components/
│   ├── constants/
│   ├── contexts/
│   ├── hooks/
│   │   ├── useApps.ts
│   │   ├── useCompanion.ts
│   │   ├── useInstall.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   └── useSearch.ts
│   │
│   ├── lib/
│   │   └── bridge/
│   │       └── client.ts
│   │
│   ├── mock/
│   ├── services/
│   ├── types/
│   ├── package.json
│   └── next.config.ts
│
├── backend/
│   ├── app/
│   │   ├── database.py
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── routers/
│   │   │   ├── apps.py
│   │   │   ├── bundles.py
│   │   │   ├── categories.py
│   │   │   └── search.py
│   │   └── services/
│   │       └── winget_sync.py
│   │
│   ├── scripts/
│   ├── static/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── requirements.txt
│
└── windows-bridge/
    ├── dist/
    ├── installer/
    │   └── BulkStoreInstallerBridge.iss
    │
    └── src/
        └── BulkStoreInstaller.Bridge/
            ├── Assets/
            │   └── catalog.json
            ├── Models/
            ├── Services/
            │   ├── CatalogService.cs
            │   ├── InstallQueueService.cs
            │   ├── InstalledAppsService.cs
            │   ├── ProcessRunner.cs
            │   └── WingetOutputParser.cs
            ├── BridgeServer.cs
            ├── Program.cs
            └── BulkStoreInstaller.Bridge.csproj
```

---

## Security Model

BulkStoreInstaller intentionally separates the web interface from native execution.

### Loopback-only bridge

Kestrel listens on localhost port `4545` instead of exposing the bridge as a normal LAN/public server.

### Host validation

The bridge accepts requests intended for:

```text
127.0.0.1:4545
localhost:4545
```

### Catalog allowlist

The browser cannot submit an arbitrary executable command to `/install`.

Before installing an application, the bridge checks whether both:

```text
application ID
Winget package ID
```

match a known entry in the bundled catalog.

### Structured process arguments

Winget arguments are supplied using `.ArgumentList`, avoiding raw concatenated shell command execution.

### Client marker

Protected bridge operations require:

```text
X-BulkStoreInstaller-Client: web-v1
```

### Current hardening note

The current bridge CORS configuration allows browser origins broadly, and the FastAPI development configuration also uses permissive CORS.

For a hardened production release, allowed web origins should be explicitly restricted to trusted BulkStoreInstaller domains.

The static client-marker header should be treated as a request-identification mechanism, **not** as a secret authentication token.

---

## Privacy

The Windows installation process happens locally.

The bridge uses local Winget commands to:

- inspect installed package IDs,
- install selected package IDs,
- report job status back to the browser page.

The project does not need to upload a complete list of locally installed software to the FastAPI backend in order to perform the normal installed-app comparison shown in the current bridge flow.

Feedback submitted through the report form may be sent through Resend when email delivery is configured.

---

## Troubleshooting

### Website says the Bridge is offline

Check that **BulkStoreInstaller Bridge** is running in the Windows system tray.

Then open:

```text
http://127.0.0.1:4545/health
```

A running bridge should return JSON.

If it does not:

- restart the bridge,
- check whether another application is using port `4545`,
- check browser/private-network restrictions,
- reinstall the latest bridge release.

### Winget is not available

Open PowerShell or Command Prompt and run:

```bash
winget --version
```

If Windows cannot find Winget, install or repair Microsoft's **App Installer / Windows Package Manager** before using the installation feature.

### An application is already installed

The bridge attempts to detect installed Winget IDs.

Some Winget exit codes indicating an already-installed or already-current package are also handled as successful outcomes.

### Installation progress appears unchanged

Not every installer emits the same amount of progress information through Winget.

BulkStoreInstaller only updates percentage values when Winget provides parseable progress output. Stage/status text may still continue to change.

### Cancelling an installation

Cancellation stops the active job where possible and marks remaining queued items as cancelled.

Cancellation does not uninstall applications that were already successfully installed before the request.

### Reports are not arriving by email

Verify:

```env
RESEND_API_KEY
```

Without the key, the development route currently simulates a successful response instead of sending a real email.

---

## Production Hardening Ideas

Future improvements that would make the platform stronger include:

- restrict bridge CORS to explicit trusted origins,
- restrict FastAPI CORS for production,
- use `NEXT_PUBLIC_COMPANION_URL` directly in the bridge client instead of a hard-coded loopback URL,
- add persistent production-grade report rate limiting,
- automate bridge builds and GitHub Releases with CI,
- add Authenticode code signing for the Windows installer,
- add automated checksum publication,
- add bridge update detection,
- improve Winget availability/source health detection,
- add richer installation logs,
- add automated frontend/backend/bridge integration tests,
- sync the application catalog through a controlled release pipeline.

---

## Building a New Bridge Release

A typical release workflow is:

```text
1. Update bridge source code.
2. Update the bridge/installer version.
3. Update Assets/catalog.json if required.
4. Build and test the bridge.
5. Publish win-x64 self-contained output.
6. Compile BulkStoreInstallerBridge.iss.
7. Test BulkStoreInstallerBridgeSetup.exe on a clean Windows machine.
8. Calculate SHA-256.
9. Create a GitHub Release.
10. Upload the installer.
11. Update BRIDGE_DOWNLOAD_URL in the web deployment.
12. Redeploy the frontend if the environment requires it.
```

Example checksum command in PowerShell:

```powershell
Get-FileHash .\BulkStoreInstallerBridgeSetup.exe -Algorithm SHA256
```

---

## Development Notes

The repository currently supports two catalog paths:

### Mock/frontend catalog

Used when:

```env
NEXT_PUBLIC_USE_MOCK=true
```

The frontend reads local JSON data.

### API/database catalog

Used when:

```env
NEXT_PUBLIC_USE_MOCK=false
```

The frontend requests catalog data from FastAPI.

When the FastAPI database is empty, the backend seeds initial application records from the frontend mock application data.

The Windows Bridge has its own packaged catalog used specifically as the **installation allowlist**.

Keeping these catalogs synchronized is important because an application visible in the frontend must also exist in the bridge catalog before the bridge will accept it for installation.

---

## Design Philosophy

BulkStoreInstaller follows a few simple principles:

**Web UI for discovery.**  
Browsing, searching, sorting, cart management, and visual feedback are better handled by a modern web interface.

**Native process for privileged local work.**  
The web application should not attempt to directly run Windows package-manager commands.

**Validated package IDs instead of arbitrary commands.**  
The bridge only installs catalog-approved packages.

**Use real package-manager output.**  
Installation stages should reflect Winget activity whenever possible instead of presenting fake deterministic progress.

**Keep local integration lightweight.**  
The bridge runs in the system tray and exposes a small loopback API rather than requiring a full desktop UI.

---

## Contributing

Contributions, bug reports, suggestions, and improvements are welcome.

A typical contribution flow:

```bash
git clone https://github.com/akilan-27/BulkStoreInstaller.git
cd BulkStoreInstaller

git checkout -b feature/your-feature
```

After making and testing your changes:

```bash
git add .
git commit -m "feat: describe your change"
git push origin feature/your-feature
```

Then open a Pull Request on GitHub.

For bridge-related changes, test on Windows with Winget available before submitting the PR.

---

## Disclaimer

BulkStoreInstaller is an independent project and is **not affiliated with, sponsored by, or endorsed by Microsoft**.

Microsoft, Windows, Winget, and related product names are trademarks of their respective owners.

Applications listed in BulkStoreInstaller belong to their respective developers and publishers. Package availability, package metadata, installer behavior, licenses, and third-party software are controlled by their respective publishers and Winget sources.

Users are responsible for reviewing the license terms of the software they choose to install.

---

## License

This project is licensed under the **MIT License**.

See:

[LICENSE](LICENSE)

for the full license text.

---

## Maintainer

**GitHub:** [@akilan-27](https://github.com/akilan-27)

Project repository:

https://github.com/akilan-27/BulkStoreInstaller

Live deployment:

https://bulk-store-installer.vercel.app/

---

<div align="center">

### BulkStoreInstaller

**A modern web-to-Windows installation workflow powered by Next.js, .NET, and Winget.**

If you find the project useful, consider giving the repository a ⭐.

</div>

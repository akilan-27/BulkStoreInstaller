# BulkStoreInstaller

**Choose your apps. Install them in one batch.**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/akilan-27/BulkStoreInstaller/blob/main/LICENSE)

BulkStoreInstaller helps you discover Windows applications, add them to a cart, and install your selections through a local Windows Bridge powered by WinGet.

[🌐 Live Application](https://bulk-store-installer.vercel.app/) · [📦 Download Windows Bridge](https://github.com/akilan-27/BulkStoreInstaller/releases/latest) · [💻 GitHub](https://github.com/akilan-27/BulkStoreInstaller)

## Features

- **Find applications:** Search by name, publisher, or description; filter by category.
- **Build your cart:** Select multiple applications and save selections in your browser.
- **Install in batches:** Run a sequential installation queue through WinGet.
- **Follow results:** View installation states, stop a queue, and retry failed apps.
- **Detect installed apps:** Identify matching packages when the Bridge is connected.
- **Use your preferred theme:** Browse a responsive interface with light and dark modes.

## Screenshots

Click a screenshot to open the original PNG.

### Application Catalog

[![Application catalog with search, categories, and application cards](docs/screenshots/catalog.png)](docs/screenshots/catalog.png)

### Cart and Selection

[![Cart showing selected applications and the Install All button](docs/screenshots/cart.png)](docs/screenshots/cart.png)

### Installation Status

[![Installation queue showing completed, downloading, and waiting applications](docs/screenshots/installation-status.png)](docs/screenshots/installation-status.png)

### Bridge Status

[![Connected Windows Bridge status in the application header](docs/screenshots/bridge-status.png)](docs/screenshots/bridge-status.png)

## How It Works

1. Browse the [website](https://bulk-store-installer.vercel.app/) and add applications to your cart.
2. Install and launch the [Windows Bridge](https://github.com/akilan-27/BulkStoreInstaller/releases/latest).
3. Confirm the connection, review your selection, and start installation.
4. The Bridge validates package IDs and installs applications one at a time through WinGet.
5. Keep the Bridge running and the website tab open to view results.

**Requirements:** A Windows x64 computer, working WinGet, and internet access for installation. The catalog can be browsed from other devices.

## Technology Stack

| Component | Technologies |
|---|---|
| Web interface | Next.js 15, React 19, TypeScript, Tailwind CSS 4, Framer Motion |
| Data and forms | TanStack Query, React Hook Form, Zod |
| Optional catalog API | Python, FastAPI, SQLModel, SQLite or PostgreSQL |
| Windows Bridge | C#, .NET 10, ASP.NET Core, WinGet |
| Hosting and delivery | Vercel, GitHub Releases, Inno Setup, Resend |

The browser handles discovery and selection. FastAPI serves catalog data in API mode; the Windows Bridge performs installations locally.

## Run Locally

### Frontend

Install Node.js compatible with Next.js 15, npm, and Git, then run:

```bash
git clone https://github.com/akilan-27/BulkStoreInstaller.git
cd BulkStoreInstaller/frontend
npm ci
```

Create `.env.local` inside `frontend/`:

```env
NEXT_PUBLIC_USE_MOCK=true
BRIDGE_DOWNLOAD_URL=https://github.com/akilan-27/BulkStoreInstaller/releases/latest/download/BulkStoreInstallerBridgeSetup.exe
RESEND_API_KEY=your_resend_api_key
```

Use your own Resend key: the current report route initializes its email client at module load. For development without email, make that initialization conditional or disable the report route.

```bash
npm run dev
```

Open [localhost:3000](http://localhost:3000). Bundled catalog mode works without FastAPI; installation still requires the Windows Bridge.

### Optional Backend

From `backend/`, with a Python environment active:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Set `NEXT_PUBLIC_USE_MOCK=false` and `NEXT_PUBLIC_API_URL=http://localhost:8000` in the frontend environment, then restart Next.js.

### Production Build

From `frontend/`:

```bash
npm run build
npm run start
```

For Vercel, select `frontend` as the root directory and configure the same environment variables.

## Project Notes

- Displayed progress currently includes simulated increments; percentages are approximate.
- Cancelling does not remove completed installations, and an active installer may continue.
- Stronger Bridge origin restrictions, authenticated pairing, and persistent job history are planned improvements.
- Keep API keys private and review third-party application terms before installing.

## Contributing

Suggestions and improvements are welcome. [Open an issue](https://github.com/akilan-27/BulkStoreInstaller/issues) or submit a pull request with a clear description of your change.

## Author and License

Built by **[Akilan R](https://github.com/akilan-27)**. Licensed under the **[MIT License](https://github.com/akilan-27/BulkStoreInstaller/blob/main/LICENSE)**.

If you find the project useful, consider giving it a ⭐.

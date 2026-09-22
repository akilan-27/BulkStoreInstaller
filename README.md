# BulkStoreInstaller

**Discover Windows apps. Build your cart. Install them in one batch.**

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/akilan-27/BulkStoreInstaller/blob/main/LICENSE)

BulkStoreInstaller is a Windows application discovery and bulk-installation platform. Browse applications, select what you need, and install them through a local Windows Bridge powered by Microsoft WinGet.

[🌐 Live Application](https://bulk-store-installer.vercel.app/) · [📦 Download Windows Bridge](https://github.com/akilan-27/BulkStoreInstaller/releases/latest) · [💻 GitHub Repository](https://github.com/akilan-27/BulkStoreInstaller)

---

## About the Project

Setting up a Windows computer often means visiting several websites, downloading individual installers, and repeating the same steps for every application.

BulkStoreInstaller brings application discovery, selection, and installation tracking into one interface. The website manages your selections, while a lightweight Windows Bridge runs the installation queue on your computer.

The project combines a Next.js frontend, an optional FastAPI catalog backend, and a native C# application.

## Features

- **Application discovery:** Search by application name, publisher, or description.
- **Categories and sorting:** Filter applications and sort by name, publisher, or category.
- **Multi-app cart:** Add several applications, remove selections, and preserve your cart in browser storage.
- **Batch installation:** Install selected applications sequentially through WinGet.
- **Installed-app detection:** Identify matching installed packages when the Bridge is connected.
- **Installation tracking:** View application states, completed items, failures, and remaining tasks.
- **Stop and retry:** Request cancellation or retry applications reported as failed.
- **Responsive interface:** Browse application cards with light, dark, and system themes.
- **Feedback reporting:** Submit bug reports, missing-app requests, and suggestions through the configured email service.

## Screenshots

Screenshots retain their original PNG resolution. Click an image to open it.

### Application Catalog

<img width="1917" height="922" alt="Screenshot 2026-09-22 151133" src="https://github.com/user-attachments/assets/803751e0-b94b-42f2-a95e-6012200664e7" />


### Cart and Selection

<img width="1917" height="926" alt="Screenshot 2026-09-22 151325" src="https://github.com/user-attachments/assets/fe2eccf1-e128-4f13-aa29-6ea0e6dce10b" />


### Installation Status

<img width="1916" height="925" alt="Screenshot 2026-09-22 151458" src="https://github.com/user-attachments/assets/e9325c30-2828-480f-af67-8e06c4249059" />


### Bridge Status

<img width="1917" height="862" alt="image" src="https://github.com/user-attachments/assets/fa620463-e542-4601-a2ea-4f2be401a624" />

## How It Works

1. Open the [live application](https://bulk-store-installer.vercel.app/).
2. Browse or search for applications and add them to your cart.
3. Install and launch the [Windows Bridge](https://github.com/akilan-27/BulkStoreInstaller/releases/latest).
4. Confirm the connection and start your selected batch.
5. The Bridge validates package identifiers against its bundled catalog.
6. WinGet installs accepted applications one at a time.
7. The website displays status updates and installation results.

Keep the Bridge running and the website tab open to view progress.

**Installation requirements:** Windows x64, working WinGet, and internet access. Individual applications may require administrator approval or a restart. Catalog browsing is available on other devices.

## Technology Stack

| Component | Technologies |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling and UI | Tailwind CSS 4, shadcn/ui, Base UI, Lucide React |
| Animation | Framer Motion |
| Data and forms | TanStack Query, React Hook Form, Zod |
| Catalog backend | Python, FastAPI, SQLModel |
| Database | SQLite or PostgreSQL |
| Windows Bridge | C#, .NET 10, ASP.NET Core, Windows Forms |
| Application installation | Microsoft WinGet |
| Hosting and distribution | Vercel, GitHub Releases, Inno Setup |
| Report emails | Resend |

### Component Responsibilities

- **Frontend:** Application browsing, search, cart management, themes, and installation controls.
- **Backend:** Application metadata, categories, search results, and bundle records when API mode is enabled.
- **Windows Bridge:** Local package validation, WinGet execution, installed-app detection, and job status.

The frontend can also use its bundled JSON catalog without running FastAPI.

## Local Development

### 1. Clone and Install

Install Node.js compatible with Next.js 15, npm, and Git.

```bash
git clone https://github.com/akilan-27/BulkStoreInstaller.git
cd BulkStoreInstaller/frontend
npm ci
```

### 2. Configure the Frontend

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_USE_MOCK=true
NEXT_PUBLIC_API_URL=http://localhost:8000

BRIDGE_DOWNLOAD_URL=https://github.com/akilan-27/BulkStoreInstaller/releases/latest/download/BulkStoreInstallerBridgeSetup.exe

RESEND_API_KEY=your_resend_api_key
```

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_USE_MOCK` | Uses the bundled catalog when set to `true`. |
| `NEXT_PUBLIC_API_URL` | FastAPI address when using API mode. |
| `BRIDGE_DOWNLOAD_URL` | Download destination for the Windows installer. |
| `RESEND_API_KEY` | Server-side key for report-email delivery. |

Replace the Resend placeholder with your own key. The current report route initializes its email client at module load; running without email requires conditional initialization or disabling that route.

Keep real API keys out of version control.

### 3. Start the Frontend

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Bundled catalog mode does not simulate installations. Installing applications still requires the Windows Bridge.

### 4. Optional Backend

From `backend/`, with a Python virtual environment active:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Update the frontend environment:

```env
NEXT_PUBLIC_USE_MOCK=false
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Restart Next.js after changing these values.

The backend uses SQLite by default. Set `DATABASE_URL` in the backend environment to use another configured database.

### 5. Windows Bridge Development

To run the Bridge from source, use Windows with the .NET 10 SDK. Stop any existing Bridge instance, then run from the repository root:

```powershell
cd windows-bridge/src/BulkStoreInstaller.Bridge
dotnet restore
dotnet run --configuration Release
```

The local service uses `http://127.0.0.1:4545`.

## Project Structure

| Directory | Purpose |
|---|---|
| `frontend/app/` | Next.js pages, layouts, and server routes. |
| `frontend/components/` | Application cards, navigation, cart, and dialogs. |
| `frontend/hooks/` | Catalog queries, search, and installation actions. |
| `frontend/lib/bridge/` | Communication with the Windows Bridge. |
| `frontend/mock/` | Bundled application and category data. |
| `backend/` | FastAPI service, database models, and catalog utilities. |
| `windows-bridge/` | Native Bridge source and installer configuration. |
| `docs/screenshots/` | README screenshots. |

## Deployment

For a local production build, run from `frontend/`:

```bash
npm run build
npm run start
```

To deploy on Vercel:

1. Import the GitHub repository.
2. Select `frontend` as the root directory.
3. Use the Next.js framework preset.
4. Configure the required environment variables.
5. Deploy the application.

FastAPI is deployed separately when API mode is used. The Windows Bridge runs on each user's computer.

## Current Notes

- Progress percentages currently include simulated increments and are approximate.
- Cancellation does not remove completed installations; an active installer may continue.
- The Bridge validates catalog entries, but its current permissive origin policy and fixed client header do not provide authenticated browser pairing.

## Planned Improvements

- Measured progress with indeterminate states when percentages are unavailable.
- Stronger origin restrictions and authenticated Bridge pairing.
- Persistent installation history and improved recovery.
- Automated, signed Windows Bridge releases.

## Contributing

Contributions, suggestions, and reproducible bug reports are welcome.

[Open an issue](https://github.com/akilan-27/BulkStoreInstaller/issues) or submit a pull request explaining your change and how you tested it. Test Windows Bridge changes on Windows with WinGet available.

## Author and License

Developed by **[Akilan R](https://github.com/akilan-27)**.

Licensed under the **[MIT License](https://github.com/akilan-27/BulkStoreInstaller/blob/main/LICENSE)**. Third-party applications retain their own licenses and publisher terms.

If you find BulkStoreInstaller useful, consider giving the repository a ⭐.

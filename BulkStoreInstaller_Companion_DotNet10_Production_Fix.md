# BulkStoreInstaller Companion — .NET 10 Production Architecture Fix

## Instruction to Antigravity

Implement this solution completely. Do not return another implementation plan and do not switch back to Node.js. Make the code changes, run every available automated check, build the Windows installer, and report the exact results and output paths.

## Decision

Replace the temporary Node.js Companion and its `pkg`-based installer with a native Windows Companion built using **.NET 10 LTS** and packaged using **Inno Setup 7**.

Do not use .NET 8 for this new project. Do not use Electron, `vercel/pkg`, a VBS launcher, or a hand-written self-extracting installer.

The final architecture must be:

1. The public Next.js application runs on Vercel.
2. A self-contained Windows Companion runs on the user's Windows computer.
3. The browser communicates directly with `http://127.0.0.1:4545`.
4. The Companion validates every requested Winget package against an approved catalogue.
5. Only the Companion executes Winget.
6. Installation state and installed-app detection come from real Winget results.

## Important Existing Problems to Correct

The current/temporary implementation must not be considered complete until these issues are corrected:

- `vercel/pkg` is deprecated and archived.
- The URL `/healthsvg` is invalid. The health endpoint is `/health`.
- A hidden `run.vbs` process provides no reliable tray lifecycle, crash feedback, or clean shutdown.
- A custom homemade installer/uninstaller is less reliable than a standard installer.
- The current frontend uses `/events` through `EventSource`. Deleting the old API routes without implementing or removing this contract breaks live installation updates.
- Native `EventSource` cannot send the custom client header. Do not design an SSE endpoint that requires a header `EventSource` cannot supply.
- Installed-app verification must use `wingetId`, not catalogue IDs such as `app-001`.
- The production browser can require permission to access the loopback network. CORS alone does not handle permission denial.
- A fixed public custom header is not authentication. Security must primarily come from loopback-only binding, exact Origin validation, Host validation, request validation, and the Winget allowlist.

## Required Project Structure

Create or replace the Companion implementation using this structure:

```text
companion/
├── src/
│   └── BulkStoreInstaller.Companion/
│       ├── BulkStoreInstaller.Companion.csproj
│       ├── Program.cs
│       ├── Api/
│       │   ├── ApiContracts.cs
│       │   └── ApiSecurity.cs
│       ├── Models/
│       │   ├── CatalogApp.cs
│       │   ├── InstallJob.cs
│       │   └── InstallQueueItem.cs
│       ├── Services/
│       │   ├── CatalogService.cs
│       │   ├── InstallQueueService.cs
│       │   ├── InstalledAppsService.cs
│       │   ├── ProcessRunner.cs
│       │   └── WingetOutputParser.cs
│       ├── Tray/
│       │   └── CompanionApplicationContext.cs
│       └── Assets/
│           ├── catalog.json
│           └── companion.ico
├── tests/
│   └── BulkStoreInstaller.Companion.Tests/
│       ├── BulkStoreInstaller.Companion.Tests.csproj
│       ├── ApiSecurityTests.cs
│       ├── CatalogServiceTests.cs
│       ├── InstallQueueServiceTests.cs
│       ├── InstalledAppsParserTests.cs
│       └── WingetOutputParserTests.cs
├── installer/
│   └── BulkStoreInstallerCompanion.iss
├── scripts/
│   ├── generate-catalog.mjs
│   └── build-release.cmd
└── README.md
```

Remove these temporary files only after the replacement builds successfully:

```text
companion/server.js
companion/build-installer.js
companion/Setup.cs
companion/run.vbs
```

Also remove obsolete Node-only dependencies and lock files from `companion/` after confirming they are not used elsewhere.

## .NET Project Requirements

Configure `BulkStoreInstaller.Companion.csproj` with these requirements:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net10.0-windows</TargetFramework>
    <UseWindowsForms>true</UseWindowsForms>
    <OutputType>WinExe</OutputType>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <RuntimeIdentifier>win-x64</RuntimeIdentifier>
    <SelfContained>true</SelfContained>
    <PublishSingleFile>true</PublishSingleFile>
    <PublishTrimmed>false</PublishTrimmed>
    <InvariantGlobalization>false</InvariantGlobalization>
    <AssemblyName>BulkStoreInstaller.Companion</AssemblyName>
    <RootNamespace>BulkStoreInstaller.Companion</RootNamespace>
  </PropertyGroup>
</Project>
```

The published application must run on a Windows x64 computer without requiring the user to install .NET.

## Companion Lifecycle

Implement the following lifecycle:

- Use a named mutex such as `Local\\BulkStoreInstaller.Companion` so only one instance runs for the current user.
- Start the Kestrel host in the background.
- Bind exclusively to `http://127.0.0.1:4545`.
- Never bind to `0.0.0.0`, a LAN IP, IPv6 any-address, or a public interface.
- Start a WinForms tray application context without showing a console window.
- The tray icon menu must contain:
  - `Companion Running` as a disabled status item.
  - `Open BulkStoreInstaller`.
  - `View Log`.
  - `Restart Companion`.
  - `Exit`.
- Exiting from the tray must stop the HTTP host and any active Winget child process cleanly.
- Store rotating diagnostic logs under:

```text
%LOCALAPPDATA%\BulkStoreInstaller Companion\Logs
```

- Never write package agreements, user paths, or other sensitive information to public web responses.

## API Security

### Network restrictions

- Listen only on `127.0.0.1:4545`.
- Validate the `Host` header. Accept only `127.0.0.1:4545` and `localhost:4545`.
- Return `400` for an invalid Host header.
- Set `Cache-Control: no-store` on all API responses.
- Limit JSON request bodies to a small fixed size.
- Reject malformed JSON and unknown fields with `400`.

### Allowed origins

Allow only these exact origins:

```text
https://bulk-store-installer.vercel.app
http://localhost:3000
http://127.0.0.1:3000
```

Do not use `AllowAnyOrigin`, `*`, suffix matching, or a general `*.vercel.app` rule. The permanent Vercel production alias must be used for production testing instead of changing preview URLs.

### CORS and private-network preflight

For an allowed origin, support `OPTIONS` requests and return the appropriate values:

```text
Access-Control-Allow-Origin: <the validated exact origin>
Vary: Origin
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, X-BulkStoreInstaller-Client
Access-Control-Max-Age: 600
```

If the request contains:

```text
Access-Control-Request-Private-Network: true
```

also return:

```text
Access-Control-Allow-Private-Network: true
```

Reject disallowed origins before executing any operation.

### Client marker

Require this header for `/verify`, `/install`, `/status`, and `/cancel`:

```text
X-BulkStoreInstaller-Client: web-v1
```

`GET /health` may remain a non-sensitive diagnostic endpoint without this header so the user can open it directly in a browser. It must reveal only readiness, version, Winget availability, and whether an installation is active.

The custom header is a client marker, not a secret. Do not describe it as authentication.

## Approved Catalogue and Command Safety

Create `companion/scripts/generate-catalog.mjs` to read:

```text
frontend/mock/apps.json
```

Generate a minimal Companion catalogue containing only:

```json
{
  "id": "app-001",
  "name": "Example App",
  "wingetId": "Publisher.Package"
}
```

Write the generated output to:

```text
companion/src/BulkStoreInstaller.Companion/Assets/catalog.json
```

Include this file in the published output and installer.

Before starting Winget:

- Resolve the request using the catalogue `id` and `wingetId`.
- Require an exact, case-insensitive match with the bundled allowlist.
- Reject empty IDs, unknown IDs, duplicate items, oversized queues, control characters, quotes used for injection, and unexpected values.
- Never accept a raw command or raw argument list from the browser.
- Start Winget using an argument list and `UseShellExecute = false`.
- Never use `cmd.exe`, PowerShell, string-concatenated commands, or `shell: true`.

Use arguments equivalent to:

```text
winget install --id <validated-winget-id> --exact --source winget --accept-package-agreements --accept-source-agreements --disable-interactivity
```

Do not force `--silent` for every package because some installers may require user interaction or elevation.

## API Contract

Keep the .NET API and TypeScript client contracts synchronized. Add contract tests or fixture tests for the following shapes.

### `GET /health`

Successful response:

```json
{
  "ready": true,
  "version": "1.0.0",
  "wingetAvailable": true,
  "isInstalling": false
}
```

The correct diagnostic address is:

```text
http://127.0.0.1:4545/health
```

Do not use `/healthsvg`.

### `POST /verify`

Request:

```json
{
  "apps": [
    {
      "id": "app-001",
      "wingetId": "Publisher.Package"
    }
  ]
}
```

Response:

```json
{
  "success": true,
  "installed": {
    "app-001": true
  },
  "installedWingetIds": [
    "Publisher.Package"
  ]
}
```

The frontend must use the returned catalogue IDs when marking cards as installed. Search results and application cards must use the same mapping.

Do not send only `app-001` to Winget. Do not compare a catalogue ID to an installed Winget package ID.

### `POST /install`

Request:

```json
{
  "apps": [
    {
      "id": "app-001",
      "wingetId": "Publisher.Package",
      "name": "Example App"
    }
  ]
}
```

Return `202 Accepted` after validation and queue creation:

```json
{
  "accepted": true,
  "jobId": "generated-job-id"
}
```

### `GET /status`

Return one stable status structure containing:

- Job ID.
- Overall job state.
- Current app.
- Total, completed, failed, cancelled, and remaining counts.
- Queue items.
- For each queue item: catalogue ID, Winget ID, name, status, stage, nullable real progress, status text, and a safe error message.

Possible item states:

```text
pending
installing
verifying
success
failed
cancelled
skipped
```

Possible active stages:

```text
preparing
downloading
installing
verifying
```

### `POST /cancel`

- Cancel pending queue items.
- Terminate the active Winget process with `Kill(entireProcessTree: true)`.
- Wait for process termination.
- Mark the active item and remaining items consistently.
- Never start the next package after cancellation.
- Return a stable response:

```json
{
  "cancelled": true
}
```

Calling cancel when idle must be idempotent and must not fail.

## Installation Queue

- Allow only one active installation job.
- Install packages sequentially.
- Return `409 Conflict` when a new job is submitted while another job is active.
- Keep queue state in memory and expose it through `/status`.
- Preserve the last completed result until a new job is accepted.
- Prevent progress and stages from moving backwards.
- Do not use fake progress, timers, or random percentage updates.
- Use the Winget process exit code as the final installation result.
- Sanitize error messages before returning them to the browser.
- Keep complete diagnostic details only in the local log file.

## Winget Output Handling

Implement output processing that:

- Reads both stdout and stderr asynchronously.
- Buffers output split across chunks.
- Treats carriage-return updates as parseable progress lines.
- Removes ANSI terminal control sequences.
- Matches messages case-insensitively.
- Clamps real numeric progress to `0..100`.
- Never decreases progress.
- Does not assume every installer emits a percentage.
- Does not mark success from output text alone.
- Treats the process exit code as authoritative.

Map stages as follows:

| Winget event | UI stage |
| --- | --- |
| Process starting, source lookup, package resolution | `preparing` |
| Download message or real download progress | `downloading` |
| Installer hash successfully verified | Remain in `downloading` |
| Archive extraction or starting package install | `installing` |
| Winget reports successful install and exits successfully | `verifying` |
| Post-install package detection succeeds | `success` |
| Non-zero exit, cancellation, or verification failure | Appropriate failure/cancel state |

Winget may emit repeated stage messages for dependencies. Never move the main application stage backwards or finish the main item solely because a dependency reports success.

## Installed-App Verification

- The frontend must send both catalogue `id` and `wingetId`.
- Prefer one cached `winget list` execution and parse installed package IDs using the dashed table separator positions rather than depending on localized column names.
- Compare Winget IDs case-insensitively.
- Cache verification results for a short period such as 30 seconds.
- Invalidate the cache after installation finishes.
- For post-install verification, retry exact detection two or three times with a short bounded delay because registration can be delayed.
- Do not execute 200 separate Winget processes on every page load.
- If verification is temporarily unavailable, return a clear error state. Do not falsely say that every application is uninstalled.

## Frontend Changes

### `frontend/constants/config.ts`

Use the loopback Companion as the default:

```ts
companionUrl:
  process.env.NEXT_PUBLIC_COMPANION_URL ?? "http://127.0.0.1:4545"
```

This URL is public configuration, not a secret.

Delete the Vercel server-side Companion routes only after all imports and callers have migrated successfully:

```text
frontend/app/api/companion/
frontend/lib/companion/
```

Before deleting `frontend/lib/companion/`, confirm no browser UI type or utility still imports it. Move any shared types that are still required into `frontend/types/`.

### `frontend/services/localhost.ts`

- Send `X-BulkStoreInstaller-Client: web-v1` on `/verify`, `/install`, `/status`, and `/cancel`.
- Send `Content-Type: application/json` only when a JSON body exists.
- Use a 3-second abort timeout for `/health`.
- Clear every timeout in a `finally` block.
- Use `cache: "no-store"`.
- Parse non-2xx error responses safely.
- Distinguish these failures:
  - Companion not installed or not running.
  - Browser local-network permission denied.
  - Origin rejected.
  - Winget unavailable.
  - Companion API version mismatch.
- Remove production `console.log` statements.
- Keep all API request and response mappings typed.

### Installed-app hook

The current project defines `useInstalledApps` inside `frontend/hooks/useCompanion.ts`. Update that actual implementation unless deliberately extracting it into a separate file.

Pass the loaded catalogue apps into verification:

```ts
apps.map(({ id, wingetId }) => ({ id, wingetId }))
```

Include a stable catalogue signature in the query key or invalidate the query when the catalogue finishes loading. Do not call `/verify` with an empty list before the catalogue is available.

### Installation updates

The current frontend opens `${config.companionUrl}/events` using native `EventSource`.

For this fix, remove the SSE dependency and use one consistent `/status` polling implementation:

- Poll every 750–1000 ms while a job is running.
- Poll every 3 seconds while the installation dialog is open but idle.
- Stop status polling when the dialog is closed and no job is active.
- Update only the relevant React Query cache/state.
- Do not fake progress between responses.
- Do not repeatedly remount the application row.
- Invalidate `installedApps` after an item succeeds and after the complete job ends.

Remove the obsolete `EventSource` code and `/events` endpoint references.

### Browser local-network permission

When health requests repeatedly fail, show a useful Companion dialog containing:

1. Confirm that the Companion is installed.
2. Confirm that the tray icon is running.
3. Ask the user to allow local-network access if Chrome or Edge shows a permission prompt.
4. Provide a `Retry Connection` button.
5. Provide an `Open Health Check` button targeting `http://127.0.0.1:4545/health`.
6. Do not repeatedly open the installer download automatically.

Audit Next.js security headers. Do not send a Permissions-Policy that disables `local-network`, `loopback-network`, or the compatibility alias `local-network-access` for the application itself.

## Inno Setup Installer

Create `companion/installer/BulkStoreInstallerCompanion.iss` using Inno Setup 7.

Requirements:

- Use a stable `AppId` GUID for upgrades.
- Install per-user without administrator rights when possible.
- Install to:

```text
%LOCALAPPDATA%\Programs\BulkStoreInstaller Companion
```

- Install the published Companion executable, icon, catalogue, and required files.
- Stop the old fake/Node Companion before replacing files.
- Remove obsolete files such as `run.vbs`, the Node server executable, dummy DLLs, and previous temporary resources.
- Remove obsolete startup registry values before writing the new value.
- Configure current-user startup using:

```text
HKCU\Software\Microsoft\Windows\CurrentVersion\Run
```

- Start the new Companion after installation.
- Configure the uninstaller to stop the process before removing files.
- Remove the startup entry during uninstall.
- Preserve user logs during normal upgrades but offer to remove them during uninstall.
- Set the output filename exactly to:

```text
BulkStoreInstallerCompanionSetup.exe
```

- Do not disguise the executable, request unnecessary elevation, or claim the binary is signed when it is not.

## Release Build Script

Create `companion/scripts/build-release.cmd` that:

1. Verifies `dotnet` exists.
2. Locates `ISCC.exe` from PATH or common Inno Setup 7 installation directories.
3. Generates `Assets/catalog.json` from `frontend/mock/apps.json`.
4. Runs `dotnet restore`.
5. Runs `dotnet test`.
6. Publishes self-contained `win-x64` release output.
7. Compiles the Inno Setup script.
8. Verifies the final installer exists and is non-empty.
9. Prints the final absolute output path.
10. Stops immediately when any command fails.

Keep build output, test output, `bin/`, `obj/`, publish directories, and generated `.exe` files ignored by Git. Commit source, scripts, the `.iss` file, tests, and the generated minimal catalogue only if the repository intentionally versions that catalogue.

## Automated Tests

Create tests for at least:

1. Only one Companion instance can become active.
2. Host validation.
3. Exact allowed and rejected origins.
4. OPTIONS preflight responses.
5. Private-network preflight response.
6. Missing or invalid client marker.
7. Unknown Winget ID rejection.
8. Injection-like package ID rejection.
9. Duplicate queue item handling.
10. Second active job returns `409`.
11. Sequential queue execution.
12. Cancellation before the next item starts.
13. Process-tree termination.
14. Normal Winget output.
15. Output split across chunks.
16. Carriage-return progress updates.
17. ANSI removal.
18. Cached installer with no download output.
19. No numeric progress output.
20. Dependency output sequences.
21. Non-zero exit code.
22. Hash verification failure.
23. UAC cancellation.
24. Successful post-install detection.
25. Localized `winget list` headers using dashed column positions.
26. Catalogue-ID to Winget-ID verification mapping.

Abstract process execution behind an interface so tests use a fake process runner and never install real software.

## Required Verification Commands

After implementation, run:

```cmd
cd companion
scripts\build-release.cmd
```

Then run the frontend build:

```cmd
cd ..\frontend
npm run build
```

Report all warnings and errors. Do not claim success if a command was skipped or unavailable.

## Manual End-to-End Verification

After the installer builds:

1. Uninstall the old fake or Node Companion.
2. Confirm old Companion processes are stopped.
3. Install the newly generated `BulkStoreInstallerCompanionSetup.exe`.
4. Confirm the tray icon appears.
5. Open:

```text
http://127.0.0.1:4545/health
```

6. Confirm it returns `ready: true` and `wingetAvailable: true`.
7. Open the permanent Vercel production URL.
8. Allow the browser's local-network permission if prompted.
9. Confirm the navbar changes from Offline to Companion Connected.
10. Confirm already installed catalogue apps are marked Installed.
11. Install one small test package.
12. Confirm real stage/progress updates appear without fake percentages.
13. Confirm successful installation is detected.
14. Test cancellation with a separate package.
15. Restart Windows or sign out/in and confirm autostart works.
16. Uninstall the Companion and confirm the process and startup registry entry are removed.

## GitHub Release Procedure

Do not commit the setup `.exe` into the Git repository.

After successful local testing:

1. Commit and push the source changes.
2. Create a new release tag such as `v1.1.0`.
3. Upload `BulkStoreInstallerCompanionSetup.exe` as a release asset.
4. Keep the frontend download URL:

```text
https://github.com/akilan-27/BulkStoreInstaller/releases/latest/download/BulkStoreInstallerCompanionSetup.exe
```

5. Redeploy the Next.js frontend on Vercel.
6. Uninstall any previous Companion before validating the release download.

## Final Acceptance Criteria

The implementation is complete only when all of the following are true:

- The Companion is a real self-contained .NET 10 Windows application.
- No Node.js installation is required on user computers.
- No VBS background launcher is used.
- No deprecated `vercel/pkg` dependency remains.
- The standard Inno Setup installer installs, upgrades, starts, and uninstalls correctly.
- The service listens only on `127.0.0.1:4545`.
- Exact Host and Origin validation works.
- Private/local-network preflight works.
- The frontend handles browser permission denial clearly.
- `/health` works at the correct URL.
- The navbar changes to Companion Connected after installation.
- Verification maps catalogue IDs to Winget IDs correctly.
- Already installed apps are marked Installed.
- Only allowlisted Winget package IDs can be executed.
- Winget is spawned without a shell.
- Installation jobs run sequentially.
- Cancellation stops the active process tree and prevents the next item from starting.
- No fake stages or fake progress remain.
- Winget exit codes determine success or failure.
- Post-install verification confirms success.
- The obsolete `/events` dependency has been removed and status polling works.
- Unit and integration tests pass.
- `npm run build` passes.
- The final installer is ready to upload as a GitHub Release asset.

At completion, provide a concise report containing:

- Files created, modified, and deleted.
- Test command results.
- Frontend build result.
- Publish result.
- Installer output path and size.
- Any manual Windows checks that still require the user.

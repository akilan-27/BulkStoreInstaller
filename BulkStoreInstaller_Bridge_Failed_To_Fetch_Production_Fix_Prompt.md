# BulkStoreInstaller — Production Fix Prompt for the Windows Bridge `Failed to fetch` Problem

## Role

Act as a **senior full-stack and Windows platform engineer**. Work directly in the existing `BulkStoreInstaller` repository and fully implement, test, and document the solution. Do not produce another theoretical plan and do not stop after changing CORS settings. Inspect the real code first, preserve working functionality, and deliver a production-ready fix.

## Primary Objective

Fix the unresolved connection failure between:

- the Next.js frontend running locally at `http://localhost:3000` or `http://127.0.0.1:3000`;
- the deployed production frontend, whose exact HTTPS origin must be discovered from the repository/environment configuration; and
- the native Windows bridge at `http://127.0.0.1:4545`.

The browser currently reports:

```text
TypeError: Failed to fetch
    at health (.../.next/static/chunks/...js)
```

The completed solution must make the deployed website reliably detect the installed bridge, query installed applications, submit a verified installation queue, receive real progress, cancel pending/running work as far as Winget permits, and display useful recovery instructions when the bridge is unavailable or browser access is blocked.

---

# Non-Negotiable Architecture

1. Keep only `windows-bridge/` as the supported native integration.
2. Treat the old `companion/` implementation as deprecated. Remove active imports, routes, build scripts, documentation, and download links that still depend on it. Do not delete user code blindly; first identify references and migrate them.
3. The frontend must call the local bridge directly. A Vercel serverless function cannot execute Winget on the visitor's computer and must never proxy installation commands.
4. The bridge must bind only to loopback, preferably `127.0.0.1:4545`. It must not bind to `0.0.0.0`, a LAN address, or a public interface.
5. Only the bridge may invoke `winget.exe`.
6. Never accept arbitrary executable names, command strings, shell fragments, flags, paths, or scripts from the browser.
7. Use exact catalogued Winget package IDs and server-side argument construction.
8. Keep the application self-contained for Windows x64 and package it as `BulkStoreInstallerBridgeSetup.exe` using Inno Setup 7.
9. Do not commit built `.exe` artifacts to Git.
10. Do not fake health, installed-state, percentage, stage, success, or cancellation results.

---

# Important Correction to the Existing Verdict

The failure must not be labelled “CORS/PNA” until diagnostics prove it. `TypeError: Failed to fetch` is deliberately nonspecific and may mean:

- nothing is listening on port `4545`;
- the bridge crashed during startup;
- the frontend is calling the wrong host, protocol, port, or path;
- the request was blocked by CORS/preflight;
- Chrome/Edge local-network permission was denied;
- HTTPS-to-loopback policy or enterprise browser policy blocked the request;
- security software blocked the bridge;
- an IPv4/IPv6 mismatch exists (`localhost` resolving to `::1` while the bridge binds only to IPv4);
- the production origin is missing from the allowlist;
- middleware ordering is incorrect;
- the custom client header triggered a preflight the bridge did not answer; or
- a stale bridge/frontend API version is installed.

The implementation must distinguish these conditions wherever browser APIs allow it and provide a deterministic diagnostic checklist where the browser intentionally hides the exact cause.

Also fix the supplied project file. `Microsoft.AspNetCore.App` is a shared framework and must be referenced with `<FrameworkReference>`, not `<PackageReference>`. Since WinForms is used, the target framework must be Windows-specific.

Use this baseline and retain other genuinely required settings discovered in the repository:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net10.0-windows</TargetFramework>
    <RootNamespace>BulkStoreInstaller.Bridge</RootNamespace>
    <UseWindowsForms>true</UseWindowsForms>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
    <PublishSingleFile>true</PublishSingleFile>
    <SelfContained>true</SelfContained>
    <RuntimeIdentifier>win-x64</RuntimeIdentifier>
    <PublishTrimmed>false</PublishTrimmed>
  </PropertyGroup>

  <ItemGroup>
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
    <!-- Keep only packages that are actually required and compatible with net10.0. -->
  </ItemGroup>
</Project>
```

Do not add a standalone `System.Text.Json` package unless the repository has a proven need; it is part of the .NET shared framework. Check Serilog package compatibility rather than copying stale version numbers without verification.

---

# Phase 1 — Repository Audit and Reproducible Diagnosis

Before editing, inspect and report:

- the complete frontend-to-bridge call chain;
- every base URL and environment variable used for bridge communication;
- all `/api/companion`, `companion/`, `windows-bridge/`, `localhost.ts`, `EventSource`, health-check, polling, and installer-download references;
- the current bridge endpoints and request/response contracts;
- the actual production origin(s);
- the current bridge startup and Kestrel binding code;
- the current CORS middleware order;
- whether an `OPTIONS` request reaches the bridge;
- whether the bridge process is listening on IPv4 port `4545`; and
- the frontend and bridge version compatibility mechanism.

Use evidence, not assumptions. Capture the following checks in the final implementation report:

```bat
curl.exe -i http://127.0.0.1:4545/health

curl.exe -i -X OPTIONS http://127.0.0.1:4545/health ^
  -H "Origin: http://localhost:3000" ^
  -H "Access-Control-Request-Method: GET" ^
  -H "Access-Control-Request-Headers: x-bulkstoreinstaller-client"

netstat -ano | findstr :4545
```

Add a production-origin preflight test using the exact deployed origin discovered from configuration. If supported by the target Chromium version, also test a request containing:

```text
Access-Control-Request-Private-Network: true
```

Do not assume that returning `Access-Control-Allow-Private-Network: true` alone will cause the browser to grant local-network access. Modern Chromium behavior may include a user permission prompt or managed policy. The UI must be able to explain that permission and offer a user-initiated retry.

Create a diagnosis table in the project documentation:

| Observation | Classification | User-facing response |
| --- | --- | --- |
| `/health` succeeds and version is compatible | Connected | Enable installed-app and install operations |
| Connection refused/no listener | Bridge offline | Ask user to open/install the bridge |
| Preflight lacks required allow headers | Bridge configuration error | Show bridge update/reinstall guidance |
| Browser reports local-network permission denial | Permission blocked | Explain how to allow access, then offer Retry |
| Health returns incompatible API version | Version mismatch | Require bridge update |
| Health works but protected call returns `401/403` | Pairing/origin failure | Re-pair or reject unsupported origin |
| Request times out | Bridge hung/security software | Stop polling and show diagnostics |

## Phase 1 acceptance gate

Do not begin broad UI changes until plain `curl` health succeeds. If it fails, fix process startup/binding first. Then prove preflight independently. Only after both pass should frontend behavior be modified.

---

# Phase 2 — Implement the Native Bridge Correctly

## 2.1 Loopback hosting and lifecycle

- Start Kestrel from the WinForms/tray process without blocking the UI thread.
- Bind explicitly to `http://127.0.0.1:4545`.
- Use a single-instance mutex. When a second instance starts, notify/focus the existing instance and exit cleanly.
- Log startup, selected port, API version, approved origin, Winget discovery, requests, queue transitions, cancellation, failures, and shutdown.
- Use rolling files with bounded retention. Never log authorization tokens, pairing codes, personal paths, or full environment data.
- Shut down Kestrel gracefully when the tray application exits.
- If port `4545` is already occupied, detect it and display an actionable error instead of silently remaining “offline.”

## 2.2 Health contract

Implement a lightweight, side-effect-free endpoint:

```http
GET /health
```

Recommended response:

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

Return `200` when the service is running even if Winget is unavailable; represent Winget availability explicitly so the UI can show the correct repair instructions. Add `Cache-Control: no-store`.

## 2.3 Exact CORS policy

Build the allowlist from configuration, with safe compiled defaults for development and the real production site. Normalize and compare origins as complete origins: scheme, hostname, and effective port. Never use `AllowAnyOrigin`, wildcard suffix checks, substring matching, `EndsWith`, reflected arbitrary origins, or `SetIsOriginAllowed(_ => true)`.

At minimum, allow only:

- `http://localhost:3000`;
- `http://127.0.0.1:3000`; and
- the exact production HTTPS origin.

Preview deployment origins must not be accepted through a broad `*.vercel.app` wildcard. If previews genuinely require bridge access, implement an explicit, bounded development configuration and keep it disabled in release builds.

Allow only required methods and headers:

```csharp
policy.WithOrigins(allowedOrigins)
      .WithMethods("GET", "POST", "OPTIONS")
      .WithHeaders("Content-Type", "X-BulkStoreInstaller-Client", "Authorization")
      .WithExposedHeaders("X-BulkStoreInstaller-Bridge-Version")
      .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
```

Use canonical casing in code even though HTTP header names are case-insensitive. Do not enable credentials unless the design actually uses cookies; bearer pairing tokens do not require `AllowCredentials`.

Place middleware in the correct order. A suitable minimal pipeline is:

1. exception handling and security headers;
2. loopback host validation;
3. conditional local-network preflight response support;
4. CORS;
5. client/version/pairing validation for protected endpoints;
6. endpoint mappings.

Do not manually duplicate all CORS headers in custom middleware. Let ASP.NET Core CORS handle standard preflights. If the request includes `Access-Control-Request-Private-Network: true`, add `Access-Control-Allow-Private-Network: true` only when the `Origin` is in the exact allowlist and the request is a valid preflight. Add `Vary: Origin` and the relevant request-header variance without overwriting existing `Vary` values.

## 2.4 Host and request validation

- Reject requests whose local destination host/port is not the expected loopback listener.
- Do not trust `Host` as proof of identity; it is one layer against DNS rebinding.
- Require `X-BulkStoreInstaller-Client: web-v1` on protected routes.
- Keep `/health` simple enough to diagnose connectivity. It may accept the marker but must not require a preflight-triggering custom header from the frontend health call.
- Set a small request-body limit.
- Reject unknown JSON properties where practical, malformed requests, oversized queues, duplicate IDs, empty IDs, and IDs absent from the signed/bundled catalog allowlist.
- Return consistent RFC 7807 problem details with a stable machine-readable error code.

## 2.5 Pairing and authorization

Origin validation is browser policy, not authentication. Implement a simple local pairing flow for state-changing operations:

1. The bridge generates a short-lived one-time pairing code and displays it in its local tray window.
2. The user enters the code in the website's Connect Bridge dialog.
3. `POST /pair` exchanges it for a high-entropy token scoped to the approved production origin.
4. Store the token using an appropriate per-user protected mechanism on Windows and store the browser copy locally for that origin.
5. Require `Authorization: Bearer <token>` on install, cancel, queue, and installed-app endpoints.
6. Support revocation/re-pairing from the tray app.
7. Never put tokens in URLs, logs, analytics, or error messages.

If the existing repository already has a stronger pairing mechanism, preserve and test it. Do not weaken it.

## 2.6 Winget execution safety

Implement typed endpoints such as:

```text
GET  /health
POST /pair
GET  /apps/installed
POST /jobs
GET  /jobs/{jobId}
POST /jobs/{jobId}/cancel
```

For every requested application:

- resolve the submitted catalog key to a server-owned exact Winget ID;
- invoke `winget.exe` directly with `ProcessStartInfo.ArgumentList`;
- set `UseShellExecute = false`;
- redirect stdout and stderr;
- never use `cmd.exe`, PowerShell, string-concatenated arguments, or user-supplied flags;
- use exact-match flags such as `--id <verified-id> --exact`;
- explicitly handle source-agreement flags according to the product's documented policy;
- process installations sequentially;
- parse real output conservatively;
- use an indeterminate downloading state when Winget provides no trustworthy percentage;
- never move a job stage backward;
- perform post-install verification before marking success; and
- distinguish cancelled, failed, already installed, reboot required, and verified success.

Cancellation must be honest: stop pending items immediately; request termination of the active child process; report when the installer has already been handed off and cannot safely be undone. Never claim that already-applied system changes were reverted.

## 2.7 Automated bridge tests

Add tests for:

- allowed development origin;
- exact production origin;
- rejected unknown origin;
- lookalike malicious origin;
- valid `OPTIONS` preflight;
- missing/invalid requested header;
- conditional private-network preflight header;
- invalid Host header;
- missing/invalid client marker;
- invalid/expired/revoked pairing token;
- unknown Winget ID;
- duplicate/oversized queue;
- cancellation state transitions;
- version contract; and
- health behavior when Winget is unavailable.

Tests must not install real software. Put process execution behind an interface and use a fake executor in automated tests.

---

# Phase 3 — Fix the Next.js Frontend Connection Layer

## 3.1 One canonical bridge client

Create or refactor one browser-only module, for example `lib/bridge/client.ts`. All components and hooks must use it. Remove competing URL constants and stale server-side companion calls.

Requirements:

- canonical base URL: `http://127.0.0.1:4545`;
- never call it during SSR, static generation, a server action, or a Vercel route;
- do not switch between `localhost` and `127.0.0.1` automatically because this obscures origin/preflight diagnostics;
- health timeout: approximately 2–3 seconds;
- `cache: "no-store"`;
- health must use a simple `GET` without unnecessary custom headers so the basic reachability check does not create avoidable preflight;
- protected requests must include the client marker and bearer token;
- parse HTTP errors separately from network exceptions;
- distinguish `AbortError` from generic `TypeError`;
- never display a raw stack trace to users.

Use a typed connection state, not a single Boolean:

```ts
type BridgeState =
  | { kind: "checking" }
  | { kind: "connected"; health: BridgeHealth }
  | { kind: "offline" }
  | { kind: "permission-blocked" }
  | { kind: "version-mismatch"; required: string; installed: string }
  | { kind: "winget-unavailable" }
  | { kind: "pairing-required" }
  | { kind: "unauthorized" }
  | { kind: "timed-out" }
  | { kind: "configuration-error"; code?: string };
```

Because browsers often collapse CORS, permission, and connection failures into the same `TypeError`, do not pretend they can always be programmatically distinguished. Use contextual classification and a short troubleshooting flow.

## 3.2 Polling policy

- Check health once after hydration.
- If connected, poll at a modest interval only while the bridge dialog is open or a job is active.
- Use one timer and one in-flight request at a time.
- Abort obsolete checks during unmount/navigation.
- Apply exponential backoff after failures and stop automatic polling after a small number of failures.
- Provide a visible user-initiated **Retry connection** button. A user gesture is important when the browser needs to request local-network permission.
- Pause polling when the document is hidden unless a job is active.
- Remove SSE/EventSource if the selected final architecture is `/status` polling.

## 3.3 Connect Bridge dialog

Implement a professional dialog with these states and actions:

- Bridge not installed → **Download Bridge**;
- installed but not running → **Open Bridge** instructions and **Retry connection**;
- local-network access blocked → browser-specific permission instructions and **Retry connection**;
- pairing required → pairing-code input;
- version mismatch → **Download latest version**;
- Winget unavailable → Windows App Installer repair instructions;
- connected → version, Winget readiness, and **Re-pair** option;
- diagnostics → copyable non-sensitive summary including site origin, bridge URL, browser, timestamp, state, and error code.

Never promise that a website can programmatically launch an arbitrary installed `.exe`. If a registered custom URI protocol is added, treat it as an optional user-confirmed launcher, validate all inputs, and keep the normal manual-open path.

## 3.4 Installation UX

- Keep the existing cart and “Add to CART” behavior.
- Before submission, verify health, API compatibility, pairing, and Winget readiness.
- Render only bridge-reported stages: Preparing → Downloading → Installing → Verifying.
- Use an indeterminate animation when no real percentage exists.
- Display per-app verified outcome and a final queue summary.
- Rename destructive-looking actions accurately. “Stop Installation” must explain that the active installer may already have made changes.
- Do not use frontend intervals to fabricate progress.

## 3.5 Frontend tests

Add unit/integration tests for:

- successful health response;
- connection refused/`TypeError`;
- timeout;
- malformed JSON;
- incompatible bridge version;
- Winget unavailable;
- pairing required and successful pairing;
- `401`, `403`, `409`, `422`, `429`, and `500` responses;
- backoff and polling cleanup;
- hidden-tab behavior;
- install progress mapping; and
- cancellation limitations shown to the user.

Mock fetch in automated tests. Add at least one browser-level test that runs against a local fake bridge and validates a real CORS preflight from the frontend origin.

---

# Phase 4 — Packaging, Release, and Proof of Completion

## 4.1 Build and installer

Provide reproducible commands appropriate to the repository, including equivalents of:

```bat
dotnet restore
dotnet test
dotnet publish windows-bridge\BulkStoreInstaller.Bridge\BulkStoreInstaller.Bridge.csproj -c Release -r win-x64 --self-contained true
npm ci
npm run lint
npm run test
npm run build
```

Build `BulkStoreInstallerBridgeSetup.exe` with Inno Setup 7. The installer must:

- install per user unless elevation is genuinely required;
- create a Start menu shortcut;
- optionally enable startup with clear user consent;
- register uninstall information;
- preserve or safely migrate pairing/configuration data during upgrades;
- shut down or upgrade the running bridge safely;
- remove startup entries and binaries on uninstall; and
- avoid deleting unrelated logs/configuration without an explicit uninstall choice.

Publish the installer through the project's selected Vercel Blob delivery flow and update the frontend download URL. Do not commit the executable. Provide a SHA-256 checksum and version metadata with the release.

## 4.2 Manual Windows validation matrix

Test on current stable Chrome and Edge on Windows 11:

| Scenario | Required result |
| --- | --- |
| Local frontend + bridge running | Connects successfully |
| Production frontend + bridge running | Permission/pairing flow then connects |
| Bridge stopped | Offline state within timeout; no infinite request storm |
| Permission denied | Clear instructions and manual retry |
| Unknown origin | Preflight/protected call rejected |
| Old bridge version | Update-required state |
| Winget missing | Bridge reachable; Winget repair state shown |
| One safe test package | Real stages and verified final result |
| Cancel pending item | Item never starts |
| Cancel active item | Honest final state; no false rollback claim |
| App already installed | Correct detected/result state |
| Reboot-required installer | Explicit reboot-required result |
| Bridge autostart | Reconnects after sign-in |
| Upgrade over old bridge | Configuration migrates safely |
| Uninstall bridge | Listener, startup entry, and binaries removed |

Use a harmless, explicitly approved test package for the real installation test. Do not install or uninstall applications merely to make automated tests pass.

## 4.3 Definition of done

The task is complete only when all of the following are true:

- `curl.exe` receives a valid `/health` response from `127.0.0.1:4545`;
- valid development and production preflights return the exact required headers;
- malicious/unlisted origins are rejected;
- the deployed HTTPS frontend connects after any required browser permission and pairing interaction;
- installed-app detection uses real bridge data;
- one approved real Winget install completes and is verified;
- queue and cancellation behavior match the documented limitations;
- frontend and bridge automated tests pass;
- production frontend build passes without bridge code running server-side;
- the installer installs, upgrades, starts, autostarts when selected, and uninstalls correctly;
- no arbitrary command execution path exists;
- no wildcard production CORS policy exists;
- no secrets appear in logs or URLs; and
- obsolete companion routes/references no longer control the application.

---

# Required Deliverables from the Coding Agent

Return all of the following after implementation:

1. **Root-cause report** — the precise failure(s) proven in the actual repository/runtime.
2. **Changed-files table** — each changed file and why it changed.
3. **API contract** — endpoints, headers, request/response models, error codes, and version rules.
4. **Security report** — binding, origin allowlist, DNS-rebinding mitigation, pairing, command allowlist, logging, and request limits.
5. **Test report** — commands executed and pass/fail results; never claim an unexecuted test passed.
6. **Manual Windows verification report** — browser, local/production origin, bridge version, and observed results.
7. **Release instructions** — exact publish and Inno Setup commands plus installer output location and checksum step.
8. **Known limitations** — especially browser permission behavior and the inability to reverse changes already performed by an installer.

## Working Rules

- Do not ask for approval after every file; make the complete scoped implementation.
- Do not rewrite unrelated UI or architecture.
- Do not overwrite existing user changes.
- Do not suppress errors with empty `catch` blocks.
- Do not “fix” the issue by disabling browser security, launching Chrome with insecure flags, allowing every origin, removing all request validation, or exposing the service to the LAN.
- Do not use fake polling, fake progress, or a dummy installer.
- Do not stop at compilation. Runtime browser validation is mandatory.
- If an exact production URL or installer delivery value cannot be discovered, isolate it in a clearly named configuration field, state the blocker, and continue implementing everything else.

The finished result must behave like a professional Windows integration: secure by default, diagnosable when blocked, honest about Winget state, and understandable to a non-technical user.


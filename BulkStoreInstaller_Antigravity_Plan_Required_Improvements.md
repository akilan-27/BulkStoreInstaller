# BulkStoreInstaller — Required Improvements to the Antigravity Windows Bridge Plan

## Verdict

The proposed plan has the correct general direction, but it is **not ready to implement exactly as written**. Treat it as a **request for changes**.

The final solution must retain the following architecture:

- Native **.NET 10 Windows Bridge** under `windows-bridge/`
- WinForms tray application with ASP.NET Core/Kestrel
- Loopback-only API at `http://127.0.0.1:4545`
- Direct browser-to-local-bridge communication
- Exact CORS origin allowlist
- HTTP polling rather than SSE/EventSource
- Secure, server-owned Winget package allowlist
- Inno Setup 7 installer
- Vercel Blob installer storage through a server-side redirect route
- No Node.js/Electron/VBS companion
- No arbitrary command execution
- No fake installation progress

The implementation must include the amendments below.

---

# 1. Do Not Delete `companion/` at the Beginning

The current proposal deletes the entire legacy folder before the replacement is proven. That is unsafe and makes comparison, migration and rollback unnecessarily difficult.

Use this staged migration:

1. Inventory all references to `companion/`, `/api/companion`, companion download links, old executable names and old API types.
2. Identify which C# logic is reusable and which code is placeholder or unsafe.
3. Build the replacement under `windows-bridge/`.
4. Update the frontend to use the new Bridge client.
5. Build and install the new Bridge on Windows.
6. Verify `/health`, CORS/preflight, pairing, installed-app detection, installation, status and cancellation.
7. Verify the complete flow from the actual deployed website.
8. Only after all acceptance tests pass, remove the deprecated `companion/` code and old references.

Do not delete unrelated user code. Report every removed file and why it became obsolete.

---

# 2. Resolve the Production Origin Properly

The currently established production origin is:

```text
https://bulk-store-installer.vercel.app
```

Before hard-coding the release configuration, confirm that this is still the active Vercel production alias.

The release Bridge must accept only these exact origins unless the repository proves another explicit production origin is required:

```text
http://localhost:3000
http://127.0.0.1:3000
https://bulk-store-installer.vercel.app
```

Do not use:

- `AllowAnyOrigin()`;
- `SetIsOriginAllowed(_ => true)`;
- `*.vercel.app`;
- hostname suffix checks;
- substring comparisons;
- automatic reflection of the request Origin; or
- arbitrary Vercel preview URLs in release builds.

If preview deployments genuinely need local Bridge access, provide a separate development-only configuration. It must be disabled in the production installer.

---

# 3. Diagnose Before Assuming CORS

`TypeError: Failed to fetch` is not proof of a CORS problem. It can also mean:

- the Bridge is not running;
- Kestrel crashed during startup;
- port `4545` is occupied;
- the request uses the wrong path, scheme, host or port;
- `localhost` resolved to IPv6 while the Bridge listens only on IPv4;
- the request timed out;
- browser local-network permission was denied;
- security software blocked the Bridge;
- the production origin is not allowlisted;
- the preflight response is invalid; or
- the frontend and Bridge API versions are incompatible.

Perform diagnostics in this order:

```bat
curl.exe -i http://127.0.0.1:4545/health
netstat -ano | findstr :4545
```

Then test a development preflight:

```bat
curl.exe -i -X OPTIONS http://127.0.0.1:4545/health ^
  -H "Origin: http://localhost:3000" ^
  -H "Access-Control-Request-Method: GET" ^
  -H "Access-Control-Request-Headers: x-bulkstoreinstaller-client"
```

Repeat the preflight with:

```text
Origin: https://bulk-store-installer.vercel.app
```

Where supported by the target Chromium browser, also test:

```text
Access-Control-Request-Private-Network: true
```

Do not begin broad frontend changes until plain `/health` succeeds through `curl.exe`. Fix Bridge startup and binding first, then preflight, and then browser behavior.

---

# 4. Correct the Bridge Project File

`Microsoft.AspNetCore.App` is a shared framework. It must be a `FrameworkReference`, not a `PackageReference`. Since the application uses WinForms, target Windows explicitly.

Use this baseline and retain other settings only when the repository proves they are needed:

```xml
<Project Sdk="Microsoft.NET.Sdk">
  <PropertyGroup>
    <OutputType>WinExe</OutputType>
    <TargetFramework>net10.0-windows</TargetFramework>
    <RootNamespace>BulkStoreInstaller.Bridge</RootNamespace>
    <UseWindowsForms>true</UseWindowsForms>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>

    <RuntimeIdentifier>win-x64</RuntimeIdentifier>
    <SelfContained>true</SelfContained>
    <PublishSingleFile>true</PublishSingleFile>
    <PublishTrimmed>false</PublishTrimmed>
  </PropertyGroup>

  <ItemGroup>
    <FrameworkReference Include="Microsoft.AspNetCore.App" />
  </ItemGroup>
</Project>
```

Additional requirements:

- Do not add `Microsoft.AspNetCore.App` as a NuGet package.
- Do not add a separate `System.Text.Json` package unless a proven compatibility requirement exists.
- Retain Serilog packages only after confirming they support the chosen target framework.
- Do not enable trimming for the first production release unless the published executable is thoroughly tested.

---

# 5. Implement Reliable Loopback Hosting

The WinForms tray process must:

- start Kestrel without blocking the UI thread;
- bind explicitly to `http://127.0.0.1:4545`;
- never bind to `0.0.0.0`, a LAN address or a public interface;
- use a per-user single-instance mutex;
- detect and clearly report when port `4545` is occupied;
- log startup, version, selected port, Winget availability, requests, queue transitions and shutdown;
- exclude tokens, pairing codes and sensitive paths from logs;
- rotate logs with bounded retention;
- cancel the server through a proper `CancellationToken`; and
- stop Kestrel gracefully when the tray application exits.

Avoid `async void` except unavoidable WinForms event handlers. Observe and log background-task exceptions instead of silently allowing the Bridge to exit.

---

# 6. Define a Safe Health Endpoint

Implement:

```http
GET /health
```

The endpoint must be:

- side-effect free;
- available without pairing authentication;
- callable without a custom request header;
- fast and non-blocking;
- returned with `Cache-Control: no-store`; and
- safe even when Winget is unavailable.

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

Return `200 OK` when the Bridge service is reachable even if Winget is missing. Communicate Winget availability through the response instead of making the Bridge appear offline.

---

# 7. Implement Exact CORS and Local-Network Preflight Handling

Configure the standard ASP.NET Core CORS middleware with exact origins, methods and headers:

```csharp
policy.WithOrigins(allowedOrigins)
      .WithMethods("GET", "POST", "OPTIONS")
      .WithHeaders(
          "Content-Type",
          "X-BulkStoreInstaller-Client",
          "Authorization")
      .WithExposedHeaders("X-BulkStoreInstaller-Bridge-Version")
      .SetPreflightMaxAge(TimeSpan.FromMinutes(10));
```

Do not enable credentialed CORS unless cookies are actually used. Bearer tokens do not require `AllowCredentials()`.

Use this middleware order:

1. exception handling and safe security headers;
2. loopback Host validation;
3. conditional private-network preflight support;
4. standard CORS middleware;
5. client/version/pairing validation for protected endpoints;
6. endpoint mappings.

If an `OPTIONS` request contains:

```text
Access-Control-Request-Private-Network: true
```

return:

```text
Access-Control-Allow-Private-Network: true
```

only when the request is a valid preflight and its Origin is in the exact allowlist. Do not return this header to arbitrary origins. Preserve existing `Vary` values and add the appropriate origin/request-header variance.

Do not assume this header automatically grants browser access. Chrome or Edge may still require a user permission action or may be affected by managed browser policy. The frontend must offer a user-triggered retry and clear guidance.

---

# 8. Add Host Validation and Request Limits

CORS is browser enforcement, not complete local-service security.

The Bridge must also:

- reject unexpected destination Host/port values;
- reject forwarded-host behavior because no reverse proxy is required;
- require `X-BulkStoreInstaller-Client: web-v1` on protected endpoints;
- apply a small JSON request-body limit;
- reject malformed JSON and unexpected values;
- reject empty, duplicate or excessive application lists;
- reject unknown catalog keys and Winget IDs;
- apply rate limits to pairing and state-changing operations; and
- return consistent RFC 7807 problem responses with stable error codes.

The custom client header is only a client marker. It must not be treated as authentication.

---

# 9. Implement Pairing Correctly

The current plan says `/pair` will “generate/exchange” pairing codes. An untrusted website must never be allowed to request a valid pairing code.

Use this flow:

1. The Bridge generates a short-lived, one-time code locally.
2. The Bridge displays the code in its tray window.
3. The user enters the code in the website's Connect Bridge dialog.
4. `POST /pair` validates the submitted code.
5. A successful exchange invalidates the code immediately.
6. The Bridge issues a high-entropy bearer token scoped to the approved frontend origin.
7. The Bridge persists required token data using an appropriate per-user protected Windows mechanism.
8. The browser retains its token only for its own origin.
9. Protected endpoints require `Authorization: Bearer <token>`.
10. The tray application provides revoke and re-pair controls.

Requirements:

- pairing codes must expire quickly;
- failed attempts must be limited;
- tokens and codes must never appear in URLs, analytics, diagnostics or logs;
- tokens must be compared safely;
- revocation must invalidate existing authorization; and
- changing an approved origin must require re-pairing.

If a stronger working mechanism already exists, preserve and test it rather than weakening it.

---

# 10. Freeze the API Contract Before Coding the UI

Use and document one consistent API. Do not create backend endpoint names that disagree with existing frontend calls.

Required operations:

```text
GET  /health
POST /pair
POST /verify
POST /install
GET  /status
POST /cancel
```

For each endpoint, document:

- whether Origin is required;
- whether the client marker is required;
- whether pairing authorization is required;
- request JSON schema;
- success response schema;
- error response schema;
- expected status codes;
- API version behavior; and
- idempotency/concurrency behavior.

Use stable error codes such as:

```text
BRIDGE_VERSION_MISMATCH
PAIRING_REQUIRED
PAIRING_CODE_INVALID
PAIRING_CODE_EXPIRED
INVALID_TOKEN
ORIGIN_NOT_ALLOWED
WINGET_UNAVAILABLE
UNKNOWN_PACKAGE
INVALID_QUEUE
JOB_ALREADY_ACTIVE
JOB_NOT_FOUND
INSTALL_FAILED
CANCELLATION_PARTIAL
```

Do not expose raw exceptions, stack traces or filesystem paths to the browser.

---

# 11. Secure Winget Execution

The frontend may submit only catalog application keys or exact approved Winget IDs. The Bridge must map them against its own bundled/server-owned allowlist.

For every process:

- locate or validate `winget.exe` safely;
- construct arguments using `ProcessStartInfo.ArgumentList`;
- set `UseShellExecute = false`;
- redirect stdout and stderr;
- never invoke `cmd.exe` or PowerShell;
- never concatenate a shell command string;
- never accept browser-supplied flags, executable names, paths or scripts;
- use exact IDs with `--id <verified-id> --exact`;
- handle source agreements according to the documented product policy;
- process the queue sequentially;
- prevent conflicting concurrent jobs;
- parse output conservatively;
- use indeterminate download progress when no trustworthy percentage exists;
- keep stage transitions monotonic; and
- verify installed state after Winget exits before reporting success.

Report separate states for:

- already installed;
- preparing;
- downloading;
- installing;
- verifying;
- verified success;
- failed;
- cancelled;
- cancellation partially completed; and
- reboot required.

Put process execution behind an interface so automated tests use a fake executor and never install real software.

---

# 12. Make Cancellation Honest

Cancellation must:

- stop pending queue entries immediately;
- attempt to terminate the active Winget process tree;
- preserve the last known real state;
- report when Winget has already handed control to another installer;
- explain that already-applied changes cannot automatically be reverted; and
- never display a fake “rolled back” or “fully stopped” result.

The confirmation message should explain this limitation before stopping an active installation.

---

# 13. Build One Browser-Only Frontend Client

Refactor all Bridge communication into one module such as:

```text
frontend/lib/bridge/client.ts
```

Use this canonical base URL:

```text
http://127.0.0.1:4545
```

Requirements:

- never run Bridge requests during SSR, static generation, server actions or Vercel API execution;
- do not alternate automatically between `localhost` and `127.0.0.1`;
- call health using a simple `GET` without the client marker;
- use `cache: "no-store"`;
- use an `AbortController` and a roughly 2–3 second health timeout;
- attach the client marker and bearer token only to protected calls;
- treat HTTP failures separately from network exceptions;
- classify `AbortError` as timeout/cancellation;
- never show raw stack traces to users; and
- validate returned JSON before trusting it.

Use a typed state instead of one Boolean:

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

Browsers may collapse connection refusal, CORS and permission denial into the same `TypeError`. Do not claim the exact cause without evidence. Use contextual guidance and diagnostics.

---

# 14. Correct the Polling Strategy

Replace aggressive or duplicated polling with these rules:

- check health once after hydration;
- maintain one timer and one in-flight health request;
- poll only while the Connect Bridge dialog is open or a job is active;
- abort obsolete checks on navigation or unmount;
- apply exponential backoff after failures;
- stop automatic polling after a small number of consecutive failures;
- pause ordinary polling while the document is hidden;
- continue only the minimum necessary job polling during an active installation;
- provide a visible **Retry connection** button; and
- remove SSE/EventSource if polling is the selected final architecture.

A user-triggered retry is important when the browser needs a local-network permission action.

---

# 15. Improve the Connect Bridge Dialog

Support these UI states:

| State | Required action/message |
| --- | --- |
| Bridge not installed | **Download Bridge** |
| Bridge installed but stopped | Explain how to open it and show **Retry connection** |
| Local-network access blocked | Show browser permission guidance and **Retry connection** |
| Pairing required | Show pairing-code entry |
| Token rejected | Offer safe re-pairing |
| Version mismatch | Require the latest Bridge download |
| Winget unavailable | Show Windows App Installer repair guidance |
| Connected | Show Bridge version and Winget readiness |
| Diagnostic mode | Copy a non-sensitive diagnostic summary |

The diagnostic summary may contain:

- frontend origin;
- Bridge URL;
- browser name/version;
- timestamp;
- connection state;
- Bridge/API versions when available; and
- stable error code.

It must not contain pairing codes, tokens or private environment data.

Do not promise that a normal website can directly open an arbitrary installed `.exe`. If a custom URI protocol is later added, treat it as a separate, user-confirmed and security-reviewed feature.

---

# 16. Preserve Real Installation UX

- Keep the existing cart and **Add to CART** behavior.
- Before submitting a queue, confirm health, API compatibility, pairing and Winget readiness.
- Display only Bridge-reported stages: Preparing → Downloading → Installing → Verifying.
- Use an indeterminate animation when Winget provides no reliable percentage.
- Never create progress using frontend timers.
- Display a verified outcome for every application.
- Display a final queue summary.
- Explain that some installers can require elevation, user interaction or restart.
- Make **Stop Installation** describe the cancellation limitation honestly.

---

# 17. Correct Installer Delivery Architecture

Do not use `NEXT_PUBLIC_BRIDGE_DOWNLOAD_URL` as the selected production architecture.

Build:

```text
windows-bridge/dist/BulkStoreInstallerBridgeSetup.exe
```

Use Inno Setup 7 with:

- per-user installation under `{localappdata}\Programs\BulkStoreInstaller Bridge`;
- a stable AppId for upgrades;
- Start menu shortcut;
- optional HKCU autostart with explicit user consent;
- safe shutdown of the running Bridge during upgrade;
- registered uninstall information;
- removal of autostart and installed binaries during uninstall;
- preservation or safe migration of pairing/configuration data during upgrade;
- narrowly targeted legacy cleanup; and
- no deletion of unrelated files.

Upload the installer to a versioned, immutable Vercel Blob path. Do not commit the `.exe` to Git.

Use server-only Vercel environment variables:

```text
BRIDGE_DOWNLOAD_URL
BRIDGE_VERSION
BRIDGE_SHA256
```

Add:

```text
GET /api/download/bridge
```

The route must:

- return `307 Temporary Redirect` to the configured Blob URL;
- return `503 Service Unavailable` with a safe error when not configured;
- add `Cache-Control: no-store`; and
- never expose server credentials.

The frontend Download Bridge button must call this route. Publish a SHA-256 checksum and version alongside the release metadata.

The installer URL cannot be finalized until the real installer has been built and uploaded. That is an expected release step, not a reason to hard-code a fake URL.

---

# 18. Required Automated Tests

## Bridge tests

Add tests for:

- allowed localhost origin;
- allowed `127.0.0.1` origin;
- exact production origin;
- rejected unknown origin;
- rejected lookalike production origin;
- valid standard preflight;
- invalid requested headers;
- conditional private-network preflight;
- invalid Host header;
- missing/invalid client marker;
- valid pairing;
- invalid, expired and reused pairing code;
- revoked/invalid token;
- version mismatch;
- Winget unavailable health response;
- unknown Winget ID;
- malformed, duplicate and oversized queues;
- concurrent-job rejection;
- cancellation state transitions; and
- safe `ProcessStartInfo.ArgumentList` construction.

## Frontend tests

Add tests for:

- successful health response;
- connection failure/`TypeError`;
- timeout;
- malformed JSON;
- incompatible Bridge version;
- Winget unavailable;
- pairing required and pairing success;
- invalid authorization;
- `401`, `403`, `409`, `422`, `429` and `500` responses;
- exponential backoff;
- timer/request cleanup;
- hidden-tab behavior;
- stage mapping;
- real-versus-indeterminate progress; and
- cancellation limitation messaging.

Add at least one browser-level test using a local fake Bridge to prove a real CORS preflight from the frontend origin. Automated tests must never install or uninstall real applications.

---

# 19. Required Build and Release Checks

Use repository-appropriate equivalents of:

```bat
dotnet restore
dotnet test
dotnet publish windows-bridge\src\BulkStoreInstaller.Bridge\BulkStoreInstaller.Bridge.csproj -c Release -r win-x64 --self-contained true

cd frontend
npm ci
npm run lint
npm run test
npm run build
```

Compile the installer with Inno Setup 7 and report:

- installer output path;
- version;
- SHA-256 checksum;
- installed location;
- upgrade result; and
- uninstall result.

Never claim a command or test passed unless it was actually executed successfully.

---

# 20. Manual Windows Verification Matrix

Test using current stable Chrome and Edge on Windows 11.

| Scenario | Required result |
| --- | --- |
| Bridge running + local frontend | Connects successfully |
| Bridge running + real production frontend | Permission/pairing flow completes and connects |
| Bridge stopped | Offline state appears within timeout; no infinite request storm |
| Port occupied | Tray UI shows an actionable error |
| Browser permission denied | Clear instructions and manual retry |
| Unknown Origin | Request rejected |
| Lookalike Origin | Request rejected |
| Old Bridge version | Update-required state |
| Winget missing | Bridge reachable; repair state shown |
| Pairing code expired | Safe rejection and new-code path |
| One user-approved safe package | Real stages and verified result |
| Pending item cancelled | Item never starts |
| Active item cancelled | Honest final state; no rollback claim |
| Package already installed | Correct installed/result state |
| Reboot required | Explicit reboot-required result |
| Autostart selected | Bridge reconnects after Windows sign-in |
| Upgrade old Bridge | Required configuration migrates safely |
| Uninstall | Listener, startup entry and binaries are removed |

Use only a harmless package explicitly approved for the real installation test.

---

# 21. Definition of Done

The problem is fixed only when all of the following are true:

- `curl.exe` receives a valid `/health` response from `127.0.0.1:4545`.
- Valid development and production preflights return correct headers.
- Unlisted and malicious lookalike origins are rejected.
- The actual deployed HTTPS frontend connects after any required permission and pairing interaction.
- The UI changes from Bridge Offline to Connected based on real health data.
- Installed-app detection uses real Bridge output.
- A user-approved Winget installation completes and is verified.
- Queue and cancellation behavior match documented limitations.
- Frontend and Bridge automated tests pass.
- The production Next.js build passes without Bridge calls executing server-side.
- The installer installs, starts, optionally autostarts, upgrades and uninstalls correctly.
- No arbitrary command execution path exists.
- No wildcard production CORS policy exists.
- No tokens or pairing codes appear in URLs or logs.
- No fake progress, success, installed state or cancellation result exists.
- Deprecated companion code is removed only after the replacement passes all checks.

---

# Required Final Report from Antigravity

After implementation, return:

1. **Proven root cause** — the exact failure or combination of failures found.
2. **Changed-files table** — every created, modified, moved and deleted file with its purpose.
3. **API contract** — endpoint schemas, required headers, authentication and error codes.
4. **Security report** — loopback binding, Host checks, origin policy, pairing, request limits and Winget validation.
5. **Test report** — every executed command and its real result.
6. **Manual Windows report** — browser, origin, Bridge version and observed results.
7. **Release report** — installer path, version, checksum, Blob configuration and download route.
8. **Known limitations** — local-network browser permission and cancellation limitations.

## Final Working Rules

- Implement the complete scoped solution; do not stop after editing CORS.
- Do not rewrite unrelated UI or architecture.
- Do not overwrite existing user changes.
- Do not suppress exceptions using empty `catch` blocks.
- Do not disable browser security or recommend insecure browser flags.
- Do not expose the Bridge to the LAN.
- Do not allow every Origin.
- Do not use a dummy installer.
- Do not fake tests, progress or completion.
- Do not mark the task complete until the real deployed frontend has been tested against the installed Windows Bridge.


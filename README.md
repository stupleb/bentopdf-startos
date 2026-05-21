<p align="center">
  <img src="icon.svg" alt="BentoPDF Logo" width="21%">
</p>

# BentoPDF on StartOS

> **Upstream docs:** <https://www.bentopdf.com/>
>
> Everything not listed in this document should behave the same as upstream
> BentoPDF. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable.

[BentoPDF](https://github.com/alam00000/bentopdf) is a privacy-first, in-browser PDF toolkit. All processing — merging, splitting, editing, converting, signing, OCR — happens client-side in your browser. Files never leave your device. This StartOS package additionally bundles the optional AGPL WebAssembly libraries locally, so the heavyweight conversion tools work without any external CDN being contacted at runtime.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Licensing](#licensing)
- [Contributing](#contributing)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                                                              |
| ------------- | ---------------------------------------------------------------------------------- |
| Image         | Built from this repository's `Dockerfile`, layered on upstream `bentopdf-simple`   |
| Architectures | x86_64, aarch64                                                                    |
| Entrypoint    | Upstream nginx entrypoint, unmodified                                              |

The image is produced by `start-cli` from this repo's `Dockerfile`. It uses upstream's prebuilt `bentopdf-simple` image as a base and adds the three AGPL WebAssembly libraries (PyMuPDF, Ghostscript, CoherentPDF) under `/usr/share/nginx/html/wasm/`. A StartOS init oneshot rewrites the CDN defaults in the bundled JavaScript to point at those local paths on every container start.

---

## Volume and Data Layout

| Volume | Mount Point | Purpose                                              |
| ------ | ----------- | ---------------------------------------------------- |
| `main` | `/data`     | Reserved. BentoPDF has no server-side state — this volume is not used by the service today. |

BentoPDF does not store user data server-side; PDFs are processed entirely in the browser and never uploaded.

---

## Installation and First-Run Flow

No setup wizard, no admin password, no first-run prompt. The web interface is usable the moment the service starts.

On every container start, a StartOS init oneshot named **rewrite-wasm-urls** runs before the web server. It rewrites the WASM module URLs that BentoPDF would otherwise load from a public CDN, redirecting them at the locally bundled copies. The oneshot is idempotent and fails loudly if upstream's bundle layout changes in a way that prevents the rewrite, surfacing the issue at startup rather than at first PDF conversion.

---

## Configuration Management

| StartOS-Managed                                                                                   | Upstream-Managed                                                  |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| WASM module URLs (PyMuPDF, Ghostscript, CoherentPDF) are pinned to local paths at every startup. | Default UI language, branding, and tool visibility (all defaults). |

There is no user-facing configuration. The Advanced Settings → WASM Settings page inside BentoPDF remains visible but is unnecessary on StartOS — the libraries are already configured locally.

---

## Network Access and Interfaces

| Interface | Container Port | Protocol | Purpose             |
| --------- | -------------- | -------- | ------------------- |
| Web UI    | 8080           | HTTP     | BentoPDF web app    |

**Access methods:**

- LAN IP with unique port
- `<hostname>.local` with unique port
- Tor `.onion` address
- Custom domains (if configured)

---

## Actions (StartOS UI)

None.

---

## Backups and Restore

**Included in backup:**

- `main` volume (currently empty in normal operation)

**Restore behavior:** Volume is restored before the service starts. Because BentoPDF holds no server-side state, restoration is functionally a no-op.

---

## Health Checks

| Check         | Method                | Messages                                                                          |
| ------------- | --------------------- | --------------------------------------------------------------------------------- |
| Web Interface | Port listening (8080) | Success: "The web interface is ready" / Error: "The web interface is not ready" |

---

## Dependencies

None.

---

## Limitations and Differences

1. **No server-side persistence.** BentoPDF processes everything client-side; nothing is saved on the StartOS box.
2. **WASM libraries are pinned at build time.** Upgrading the bundled PyMuPDF, Ghostscript, or CoherentPDF requires a new package release, not a runtime setting change.
3. **Office-document conversion requires a cross-origin-isolated browser context.** Some advanced features (LibreOffice WASM in particular) rely on `SharedArrayBuffer`, which needs HTTPS and the right COOP/COEP headers from the server. Access via a Tor `.onion` or a properly-configured HTTPS hostname.

---

## What Is Unchanged from Upstream

- The full BentoPDF tool catalog (merge, split, edit, convert, sign, OCR, etc.) is available.
- The upstream nginx configuration, security headers, and entrypoint scripts are unmodified.
- The user-facing UI is identical except that the locally-bundled WASM URLs are configured automatically.

---

## Licensing

BentoPDF is dual-licensed by upstream under AGPL-3.0 and a commercial license. This StartOS package is built from the AGPL-licensed source and ships the AGPL WebAssembly libraries (PyMuPDF, Ghostscript, CoherentPDF) bundled. Distribution and modification are governed by the AGPL-3.0 terms. The package source is at <https://github.com/Start9Labs/bentopdf-startos> and the upstream source is at <https://github.com/alam00000/bentopdf>.

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for build instructions and development workflow.

---

## Quick Reference for AI Consumers

```yaml
package_id: bentopdf
architectures: [x86_64, aarch64]
volumes:
  main: /data
ports:
  ui: 8080
dependencies: none
startos_managed_env_vars: none
actions: none
oneshots:
  - rewrite-wasm-urls
```

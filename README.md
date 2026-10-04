<p align="center">
  <img src="icon.svg" alt="BentoPDF Logo" width="21%">
</p>

# BentoPDF on StartOS

> Everything not listed in this document should behave the same as upstream
> BentoPDF. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

[BentoPDF](https://github.com/alam00000/bentopdf) is a set of PDF tools that run in the browser: the server hands out the application, and files are processed on the user's device. This package serves upstream's self-hosted build and adds to its image the libraries, fonts and OCR data that build downloads from a CDN when a tool first needs them. What is still fetched from outside is listed under [Limitations and Differences](#limitations-and-differences).

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The image is built from this repository's `Dockerfile`: upstream's published image with extra files layered on, running in one subcontainer.

| Property      | Value                                                                 |
| ------------- | --------------------------------------------------------------------- |
| Image         | Built from `Dockerfile` on top of `ghcr.io/alam00000/bentopdf-simple` |
| Architectures | x86_64, aarch64                                                       |
| Entrypoint    | Upstream's, unchanged; it starts nginx                                |
| User          | The image's unprivileged `nginx` user                                 |
| Subcontainer  | `bentopdf-sub`                                                        |

`bentopdf-simple` is upstream's self-hosted build. It has every tool and leaves out the marketing sections of bentopdf.com.

The `Dockerfile` adds these under the web root, `/usr/share/nginx/html`:

| Path                                      | Holds                                                                                                |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `wasm/pymupdf/`, `wasm/gs/`, `wasm/cpdf/` | The PyMuPDF, Ghostscript and CoherentPDF WebAssembly libraries                                       |
| `fonts/embedpdf/`                         | The seven Noto fonts the PDF editor falls back to                                                    |
| `tesseract/`                              | The OCR worker, its core runtime, and language data for the languages named in `tesseract-langs.txt` |

The OCR worker is the one from the `tesseract.js` npm package, with its two built-in jsDelivr prefixes (core runtime and language data) changed to `/tesseract/` paths when the image is built.

`/etc/nginx/nginx.conf` is upstream's with one rule added: a request under `/tesseract/lang/` is answered from the bundled files, and for a language that is not bundled it is redirected to jsDelivr. Upstream's security headers, among them the cross-origin isolation headers its Office conversion depends on, are not touched.

`bentopdf-sub` runs two things in order: `rewrite-wasm-urls`, a one-shot that edits the served JavaScript (see [Installation and First-Run Flow](#installation-and-first-run-flow)), then nginx (daemon id `primary`).

## Volume and Data Layout

The service keeps no state. One volume exists, and nothing writes to it.

| Volume | Mount point         | Holds   |
| ------ | ------------------- | ------- |
| `main` | `/data`, read-write | Nothing |

Whatever BentoPDF remembers between visits is in the browser's own storage, not on the server.

## File Models

None. The package has no file model, keeps no `store.json`, and passes no setting by environment variable.

Two files in the container are worth knowing about all the same:

- **The JavaScript under `/usr/share/nginx/html/assets/`** is edited at every start by `rewrite-wasm-urls`.
- **`/usr/share/nginx/html/config.json`** is the file upstream lets an operator mount to hide tools or parts of the PDF editor. Here it is the image's empty default, and no action writes it.

The subcontainer's filesystem is created from the image at each start, so an edit made by hand inside the running container lasts until the next restart.

## Dependencies

None. BentoPDF needs no other service.

## Network Access and Interfaces

One interface: the BentoPDF application, served by nginx on port 8080.

| Interface id | Type | Port | Protocol | Serves                                                                    |
| ------------ | ---- | ---- | -------- | ------------------------------------------------------------------------- |
| `ui`         | `ui` | 8080 | HTTP     | Static pages, scripts and WebAssembly. There is no API or login behind it |

nginx speaks plain HTTP; TLS is added by StartOS.

## Installation and First-Run Flow

There is nothing to set up: no account, no wizard, no task. The interface is usable as soon as the service has started.

Every start runs `rewrite-wasm-urls` before nginx. It edits upstream's JavaScript in place so that the three WebAssembly libraries, the PDF editor's fallback fonts and the OCR worker are requested from the paths above instead of jsDelivr. It then deletes the precompressed `.br` copy of each file it changed, which nginx would otherwise serve in place of the edited one.

After each edit it checks that no such URL is left. If one is, it prints a line starting `ERROR:` and exits, and nginx is not started.

## Actions

None. The package defines no actions.

## Tasks

None. The service is never held on a prompt, and its ordinary controls are always available.

## Health Checks

There is one check, on the `primary` daemon. It passes while something is listening on port 8080; it does not load a page, so it says nothing about whether a particular tool works.

| Check                     | Probes                             | Grace period                |
| ------------------------- | ---------------------------------- | --------------------------- |
| Web Interface (`primary`) | TCP port 8080 inside the container | 10 seconds, the SDK default |

- **It stays at `waiting`.** nginx has not been started, because `rewrite-wasm-urls` keeps failing. The step is retried with a pause that grows to 30 seconds. Its `ERROR:` line in the service log names the kind of URL it could not rewrite. That happens when upstream's bundle has changed in a way the package does not handle, so it takes a package update to fix, not a setting.
- **It fails after the grace period.** nginx is not listening: it exited, or never bound the port. Its own output is in the service log.

## Backups and Restore

The `main` volume is copied as it is. It is empty, so a backup of this service holds no user data.

Nothing is excluded, and a restored instance has nothing to rebuild: it serves the application exactly as a fresh install does. Documents are processed in the browser and never reach the server, so they are in no backup.

## Limitations and Differences

1. **Libraries, fonts and the OCR engine come from the server.** Upstream's build downloads the three WebAssembly libraries, the PDF editor's fallback fonts and the OCR worker and runtime from jsDelivr. Here they are part of the image, so their versions change only with a package update.
2. **OCR language data is bundled for a fixed set of languages.** `tesseract-langs.txt` lists them by Tesseract code; `osd` is the script and orientation data. Every other language in upstream's catalogue is still offered, and choosing one makes the browser download its data from jsDelivr.
3. **OCR still downloads a font.** To write the text layer of a searchable PDF, upstream fetches a Noto font chosen by the OCR language from `rawcdn.githack.com` and caches it in the browser. The package does not bundle these fonts. Where the download fails, upstream uses Helvetica instead.
4. **WASM Settings needs no input.** Upstream's page for pointing the three libraries at another location is still there; the built-in locations are the local copies.
5. **Upstream's options cannot be set.** Upstream is configured when its image is built (branding, default language, hidden tools), by mounting a `config.json` (hidden tools and editor features), or by container environment (`PORT`, `DISABLE_IPV6`, `ROBOTS_NOINDEX`). The package sets none of these and has no action for them, so each is at upstream's default.
6. **x86_64 and aarch64 only.** Upstream publishes its image for those two architectures.

---

## Quick Reference for AI Consumers

```yaml
package_id: bentopdf
image: ghcr.io/alam00000/bentopdf-simple # the base; the package image is built from the Dockerfile
architectures: [x86_64, aarch64]
subcontainers: [bentopdf-sub]
volumes:
  main: /data
file_models: []
startos_managed_env_vars: []
dependencies: none
interfaces:
  ui: { type: ui, port: 8080 }
actions: []
tasks: []
health_checks:
  - primary
```

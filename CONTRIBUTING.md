# Contributing

This repo packages [BentoPDF](https://github.com/alam00000/bentopdf) for StartOS.

## Documentation — keep it in sync

- **`README.md`** — what this package is and how it's built (image, volumes, interfaces). For developers and AI assistants.
- **`instructions.md`** — the user-facing instructions packed into the `.s9pk` and shown on the **Instructions** tab in StartOS, for the person running the service.
- **`CONTRIBUTING.md`** — this file.
- **`CLAUDE.md`** — operating rules for AI developers working in this repo.

**Any code change that warrants it must update `README.md` and `instructions.md` in the same change** — a new or renamed action, an added or removed volume / port / interface / dependency, a changed default, a new limitation, any altered user-visible behavior. Don't defer: a package that ships with a stale README or stale instructions is not done, even if the code is perfect. Content rules live in the packaging guide: [Writing READMEs](https://docs.start9.com/packaging/writing-readmes.html) and [Writing Service Instructions](https://docs.start9.com/packaging/writing-instructions.html).

## Building

See the [StartOS Packaging Guide](https://docs.start9.com/packaging/) for environment setup, then:

```bash
npm ci    # install dependencies
make      # build the universal .s9pk
```

The `make` step invokes `start-cli s9pk pack`, which builds the project `Dockerfile`. That Dockerfile pulls the upstream `ghcr.io/alam00000/bentopdf-simple` image and layers in the three AGPL WASM npm packages (PyMuPDF, Ghostscript, CoherentPDF) under `/usr/share/nginx/html/wasm/`. `start-cli` needs a buildx builder with the `docker-container` driver to export the resulting image — if you see *"Docker exporter feature is currently not supported for docker driver"*, run `docker buildx create --driver docker-container --use` once.

## Updating versions

This package pins four upstream versions: the BentoPDF base image and the three WASM npm packages. They live in the project `Dockerfile`:

```
FROM ghcr.io/alam00000/bentopdf-simple:<TAG>
ARG PYMUPDF_VERSION=...
ARG GS_VERSION=...
ARG CPDF_VERSION=...
```

To track a new BentoPDF release:

1. Bump the `FROM` tag in `Dockerfile` to the new `bentopdf-simple` tag.
2. Look at upstream's `src/js/utils/wasm-provider.ts` at that tag and update `PYMUPDF_VERSION`, `GS_VERSION`, `CPDF_VERSION` in `Dockerfile` to match the `CDN_DEFAULTS` versions there. If they have not changed, leave them alone.
3. Update `version` and `releaseNotes` in the file under `startos/versions/`, renaming the file to the new version string. A *new* version file is only needed when the bump carries an `up`/`down` migration, or when you want the old release notes preserved in git history — see [Versions](https://docs.start9.com/packaging/versions.html).
4. Rebuild (`make`), sideload the `.s9pk`, and verify the **rewrite-wasm-urls** init oneshot completes cleanly. If it fails with *"jsdelivr URL still present after rewrite"*, the upstream bundle format changed and the `sed` patterns in `startos/main.ts` need updating.
5. Review `README.md` and `instructions.md` for anything the bump changed.

## How the WASM rewrite works

BentoPDF v2.0+ stopped bundling the AGPL WASM libraries (PyMuPDF, Ghostscript, CoherentPDF) and defers them to a jsdelivr CDN at runtime by default. Upstream's `src/js/utils/wasm-provider.ts` reads the URLs at Vite build time via `import.meta.env.VITE_WASM_*_URL`, falling back to the CDN. Those URLs are inlined as plain string literals into `assets/wasm-provider-*.js` in the prebuilt image.

This package:

1. **Bundles the libraries locally** via the project `Dockerfile`, which `npm pack`s them in a vendor stage and copies them under `/usr/share/nginx/html/wasm/{pymupdf,gs,cpdf}/`.
2. **Rewrites the URLs at startup** via an init oneshot in `startos/main.ts` that `sed`s the jsdelivr URLs in the bundled JS to the local `/wasm/.../` paths. The oneshot is idempotent and fails loudly if the rewrite leaves any jsdelivr URLs behind.

The result: zero-config, no per-browser setup, no external CDN traffic.

## How to contribute

1. Fork the repository and create a branch from `master`.
2. Make your changes — including the doc updates above.
3. Open a pull request to `master`.

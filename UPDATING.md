# Updating the upstream version

Upstream is [BentoPDF](https://github.com/alam00000/bentopdf), taken as its prebuilt `ghcr.io/alam00000/bentopdf-simple` image. This repository's `Dockerfile` builds on that image and adds files BentoPDF would otherwise download from a CDN, so a bump can move seven pins: the image tag, and six `ARG`s that have to match what that release's JavaScript asks for.

## Determining the upstream version

Every pin is in the `Dockerfile`.

| Pin                                             | What it is                                                    |
| ----------------------------------------------- | ------------------------------------------------------------- |
| `FROM ghcr.io/alam00000/bentopdf-simple:<tag>`  | The BentoPDF release                                          |
| `PYMUPDF_VERSION`, `GS_VERSION`, `CPDF_VERSION` | The three WebAssembly libraries                               |
| `EMBEDPDF_FONTS_VERSION`                        | The PDF editor's fallback fonts (`@embedpdf/fonts-*`)         |
| `TESSERACT_VERSION`                             | `tesseract.js` and `tesseract.js-core`, which share a version |
| `TESSDATA_VERSION`                              | The `@tesseract.js-data/*` language packages                  |

Upstream's newest release:

```bash
gh release view -R alam00000/bentopdf --json tagName -q .tagName
```

The image tag is the release tag, leading `v` included. Check that the image exists for both architectures; `linux/amd64` and `linux/arm64` must both be listed:

```bash
docker buildx imagetools inspect ghcr.io/alam00000/bentopdf-simple:<tag>
```

What the release expects of the other pins is in upstream's source at that tag:

- `src/js/utils/wasm-provider.ts`: `CDN_DEFAULTS` holds the PyMuPDF, Ghostscript and CoherentPDF versions.
- `src/js/config/editor-fonts.ts`: the `@embedpdf/fonts-*` version and the shape of the font URL.
- `package-lock.json`: the `tesseract.js` version the release was built with.

  ```bash
  curl -fsSL https://raw.githubusercontent.com/alam00000/bentopdf/<tag>/package-lock.json \
    | jq -r '.packages["node_modules/tesseract.js"].version'
  ```

- `npm view @tesseract.js-data/eng version`: the language packages, which are versioned together.

Then compare the files that decide whether the package still fits the release:

```bash
for f in Dockerfile nginx.conf scripts/generate-security-headers.mjs docs/self-hosting/docker.md \
  src/js/utils/wasm-provider.ts src/js/config/editor-fonts.ts; do
  diff <(curl -fsSL "https://raw.githubusercontent.com/alam00000/bentopdf/<old-tag>/$f") \
    <(curl -fsSL "https://raw.githubusercontent.com/alam00000/bentopdf/<new-tag>/$f") >/dev/null \
    && echo "unchanged: $f" || echo "CHANGED:   $f"
done
```

- `Dockerfile`: the base image, the user, the port and the entrypoint scripts the package relies on.
- `nginx.conf`: the package inserts its rule before `location ^~ /pdfjs-viewer/`.
- `scripts/generate-security-headers.mjs`: every remote origin the application is allowed to reach. An origin that is new here is something the release downloads from outside.
- `docs/self-hosting/docker.md`, the environment table: a new `VITE_*_URL` option marks a file upstream fetches remotely unless told otherwise.

A remote download the package neither bundles nor lists in `README.md` under Limitations and Differences needs one or the other before the bump ships.

## Applying the bump

1. Set the tag on the `FROM` line of the `Dockerfile`.
2. Set each `ARG` whose value changed upstream. If `editor-fonts.ts` names different font files, change the list in the font loop to match.
3. Set `version` and `releaseNotes` in `startos/versions/current.ts`. The version is the release tag without its `v`, at revision `0`.
4. Build. The build stops if the patched OCR worker still names a CDN, or if upstream's `nginx.conf` no longer has the `location ^~ /pdfjs-viewer/` line.
5. Start the package on a server and read the service log. `rewrite-wasm-urls` ends with `WASM, editor-font and OCR URLs rewritten to local paths; brotli caches invalidated.` An `ERROR:` line instead names the kind of URL whose shape changed; the patterns for it are in `startos/main.ts`.

A pin that lags the release passes both of those checks. It shows only in the browser, as a 404 on a library, font or OCR file, so open a tool that uses each before releasing: a conversion, the PDF editor with non-Latin text, and OCR.

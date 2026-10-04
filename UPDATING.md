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

The OCR text-layer fonts have no pin: the build downloads whichever fonts the release's JavaScript names on `rawcdn.githack.com`.

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
3. If `TESSDATA_VERSION` or `EMBEDPDF_FONTS_VERSION` changed, check that the editor's four CJK fonts still contain every character the `jpn`, `kor`, `chi_sim` and `chi_tra` models can output: OCR writes those languages' text layer with them. With `fonttools` installed, every line must end in `missing 0`:

   ```bash
   TESSDATA_VERSION=<ver> EMBEDPDF_FONTS_VERSION=<ver> python3 - <<'EOF'
   import gzip, io, os, struct, urllib.request
   from fontTools.ttLib import TTFont

   def get(url):
       return urllib.request.urlopen(url).read()

   for lang, pkg, font in [('jpn', 'jp', 'NotoSansJP'), ('kor', 'kr', 'NotoSansKR'),
                           ('chi_sim', 'sc', 'NotoSansHans'), ('chi_tra', 'tc', 'NotoSansHant')]:
       data = gzip.decompress(get(f"https://cdn.jsdelivr.net/npm/@tesseract.js-data/{lang}@{os.environ['TESSDATA_VERSION']}/4.0.0_best_int/{lang}.traineddata.gz"))
       offsets = struct.unpack_from('<%dq' % struct.unpack_from('<i', data)[0], data, 4)
       start = offsets[21]  # the lstm-unicharset component
       lines = data[start:min([o for o in offsets if o > start] + [len(data)])].decode().split('\n')
       chars = {ord(c) for line in lines[1:1 + int(lines[0])] if line.split(' ')[0] != 'NULL' for c in line.split(' ')[0]}
       cmap = TTFont(io.BytesIO(get(f"https://cdn.jsdelivr.net/npm/@embedpdf/fonts-{pkg}@{os.environ['EMBEDPDF_FONTS_VERSION']}/fonts/{font}-Regular.otf"))).getBestCmap()
       print(lang, 'missing', len(chars - cmap.keys()))
   EOF
   ```

4. Set `version` and `releaseNotes` in `startos/versions/current.ts`. The version is the release tag without its `v`, at revision `0`.
5. Build. The build stops if the patched OCR worker still names a CDN, if the release's `rawcdn.githack.com` font URLs changed shape or name a Noto Sans CJK font the `Dockerfile` has no link for, or if upstream's `nginx.conf` no longer has the `location ^~ /pdfjs-viewer/` line.
6. Start the package on a server and read the service log. `rewrite-wasm-urls` ends with `WASM, editor-font and OCR URLs rewritten to local paths.` An `ERROR:` line instead names the kind of URL whose shape changed; the patterns for it are in `startos/main.ts`.

A pin that lags the release passes both of those checks. It shows only in the browser, as a 404 on a library, font or OCR file, so open a tool that uses each before releasing: a conversion, the PDF editor with non-Latin text, and OCR in a bundled language. Use a private window, since a browser that ran the previous version can keep its files, and watch the network panel: apart from OCR data for a language that isn't bundled, every request goes to the server.

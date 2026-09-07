import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'

// Rewrites the jsdelivr CDN defaults baked into BentoPDF's bundled JS to
// point at the local copies our Dockerfile lays down:
//   - the WASM libraries (PyMuPDF, Ghostscript, CoherentPDF) in
//     wasm-provider-*.js  ->  /wasm/{pymupdf,gs,cpdf}/
//   - the PDF text editor's Noto fallback fonts (@embedpdf/fonts-*), whose
//     base URL is inlined into several hash-suffixed chunks  ->  /fonts/embedpdf
// Idempotent: after the first run there are no jsdelivr URLs left to match.
// Fails loudly if upstream's bundle format changes in a way that leaves CDN
// URLs in place — we want to know at startup, not when a user tries to
// convert or edit a PDF.
//
// We also delete the brotli-precompressed copy of every rewritten chunk. The
// upstream image ships *.js.br alongside each .js, and nginx prefers the .br
// for brotli-capable clients — which would silently re-introduce the original
// jsdelivr URLs because the .br is unmodified. With the .br missing, nginx
// falls back to serving the (rewritten) .js.
const REWRITE_WASM_URLS = `
set -e
# ---- WASM libraries ---------------------------------------------------------
target='/usr/share/nginx/html/assets/wasm-provider-*.js'
matched=$(ls $target 2>/dev/null || true)
if [ -z "$matched" ]; then
  echo "ERROR: no wasm-provider-*.js bundle found. Upstream layout may have changed."
  exit 1
fi
# The version pin in the CDN URLs varies across BentoPDF releases — at v2.7.0
# only pymupdf is pinned, at v2.8.x all three are. (@[0-9.]+)? handles both.
sed -i -E \\
  -e 's|https://cdn\\.jsdelivr\\.net/npm/@bentopdf/pymupdf-wasm(@[0-9.]+)?/|/wasm/pymupdf/|g' \\
  -e 's|https://cdn\\.jsdelivr\\.net/npm/@bentopdf/gs-wasm(@[0-9.]+)?/assets/|/wasm/gs/|g' \\
  -e 's|https://cdn\\.jsdelivr\\.net/npm/coherentpdf(@[0-9.]+)?/dist/|/wasm/cpdf/|g' \\
  $matched
if grep -qE 'cdn\\.jsdelivr\\.net/npm/(@bentopdf/(pymupdf-wasm|gs-wasm)|coherentpdf)[/@]' $matched; then
  echo "ERROR: jsdelivr WASM URL still present after rewrite. Upstream bundle format may have changed."
  exit 1
fi
rm -f /usr/share/nginx/html/assets/wasm-provider-*.js.br
# ---- Editor fallback fonts --------------------------------------------------
# Both BentoPDF's editor-fonts.ts and the @embedpdf engine build font URLs from
# the same base, so one prefix rewrite covers every chunk that carries it. The
# chunks are hash-suffixed, so find them by content rather than by name.
fonts_matched=$(grep -l 'cdn\\.jsdelivr\\.net/npm/@embedpdf' /usr/share/nginx/html/assets/*.js 2>/dev/null || true)
if [ -n "$fonts_matched" ]; then
  sed -i -E -e 's|https://cdn\\.jsdelivr\\.net/npm/@embedpdf|/fonts/embedpdf|g' $fonts_matched
  if grep -qE 'cdn\\.jsdelivr\\.net/npm/@embedpdf' $fonts_matched; then
    echo "ERROR: jsdelivr editor-font URL still present after rewrite. Upstream bundle format may have changed."
    exit 1
  fi
  for f in $fonts_matched; do rm -f "$f.br"; done
  echo "Editor font URLs rewritten to local paths."
else
  echo "NOTE: no @embedpdf CDN URLs found in the bundle (upstream may now ship fonts locally); nothing to rewrite."
fi
echo "WASM and editor-font URLs rewritten to local paths; brotli caches invalidated."
`

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting BentoPDF'))

  const appSub = sdk.SubContainer.of(
    effects,
    { imageId: 'bentopdf' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'bentopdf-sub',
  )

  return sdk.Daemons.of(effects)
    .addOneshot('rewrite-wasm-urls', {
      subcontainer: appSub,
      exec: {
        command: ['sh', '-c', REWRITE_WASM_URLS],
      },
      requires: [],
    })
    .addDaemon('primary', {
      subcontainer: appSub,
      exec: { command: sdk.useEntrypoint() },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['rewrite-wasm-urls'],
    })
})

import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'

// Rewrites the jsdelivr CDN defaults baked into BentoPDF's bundled
// wasm-provider JS to point at the local /wasm/{pymupdf,gs,cpdf}/ paths that
// our Dockerfile lays down. Idempotent: after the first run there are no
// jsdelivr URLs left to match. Fails loudly if upstream's bundle format
// changes in a way that leaves CDN URLs in place — we want to know at
// startup, not when a user tries to convert a PDF.
//
// We also delete the brotli-precompressed copy of the bundle. The upstream
// image ships wasm-provider-*.js.br alongside the .js, and nginx prefers
// the .br for brotli-capable clients — which would silently re-introduce
// the original jsdelivr URLs because the .br is unmodified. With the .br
// missing, nginx falls back to serving the (rewritten) .js.
const REWRITE_WASM_URLS = `
set -e
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
  echo "ERROR: jsdelivr URL still present after rewrite. Upstream bundle format may have changed."
  exit 1
fi
rm -f /usr/share/nginx/html/assets/wasm-provider-*.js.br
echo "WASM URLs rewritten to local paths; brotli cache invalidated."
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

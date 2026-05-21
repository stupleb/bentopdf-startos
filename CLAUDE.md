# CLAUDE.md

See [CONTRIBUTING.md](CONTRIBUTING.md) for the doc map and contribution workflow.

## Operating rules

- This package wraps [BentoPDF](https://github.com/alam00000/bentopdf), a browser-side PDF toolkit. The container is a static nginx server — there is no backend service, no database, no auth.
- The non-trivial part of this package is the WASM re-bundling: upstream v2.0+ defers PyMuPDF/Ghostscript/CoherentPDF to a CDN. Our `Dockerfile` layers them in locally and `startos/main.ts` runs an init oneshot that `sed`s the CDN URLs in the bundled JS to local paths. If a version bump breaks the oneshot, the verification step fails loudly at startup — read the oneshot's stderr first.
- Before bumping the upstream image tag, read `src/js/utils/wasm-provider.ts` at the new tag to see whether the WASM URL shape changed. The current sed handles both pinned (`@x.y.z/`) and unpinned (no version) forms.

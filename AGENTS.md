# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

**Start every task at the recipe index** — `../start-technologies/projects/start-sdk/docs/src/recipes.md`
(or <https://docs.start9.com/packaging/recipes.html>). It maps an intent ("prompt the user to create
admin credentials", "expose a web UI") to the constructs, the reference pages, and a named production
package to copy. Find the recipe before you read this package's neighbours: a package you reach by
grepping may be non-conformant, and the recipe outranks it.

Keep `README.md` (technical reference for an AI support or administering agent) and
`instructions.md` (end-user docs) in sync with your changes.

**Bugs and feature requests are GitHub issues on this repo** — file them as you find them.
Don't record work in the repo instead: no `TODO.md`, no `NOTES.md`, no `PLAN.md`. What you
verified, tried, and decided belongs in the commit message and the PR body.

## This repo

- This package wraps [BentoPDF](https://github.com/alam00000/bentopdf), a browser-side PDF toolkit. The container is a static nginx server — there is no backend service, no database, no auth.
- The non-trivial part of this package is the WASM re-bundling: upstream v2.0+ defers PyMuPDF/Ghostscript/CoherentPDF to a CDN, and v2.8.8+ also fetches the PDF text editor's Noto fallback fonts (`@embedpdf/fonts-*`) from one. Our `Dockerfile` layers them all in locally and `startos/main.ts` runs an init oneshot that `sed`s the CDN URLs in the bundled JS to local paths. If a version bump breaks the oneshot, the verification step fails loudly at startup — read the oneshot's stderr first.
- Before bumping the upstream image tag, read `src/js/utils/wasm-provider.ts` **and** `src/js/config/editor-fonts.ts` at the new tag to see whether the WASM or editor-font URL shapes (or their pinned versions) changed. The current sed handles both pinned (`@x.y.z/`) and unpinned (no version) forms.
- `CONTRIBUTING.md` — build, version-update and contribution workflow for this repo.

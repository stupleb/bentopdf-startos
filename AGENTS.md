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

- A version bump follows `UPDATING.md`. The six `ARG` pins in the `Dockerfile` must match what the new upstream release asks for: a stale pin passes the build and the start-up check and fails only in the browser, as a 404 on a library, font or OCR file.
- A CDN URL in upstream's bundle that is localised later needs three things: its files fetched in the `Dockerfile`'s vendor stage, a rewrite in `startos/main.ts` that also deletes the chunk's `.br` copy (nginx serves that copy to any browser that accepts brotli, so the `.js` alone is not what is served), and a check after the rewrite that fails the start if the URL survived.
- Keep the `Dockerfile`'s final stage free of `RUN`. It is built for both architectures, one of them emulated; the vendor stage runs on the build host's own architecture and does the work.

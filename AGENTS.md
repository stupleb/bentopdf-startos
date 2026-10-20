# AGENTS.md

This is a StartOS service-package repository — it builds a `.s9pk` for StartOS.

Develop it inside a StartOS packaging workspace created by `start-cli s9pk init-workspace`,
which provides the packaging guide and agent context one level up. If you're reading this in a
bare clone with no workspace, the full guide is at <https://docs.start9.com/packaging>.

## This repo

- A version bump follows `UPDATING.md`. The six `ARG` pins in the `Dockerfile` must match what the new upstream release asks for: a stale pin passes the build and the start-up check and fails only in the browser, as a 404 on a library, font or OCR file.
- A CDN URL in upstream's bundle that is localised later needs three things: its files fetched in the `Dockerfile`'s vendor stage, a rewrite in `startos/main.ts`, and a check after the rewrite that fails the start if the URL survived. A URL that code inside a web worker resolves needs the origin in front of it (`self.location.origin+`): tesseract's worker runs from a `blob:` URL, against which a bare path is invalid, and only a browser shows the failure.
- Keep the `Dockerfile`'s final stage free of `RUN`. It is built for both architectures, one of them emulated; the vendor stage runs on the build host's own architecture and does the work.

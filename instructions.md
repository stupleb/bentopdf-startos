# BentoPDF

You've installed BentoPDF — a privacy-first PDF toolkit with 50+ tools that runs entirely in your browser. There's nothing to configure: the service starts on its own and the web UI is usable immediately. Your PDFs never leave your device.

## Documentation

- [BentoPDF website](https://www.bentopdf.com/) — full documentation, feature catalog, and how-to guides.
- [BentoPDF upstream repo](https://github.com/alam00000/bentopdf) — source code and release notes.

## What you get on StartOS

- **A self-contained PDF toolkit.** All tools — merge, split, edit, convert, sign, OCR — run client-side in your browser.
- **No CDN dependency.** The heavyweight WebAssembly libraries (PyMuPDF, Ghostscript, CoherentPDF) ship with the package and are served locally. BentoPDF on StartOS does not contact any external CDN at runtime.
- **Nothing to configure.** No accounts, no admin password, no setup wizard. Open the Web UI and start using it.

## Getting set up

1. Open BentoPDF's **Dashboard** tab.
2. Click the **Web UI** interface to open BentoPDF in your browser.
3. Drag a PDF onto the page and pick a tool.

## A note on browser features

Some advanced tools — Office-document conversion in particular — rely on browser features that require a secure (HTTPS) origin with cross-origin isolation. Access BentoPDF over your StartOS HTTPS hostname or Tor `.onion` address if you intend to use those tools.

## Limitations

- BentoPDF stores nothing on the StartOS box. Closing the browser tab discards in-progress work. Save your output PDFs locally before navigating away.
- The package ships pinned versions of PyMuPDF, Ghostscript, and CoherentPDF. Newer versions of those libraries arrive only when this package is updated.

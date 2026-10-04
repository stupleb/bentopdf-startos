# BentoPDF

## Documentation

- [BentoPDF tool guides](https://github.com/alam00000/bentopdf/tree/main/docs/tools) — upstream's page for each tool: what it does and how to use it

## What you get on StartOS

One web interface with every BentoPDF tool. There are no accounts and no settings to fill in. Your documents are opened and processed by your browser, so nothing you work on is stored on your server or ends up in its backups.

Several things BentoPDF normally downloads from a public CDN come from your server instead: the PyMuPDF, Ghostscript and CoherentPDF libraries that many tools rely on, the PDF editor's fallback fonts, and the OCR engine with the data for these languages: Arabic, Chinese (Simplified and Traditional), Dutch, English, French, German, Hebrew, Hindi, Italian, Japanese, Korean, Polish, Portuguese, Russian, Spanish, Turkish and Ukrainian.

## Using BentoPDF

### Web interface

Press **Open UI** on the service's **Dashboard**. BentoPDF opens on its list of tools; there is no login.

### Office documents

Converting Word, Excel and PowerPoint files needs a secure connection, so open BentoPDF at an address that starts with `https://`. At a plain `http://` address on your network, browsers withhold a feature those tools depend on and the conversion does not work.

### OCR

The OCR tool recognises text in the languages listed above using data from your server. Your browser still fetches two things from the internet:

- the data for any other language, from the jsDelivr CDN, the first time you use that language;
- the font BentoPDF uses for the searchable text it adds to the PDF, from `rawcdn.githack.com`, the first time it is needed in that browser.

Your document is not sent anywhere in either case.

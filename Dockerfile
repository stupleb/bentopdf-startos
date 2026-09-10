# BentoPDF for StartOS
#
# We use upstream's prebuilt -simple image and layer in, locally, what
# upstream defers to a jsdelivr CDN at runtime: the three AGPL WASM packages
# (PyMuPDF, Ghostscript, CoherentPDF) that v2.0+ stopped bundling, (v2.8.8+)
# the PDF text editor's seven Noto fallback fonts, and the OCR engine
# (tesseract.js worker + core WASM + language data). An init oneshot in
# main.ts rewrites the CDN defaults in the bundled JS to these local paths.

# ---- upstream image (named so the vendor stage can borrow its nginx.conf) --
FROM ghcr.io/alam00000/bentopdf-simple:v2.8.8 AS upstream

# ---- vendor stage: fetch the npm packages ----------------------------------
# --platform=$BUILDPLATFORM: this stage only downloads npm tarballs and shuffles
# files, so it is architecture-independent -- run it natively on the build host
# instead of under QEMU (emulated node hit SIGILL on the x86 release runner).
FROM --platform=$BUILDPLATFORM public.ecr.aws/docker/library/node:20-alpine AS wasm

WORKDIR /tmp/pkgs

# Pinned versions match upstream's CDN_DEFAULTS in wasm-provider.ts at v2.8.8.
# Bump these together with the BentoPDF base image tag.
ARG PYMUPDF_VERSION=0.11.16
ARG GS_VERSION=0.1.1
ARG CPDF_VERSION=2.5.5

RUN set -eux; \
    npm pack \
      "@bentopdf/pymupdf-wasm@${PYMUPDF_VERSION}" \
      "@bentopdf/gs-wasm@${GS_VERSION}" \
      "coherentpdf@${CPDF_VERSION}" ; \
    mkdir -p pymupdf gs cpdf ; \
    tar -xzf "bentopdf-pymupdf-wasm-${PYMUPDF_VERSION}.tgz" -C pymupdf --strip-components=1 ; \
    tar -xzf "bentopdf-gs-wasm-${GS_VERSION}.tgz"           -C gs       --strip-components=1 ; \
    tar -xzf "coherentpdf-${CPDF_VERSION}.tgz"              -C cpdf     --strip-components=1 ; \
    # URL-root flattening: BentoPDF concatenates the configured base URL with
    # filenames like 'dist/index.js' (pymupdf), 'gs.js' (ghostscript), and
    # 'coherentpdf.browser.min.js' (cpdf). The jsdelivr defaults pointed at:
    #   pymupdf:     <pkg>/            -- package root, keep as-is
    #   ghostscript: <pkg>/assets/     -- promote assets/ to root
    #   cpdf:        <pkg>/dist/       -- promote dist/   to root
    mv gs/assets/*   gs/   && rmdir gs/assets ; \
    mv cpdf/dist/*   cpdf/ && rmdir cpdf/dist

# Editor fallback fonts. BentoPDF's PDF text editor (v2.8.8+) fetches seven
# Noto fallback fonts from jsdelivr on demand -- see upstream
# src/js/config/editor-fonts.ts and the @embedpdf engine's own loader, both
# pinned to fonts-*@1.0.0. We ship only the single Regular-weight file per
# package that upstream references (~23 MB in total; the packages carry extra
# weights we never serve), laid out as <pkg>@<ver>/fonts/<file> so the
# rewritten base URL resolves unchanged.
ARG EMBEDPDF_FONTS_VERSION=1.0.0

RUN set -eux; \
    for pair in \
      latin:NotoSans-Regular.ttf \
      arabic:NotoNaskhArabic-Regular.ttf \
      hebrew:NotoSansHebrew-Regular.ttf \
      jp:NotoSansJP-Regular.otf \
      kr:NotoSansKR-Regular.otf \
      sc:NotoSansHans-Regular.otf \
      tc:NotoSansHant-Regular.otf ; do \
      p="${pair%%:*}"; f="${pair##*:}"; \
      npm pack "@embedpdf/fonts-${p}@${EMBEDPDF_FONTS_VERSION}" ; \
      mkdir -p "tmp-${p}" "fonts/embedpdf/fonts-${p}@${EMBEDPDF_FONTS_VERSION}/fonts" ; \
      tar -xzf "embedpdf-fonts-${p}-${EMBEDPDF_FONTS_VERSION}.tgz" -C "tmp-${p}" --strip-components=1 ; \
      cp "tmp-${p}/fonts/${f}" "fonts/embedpdf/fonts-${p}@${EMBEDPDF_FONTS_VERSION}/fonts/${f}" ; \
      rm -rf "tmp-${p}" "embedpdf-fonts-${p}-${EMBEDPDF_FONTS_VERSION}.tgz" ; \
    done

# OCR engine (tesseract.js). BentoPDF's OCR tool fetches the tesseract.js
# worker from jsdelivr, and that worker in turn fetches the tesseract.js-core
# WASM and per-language traineddata from jsdelivr -- those two defaults live
# inside the worker itself, so they are patched here at build time in OUR
# copy; the main bundle's workerPath default is rewritten by the oneshot in
# main.ts. tesseract.js and tesseract.js-core share a version (7.0.0 in the
# v2.8.8 bundle); @tesseract.js-data/* are all 1.0.0. Bump TESSERACT_VERSION
# when the version in assets/tesseract-runtime-*.js changes. The languages
# to ship are listed one per line in tesseract-langs.txt.
ARG TESSERACT_VERSION=7.0.0
ARG TESSDATA_VERSION=1.0.0
COPY tesseract-langs.txt .

RUN set -eux; \
    npm pack "tesseract.js@${TESSERACT_VERSION}" "tesseract.js-core@${TESSERACT_VERSION}" ; \
    mkdir -p "tesseract/core/v${TESSERACT_VERSION}" tmp-tess tmp-core ; \
    tar -xzf "tesseract.js-${TESSERACT_VERSION}.tgz"      -C tmp-tess --strip-components=1 ; \
    tar -xzf "tesseract.js-core-${TESSERACT_VERSION}.tgz" -C tmp-core --strip-components=1 ; \
    cp tmp-tess/dist/worker.min.js tesseract/worker.min.js ; \
    cp tmp-core/tesseract-core* "tesseract/core/v${TESSERACT_VERSION}/" ; \
    # Patch the worker's own CDN defaults to the local mirrors. The worker
    # appends "/tesseract-core-<variant>.wasm.js" to corePath and
    # "<lang>/4.0.0_best_int/<lang>.traineddata.gz" to langPath, so the local
    # layout mirrors the CDN paths exactly. Fail the build if anything is left.
    sed -i \
      -e 's|https://cdn\.jsdelivr\.net/npm/tesseract\.js-core@v|/tesseract/core/v|g' \
      -e 's|https://cdn\.jsdelivr\.net/npm/@tesseract\.js-data/|/tesseract/lang/|g' \
      tesseract/worker.min.js ; \
    if grep -q 'cdn\.jsdelivr\.net' tesseract/worker.min.js; then \
      echo "ERROR: a CDN URL survived in the patched tesseract worker; its URL shapes changed." ; exit 1 ; \
    fi ; \
    # Language data: only the int-quantized LSTM model the worker uses by
    # default (4.0.0_best_int). The npm packages also carry a ~4x larger
    # legacy model we never serve, so fetch the one pinned file per language
    # rather than npm-packing whole packages.
    while read -r l; do \
      if [ -n "$l" ]; then \
        mkdir -p "tesseract/lang/$l/4.0.0_best_int" ; \
        wget -q -O "tesseract/lang/$l/4.0.0_best_int/$l.traineddata.gz" \
          "https://cdn.jsdelivr.net/npm/@tesseract.js-data/$l@${TESSDATA_VERSION}/4.0.0_best_int/$l.traineddata.gz" ; \
      fi ; \
    done < tesseract-langs.txt ; \
    rm -rf tmp-tess tmp-core "tesseract.js-${TESSERACT_VERSION}.tgz" "tesseract.js-core-${TESSERACT_VERSION}.tgz"

# nginx: bundled OCR languages are served locally; any other language is
# redirected to jsdelivr by the rule in nginx-tesseract-lang.conf. Upstream's
# server block lives in /etc/nginx/nginx.conf (conf.d is not included), so
# patch a copy of it here -- natively -- and COPY it into the final image,
# keeping that stage RUN-free. Insert before its first location (pdfjs-viewer)
# and fail the build if the anchor moved or the rule landed more than once.
COPY --from=upstream /etc/nginx/nginx.conf ./nginx.conf.orig
COPY nginx-tesseract-lang.conf .

RUN set -eux; \
    grep -q 'location ^~ /pdfjs-viewer/' nginx.conf.orig ; \
    snip=$(sed "s/@TESSDATA_VERSION@/${TESSDATA_VERSION}/g" nginx-tesseract-lang.conf) ; \
    awk -v snip="$snip" 'BEGIN{done=0} /location \^~ \/pdfjs-viewer\//&&!done{print snip; done=1} {print}' nginx.conf.orig > nginx.conf ; \
    [ "$(grep -c 'location @tessdata_cdn' nginx.conf)" = 1 ] ; \
    grep -q 'location ^~ /pdfjs-viewer/' nginx.conf

# ---- final stage: layer onto upstream's prebuilt -simple image -------------
FROM upstream

COPY --from=wasm --chown=nginx:nginx /tmp/pkgs/pymupdf/        /usr/share/nginx/html/wasm/pymupdf/
COPY --from=wasm --chown=nginx:nginx /tmp/pkgs/gs/             /usr/share/nginx/html/wasm/gs/
COPY --from=wasm --chown=nginx:nginx /tmp/pkgs/cpdf/           /usr/share/nginx/html/wasm/cpdf/
COPY --from=wasm --chown=nginx:nginx /tmp/pkgs/fonts/embedpdf/ /usr/share/nginx/html/fonts/embedpdf/
COPY --from=wasm --chown=nginx:nginx /tmp/pkgs/tesseract/      /usr/share/nginx/html/tesseract/
COPY --from=wasm /tmp/pkgs/nginx.conf /etc/nginx/nginx.conf

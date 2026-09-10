# BentoPDF for StartOS
#
# We use upstream's prebuilt -simple image and layer in, locally, what
# upstream defers to a jsdelivr CDN at runtime: the three AGPL WASM packages
# (PyMuPDF, Ghostscript, CoherentPDF) that v2.0+ stopped bundling, and
# (v2.8.8+) the PDF text editor's seven Noto fallback fonts. An init oneshot
# in main.ts rewrites the CDN defaults in the bundled JS to these local paths.

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

# ---- final stage: layer onto upstream's prebuilt -simple image -------------
FROM ghcr.io/alam00000/bentopdf-simple:v2.8.8

COPY --from=wasm --chown=nginx:nginx /tmp/pkgs/pymupdf/        /usr/share/nginx/html/wasm/pymupdf/
COPY --from=wasm --chown=nginx:nginx /tmp/pkgs/gs/             /usr/share/nginx/html/wasm/gs/
COPY --from=wasm --chown=nginx:nginx /tmp/pkgs/cpdf/           /usr/share/nginx/html/wasm/cpdf/
COPY --from=wasm --chown=nginx:nginx /tmp/pkgs/fonts/embedpdf/ /usr/share/nginx/html/fonts/embedpdf/

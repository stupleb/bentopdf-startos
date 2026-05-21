# BentoPDF for StartOS
#
# We use upstream's prebuilt -simple image and layer in the three AGPL WASM
# packages (PyMuPDF, Ghostscript, CoherentPDF) that v2.0+ stopped bundling.
# An init oneshot in main.ts rewrites the jsdelivr CDN defaults in the bundled
# JS to point at these local paths.

# ---- vendor stage: fetch the three npm WASM packages -----------------------
FROM public.ecr.aws/docker/library/node:20-alpine AS wasm

WORKDIR /tmp/pkgs

# Pinned versions match upstream's CDN_DEFAULTS in wasm-provider.ts at v2.8.4.
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

# ---- final stage: layer onto upstream's prebuilt -simple image -------------
FROM ghcr.io/alam00000/bentopdf-simple:v2.8.4

COPY --from=wasm --chown=nginx:nginx /tmp/pkgs/pymupdf/ /usr/share/nginx/html/wasm/pymupdf/
COPY --from=wasm --chown=nginx:nginx /tmp/pkgs/gs/      /usr/share/nginx/html/wasm/gs/
COPY --from=wasm --chown=nginx:nginx /tmp/pkgs/cpdf/    /usr/share/nginx/html/wasm/cpdf/

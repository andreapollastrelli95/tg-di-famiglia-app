#!/usr/bin/env bash
# Build per Cloudflare Pages: copia il sito in _site/ e raccoglie i dati del giorno in _site/data/.
# Comando di build su Cloudflare:  bash scripts/build.sh      Cartella di output:  _site
set -euo pipefail
rm -rf _site && mkdir -p _site/data
cp -r index.html privacy.html regalo.html regalo.js sito.css statistiche.js config.json premium-codes.json _headers robots.txt sitemap.xml \
      favicon.png og-image.png qr-tg-di-famiglia.png app lib screenshot stampa promo guide _site/
python3 -m pip install --quiet -r requirements.txt
SITO_PUBBLICO="${SITO_PUBBLICO:-https://tg-di-famiglia.pages.dev}" python3 scripts/raccogli.py _site/data
echo "Sito pronto in _site/"

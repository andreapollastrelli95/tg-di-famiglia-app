# STATO PROGETTO - PASSAGGIO DI CONSEGNE

## Aggiornamento 20/11/2026 (Vibe)
- Scansione residui completata: rimosso `tools/costruzione-app/pubblica_app.py.bak`, `.gitignore` esteso con `_v_*.png` e `*.bak`.
- Verificate coerenza di `app/index.html` (3997 righe, chiuso correttamente), `sw.js` (cache `tgapp-v3`), `config.json`, `_headers` e statistiche GoatCounter.
- Sito online e dati aggiornati su https://tg-di-famiglia.pages.dev.
- Da fare: commit/push dei file modificati (elenco qui sotto) e collaudo manuale su telefono (`COLLAUDO_MANUALE.md`).

## Ultimo task noto (da Claude Code)
- Esecuzione test demo iPhone (PiantaDemo, gestione touch/eventi) e scansione residui (leftover scan).
- Nota: sessione interrotta per limite settimanale Claude Code; successive modifiche parziali effettuate da Gemini CLI. Task completati da Vibe il 20/11/2026.

## Ultimi 5 Commit
304bfa5 GoatCounter tgdifamiglia, verifica Pinterest, contatto Pinterest al posto dell'email; cache tgapp-v2 7ebdf42 Aggiornamento quotidiano: avviso invece di errore finch├® manca il deploy hook 3810f00 TG di Famiglia, versione pubblica: demo, sblocco, citt├á, premium, regalo, promo, Cloudflare Pages

## File modificati o non tracciati (git status)
 M .github/workflows/aggiorna.yml  M .gitignore  M LANCIO.md  M PUBBLICAZIONE.md  M README.md  M _headers  M app/index.html  M app/sw.js  M config.json  M config/fonti.json  M config/podcast.json  M index.html D  premium-codes.json  M privacy.html  M scripts/build.sh  M scripts/raccogli.py  M stampa/index.html  M tools/costruzione-app/pub_avvio.js D  tools/costruzione-app/pub_premium.js  M tools/costruzione-app/pub_schermate.js  M tools/costruzione-app/pubblica_app.py  M tools/genera_codici.py  M tools/promo.html ?? ARCHITECTURE.md ?? CHANGELOG.md ?? COLLAUDO_MANUALE.md ?? PROJECT_STATUS.md ?? ROADMAP.md ?? TEST_REPORT.md ?? _v_demo.png ?? _v_landing.png ?? _v_sblocca.png ?? codici-sblocco.json ?? config/altro.json ?? config/tech.json ?? tools/costruzione-app/pub_completo.py ?? tools/costruzione-app/pub_livelli.js ?? tools/costruzione-app/pub_sezioni.js ?? tools/costruzione-app/pubblica_app.py.bak

## Riepilogo righe modificate (git diff --stat)
 .github/workflows/aggiorna.yml         |    3 +-  .gitignore                             |    2 +-  LANCIO.md                              |   50 +-  PUBBLICAZIONE.md                       |   31 +-  README.md                              |   41 +-  _headers                               |    2 +-  app/index.html                         | 1380 +++++++++++++++++++++++++++++---  app/sw.js                              |    2 +-  config.json                            |   56 +-  config/fonti.json                      |  177 +++-  config/podcast.json                    |   84 ++  index.html                             |   13 +-  privacy.html                           |    6 +-  scripts/build.sh                       |    2 +-  scripts/raccogli.py                    |  200 +++++  stampa/index.html                      |    2 +-  tools/costruzione-app/pub_avvio.js     |   12 +-  tools/costruzione-app/pub_schermate.js |   26 +-  tools/costruzione-app/pubblica_app.py  |  160 +---  tools/genera_codici.py                 |   42 +-  tools/promo.html                       |    2 +-  21 files changed, 1930 insertions(+), 363 deletions(-)

# ROADMAP – TG di Famiglia

**Ultimo aggiornamento:** 18 Novembre 2026

---

## Fasi Operative

### Fase 1: Audit Completo & Baseline (Completato)
- [x] Analisi struttura repository e stato Git.
- [x] Verifica dei file di configurazione (`config.json`, `codici-sblocco.json`).
- [x] Mappatura degli script di generazione in `tools/costruzione-app/`.

### Fase 2: Verifica, Test e Correzione (Completato)
- [x] Analisi della logica Base/Completo.
- [x] Verifica gestione errori API Gemini (429/503, retry, backoff).
- [x] Controllo sezioni dinamiche e flussi audio/podcast/radio.
- [x] Test responsive mobile e PWA.

### Fase 3: Documentazione & Finalizzazione (Completato)
- [x] `PROJECT_STATUS.md` aggiornato.
- [x] `ROADMAP.md` aggiornato.
- [x] `CHANGELOG.md` aggiornato.
- [x] `ARCHITECTURE.md` creato.
- [x] `TEST_REPORT.md` creato.

### Fase 4: Pubblicazione & Deploy (Completata)
- [x] Deploy su Cloudflare Pages: https://tg-di-famiglia.pages.dev
- [x] Verifica del deploy quotidiano dei dati (grezzo.json aggiornato ogni mattina)

### Fase 5: Consolidamento finale (Completata)
- [x] Scansione residui: rimozione `pubblica_app.py.bak`, `.gitignore` esteso (`_v_*.png`, `*.bak`)
- [x] Verifica consistenza di `app/index.html`, `sw.js` (cache `tgapp-v3`), `config.json` e `_headers`
- [ ] Collaudo manuale su telefono reale (vedi `COLLAUDO_MANUALE.md`)
- [ ] Commit e push delle modifiche aperte

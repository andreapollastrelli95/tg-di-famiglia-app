# ARCHITECTURE – TG di Famiglia

**Data:** 18 Novembre 2026

---

## 1. Struttura dei Repository e delle Cartelle
Il progetto si compone di una repository principale suddivisa per moduli:
- `app/`: Contiene l'applicazione PWA finale (`index.html`, `manifest.json`, `sw.js`, `assets/`).
- `tools/`: Script di utilità per la generazione dei codici (`genera_codici.py`), della PWA (`costruzione-app/`) e materiali promozionali.
- `config/`: File JSON di configurazione per podcast, fonti, province, squadre, tech e altro.
- `proxy/`: Cloudflare Worker per la gestione proxy delle richieste API se necessario.
- `stampa/`: Materiali stampabili (es. volantini A4, biglietti regalo).

---

## 2. Flusso di Generazione dell'App
L'applicazione pubblica viene generata a partire dal codice sorgente privato tramite gli script presenti in `tools/costruzione-app/`:
1. `pubblica_app.py`: Script principale di orchestrazione.
2. `pub_avvio.js`, `pub_schermate.js`, `pub_sezioni.js`, `pub_livelli.js`: Moduli JavaScript iniettati e assemblati per gestire l'avvio, le schermate, le sezioni e i livelli di accesso (Base vs Completo).

---

## 3. Gestione Livelli (Base vs Completo)
La configurazione centralizzata in `config.json` definisce quali funzioni appartengono al livello **Base** (es. telegiornale quotidiano, saluto, una città, fonti) e quali al livello **Completo** (fino a 5 città, squadra del cuore, podcast, radio, calcio, meteo, edizione serale, voce, ecc.).

---

## 4. Sicurezza & Autenticazione
- **Chiave API Google AI Studio:** Memorizzata localmente sul dispositivo dell'utente (`localStorage`), non transita su server intermedi.
- **Codici di Sblocco:** Validati tramite impronte SHA-256 memorizzate in `codici-sblocco.json`.

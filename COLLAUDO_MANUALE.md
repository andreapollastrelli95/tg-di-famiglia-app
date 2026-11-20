# GUIDA OPERATIVA E PIANO DI COLLAUDO MANUALE – TG DI FAMIGLIA

**Data:** 18 Novembre 2026  
**Versione Documento:** 1.0  
**Stato Progetto:** Pronto per collaudo manuale (nessun file applicativo modificato, nessun deploy automatico).

---

## 1. Identificazione della Versione da Collaudare
- **URL Pubblico Disponibile:** [https://tg-di-famiglia.pages.dev](https://tg-di-famiglia.pages.dev) (ospitato su Cloudflare Pages).
- **Repository Pubblicato:** `https://github.com/andreapollastrelli95/tg-di-famiglia-app` (ramo `main`).
- **Modifiche Locali Non Ancora Pubblicate:** Nella cartella di lavoro corrente (`C:\Users\andre\tg-di-famiglia-app`) sono presenti modifiche non committate (aggiornamenti a `config.json`, script di generazione in `tools/costruzione-app/`, documentazione e script di raccolta dati) che introducono la transizione completa al modello Base/Completo e la gestione dei codici di sblocco SHA-256.
- **Nota Importante:** Il sito pubblico attuale riflette l'ultimo commit su GitHub (`304bfa5`), mentre la versione locale contiene i miglioramenti definitivi descritti nella documentazione. Prima di effettuare il collaudo definitivo sul sito pubblico, sarà necessario completare il commit e il push delle modifiche locali (previo comando dell'utente).

---

## 2. Piano di Collaudo Manuale (16 Sezioni)

### A. Apertura e Navigazione
1. **Dove andare:** Aprire il browser e digitare l'URL dell'app (o `file:///.../app/index.html` per i test locali).
2. **Cosa premere:** Verificare l'apparizione immediata della schermata Demo (`schermataDemo`).
3. **Risultato atteso:** L'app si carica senza errori in console, mostra la data odierna formattata in italiano (`it-IT`), avvia l'edizione dimostrativa silenziosa o mostra il grande tasto rosso di play.
4. **Cosa riconoscere come errore:** Schermata bianca, blocco JavaScript in console, mancata visualizzazione della data.

### B. Versione Base
1. **Dove andare:** Avviare l'app senza inserire alcuna chiave API né codice di sblocco.
2. **Cosa premere:** Toccare il tasto Play o navigare tra le funzioni Base consentite.
3. **Risultato atteso:** L'utente può ascoltare il telegiornale quotidiano essenziale, vedere il saluto personalizzato, visualizzare una sola città e accedere alle fonti originali. Le funzioni avanzate (fino a 5 città, squadra del cuore, podcast, radio, meteo avanzato, edizione serale, scelta voce) mostrano l'icona del lucchetto 🔒.
4. **Cosa riconoscere come errore:** Accesso non autorizzato alle funzioni Completo senza sblocco.

### C. Versione Completa
1. **Dove andare:** Aprire il menu Impostazioni (⚙️) o toccare un blocco con lucchetto 🔒.
2. **Cosa premere:** Inserire un codice valido (`TGF-3M-...` o `TGF-1M-...`) oppure una chiave Google AI Studio valida.
3. **Risultato atteso:** Sblocco immediato di tutte le funzionalità avanzate (fino a 5 città, squadra del cuore, podcast, radio, meteo, edizione serale). Il badge di stato indica che la versione Completo è attiva.
4. **Cosa riconoscere come errore:** Messaggio di chiave/codice non valido pur avendo inserito un codice corretto.

### D. Chiave Google AI Studio
1. **Dove andare:** ⚙️ Impostazioni → Sblocca tutto (o schermata Sblocca).
2. **Cosa inserire:** Una chiave API Gemini valida (formato tipico `AIzaSy...`).
3. **Risultato atteso:** Controllo asincrono positivo («✅ Sbloccato!») e salvataggio nel `localStorage` del browser.
4. **Cosa riconoscere come errore:** Errore 400/403 non gestito o blocco dell'interfaccia in caso di chiave formattata male.

### E. Codici Promozionali
1. **Dove andare:** Schermata Sblocca.
2. **Cosa inserire:** Un codice di prova simulato (es. generato con `python tools/genera_codici.py 3M 1`).
3. **Risultato atteso:** Validazione tramite impronta SHA-256 e attivazione della versione Completo per la durata prevista (3 mesi o 1 mese + 5 giorni).
4. **Cosa riconoscere come errore:** Tentativo di riutilizzo dello stesso codice sullo stesso dispositivo (deve essere rifiutato con messaggio di errore).

### F. Personalizzazione Città e Squadra del Cuore
1. **Dove andare:** ⚙️ Impostazioni → Modifica preferenze (o schermata Configurazione).
2. **Cosa inserire:** Nome della famiglia, aggiunta di città (verificando il limite di 1 per Base e fino a 5 per Completo), selezione della squadra del cuore.
3. **Risultato atteso:** Salvataggio delle preferenze e aggiornamento immediato della scaletta del TG.
4. **Cosa riconoscere come errore:** Città non trovata nell'elenco ISTAT o impossibilità di aggiungere città nella versione Completa.

### G. Notizie, Meteo, Sport e Altre Sezioni
1. **Dove andare:** Pulsanti di navigazione principali (TG, Podcast, Radio, Calcio, Varie).
2. **Cosa premere:** Aprire le singole schede (Meteo, Stasera in TV, Accadde oggi, Ricette, ecc.).
3. **Risultato atteso:** Visualizzazione corretta dei contenuti dinamici senza sezioni vuote o "rotelle" di caricamento infinite.
4. **Cosa riconoscere come errore:** Testo troncato, errori di rendering JSON o sezioni vuote spacciate per attive.

### H. Edizione Mattutina e Serale
1. **Dove andare:** Schermata principale del TG.
2. **Cosa verificare:** Presenza dell'edizione del mattino e, dopo le 17:30 (o simulando il controllo orario), dell'edizione serale (riservata alla versione Completo).
3. **Risultato atteso:** Separazione pulita tra le due edizioni, nessun contenuto duplicato.
4. **Cosa riconoscere come errore:** Sovrascrittura dell'edizione mattutina senza preavviso o errore nella riproduzione della sera.

### I. Audio, Sigla e Voce Narrante
1. **Dove andare:** Player audio in alto.
2. **Cosa premere:** ▶ Play, ⏸ Pausa, tasti di scorrimento avanti/indietro.
3. **Risultato atteso:** Riproduzione fluida della sigla, dei stacchi audio e della voce narrante (Web Speech API o voce Gemini se attiva), con sincronizzazione visiva della notizia in onda.
4. **Cosa riconoscere come errore:** Audio interrotto a metà, mancata ripresa dopo la pausa o mancata riproduzione della sigla.

### L. Gestione degli Errori Gemini
1. **Simulazione:** Disattivare temporaneamente la connessione Internet o inserire una chiave con quota esaurita.
2. **Risultato atteso:** Cattura dell'errore (429, 503, timeout, rete), applicazione del backoff esponenziale nei tentativi e visualizzazione di un messaggio chiaro all'utente con l'invito a riprovare.
3. **Cosa riconoscere come errore:** Crash dell'applicazione o loop infinito di chiamate fallite.

### M. Installazione PWA su Android
1. **Dove andare:** Browser Chrome su smartphone Android.
2. **Cosa premere:** Menu puntini in alto a destra → "Aggiungi a schermata Home" (o banner di installazione).
3. **Risultato atteso:** L'app si installa come icona nativa sulla Home, si apre in modalità standalone (senza barra degli indirizzi del browser).
4. **Cosa riconoscere come errore:** Banner di installazione assente o errore di caricamento del Service Worker (`sw.js`).

### N. Installazione PWA su iPhone
1. **Dove andare:** Browser Safari su iPhone / iPad.
2. **Cosa premere:** Tasto Condividi (quadretto con freccia) → "Aggiungi alla schermata Home".
3. **Risultato atteso:** Comparsa dell'icona sulla Home con apertura in modalità standalone e visualizzazione della guida integrata (`guidaInstalla`).
4. **Cosa riconoscere come errore:** Mancata visualizzazione dell'icona Apple Touch o impossibilità di installazione.

### O. Responsive su Desktop, Tablet e Smartphone
1. **Dove andare:** Ridimensionare la finestra del browser o testare su dispositivi con viewport a 390px, 412px, tablet e desktop.
2. **Risultato atteso:** Layout fluido, assenza totale di scroll orizzontale, pulsanti facilmente cliccabili con le dita (touch-friendly), testi leggibili.
3. **Cosa riconoscere come errore:** Elementi sovrapposti, pulsanti fuori schermo o testo illeggibile su schermi stretti.

### P. Scadenze, Prova Gratuita e Regole Commerciali
1. **Simulazione:** Modificare la data di sistema (o simulare le funzioni `regaloNatale()`, `nuoveRegole()`, `giornoProva()`).
2. **Risultato atteso:** 
   - Fino al 31/12/2026: accesso libero come regalo di Natale.
   - Dal 01/01/2027: attivazione prova di 15 giorni, seguita dal blocco o richiesta di sblocco con codice/chiave.
3. **Cosa riconoscere come errore:** Scadenze calcolate in modo errato o blocco anticipato rispetto al periodo di prova.

---

## 3. Tabella di Registrazione del Collaudo Manuale (`COLLAUDO_MANUALE.md`)

| N. | Sezione / Test | Procedura Sintetica | Risultato Atteso | Esito (PASSATO / FALLITO / NON ESEGUITO) | Note / Anomalia |
| :---: | :--- | :--- | :--- | :---: | :--- |
| 1 | **A. Apertura** | Aprire l'app da browser | Caricamento demo e data odierna | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 2 | **B. Base** | Usare l'app senza chiave/codice | Accesso TG base, 1 città, lucchetti attivi | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 3 | **C. Completo** | Inserire codice valido `TGF-3M-...` | Sblocco immediato funzioni avanzate | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 4 | **D. Chiave AI** | Inserire chiave Google AI Studio | Verifica OK e salvataggio locale | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 5 | **E. Codici** | Inserire codice promozionale | Validazione SHA-256 e durata corretta | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 6 | **F. Città/Squadra**| Configurare nome, 2 città e squadra | Aggiornamento scaletta e preferenze | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 7 | **G. Sezioni** | Aprire meteo, TV, accadde oggi | Dati presenti, nessuna sezione vuota | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 8 | **H. Edizioni** | Verificare edizioni mattina e sera | Doppia edizione senza duplicazioni | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 9 | **I. Audio** | Riprodurre sigla, voce e stacchi | Audio fluido e sincronizzato | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 10 | **L. Errori API** | Testare offline / quota esaurita | Messaggio chiaro e retry con backoff | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 11 | **M. PWA Android**| Installare da Chrome Android | Icona Home e mod. standalone | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 12 | **N. PWA iPhone** | Installare da Safari iOS | Icona Home e guida installazione | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 13 | **O. Responsive** | Test su 390px, 412px, tablet, desktop| Assenza scroll orizzontale, UI pulita | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 14 | **P. Commerciale**| Verificare date 2026/2027 e prova 15g | Rispetto scadenze e regole regalo | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 15 | **Sicurezza** | Verificare localStorage e `.gitignore`| Nessun segreto esposto, codici protetti| [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |
| 16 | **Cache PWA** | Svuotare cache e verificare aggiornamento| Ricaricamento pulito via Service Worker | [ ] PASSATO <br>[ ] FALLITO <br>[ ] NON ESEGUITO | |

---

Ho preparato integralmente la guida operativa e il piano di collaudo manuale. Il file `COLLAUDO_MANUALE.md` è pronto per essere utilizzato. Attendo le tue istruzioni per procedere.

# TG di Famiglia – Il tuo telegiornale personale in 5 minuti

**https://tg-di-famiglia.pages.dev** (repository privato, pubblicato con Cloudflare Pages: vedi
[PUBBLICAZIONE.md](PUBBLICAZIONE.md))

Ogni mattina un telegiornale su misura: le notizie più importanti, quelle delle città scelte e della
squadra del cuore, lette da una voce con sigla e stacchi, più 10 podcast consigliati, radio e meteo.
È una PWA installabile su Android e iPhone, senza registrazione: le preferenze restano sul telefono.

## Come si usa

1. Si apre il link: parte subito una **demo** statica (nessuna chiave, voce del telefono). Se il browser
   blocca l'audio compare il tasto **▶ Guarda la demo**.
2. Dopo 20 secondi il riquadro **"Inserisci la tua chiave API…"** spiega come creare gratis la chiave
   Gemini su aistudio.google.com. **Sblocca** la verifica con Google (accetta i formati `AIza…` e `AQ.…`);
   **Più tardi** lascia rivedere la demo; i tasti con il lucchetto 🔒 riaprono il riquadro.
3. Configurazione: nome della famiglia, fino a 5 città (autocompletamento dei 7.896 comuni ISTAT),
   calcio sì/no e squadra del cuore. Dal link di un biglietto regalo (`?famiglia=…&citta=…`) nome e città
   arrivano già compilati.
4. Il primo TG ascoltato fa partire la **prova gratuita di 15 giorni**.

### Scaletta delle 10 notizie

| Scelte | Scaletta |
|---|---|
| nessuna città | 8 nazionali + 2 calcio (10 nazionali senza calcio) |
| 1 città | 6 + 2 locali + 2 calcio |
| 2 città | 5 + 3 locali + 2 calcio |
| 3-5 città | 4 + 4 locali + 2 calcio |

Le notizie locali hanno la città all'inizio del titolo; se non se ne trovano, il posto va a una nazionale.
Calcio spento: niente notizie sportive, niente podcast di calcio, scheda CALCIO nascosta.

## Modello: prova, donazione, Premium (`config.json`)

- `PREMIUM_ENABLED` (true/false) accende o spegne tutto il modello.
- Giorni 1-15 gratis (dal primo TG ascoltato); in Impostazioni "Prova gratuita: mancano X giorni".
- 3° giorno: dopo il TG, una sola volta, il riquadro "Ti sta piacendo TG di Famiglia? ☕" (Ko-fi).
  La donazione resta in Impostazioni → "Sostieni TG di Famiglia".
- 12° giorno: avviso "Mancano 3 giorni alla fine della prova gratuita…".
- Dal 16° giorno: schermata "Continua con TG di Famiglia Premium – 1,99 €/mese". Restano gratis demo,
  biglietto regalo e condivisione.
- Web: abbonamento Ko-fi → codice personale verificato con l'hash in `premium-codes.json`
  (`python tools/genera_codici.py 20`; i codici in chiaro non vanno mai nel repository).
- Nessuno store: l'app si distribuisce solo con il link e si installa dalla schermata Home (tasto
  "📲 Installa l'app": su Android usa l'installazione automatica di Chrome, su iPhone mostra i passaggi).

## Regalo e condivisione

- **Biglietto regalo** (gratis, `regalo.html`, `regalo.js`, anche nella landing e nell'app): nome,
  messaggio e tema (Natale, Festa del papà, Festa della mamma, Compleanno, Nonni) → A5 in PDF e PNG con
  il QR `https://tg-di-famiglia.pages.dev/?famiglia=<Nome>&citta=<città>` e le istruzioni; tasto
  "Invia il regalo su WhatsApp".
- **Condividi su WhatsApp**: alla fine di ogni TG, sotto il tasto play e in Impostazioni. Usa il pannello
  di condivisione del telefono (`navigator.share`) se c'è, altrimenti `wa.me`.

## Statistiche anonime (GoatCounter, senza cookie)

Codice in `statistiche.js` e `app/index.html` (`TUO-CODICE`). Eventi (mai nomi, città o chiavi):
`apertura-app`, `apri-dalla-landing`, `demo-avviata`, `riquadro-chiave`, `piu-tardi`, `chiave-verificata`,
`sblocco-riuscito`, `onboarding-completato`, `installata`, `avvio-standalone`, `play`, `approfondisci`,
`podcast`, `prova-iniziata`, `donazione-mostrata`, `caffe`, `caffe-altra-volta`, `avviso-fine-prova`,
`premium-mostrata`, `abbonati`, `codice-premium-attivato`, `biglietto-creato`, `biglietto-scaricato`,
`regalo-whatsapp`, `aperta-da-biglietto`, `condivisione`, `aperta-da-whatsapp`.

## Come funziona

```
Cloudflare Pages (build: bash scripts/build.sh, ogni push + ogni mattina via deploy hook)
  scripts/raccogli.py  (nessuna chiave)
    ├─ feed nazionali e sportivi, podcast, guida TV           → data/grezzo.json
    ├─ Google News per le 107 province                         → data/province/<SIGLA>.json
    ├─ Google News per 33 squadre                              → data/squadre/<id>.json
    └─ podcast locali per provincia (a rotazione)              → data/province/<SIGLA>.json
Telefono (app/index.html): scarica i dati delle sue città, Gemini (chiave dell'utente) scrive il TG,
voce di Gemini con la voce del telefono come riserva.
```

## Struttura

```
index.html, regalo.html, privacy.html   landing, generatore di biglietti, privacy
guide/                                  3 pagine utili per i motori di ricerca
stampa/                                 cartella stampa
app/                                    l'app (PWA)
config.json, premium-codes.json         impostazioni pubbliche, impronte dei codici Premium
regalo.js, sito.css, statistiche.js     codice e stile condivisi; lib/ = qrcode-generator e jsPDF
config/, scripts/                       fonti e raccolta dati; scripts/build.sh per Cloudflare
tools/                                  comuni ISTAT, codici Premium, QR, generatore promo (non pubblicato)
promo/                                  screenshot 1080×1920, Pinterest, volantino A4, biglietti di esempio
proxy/                                  Cloudflare Worker per Gemini (non attivo)
_headers, robots.txt, sitemap.xml
```

## Avvertenza sui contenuti

Le notizie sono riassunti generati dall'intelligenza artificiale a partire da titoli e sommari delle
testate, con fonte e link all'articolo originale. Possono contenere errori: vanno verificate sulle fonti.

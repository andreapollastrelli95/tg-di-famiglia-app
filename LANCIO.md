# Lancio di "TG di Famiglia" – account del brand, testi e calendario

Tutto a nome del brand **TG di Famiglia**: mai nomi personali in profili, post e immagini.
Regole: password, codici, telefono, documenti, data di nascita, pagamenti e CAPTCHA li gestisci tu;
nessuna pubblicazione senza il tuo ok; niente recensioni o utenti finti, un solo account per piattaforma.

Link: **https://tg-di-famiglia.pages.dev** · Slogan: **"Regala alla tua famiglia un TG"**
Logo per i profili: `app/icons/icon-512.png` (o `promo/screenshot/icona-512.png`).

---

## 1. Gmail del brand (per primo)

1. Apri [accounts.google.com/signup](https://accounts.google.com/signup) → *Per uso personale*.
2. Nome **TG**, cognome **di Famiglia**.
3. Indirizzo, in ordine: `tgdifamiglia.app` → `tgdifamiglia` → `tg.di.famiglia` → `tgdifamiglia.info`.
4. Data di nascita, telefono, email di recupero, password, CAPTCHA: tuoi.
5. Dopo la creazione:
   - **Verifica in due passaggi**: [myaccount.google.com/security](https://myaccount.google.com/security).
   - **Firma** (Gmail → ⚙️ → Visualizza tutte le impostazioni → Firma):
     `TG di Famiglia – il tuo telegiornale di famiglia · https://tg-di-famiglia.pages.dev`
   - **Foto del profilo**: [myaccount.google.com](https://myaccount.google.com) → Informazioni personali → Foto → carica `icona-512.png`.

**Se l'indirizzo non è `tgdifamiglia.app@gmail.com`**, va sostituito in questi file (lo fa Claude Code):
`index.html`, `privacy.html`, `stampa/index.html`, `app/index.html` (2 punti, nella build: `pubblica_app.py`),
`config.json` (`email`), `PUBBLICAZIONE.md`, `LANCIO.md`.

## 2. Account tecnici dell'app

### GoatCounter (statistiche anonime, gratis)
1. [goatcounter.com/signup](https://www.goatcounter.com/signup) → *Code*: **`tgdifamiglia`**, email del brand.
2. Dai a Claude Code il codice: va messo al posto di `TUO-CODICE` in `statistiche.js` e in `app/index.html`.
3. In GoatCounter → Settings: attiva *"Don't track IPs"* (o lascia il default anonimo).

### Ko-fi (donazioni e Premium, gratis)
1. [ko-fi.com](https://ko-fi.com/) → *Start a page* con l'email del brand. Link: **`ko-fi.com/tgdifamiglia`**.
2. Nome pagina: **TG di Famiglia** · Immagine: `icona-512.png` · Copertina: `og-image.png`.
3. **Descrizione** (About):
   > TG di Famiglia è un telegiornale personale gratuito: ogni mattina le notizie del giorno lette come al
   > TG, con il saluto per la famiglia e le notizie della propria città. Nessuna pubblicità. Con un caffè
   > ci aiuti a tenerlo vivo e a costruire le prossime funzioni. Grazie! ☕ https://tg-di-famiglia.pages.dev
4. **Obiettivo** (Goal): *"50 caffè per le prossime funzioni"* · importo: 50 × prezzo del caffè.
   Prezzo del caffè: **2 €** (Settings → Payments → Coffee price).
5. **Membership**: *Memberships → Enable* → livello **"Premium"** a **1,99 €/mese**. Descrizione:
   > Il tuo TG di Famiglia ogni mattina, senza limiti: notizie, città, squadra del cuore, podcast. Dopo
   > l'iscrizione ricevi un codice personale da inserire nell'app (⚙️ → Premium). Disdici quando vuoi.
   Messaggio di benvenuto (da completare a mano con un codice di `codici-premium-PRIVATI.txt`):
   > Grazie per aver scelto TG di Famiglia Premium! Il tuo codice è: TGF-XXXX-XXXX-XXXX. Aprilo
   > nell'app, inseriscilo nella schermata Premium e premi «Attiva».
6. **Pagamenti**: collega **Stripe** (preferito: mostra il nome del brand a chi paga) – dati bancari e
   d'identità li inserisci tu. Su Stripe imposta *Public business name* = "TG di Famiglia".

## 3. Reddit

1. Registrazione su [reddit.com](https://www.reddit.com/) con l'email del brand. Username in ordine:
   `TGdiFamiglia` → `TG_di_Famiglia` → `TGdiFamigliaApp`.
2. Profilo: avatar con il logo; descrizione:
   *"Il telegiornale personale per tutta la famiglia, gratis. Creato da un figlio per suo papà."*;
   link: https://tg-di-famiglia.pages.dev
3. **Non pubblicare subito.** Le regole dei subreddit vanno lette dalla barra laterale ("Rules") e dal
   post fissato di ciascuno: da qui non è stato possibile leggerle (Reddit blocca l'accesso automatico),
   quindi **non sono verificate**. Per ognuno annota: autopromozione permessa? karma minimo? età
   dell'account? giorno dedicato o thread settimanale? flair obbligatorio?

| Subreddit | Perché è adatto | Da verificare | Consiglio |
|---|---|---|---|
| r/ItalyInformatica | progetti software italiani | regole su "progetto personale"/autopromozione, flair | il più adatto: post tecnico e onesto |
| r/italy | pubblico ampio | di solito l'autopromozione è molto limitata o solo in thread dedicati | solo se le regole lo permettono, nel thread giusto |
| r/Italia | pubblico ampio | come sopra | idem |
| r/AppItaliane o simili (cerca "app italiane") | app fatte in Italia | esistenza, attività, regole | se attivo |
| un subreddit di idee regalo in italiano (cerca "regali") | regalo per i nonni | esistenza, regole | sotto Natale |

Prima di pubblicare: usa l'account per **1-2 settimane** commentando in modo utile (molti subreddit
filtrano account nuovi o con poco karma). Pubblica un solo subreddit al giorno, mai lo stesso testo
copiato ovunque.

### Bozze (da approvare, una per subreddit)

**r/ItalyInformatica** – titolo: *Ho fatto un TG personale per mio papà: una web app che legge le notizie del mattino. Mi date un parere?*
> Ciao! Sono l'autore di TG di Famiglia. È nato come regalo per mio papà, che ogni mattina faticava a
> leggere le notizie sul telefono (caratteri piccoli, pubblicità, popup). Ho fatto una PWA che ogni
> mattina raccoglie i feed delle principali testate e le notizie locali (Google News per provincia),
> poi con Gemini sceglie 10 notizie e le legge ad alta voce con sigla e stacchi, come un TG. Ogni notizia
> ha la fonte e il link all'articolo.
> Dettagli tecnici: niente backend (raccolta dati in una build statica ogni mattina), ogni utente usa la
> propria chiave Gemini gratuita che resta sul telefono, voce di Gemini con quella del telefono come
> riserva, scelta di città tra i 7.896 comuni ISTAT, statistiche anonime senza cookie.
> I primi 15 giorni sono gratis, poi c'è un Premium da 1,99 €/mese (demo e biglietto regalo restano gratis).
> Cerco pareri e critiche, soprattutto su: facilità per chi non è pratico, qualità dei riassunti,
> privacy. Link: https://tg-di-famiglia.pages.dev

**r/italy / r/Italia** (solo nel thread consentito) – titolo: *Un TG personale da regalare ai genitori/nonni: ve lo faccio provare*
> Ho creato TG di Famiglia, una web app gratuita (15 giorni, poi 1,99 €/mese) nata per mio papà: si
> preme play e si ascoltano le notizie del giorno lette come al telegiornale, con il saluto per la
> famiglia e le notizie della propria città. Si può stampare un biglietto regalo con il QR. Sono
> l'autore: accetto volentieri critiche e suggerimenti. https://tg-di-famiglia.pages.dev

**Subreddit di regali** – titolo: *Idea regalo per i nonni che vogliono sentire le notizie*
> Se avete nonni o genitori che vogliono le notizie ma faticano col telefono: ho fatto un "TG di
> famiglia" che le legge ad alta voce ogni mattina, con il loro nome nel saluto. Dal sito si crea gratis
> un biglietto da stampare con il QR (temi Natale, nonni, festa del papà...). Sono l'autore, ditemi cosa
> ne pensate: https://tg-di-famiglia.pages.dev/regalo.html

**Risposte ai commenti (modelli da adattare, sempre con il tuo ok):**
- *"Serve la chiave Google?"* → «Sì, per ora ognuno usa la sua chiave Gemini gratuita: si crea in un
  minuto e l'app guida passo passo. Così il servizio resta senza server e senza costi per voi.»
- *"E la privacy?"* → «Preferenze e chiave restano sul telefono; le statistiche sono anonime e senza
  cookie (GoatCounter). Dettagli: https://tg-di-famiglia.pages.dev/privacy.html»
- *"L'AI sbaglia"* → «Vero: per questo ogni notizia ha la fonte e il link all'articolo. Se trovi un
  errore mandami la notizia, mi aiuta a migliorare le istruzioni.»
- Critica negativa → ringrazia, chiedi un dettaglio concreto, non discutere.

## 4. Pinterest (account business gratuito)

1. [pinterest.it/business/create](https://www.pinterest.it/business/create/) con l'email del brand.
   Nome **TG di Famiglia**, sito `https://tg-di-famiglia.pages.dev`, categoria *App/Tecnologia* o *Regali*.
2. **Verifica del sito**: Impostazioni → *Account rivendicati* → *Rivendica* il sito → scegli **Aggiungi
   tag HTML**: copia il tag `<meta name="p:domain_verify" content="…"/>` e dallo a Claude Code, che lo
   mette nella `<head>` della landing (`index.html`, c'è già il punto segnato). Dopo la pubblicazione
   premi **Verifica**.
3. Bacheche: **Idee regalo per i nonni** · **Regali di Natale per la famiglia** · **Regali per la Festa del papà**.
4. Pin (immagini in `promo/pinterest/`, testi in `promo/pinterest/pinterest.md`):

| Pin | Bacheca |
|---|---|
| pin-01-natale, pin-02-natale, pin-07-compleanno | Regali di Natale per la famiglia |
| pin-09-nonni, pin-10-nonni, pin-05-mamma, pin-06-mamma, pin-08-compleanno | Idee regalo per i nonni |
| pin-03-papa, pin-04-papa | Regali per la Festa del papà |

5. Pubblica **2 pin al giorno** (Pinterest permette di programmare i pin dal computer: *Crea Pin →
   Pubblica più tardi*).

## 5. Store: non si usano

Nessun Google Play / Galaxy Store / altri store. L'app si installa dal link: la landing ha la sezione
**"📲 Installala sul telefono"** con il tasto **Installa l'app** (su Android usa l'installazione automatica
di Chrome, su iPhone mostra i 3 passaggi) e lo stesso tasto c'è nell'app (demo, TG, Impostazioni).

## Calendario proposto

| Data | Cosa |
|---|---|
| giorno 0 | Gmail → GoatCounter → Ko-fi (Stripe) → Pinterest (verifica sito) → Reddit (solo profilo) |
| giorno 1 | Claude Code: email, codice GoatCounter, meta Pinterest, push → controllo del sito pubblicato |
| giorni 2-6 | Pinterest: 2 pin al giorno (prima i 3 di Natale e i 2 dei nonni, poi mamma, compleanno, papà) |
| giorni 1-14 | Reddit: commenti utili nei subreddit scelti, niente link; leggi e annota le regole |
| giorno ~15 | Reddit: primo post su r/ItalyInformatica (se le regole lo permettono), rispondi ai commenti per 2 giorni |
| giorno ~18 | Reddit: post nel subreddit di regali (periodo natalizio) |
| giorno ~22 | Reddit: r/italy o r/Italia solo nel thread consentito |
| febbraio-marzo | Pin della Festa del papà in evidenza (19 marzo) |
| aprile-maggio | Pin della Festa della mamma (seconda domenica di maggio) |

## Checklist

| Account | Stato | Cosa manca |
|---|---|---|
| Gmail del brand | da creare | registrazione (tu), 2 passaggi, firma, foto |
| GoatCounter | da creare | codice `tgdifamiglia` → Claude Code lo inserisce |
| Ko-fi | da creare | pagina, obiettivo, membership 1,99 €, Stripe (tu) |
| Reddit | da creare | profilo; regole dei subreddit da verificare; post dopo 1-2 settimane |
| Pinterest | da creare | account business, meta di verifica → Claude Code, 3 bacheche, 10 pin |
| Cloudflare Pages | da creare | vedi `PUBBLICAZIONE.md` (serve prima di Pinterest e Reddit) |

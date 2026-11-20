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

**Contatto pubblico:** per ora nessuna email (l'indirizzo previsto non esiste): landing, privacy, cartella
stampa e app rimandano al profilo https://pinterest.com/tgdifamiglia. Quando ci sarà l'email del brand,
Claude Code la inserisce in `index.html`, `privacy.html`, `stampa/index.html`, `app/index.html` e `config.json`.

## 2. Account tecnici dell'app

### GoatCounter (statistiche anonime, gratis)
1. [goatcounter.com/signup](https://www.goatcounter.com/signup) → *Code*: **`tgdifamiglia`**, email del brand.
2. ✅ Codice `tgdifamiglia` già inserito nell'app e nel sito (statistiche su https://tgdifamiglia.goatcounter.com).
3. In GoatCounter → Settings: attiva *"Don't track IPs"* (o lascia il default anonimo).

### Ko-fi (sblocco e sostegno, gratis)
1. La pagina è già `ko-fi.com/tgdifamiglia`. Nome pagina: **TG di Famiglia** · immagine `icona-512.png`.
2. **Descrizione** (About):
   > TG di Famiglia è un telegiornale personale: ogni mattina le notizie del giorno lette come al TG, con il
   > saluto per la famiglia e le notizie della propria città. Nessuna pubblicità. Con un contributo sblocchi
   > TG di Famiglia Completo e ci aiuti a costruire le prossime funzioni. Grazie! https://tg-di-famiglia.pages.dev
3. **Obiettivo** (Goal): *"50 caffè per le prossime funzioni"*. Prezzo del caffè: **2 €**.
4. **Articolo dello Shop** (contributo da 5 €): *Shop → Add item* → tipo **Digital product / Commission-free item**
   - Nome: **TG di Famiglia Completo – 3 mesi**
   - Prezzo: **5 €**
   - Descrizione:
     > Sblocca TG di Famiglia Completo per 3 mesi: fino a 5 città, squadra del cuore, podcast, sigla e musica,
     > meteo, radio, edizione serale, scelta della voce e tutte le altre schede. Dopo l'acquisto ricevi un
     > codice personale (TGF-3M-…) da inserire nell'app: ⚙️ Impostazioni → Sblocca tutto.
   - Messaggio dopo l'acquisto (testo da mandare a mano con il codice):
     > Grazie! Il tuo codice è: TGF-3M-XXXX-XXXX. Apri TG di Famiglia, tocca ⚙️ → Sblocca tutto, scrivi il
     > codice e premi «Sblocca». Resta valido 3 mesi dal giorno in cui lo attivi.
   - Link usato nell'app (`config.json` → `SBLOCCO.3M.link`): `https://ko-fi.com/tgdifamiglia/shop`
     (se Ko-fi ti dà l'indirizzo diretto dell'articolo, sostituiscilo).
5. **Membership** (mensile): rinomina il livello esistente "TG di Famiglia Premium" in
   **"TG di Famiglia Completo – mensile"**, **1,99 €/mese**. Descrizione:
   > Il tuo TG di Famiglia Completo ogni mese: tutte le funzioni, senza limiti. Ricevi un codice personale
   > (TGF-1M-…) da inserire nell'app (⚙️ → Sblocca tutto). A ogni rinnovo mensile ricevi un codice nuovo.
   > Disdici quando vuoi.
   Messaggio di benvenuto (da completare con un codice `1M`):
   > Grazie per l'iscrizione! Il tuo codice è: TGF-1M-XXXX-XXXX. Apri TG di Famiglia, ⚙️ → Sblocca tutto,
   > scrivi il codice e premi «Sblocca». Ogni mese ti mando un codice nuovo.
6. **Pagamenti**: collega **Stripe** (preferito: mostra il nome del brand a chi paga) – dati bancari e
   d'identità li inserisci tu. Su Stripe imposta *Public business name* = "TG di Famiglia".
7. **Come mandi i codici**: `python tools/genera_codici.py 3M 10` (o `1M 5`), poi commit e push di
   `codici-sblocco.json`, poi copi un codice dal file `codici-sblocco-PRIVATI.txt` nel messaggio.

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
> Fino al 31 dicembre 2026 la versione Base è gratis; con 5 € si sbloccano tutte le funzioni per 3 mesi (dal 2027: 15 giorni gratis, poi 5 € per 3 mesi o 1,99 €/mese). Demo e biglietto regalo restano gratis.
> Cerco pareri e critiche, soprattutto su: facilità per chi non è pratico, qualità dei riassunti,
> privacy. Link: https://tg-di-famiglia.pages.dev

**r/italy / r/Italia** (solo nel thread consentito) – titolo: *Un TG personale da regalare ai genitori/nonni: ve lo faccio provare*
> Ho creato TG di Famiglia, una web app gratuita nella versione Base (con 5 € si sbloccano tutte le funzioni) nata per mio papà: si
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
| Ko-fi | pagina creata | articolo Shop da 5 €, membership "Completo – mensile" da 1,99 €, Stripe (tu) |
| Reddit | da creare | profilo; regole dei subreddit da verificare; post dopo 1-2 settimane |
| Pinterest | da creare | account business, meta di verifica → Claude Code, 3 bacheche, 10 pin |
| Cloudflare Pages | da creare | vedi `PUBBLICAZIONE.md` (serve prima di Pinterest e Reddit) |

# Pubblicare TG di Famiglia su Cloudflare Pages

Indirizzo previsto: **https://tg-di-famiglia.pages.dev** (se il nome è già preso: `tgdifamiglia` oppure
`tg-di-famiglia-app`; in quel caso vedi "Se il nome cambia" in fondo).

Il repository GitHub resta **privato**: Cloudflare lo legge con il permesso che gli dai al punto 2. Nessun
indirizzo pubblico contiene il nome dell'autore.

Come funziona: a ogni build Cloudflare esegue `scripts/build.sh`, che copia il sito e **raccoglie le
notizie del giorno** (Python, nessuna chiave). Ogni mattina un workflow di GitHub Actions chiama il
"Deploy hook" di Cloudflare per rifare la build con le notizie fresche.

## 1. Account Cloudflare (gratuito)

1. Vai su [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up) e registrati con l'email del
   brand (es. `tgdifamiglia.app@gmail.com`). Conferma l'email.
2. Non serve aggiungere un dominio né una carta di credito.

## 2. Creare il progetto Pages collegato a GitHub

1. Nel pannello: **Workers & Pages → Create → Pages → Connect to Git**.
2. **Connect GitHub** → si apre GitHub: scegli **Only select repositories** → `tg-di-famiglia-app` →
   **Install & Authorize**.
3. Seleziona il repository `tg-di-famiglia-app` → **Begin setup**.
4. Compila così:
   | Campo | Valore |
   |---|---|
   | Project name | `tg-di-famiglia` (diventa `tg-di-famiglia.pages.dev`) |
   | Production branch | `main` |
   | Framework preset | `None` |
   | Build command | `bash scripts/build.sh` |
   | Build output directory | `_site` |
   | Root directory | *(vuoto)* |
5. Apri **Environment variables (advanced)** e aggiungi:
   | Nome | Valore |
   |---|---|
   | `PYTHON_VERSION` | `3.12` |
   | `SITO_PUBBLICO` | `https://tg-di-famiglia.pages.dev` |
6. **Save and Deploy**. La prima build dura 5-8 minuti (raccoglie le notizie di 107 province).
   Alla fine compare il link: aprilo e controlla che la demo parta.

> Se il nome `tg-di-famiglia` è occupato, Cloudflare aggiunge un suffisso casuale (es.
> `tg-di-famiglia-4xy.pages.dev`): in quel caso annulla e usa `tgdifamiglia`.

## 3. Aggiornamento ogni mattina

1. In Cloudflare: **Workers & Pages → tg-di-famiglia → Settings → Builds → Deploy hooks → Add deploy
   hook**. Nome: `mattino`, branch: `main` → **Save**. Copia l'indirizzo che compare (inizia con
   `https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/…`).
2. Su GitHub, nel repository: **Settings → Secrets and variables → Actions → New repository secret**.
   Nome `CF_DEPLOY_HOOK`, valore: l'indirizzo copiato → **Add secret**.
3. Prova: **Actions → Aggiornamento quotidiano (Cloudflare Pages) → Run workflow**. Dopo qualche
   secondo in Cloudflare (scheda *Deployments*) parte una nuova build.

Da quel momento ogni giorno alle 04:30 UTC (05:30/06:30 in Italia) il sito si aggiorna da solo.
Il workflow `keepalive.yml` fa un piccolo commit al mese, perché GitHub non sospenda quello programmato.

## 4. Controlli dopo la pubblicazione

- `https://tg-di-famiglia.pages.dev/` → la landing con il generatore di biglietti.
- `https://tg-di-famiglia.pages.dev/app/` → la demo parte (o compare il tasto ▶).
- `https://tg-di-famiglia.pages.dev/data/grezzo.json` → i dati di oggi.
- Da Chrome su Android: menu ⋮ → deve comparire **Installa app**. Su iPhone: Condividi → Aggiungi alla
  schermata Home.
- `https://tg-di-famiglia.pages.dev/?famiglia=Rossi&citta=Bergamo` → apre l'app e, dopo lo sblocco,
  la configurazione è già compilata.

Le intestazioni HTTP (service worker sempre aggiornato, manifest, dati non in cache) sono nel file
`_headers`, che Cloudflare applica da solo.

## 5. Statistiche, donazioni, contatti (segnaposto da sostituire)

| Segnaposto | Dove | Cosa fare |
|---|---|---|
| `TUO-CODICE` (GoatCounter) | `statistiche.js`, `app/index.html` (riga `GOATCOUNTER_CODICE`) | crea l'account su goatcounter.com con il codice scelto (es. `tgdifamiglia`) |
| `https://ko-fi.com/tgdifamiglia` | `config.json` (`kofi_caffe`, `kofi_abbonamento`) | crea la pagina Ko-fi con quel nome e il livello di membership "Premium" a 1,99 €/mese |
| `tgdifamiglia.app@gmail.com` | landing, privacy, stampa, app | crea la casella Gmail del brand |

Dopo ogni modifica: commit e push su `main` → Cloudflare ripubblica da solo.

## 6. Codici Premium (abbonati Ko-fi)

```bash
python tools/genera_codici.py 20
```
Stampa 20 codici (e li salva in `codici-premium-PRIVATI.txt`, che **non** va nel repository) e aggiunge le
loro impronte a `premium-codes.json`. Fai commit e push di `premium-codes.json`. A ogni nuovo abbonato
Ko-fi invia un codice (Ko-fi permette un messaggio automatico di ringraziamento per i membri: puoi
inviarli a mano dalla sezione *Supporters*). Per revocarne uno:
`python tools/genera_codici.py --revoca TGF-XXXX-XXXX-XXXX`.

Nota: la prova gratuita e lo stato Premium sono salvati sul telefono; sul web una persona esperta può
aggirarli (per esempio cancellando i dati del sito). Per un controllo vero serve un server (fase
successiva, vedi `proxy/`).

## Se il nome cambia

Se il progetto si chiama diversamente (es. `tgdifamiglia`), sostituisci `tg-di-famiglia.pages.dev` in tutti
i file con il nuovo indirizzo (`grep -rl "tg-di-famiglia.pages.dev" .`), rigenera il QR con
`python tools/genera_qr.py https://tgdifamiglia.pages.dev/` e aggiorna la variabile `SITO_PUBBLICO`
in Cloudflare.

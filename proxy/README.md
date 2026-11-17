# Proxy Gemini (fase successiva – non attivo)

Oggi ogni utente usa la **propria** chiave Gemini, inserita nell'app. Questo proxy serve per il passo
successivo: tenere **una sola chiave sul server**, così chi installa l'app non deve crearne una.

Il proxy è un [Cloudflare Worker](https://developers.cloudflare.com/workers/) (piano gratuito: 100.000
richieste al giorno) che:

- inoltra a Google solo le chiamate `generateContent` e `streamGenerateContent` dei modelli Gemini;
- applica un **limite giornaliero per telefono** (`LIMITE_UTENTE`, ogni telefono ha un id casuale) e uno
  **globale** (`LIMITE_TOTALE`) per non esaurire la quota della chiave;
- risponde solo all'origine dell'app (CORS).

## Deploy

1. Crea un account gratuito su [dash.cloudflare.com](https://dash.cloudflare.com/).
2. Da questa cartella:
   ```bash
   npm install -g wrangler        # oppure usa: npx wrangler ...
   wrangler login
   wrangler kv namespace create LIMITI
   ```
   Copia l'`id` restituito in `wrangler.toml` al posto di `INCOLLA-QUI-L-ID-DEL-NAMESPACE`.
3. Salva la chiave Gemini **come segreto** (non scriverla mai nei file):
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```
4. Pubblica:
   ```bash
   wrangler deploy
   ```
   Otterrai un indirizzo tipo `https://tg-di-famiglia-proxy.<tuo-account>.workers.dev`.
5. Prova che risponda:
   ```bash
   curl -X POST "https://tg-di-famiglia-proxy.<tuo-account>.workers.dev/v1beta/models/gemini-flash-latest:generateContent" \
     -H "Origin: https://tg-di-famiglia.pages.dev" -H "x-tg-utente: prova-12345678" \
     -H "Content-Type: application/json" -d '{"contents":[{"parts":[{"text":"Ciao"}]}]}'
   ```

## Attivarlo nell'app

In `app/index.html`, nell'oggetto `CONFIG`:

```js
useProxy: true,
proxyUrl: 'https://tg-di-famiglia-proxy.<tuo-account>.workers.dev',
```

Con `useProxy: true` l'app non chiede più la chiave: la demo resta, il riquadro di sblocco non serve più
(conviene allora togliere il riquadro o trasformarlo in un semplice "Inizia"). Alza anche `CACHE` in
`app/sw.js` perché i telefoni scarichino la versione nuova.

## Costi e attenzioni

- Con una sola chiave, **tutte** le richieste pesano sulla tua quota Gemini: il piano gratuito basta per
  poche decine di utenti al giorno. Oltre servirà un piano a pagamento di Google: imposta un tetto di spesa.
- La voce di Gemini (TTS) ha quote gratuite molto basse: con tanti utenti conviene lasciare la voce del
  telefono oppure preparare l'audio sul server.
- Il limite per utente si basa su un id casuale salvato nel telefono: è una protezione contro l'uso
  normale eccessivo, non contro chi vuole abusarne di proposito. Per questo esiste anche il limite globale.

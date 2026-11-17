/**
 * TG di Famiglia – proxy per Gemini (Cloudflare Worker). FASE SUCCESSIVA: NON ATTIVO.
 *
 * Tiene la chiave Gemini sul server (segreto GEMINI_API_KEY), così gli utenti non devono crearne una.
 * L'app lo usa quando in app/index.html si imposta CONFIG.useProxy = true e CONFIG.proxyUrl.
 *
 * - Accetta solo POST verso /v1beta/models/<modello>:generateContent | :streamGenerateContent
 * - Accetta solo i modelli dell'elenco MODELLI (niente uso improprio della chiave)
 * - Limite di richieste per utente al giorno (intestazione x-tg-utente = id casuale del telefono)
 *   e limite globale giornaliero, contati in un KV namespace (binding LIMITI)
 * - CORS solo per l'origine dell'app (ORIGINE_APP)
 */
const MODELLI = /^(gemini-[\w.-]+)$/;
const LIMITE_UTENTE = 40;      // richieste al giorno per telefono (un TG ne usa circa 12 con la voce)
const LIMITE_TOTALE = 20000;   // richieste al giorno per tutti: protegge la quota della chiave

export default {
  async fetch(req, env) {
    const origine = req.headers.get('Origin') || '';
    const consentita = origine === (env.ORIGINE_APP || 'https://tg-di-famiglia.pages.dev');
    const cors = {
      'Access-Control-Allow-Origin': consentita ? origine : 'null',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-tg-utente',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    };
    const risposta = (stato, messaggio) => new Response(JSON.stringify({ error: { code: stato, message: messaggio } }), { status: stato, headers: { ...cors, 'Content-Type': 'application/json' } });
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!consentita) return risposta(403, 'Origine non consentita');
    if (req.method !== 'POST') return risposta(405, 'Metodo non consentito');

    const url = new URL(req.url);
    const m = url.pathname.match(/^\/v1beta\/models\/([^/:]+):(generateContent|streamGenerateContent)$/);
    if (!m || !MODELLI.test(m[1])) return risposta(404, 'Percorso non consentito');
    const utente = (req.headers.get('x-tg-utente') || '').slice(0, 64);
    if (!/^[\w-]{8,64}$/.test(utente)) return risposta(400, 'Utente mancante');

    // limiti giornalieri (KV: eventualmente consistente, va bene per un limite indicativo)
    const giorno = new Date().toISOString().slice(0, 10);
    const kU = `u:${giorno}:${utente}`, kT = `t:${giorno}`;
    const [nU, nT] = await Promise.all([env.LIMITI.get(kU), env.LIMITI.get(kT)]).then((v) => v.map((x) => +x || 0));
    if (nU >= LIMITE_UTENTE) return risposta(429, 'Hai raggiunto il limite di oggi: riprova domani.');
    if (nT >= LIMITE_TOTALE) return risposta(429, 'Il servizio ha raggiunto il limite di oggi: riprova più tardi.');
    await Promise.all([
      env.LIMITI.put(kU, String(nU + 1), { expirationTtl: 172800 }),
      env.LIMITI.put(kT, String(nT + 1), { expirationTtl: 172800 }),
    ]);

    const dest = `https://generativelanguage.googleapis.com${url.pathname}${url.search}`;
    const r = await fetch(dest, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': env.GEMINI_API_KEY },
      body: req.body,
    });
    const h = new Headers(r.headers);
    Object.entries(cors).forEach(([k, v]) => h.set(k, v));
    return new Response(r.body, { status: r.status, headers: h });
  },
};

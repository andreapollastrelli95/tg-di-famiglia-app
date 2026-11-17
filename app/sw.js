/* TG di Famiglia (versione pubblica) – service worker
   - interfaccia: in cache (funziona anche offline); i pacchetti sonori (assets/suoni/N/) entrano in cache
     la prima volta che servono, quindi dopo qualche giorno ci sono tutti
   - data/*.json: sempre dalla rete (network-first), copia di riserva in cache
   - data/audio/*.mp3: voce del giorno, scaricata a ogni nuova edizione e poi disponibile anche offline
   - richieste ad altri siti (Gemini, podcast, radio): non toccate */
const CACHE = 'tgapp-v1';
const GUSCIO = ['./', 'index.html', 'manifest.json', 'comuni.json',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(GUSCIO)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys()
    .then((k) => Promise.all(k.filter((n) => n.startsWith('tgapp-') && n !== CACHE).map((n) => caches.delete(n)))) // solo le cache di questa app: sullo stesso dominio ci sono anche altre app
    .then(() => self.clients.claim()));
});

async function reteDiPrima(req) {
  const c = await caches.open(CACHE);
  try {
    const r = await fetch(req, { cache: 'no-store' });
    if (r.ok) c.put(req, r.clone());
    return r;
  } catch (e) {
    const salvata = await c.match(req, { ignoreSearch: true });
    if (salvata) return salvata;
    throw e;
  }
}
async function cacheDiPrima(req) {
  const c = await caches.open(CACHE);
  const salvata = await c.match(req, { ignoreSearch: true });
  if (salvata) return salvata;
  const r = await fetch(req);
  if (r.ok && r.status === 200) c.put(req, r.clone());
  return r;
}

/* MP3 della voce (data/audio/…?v=edizione): l'indirizzo cambia a ogni edizione, quindi ogni mattina
   si scarica il file nuovo dalla rete; lo stesso file poi resta in cache e funziona anche senza
   connessione. Il browser chiede l'audio "a pezzi" (Range): si risponde con la porzione richiesta. */
async function audioDelGiorno(req) {
  const c = await caches.open(CACHE);
  let r = await c.match(req.url);
  if (!r) {
    r = await fetch(req.url, { cache: 'no-store' });
    if (!r.ok) return r;
    await c.put(req.url, r.clone());
    // via gli audio delle edizioni precedenti (ogni edizione ha la sua cartella data/audio/<edizione>/)
    const cartella = (u) => u.pathname.split('/data/audio/')[1]?.split('/')[0];
    const attuale = cartella(new URL(req.url));
    for (const k of await c.keys()) { const u = new URL(k.url); if (u.pathname.includes('/data/audio/') && cartella(u) !== attuale) c.delete(k); }
  }
  const range = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  if (!range) return r;
  const dati = await r.arrayBuffer(), tot = dati.byteLength;
  let da = range[1] ? +range[1] : 0, a = range[2] ? +range[2] : tot - 1;
  if (!range[1] && range[2]) { da = Math.max(tot - +range[2], 0); a = tot - 1; }
  a = Math.min(a, tot - 1);
  if (da > a) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${tot}` } });
  return new Response(dati.slice(da, a + 1), { status: 206, headers: {
    'Content-Type': r.headers.get('Content-Type') || 'audio/mpeg', 'Content-Range': `bytes ${da}-${a}/${tot}`,
    'Content-Length': String(a - da + 1), 'Accept-Ranges': 'bytes' } });
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // Gemini, podcast, radio: rete diretta
  if (url.pathname.includes('/data/audio/')) { e.respondWith(audioDelGiorno(req).catch(() => fetch(req))); return; }
  if (req.headers.has('range')) return;                      // lascia gestire l'audio al browser
  if (url.pathname.includes('/data/')) { e.respondWith(reteDiPrima(req)); return; }
  // pagina: rete di prima, così gli aggiornamenti arrivano subito; offline usa la copia
  if (req.mode === 'navigate' || url.pathname.endsWith('/index.html') || url.pathname.endsWith('/')) {
    e.respondWith(reteDiPrima(req).catch(() => caches.match('index.html'))); return;
  }
  e.respondWith(cacheDiPrima(req));
});

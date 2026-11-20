/* =====================================================================
   LIVELLI: Base (gratis) e Completo (sbloccato). Regole nel tempo e prezzi in ../config.json
   ===================================================================== */
const PUBBLICO = {
  REGALO_NATALE_FINO_AL: '2026-12-31', INIZIO_NUOVE_REGOLE: '2027-01-01', GIORNI_PROVA: 15, GIORNO_AVVISO_PROVA: 12,
  GIORNI_AVVISO_SCADENZA: 7, DOPO_PROVA: 'blocco',
  FUNZIONI_BASE: ['tg', 'saluto', 'citta1', 'fonti'],
  FUNZIONI_COMPLETO: ['citta5', 'squadra', 'podcast', 'sigla', 'meteo', 'radio', 'serale', 'voce', 'varie', 'novita', 'tech', 'altro'],
  SBLOCCO: {
    '3M': { nome: 'Contributo una tantum', prezzo: '5 €', descrizione: '3 mesi di TG di Famiglia Completo', mesi: 3, giorni_extra: 0, link: 'https://ko-fi.com/tgdifamiglia/shop' },
    '1M': { nome: 'Mensile', prezzo: '1,99 €/mese', descrizione: 'finché è attivo · disdici quando vuoi', mesi: 1, giorni_extra: 5, link: 'https://ko-fi.com/tgdifamiglia/tiers' },
  },
  sito: 'https://tg-di-famiglia.pages.dev', kofi_caffe: 'https://ko-fi.com/tgdifamiglia',
};
const NOMI_FUNZIONI = {
  tg: 'Il TG del giorno: 10 notizie lette dalla voce', saluto: 'Il saluto per la tua famiglia', citta1: '1 città con le sue notizie locali',
  fonti: 'Il link alla fonte di ogni notizia (Approfondisci)', citta5: 'Fino a 5 città, con notizie locali e meteo',
  squadra: 'La tua squadra del cuore, con notizie dedicate', podcast: '10 podcast consigliati al giorno, anche della tua zona',
  sigla: 'Sigla, stacchi e musica, come al vero TG', meteo: 'Il meteo delle tue città', radio: 'Radio per genere, preferite e della tua zona',
  serale: "L'edizione della sera, con le notizie aggiornate", voce: 'La scelta della voce', calcio: 'La scheda calcio e le domande all\'AI',
  varie: 'Varie: TV, accadde oggi, rassegna, sport, cultura, sentieri, ricette, fai da te',
  novita: 'Novità: eventi nelle tue città, detto del giorno, podcast fai da te, consiglio dell\'IA, TG in dialetto',
  tech: 'Tech & AI: notizie, idee, futuro, video, la scintilla, libri, dibattito', altro: 'Futuro del lavoro, news dalla ricerca, economia circolare',
};
let codiciSblocco = null;
async function caricaPubblico() {
  try { Object.assign(PUBBLICO, await (await fetch('../config.json', { cache: 'no-store' })).json()); } catch {}
  try { codiciSblocco = new Set((await (await fetch('../codici-sblocco.json', { cache: 'no-store' })).json()).hash || []); } catch {}
}

/* ---------- Data di oggi (Europe/Rome). In sviluppo (localhost) si può simulare con ?oggi=AAAA-MM-GG ---------- */
const SVILUPPO = ['localhost', '127.0.0.1'].includes(location.hostname);
(() => {
  if (!SVILUPPO) return;
  const q = new URLSearchParams(location.search).get('oggi');
  try { if (q && /^\d{4}-\d{2}-\d{2}$/.test(q)) sessionStorage.setItem('tg_oggi_test', q); } catch {}
})();
function oggiISO() {
  if (SVILUPPO) { try { const t = sessionStorage.getItem('tg_oggi_test'); if (t) return t; } catch {} }
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Rome' });
}
const giornoUTC = (iso) => Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10));
const diffGiorni = (a, b) => Math.round((giornoUTC(b) - giornoUTC(a)) / 864e5);
function piuMesi(iso, mesi, giorni = 0) {
  const d = new Date(giornoUTC(iso));
  const g = d.getUTCDate();
  d.setUTCMonth(d.getUTCMonth() + mesi);
  if (d.getUTCDate() < g) d.setUTCDate(0); // 31 gennaio + 1 mese = 28/29 febbraio
  d.setUTCDate(d.getUTCDate() + giorni);
  return d.toISOString().slice(0, 10);
}
const dataLunga = (iso) => new Date(giornoUTC(iso)).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
const regaloNatale = () => oggiISO() <= PUBBLICO.REGALO_NATALE_FINO_AL;
const nuoveRegole = () => oggiISO() >= PUBBLICO.INIZIO_NUOVE_REGOLE;

/* ---------- Prova di 15 giorni (dal 2027): dal primo TG ascoltato; chi c'era già parte dal 1/1/2027 ---------- */
function inizioProva() {
  if (!nuoveRegole()) return null;
  const primo = ls.get('tg_primo_tg');
  if (!primo) return null;
  return primo > PUBBLICO.INIZIO_NUOVE_REGOLE ? primo : PUBBLICO.INIZIO_NUOVE_REGOLE;
}
function giornoProva() { const i = inizioProva(); return i ? diffGiorni(i, oggiISO()) + 1 : 0; }
const giorniRimasti = () => Math.max(0, PUBBLICO.GIORNI_PROVA - giornoProva());
const inProva = () => { const g = giornoProva(); return g >= 1 && g <= PUBBLICO.GIORNI_PROVA; };
const provaFinita = () => giornoProva() > PUBBLICO.GIORNI_PROVA;
/** Al primo TG ascoltato. */
function iniziaProva() {
  if (!ls.get('tg_primo_tg')) ls.set('tg_primo_tg', oggiISO());
  controllaLivello();
}

/* ---------- Sblocco con codice ---------- */
function sblocco() { try { return JSON.parse(ls.get('tg_sblocco') || 'null'); } catch { return null; } }
const sbloccoAttivo = () => { const s = sblocco(); return !!s && oggiISO() <= s.scadenza; };

/** Livello di oggi: 'completo', 'base' oppure 'bloccato'. */
function livello() {
  if (sbloccoAttivo()) return 'completo';
  if (!nuoveRegole()) return 'base';                       // fino al 31/12/2026: Base gratis per tutti
  if (!inizioProva() || inProva()) return 'completo';      // dal 2027: 15 giorni con tutto (anche prima del primo TG)
  return PUBBLICO.DOPO_PROVA === 'base' ? 'base' : 'bloccato';
}
const completo = () => livello() === 'completo';
const bloccato = () => livello() === 'bloccato';
const ha = (f) => PUBBLICO.FUNZIONI_BASE.includes(f) || completo();
/** Statistiche dei passaggi di stato (una volta sola ciascuno). */
function controllaLivello() {
  if (nuoveRegole() && inizioProva() && !ls.get('tg_ev_prova')) { ls.set('tg_ev_prova', '1'); window.evento('prova-iniziata'); }
  if (provaFinita() && !ls.get('tg_ev_prova_scaduta')) { ls.set('tg_ev_prova_scaduta', '1'); window.evento('prova-scaduta'); }
  const s = sblocco();
  if (s && oggiISO() > s.scadenza && ls.get('tg_ev_sblocco_scaduto') !== s.scadenza) { ls.set('tg_ev_sblocco_scaduto', s.scadenza); window.evento('sblocco-scaduto'); }
  aggiornaLucchetti();
}
/** Avvisi gentili: 12° giorno di prova e 7 giorni prima della scadenza dello sblocco (una volta ciascuno). */
function avvisiLivello() {
  const g = giornoProva();
  if (!sbloccoAttivo() && g >= PUBBLICO.GIORNO_AVVISO_PROVA && g <= PUBBLICO.GIORNI_PROVA && !ls.get('tg_avviso_prova')) {
    ls.set('tg_avviso_prova', '1');
    const n = giorniRimasti();
    avviso(`${n > 0 ? `Mancano ${n} giorni alla fine della prova gratuita` : 'Oggi è l’ultimo giorno della prova gratuita'}. Poi puoi scegliere: ${PUBBLICO.SBLOCCO['3M'].prezzo} per 3 mesi oppure ${PUBBLICO.SBLOCCO['1M'].prezzo}. Tocca ⚙️ → Sblocca tutto.`);
    window.evento('avviso-fine-prova');
  }
  const s = sblocco();
  if (s && sbloccoAttivo() && diffGiorni(oggiISO(), s.scadenza) <= PUBBLICO.GIORNI_AVVISO_SCADENZA && ls.get('tg_avviso_scadenza') !== s.scadenza) {
    ls.set('tg_avviso_scadenza', s.scadenza);
    avviso(`Il tuo TG di Famiglia Completo scade il ${dataLunga(s.scadenza)}. Per continuare: ⚙️ → Sblocca tutto.`);
  }
}
/** Testo dell'offerta, cambia da solo il 1/1/2027. */
function testoOfferta() {
  const a = PUBBLICO.SBLOCCO['3M'], b = PUBBLICO.SBLOCCO['1M'];
  return regaloNatale() || !nuoveRegole()
    ? `🎄 Regalo di Natale: TG di Famiglia è gratis fino al ${dataLunga(PUBBLICO.REGALO_NATALE_FINO_AL)}. Con un contributo di ${a.prezzo} sblocchi tutte le funzioni per 3 mesi.`
    : `${PUBBLICO.GIORNI_PROVA} giorni gratis, poi scegli: ${a.prezzo} per 3 mesi oppure ${b.prezzo}.`;
}
function statoLivello() {
  const s = sblocco();
  if (sbloccoAttivo()) return `⭐ TG di Famiglia Completo attivo fino al ${dataLunga(s.scadenza)}.`;
  if (!nuoveRegole()) return `🎄 Versione Base gratis fino al ${dataLunga(PUBBLICO.REGALO_NATALE_FINO_AL)}. Sblocca il Completo con un contributo.`;
  if (!inizioProva()) return `Prova gratuita di ${PUBBLICO.GIORNI_PROVA} giorni: parte dal primo TG ascoltato.`;
  if (inProva()) return giorniRimasti() > 0 ? `Prova gratuita: mancano ${giorniRimasti()} ${giorniRimasti() === 1 ? 'giorno' : 'giorni'} (tutte le funzioni).` : "Prova gratuita: oggi è l'ultimo giorno.";
  return PUBBLICO.DOPO_PROVA === 'base' ? 'La prova gratuita è finita: hai la versione Base. Sblocca tutto con un contributo.' : 'La prova gratuita è finita: sblocca il TG con un contributo.';
}

/* ---------- Lucchetti sulle schede ---------- */
const SCHEDE_FUNZIONE = { Podcast: 'podcast', Radio: 'radio', Calcio: 'squadra', Varie: 'varie', Novita: 'novita', Tech: 'tech', Altro: 'altro' };
function aggiornaLucchetti() {
  for (const [id, f] of Object.entries(SCHEDE_FUNZIONE)) {
    const b = $('scheda' + id);
    if (!b) continue;
    if (!b.dataset.etichetta) b.dataset.etichetta = b.textContent.trim();
    b.textContent = b.dataset.etichetta + (ha(f) ? '' : ' 🔒');
  }
}
function apriScheda(id) {
  const f = SCHEDE_FUNZIONE[id];
  if (f && !ha(f)) return mostraSblocca(f);
  mostraScheda(id.toLowerCase());
  if (id === 'Radio') radioDellaZona();
  if (id === 'Varie' || id === 'Novita') preparaExtra();
  if (id === 'Tech' || id === 'Altro') preparaTech();
}

/* ---------- Schermata "Sblocca tutto" ---------- */
let schermataPrima = 'tg';
function mostraSblocca(funzione = '', obbligatoria = false) {
  if (funzione && funzione !== 'tg') window.evento('funzione-bloccata-toccata/' + funzione);
  window.evento('schermata-sblocca-mostrata');
  const visibile = ['demo', 'config', 'tg'].find((x) => !$('schermata' + { demo: 'Demo', config: 'Config', tg: 'TG' }[x]).classList.contains('nascosto'));
  if (visibile) schermataPrima = visibile;
  fermaTutto();
  const a = PUBBLICO.SBLOCCO['3M'], b = PUBBLICO.SBLOCCO['1M'];
  $('sbloccaSituazione').textContent = (funzione && NOMI_FUNZIONI[funzione] && funzione !== 'tg' ? `🔒 «${NOMI_FUNZIONI[funzione]}» fa parte di TG di Famiglia Completo. ` : '') + (bloccato() ? statoLivello() : testoOfferta());
  $('sbloccaTabella').innerHTML = `<thead><tr><th></th><th>Base</th><th>Completo</th></tr></thead><tbody>`
    + [...PUBBLICO.FUNZIONI_BASE, ...PUBBLICO.FUNZIONI_COMPLETO].map((f) => `<tr><td>${esc(NOMI_FUNZIONI[f] || f)}</td><td>${PUBBLICO.FUNZIONI_BASE.includes(f) ? '✅' : '—'}</td><td>✅</td></tr>`).join('') + '</tbody>';
  $('opzioni3M').innerHTML = `<b>${esc(a.nome)}</b><span class="prezzo">${esc(a.prezzo)}</span><span>${esc(a.descrizione)}</span>`;
  $('opzioni1M').innerHTML = `<b>${esc(b.nome)}</b><span class="prezzo">${esc(b.prezzo)}</span><span>${esc(b.descrizione)}</span>`;
  $('sbloccaIndietro').classList.toggle('nascosto', obbligatoria && bloccato());
  $('statoSblocca').textContent = '';
  mostra('sblocca');
}
$('scegli3M').onclick = () => { window.evento('scelta-5euro-3mesi'); window.open(PUBBLICO.SBLOCCO['3M'].link, '_blank', 'noopener'); $('statoSblocca').textContent = 'Dopo il contributo su Ko-fi ricevi un codice personale: inseriscilo qui sotto.'; };
$('scegli1M').onclick = () => { window.evento('scelta-mensile'); window.open(PUBBLICO.SBLOCCO['1M'].link, '_blank', 'noopener'); $('statoSblocca').textContent = 'Dopo l\'iscrizione su Ko-fi ricevi un codice personale: inseriscilo qui sotto. A ogni rinnovo ne ricevi uno nuovo.'; };
$('sbloccaIndietro').onclick = () => {
  if (schermataPrima === 'demo') return mostraDemo();
  if (schermataPrima === 'config') return mostra('config');
  mostra('tg');
};
$('apriSbloccaTutto').onclick = () => { $('impostazioni').close(); mostraSblocca(); };
async function impronta(testo) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(testo));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
/** Attiva un codice TGF-3M-… o TGF-1M-…: la scadenza parte da oggi (o dalla scadenza attuale, se è un rinnovo). */
async function attivaCodice(testo) {
  const codice = String(testo || '').trim().toUpperCase().replace(/\s+/g, '');
  const tipo = (codice.match(/^TGF-(3M|1M)-[A-Z0-9]{4}-[A-Z0-9]{4}$/) || [])[1];
  if (!codiciSblocco) await caricaPubblico();
  const h = await impronta(codice);
  if (!tipo || !codiciSblocco?.has(h)) { window.evento('codice-non-valido'); return { ok: false, msg: 'Codice non valido: controlla di averlo scritto tutto (es. TGF-3M-ABCD-EFGH).' }; }
  let usati = []; try { usati = JSON.parse(ls.get('tg_codici_usati') || '[]'); } catch {}
  if (usati.includes(h)) { window.evento('codice-non-valido'); return { ok: false, msg: 'Questo codice è già stato usato su questo telefono.' }; }
  const regola = PUBBLICO.SBLOCCO[tipo];
  const att = sblocco();
  const da = att && sbloccoAttivo() && att.scadenza > oggiISO() ? att.scadenza : oggiISO();
  const nuovo = { tipo, attivato: oggiISO(), scadenza: piuMesi(da, regola.mesi, regola.giorni_extra) };
  ls.set('tg_sblocco', JSON.stringify(nuovo));
  ls.set('tg_codici_usati', JSON.stringify([...usati, h]));
  window.evento('codice-attivato-' + tipo);
  aggiornaLucchetti();
  return { ok: true, msg: `✅ TG di Famiglia Completo attivo fino al ${dataLunga(nuovo.scadenza)}. Grazie!` };
}
$('attivaCodice').onclick = async () => {
  const r = await attivaCodice($('campoCodice').value);
  $('statoSblocca').textContent = r.msg;
  if (r.ok) { $('campoCodice').value = ''; setTimeout(sbloccaTutto, 1200); }
};
function sbloccaTutto() {
  aggiornaLucchetti();
  if (!sbloccata()) return mostraDemo();
  if (!impostazioni().fatto) return mostraConfig(true);
  applicaImpostazioni(null);
  if (Ed.gen) { mostra('tg'); prepara(true); } else avviaApp();
}

/* ---------- Scelta della voce (Completo) ---------- */
const VOCI = [['Kore', 'Kore (femminile, chiara)'], ['Aoede', 'Aoede (femminile, calda)'], ['Leda', 'Leda (femminile, giovane)'], ['Zephyr', 'Zephyr (femminile, luminosa)'], ['Charon', 'Charon (maschile, profonda)'], ['Puck', 'Puck (maschile, vivace)'], ['telefono', 'La voce del telefono']];
function vocePreferita() { const v = ls.get('tg_voce'); return ha('voce') && VOCI.some(([k]) => k === v) ? v : 'Kore'; }
function renderSceltaVoce() {
  const v = vocePreferita();
  $('sceltaVoce').innerHTML = `<h3>🎙️ La voce del TG ${ha('voce') ? '' : '🔒'}</h3>`
    + (ha('voce') ? `<select class="campo" id="campoVoce">${VOCI.map(([k, n]) => `<option value="${k}" ${k === v ? 'selected' : ''}>${esc(n)}</option>`).join('')}</select>`
      : `<p class="piccolo">Con TG di Famiglia Completo puoi scegliere tra sei voci o la voce del telefono.</p><div class="riga-btn"><button class="btn" data-funzione-impostazioni="voce" type="button">🔒 Scegli la voce</button></div>`);
}
document.addEventListener('change', async (e) => {
  if (e.target.id !== 'campoVoce') return;
  ls.set('tg_voce', e.target.value);
  applicaVoce();
  for (const k of await db.keys()) if (/^(audio|titoli|varia|saluto):/.test(String(k))) await db.del(k);
  $('statoImpostazioni').textContent = 'Voce cambiata: vale dal prossimo ascolto.';
});
document.addEventListener('click', (e) => { const b = e.target.closest('[data-funzione-impostazioni]'); if (b) { $('impostazioni').close(); mostraSblocca(b.dataset.funzioneImpostazioni); } });
function applicaVoce() { const v = vocePreferita(); CONFIG.voce = v === 'telefono' ? 'Kore' : v; vocePerOggiKO = v === 'telefono'; }

/* ---------- Radio della tua zona (Radio Browser, per nome delle città) ---------- */
let radioZonaDi = '';
async function radioDellaZona() {
  const box = $('radioZona');
  if (!box) return;
  const citta = impostazioni().citta.map((c) => c.nome);
  const chiaveZona = citta.join('|');
  if (!citta.length) { box.innerHTML = '<p class="piccolo">Aggiungi le tue città nelle impostazioni ⚙️ per trovare le radio della tua zona.</p>'; return; }
  if (radioZonaDi === chiaveZona) return;
  radioZonaDi = chiaveZona;
  box.innerHTML = '<p class="piccolo">Cerco le radio della tua zona…</p>';
  const trovate = [];
  for (const nome of citta) {
    try {
      const q = new URLSearchParams({ name: nome, countrycode: 'IT', hidebroken: 'true', order: 'clickcount', reverse: 'true', limit: '6' });
      const r = await fetch(`https://de1.api.radio-browser.info/json/stations/search?${q}`);
      for (const x of await r.json()) if (x.url_resolved && !trovate.some((y) => y.url === x.url_resolved)) trovate.push({ nome: x.name.trim(), url: x.url_resolved, citta: nome, tipo: /m3u8/i.test(x.url_resolved) ? 'hls' : (x.codec === 'OGG' ? 'ogg' : undefined) });
    } catch (e) { console.warn('radio zona', e); }
  }
  radioZona = trovate.slice(0, 12);
  box.innerHTML = radioZona.length ? radioZona.map((r, i) => `<div class="riga-radio"><button class="btn" data-radio-zona="${i}" type="button">📻 ${esc(r.nome)} <span class="piccolo">· ${esc(r.citta)}</span></button></div>`).join('')
    : '<p class="piccolo">Per le tue città non ho trovato radio locali nell\'elenco pubblico: prova la ricerca qui sotto.</p>';
}
let radioZona = [];
document.addEventListener('click', (e) => { const b = e.target.closest('[data-radio-zona]'); if (b) suonaRadioScelta(radioZona[+b.dataset.radioZona]); });
/* ---------- Condividi (WhatsApp, o il pannello di condivisione del telefono) ---------- */
async function condividi() {
  window.evento('condivisione');
  const link = `${PUBBLICO.sito}/?da=whatsapp`;
  const testo = 'Ho appena ascoltato il mio TG di Famiglia di oggi 📺 Le notizie del giorno lette come al telegiornale, gratis. Provalo anche tu 👉';
  if (navigator.share) {
    try { await navigator.share({ title: 'TG di Famiglia', text: testo, url: link }); return; }
    catch (e) { if (e?.name === 'AbortError') return; }
  }
  window.open('https://wa.me/?text=' + encodeURIComponent(`${testo} ${link}`), '_blank', 'noopener');
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-condividi]')) condividi(); });

/* ---------- Link da un biglietto regalo o da una condivisione ---------- */
function leggiParametri() {
  const p = new URLSearchParams(location.search);
  if (p.has('famiglia')) {
    window.evento('aperta-da-biglietto'); // solo il fatto, mai il nome
    if (!impostazioni().fatto) ls.set('tg_precompila', JSON.stringify({ nome: pulisciNome(p.get('famiglia')).slice(0, 40), citta: (p.get('citta') || '').split(',').map((x) => x.trim()).filter(Boolean).slice(0, 5) }));
  }
  if (p.get('da') === 'whatsapp') window.evento('aperta-da-whatsapp');
  if ([...p.keys()].some((k) => ['famiglia', 'citta', 'da'].includes(k))) history.replaceState(null, '', location.pathname + (p.has('installa') ? '?installa=1' : ''));
}
/** Configurazione già compilata dal biglietto regalo: nome e città (solo i comuni riconosciuti). */
async function precompila(bozzaCorrente) {
  let pre; try { pre = JSON.parse(ls.get('tg_precompila') || 'null'); } catch {}
  if (!pre) return false;
  ls.del('tg_precompila');
  if (pre.nome) bozzaCorrente.nome = pre.nome;
  await caricaComuni();
  for (const nome of pre.citta || []) {
    const c = comuni.filter((x) => x.k === senzaAccenti(nome));
    if (c.length >= 1 && !bozzaCorrente.citta.some((x) => x.nome === c[0].nome)) { const nuova = { nome: c[0].nome, sigla: c[0].sigla }; bozzaCorrente.citta.push(nuova); attese.add(nuova); coordinate(nuova); }
  }
  return true;
}

/* ---------- Installa l'app (niente store: si installa dalla schermata Home) ---------- */
let richiestaInstalla = null;
const installata = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const suIOS = () => /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function aggiornaTastiInstalla() {
  // su Android il tasto compare quando Chrome offre l'installazione; su iPhone porta alle istruzioni
  const mostra = !installata() && (richiestaInstalla || suIOS());
  document.querySelectorAll('[data-installa]').forEach((b) => b.classList.toggle('nascosto', !mostra));
}
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); richiestaInstalla = e; aggiornaTastiInstalla(); });
window.addEventListener('appinstalled', () => { richiestaInstalla = null; aggiornaTastiInstalla(); });
async function installa() {
  window.evento('installa-premuto');
  if (richiestaInstalla) {
    richiestaInstalla.prompt();
    const { outcome } = await richiestaInstalla.userChoice.catch(() => ({}));
    if (outcome === 'accepted') richiestaInstalla = null;
    aggiornaTastiInstalla();
    return;
  }
  $('guidaInstalla').showModal();
}
document.addEventListener('click', (e) => { if (e.target.closest('[data-installa]')) installa(); });
$('chiudiGuidaInstalla').onclick = () => $('guidaInstalla').close();

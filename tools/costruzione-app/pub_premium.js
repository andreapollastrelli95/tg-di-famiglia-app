/* =====================================================================
   PROVA GRATUITA, DONAZIONE, PREMIUM (config.json → PREMIUM_ENABLED) E CONDIVISIONE
   ===================================================================== */
const PUBBLICO = {
  PREMIUM_ENABLED: true, giorni_prova: 15, giorno_donazione: 3, giorno_avviso: 12, prezzo: '1,99 €/mese',
  sito: 'https://tg-di-famiglia.pages.dev', kofi_caffe: 'https://ko-fi.com/tgdifamiglia', kofi_abbonamento: 'https://ko-fi.com/tgdifamiglia/tiers',
};
let codiciPremium = null;
async function caricaPubblico() {
  try { Object.assign(PUBBLICO, await (await fetch('../config.json', { cache: 'no-store' })).json()); } catch {}
  try { codiciPremium = new Set((await (await fetch('../premium-codes.json', { cache: 'no-store' })).json()).hash || []); } catch {}
}
const giornoDi = (t) => Math.floor((new Date(t).setHours(12, 0, 0, 0)) / 864e5);
/** Giorno di prova (1 = il giorno del primo TG ascoltato), 0 se la prova non è ancora iniziata. */
function giornoProva() {
  const inizio = +ls.get('tg_prova_inizio') || 0;
  return inizio ? giornoDi(Date.now()) - giornoDi(inizio) + 1 : 0;
}
const giorniRimasti = () => Math.max(0, PUBBLICO.giorni_prova - giornoProva()); // giorni dopo oggi
const premiumAttivo = () => ls.get('tg_premium') === 'codice';
const bloccato = () => PUBBLICO.PREMIUM_ENABLED && giornoProva() > PUBBLICO.giorni_prova && !premiumAttivo();
function iniziaProva() {
  if (!ls.get('tg_prova_inizio')) { ls.set('tg_prova_inizio', String(Date.now())); window.evento('prova-iniziata'); }
}
async function impronta(testo) {
  const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(testo));
  return [...new Uint8Array(b)].map((x) => x.toString(16).padStart(2, '0')).join('');
}
async function controllaCodiceSalvato() {
  if (ls.get('tg_premium') !== 'codice' || !codiciPremium) return;
  if (!codiciPremium.has(ls.get('tg_codice_hash'))) { ls.del('tg_premium'); ls.del('tg_codice_hash'); } // codice revocato
}

/* ---------- Schermata Premium (dal 16° giorno) ---------- */
function mostraPremium() {
  fermaTutto();
  mostra('premium');
  $('prezzoPremium').textContent = PUBBLICO.prezzo;
  $('statoPremium').textContent = '';
  window.evento('premium-mostrata');
}
$('abbonati').onclick = () => {
  window.evento('abbonati');
  window.open(PUBBLICO.kofi_abbonamento, '_blank', 'noopener');
  $('statoPremium').textContent = 'Dopo l\'abbonamento su Ko-fi riceverai un codice personale: inseriscilo qui sotto.';
};
$('attivaCodice').onclick = async () => {
  const codice = $('campoCodice').value.trim().toUpperCase().replace(/\s+/g, '');
  if (!codice) { $('statoPremium').textContent = 'Scrivi prima il codice.'; return; }
  if (!codiciPremium) await caricaPubblico();
  const h = await impronta(codice);
  if (!codiciPremium?.has(h)) { $('statoPremium').textContent = 'Codice non valido: controlla di averlo scritto tutto (es. TGF-ABCD-EFGH-JKLM).'; return; }
  ls.set('tg_premium', 'codice'); ls.set('tg_codice_hash', h);
  window.evento('codice-premium-attivato');
  $('statoPremium').textContent = '✅ Premium attivato. Grazie!';
  setTimeout(sbloccaPremium, 1000);
};
$('premiumDemo').onclick = () => { D.stato = 'ferma'; D.passo = 0; D.riquadroVisto = true; mostraDemo(); };
function sbloccaPremium() { applicaImpostazioni(null); if (Ed.gen) { mostra('tg'); prepara(); } else avviaApp(); }

/* ---------- Dopo il TG: condivisione, donazione al 3° giorno ---------- */
function dopoTG() {
  document.querySelectorAll('.condividi-fine').forEach((x) => x.classList.remove('nascosto'));
  if (!PUBBLICO.PREMIUM_ENABLED || premiumAttivo()) return;
  if (giornoProva() >= PUBBLICO.giorno_donazione && !ls.get('tg_donazione_vista')) {
    ls.set('tg_donazione_vista', '1'); // una sola volta
    setTimeout(() => { $('donazione').showModal(); window.evento('donazione-mostrata'); }, 1500);
  }
}
$('offriCaffe').onclick = () => { window.evento('caffe'); window.open(PUBBLICO.kofi_caffe, '_blank', 'noopener'); $('donazione').close(); };
$('altraVolta').onclick = () => { window.evento('caffe-altra-volta'); $('donazione').close(); };
function avvisoFineProva() {
  if (!PUBBLICO.PREMIUM_ENABLED || premiumAttivo()) return;
  const g = giornoProva();
  if (g >= PUBBLICO.giorno_avviso && g <= PUBBLICO.giorni_prova && !ls.get('tg_avviso_visto')) {
    ls.set('tg_avviso_visto', '1');
    avviso(`Mancano ${giorniRimasti()} giorni alla fine della prova gratuita. Continua con Premium a ${PUBBLICO.prezzo}.`);
    window.evento('avviso-fine-prova');
  }
}

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

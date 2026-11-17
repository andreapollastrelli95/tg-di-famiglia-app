/* ---------- Schermate ---------- */
function mostra(schermata) {
  for (const [id, nome] of [['schermataDemo', 'demo'], ['schermataConfig', 'config'], ['schermataTG', 'tg'], ['schermataPremium', 'premium']]) $(id).classList.toggle('nascosto', schermata !== nome);
  $('apriImpostazioni').classList.toggle('nascosto', schermata !== 'tg');
  window.scrollTo({ top: 0 });
}

/* =====================================================================
   DEMO: edizione dimostrativa statica (nessuna chiamata a Gemini, nessuna chiave)
   ===================================================================== */
const DEMO = {
  notizie: [
    { titolo: 'Come nasce il tuo TG di Famiglia', testo: "Ogni mattina l'app raccoglie le notizie delle principali testate italiane. Poi l'intelligenza artificiale di Google sceglie le dieci più importanti e le racconta con parole semplici, come un vero telegiornale. In cinque minuti sai che cosa succede in Italia e nel mondo.", fonte: 'TG di Famiglia' },
    { titolo: 'Le notizie della tua città', testo: "Puoi scegliere fino a cinque città: il TG aggiunge le notizie locali più importanti, la conduttrice le nomina all'inizio e trovi anche il meteo dei prossimi giorni. Se ti piace il calcio, arrivano le notizie della tua squadra del cuore.", fonte: 'TG di Famiglia' },
    { titolo: 'Perché il cielo è azzurro', testo: "La luce del Sole contiene tutti i colori. Attraversando l'aria, la luce azzurra, che ha onde più corte, viene sparpagliata in ogni direzione molto più del rosso. Per questo, guardando in alto, vediamo il cielo azzurro, mentre al tramonto prevalgono l'arancione e il rosso.", fonte: 'Curiosità' },
    { titolo: 'Il TG anche in auto', testo: "Collega il telefono all'auto con il Bluetooth e premi play: il TG si ascolta anche a schermo spento, si va avanti e indietro tra le notizie e alla fine partono i podcast consigliati. Ci sono anche le radio, dalla musica classica allo sport.", fonte: 'TG di Famiglia' },
  ],
  podcast: [
    { nome: 'Attualità', episodio: 'Il riassunto della giornata', spiegazione: 'Ogni giorno dieci podcast italiani scelti per te, con due righe che spiegano di che cosa parla la puntata.' },
    { nome: 'Calcio', episodio: 'Il commento alla giornata di campionato', spiegazione: 'Se ti piace il calcio, almeno un podcast sportivo al giorno.' },
    { nome: 'Dalla tua zona', episodio: 'I podcast della tua città', spiegazione: 'Quando esistono, i podcast locali della tua provincia vengono messi per primi.' },
  ],
  chiusura: "Fine della demo. Sblocca l'app gratis per avere ogni mattina il tuo TG vero, con le notizie della tua città.",
};
const D = { stato: 'ferma', passo: 0, token: 0, inizio: 0, timer: null, riquadroVisto: false };
function testiDemo() {
  return ["Buongiorno Famiglia! Questa è un'edizione dimostrativa del TG di Famiglia.", ...DEMO.notizie.map((n) => `${n.titolo}. ${n.testo}`), DEMO.chiusura];
}
function renderDemo(attiva = -1) {
  $('demoNotizie').innerHTML = DEMO.notizie.map((n, i) => `
    <article class="scheda notizia ${i === attiva ? 'in-onda' : ''}" id="demo-${i}">
      <div class="riga"><span class="numero">${i + 1}</span><div style="flex:1"><span class="badge">Esempio</span><h3>${esc(n.titolo)}</h3></div></div>
      <p>${esc(n.testo)}</p>
      <div class="fonte">Fonte: ${esc(n.fonte)}</div>
      <button class="btn" data-bloccato type="button">Approfondisci <span class="lucchetto">🔒</span></button>
    </article>`).join('');
  $('demoPodcast').innerHTML = DEMO.podcast.map((p) => `
    <article class="scheda podcast"><div class="testa"><div><div class="nome">${esc(p.nome)}</div><div class="episodio">${esc(p.episodio)}</div></div></div>
      <p>${esc(p.spiegazione)}</p><div class="azioni"><button class="btn" data-bloccato type="button">▶️ Ascolta <span class="lucchetto">🔒</span></button></div></article>`).join('');
}
function etichettaDemo(testo) {
  $('etichettaDemo').textContent = testo;
  $('iconaDemo').innerHTML = /Pausa/.test(testo) ? '<path d="M7 5h4v14H7zM13 5h4v14h-4z"/>' : '<path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/>';
}
function mostraDemo() {
  mostra('demo');
  renderDemo();
  avviaDemo(false); // prova a partire da sola; se il browser blocca l'audio resta il grande tasto
}
function avviaTimerDemo() {
  if (D.timer || D.riquadroVisto) return;
  D.timer = setTimeout(() => { if (!D.riquadroVisto) { pausaDemo(); apriSblocco('dopo 20 secondi'); } }, Math.max(0, 20000 - (Date.now() - D.inizio)));
}
function pausaDemo() {
  D.token++;
  window.speechSynthesis?.cancel();
  audio.pause();
  if (D.stato === 'in corso') { D.stato = 'pausa'; etichettaDemo('▶ Riprendi la demo'); }
}
async function avviaDemo(daTocco) {
  if (D.stato === 'in corso') { pausaDemo(); return; }
  const mio = ++D.token;
  let siglaOk = true;
  if (D.passo === 0) {
    audio.loop = false; audio.src = URL_SIGLA;
    // play() può fallire (audio automatico bloccato) o restare in sospeso: si aspetta al massimo 1,5 s
    siglaOk = await Promise.race([audio.play().then(() => true, () => false), sleep(1500).then(() => null)]);
    if (siglaOk !== true && !daTocco) {
      audio.pause();
      etichettaDemo('▶ Guarda la demo'); $('statoDemo').textContent = '👆 Tocca il grande tasto rosso per far partire la demo.';
      return;
    }
  }
  if (mio !== D.token) return;
  D.stato = 'in corso'; etichettaDemo('⏸ Pausa');
  $('statoDemo').textContent = '🎬 Edizione dimostrativa in onda…';
  if (!D.inizio) { D.inizio = Date.now(); window.evento('demo-avviata'); }
  avviaTimerDemo();
  if (D.passo === 0) {
    if (siglaOk === true) await Promise.race([new Promise((r) => audio.addEventListener('ended', r, { once: true })), sleep(7000)]);
    if (mio !== D.token) return;
    audio.pause();
    D.passo = 1;
  }
  const testi = testiDemo();
  for (; D.passo <= testi.length; D.passo++) {
    const i = D.passo - 1, notizia = i - 1;
    renderDemo(notizia >= 0 && notizia < DEMO.notizie.length ? notizia : -1);
    if (notizia >= 0 && notizia < DEMO.notizie.length) $('demo-' + notizia)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const t0 = Date.now();
    await parla(testi[i]);
    if (mio !== D.token) return;
    // la voce del telefono è bloccata finché non si tocca lo schermo (succede su iPhone): serve il tasto
    if (Date.now() - t0 < 400 && testi[i].length > 40) {
      D.stato = 'pausa'; etichettaDemo('▶ Guarda la demo');
      $('statoDemo').textContent = '👆 Tocca il grande tasto rosso per sentire la demo.';
      return;
    }
  }
  D.stato = 'finita'; D.passo = 0; renderDemo();
  etichettaDemo('▶ Rivedi la demo');
  $('statoDemo').textContent = 'La demo è finita.';
  apriSblocco('fine della demo');
}
$('tastoDemo').onclick = () => avviaDemo(true);
$('tgOggiBloccato').onclick = () => { pausaDemo(); apriSblocco('lucchetto'); };
$('apriSblocco').onclick = () => { pausaDemo(); apriSblocco('tasto'); };
$('schermataDemo').addEventListener('click', (e) => { if (e.target.closest('[data-bloccato]')) { pausaDemo(); apriSblocco('lucchetto'); } });

/* ---------- Riquadro di sblocco con la chiave Gemini ---------- */
function apriSblocco() {
  D.riquadroVisto = true;
  if (!$('sblocco').open) { $('statoChiave').textContent = ''; $('statoChiave').classList.remove('errore'); $('sblocco').showModal(); }
  window.evento('riquadro-chiave');
}
$('piuTardi').onclick = () => { $('sblocco').close(); window.evento('piu-tardi'); };
async function salvaChiaveDa(campo, statoEl, poi) {
  const k = campo.value.trim().replace(/\s+/g, '');
  statoEl.classList.remove('errore');
  if (!k) { statoEl.textContent = 'Incolla prima la chiave.'; return; }
  // le chiavi Google hanno più formati (AIza…, AQ.…): qui solo un controllo di lunghezza, poi decide Google
  if (!/^[\w.-]{30,}$/.test(k)) { statoEl.textContent = 'La chiave non sembra corretta: controlla di averla copiata tutta.'; statoEl.classList.add('errore'); return; }
  statoEl.textContent = 'Controllo la chiave…';
  const v = await verificaChiave(k);
  if (!v.ok) {
    statoEl.textContent = /Internet|contattare/.test(v.msg || '') ? v.msg : 'La chiave non sembra corretta: controlla di averla copiata tutta.';
    statoEl.classList.add('errore');
    return;
  }
  chiave = k; ls.set('tg_chiave', k); campo.value = '';
  window.evento('chiave-verificata');
  statoEl.textContent = '✅ Sbloccato!';
  poi?.();
}
$('salvaChiave').onclick = () => salvaChiaveDa($('campoChiave'), $('statoChiave'), () => {
  window.evento('sblocco-riuscito');
  pausaDemo();
  setTimeout(() => { $('sblocco').close(); mostraConfig(true); }, 1200);
});
$('campoChiave').addEventListener('keydown', (e) => { if (e.key === 'Enter') $('salvaChiave').click(); });
$('incolla').onclick = async () => {
  try { $('campoChiave').value = (await navigator.clipboard.readText()).trim(); }
  catch { $('statoChiave').textContent = 'Tieni premuto nel riquadro e scegli “Incolla”.'; $('campoChiave').focus(); }
};

/* =====================================================================
   CONFIGURAZIONE: nome, città (comuni italiani), calcio
   ===================================================================== */
let bozza = null, primaConfig = false, comuni = null, proposte = [];
async function caricaComuni() {
  if (!comuni) {
    try { comuni = (await (await fetch('comuni.json')).json()).map(([nome, sigla]) => ({ nome, sigla, k: senzaAccenti(nome) })); }
    catch { comuni = []; }
  }
  return comuni;
}
async function caricaSquadre() {
  let lista = Ed.grezzo?.squadre_disponibili;
  if (!lista) { try { lista = (await (await fetch(CONFIG.dati + 'grezzo.json', { cache: 'no-store' })).json()).squadre_disponibili; } catch {} }
  return lista || [];
}
const pulisciNome = (t) => String(t || '').replace(/[<>"]/g, '').replace(/\s+/g, ' ').trim().replace(/(^|[\s'-])(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
async function mostraConfig(prima) {
  primaConfig = prima;
  bozza = impostazioni();
  if (prima && !ls.get('tg_impostazioni')) bozza.calcio = true;
  mostra('config');
  $('statoCitta').textContent = '';
  if (await precompila(bozza)) $('statoCitta').textContent = '🎁 Abbiamo già inserito i dati del biglietto regalo: controlla e premi «Inizia».';
  $('campoNome').value = bozza.nome;
  $('campoCitta').value = ''; $('statoConfig').textContent = '';
  $('salvaConfig').textContent = prima ? '▶ Inizia il mio TG' : '💾 Salva e rifai il TG';
  aggiornaSaluto(); renderChip(); renderCalcio(); proponi([]);
  caricaComuni();
  const squadre = await caricaSquadre();
  $('campoSquadra').innerHTML = '<option value="">Nessuna in particolare</option>' + squadre.map((q) => `<option value="${esc(q.id)}">${esc(q.nome)}</option>`).join('');
  $('campoSquadra').value = squadre.some((q) => q.id === bozza.squadra) ? bozza.squadra : '';
}
function aggiornaSaluto() {
  bozza.nome = pulisciNome($('campoNome').value).slice(0, 40);
  $('anteprimaSaluto').textContent = `La conduttrice dirà: «${salutoPer(bozza)}»`;
}
function renderChip() {
  $('chipCitta').innerHTML = bozza.citta.map((c, i) => `<span class="chip">📍 ${esc(c.nome)} <span class="piccolo">(${esc(c.sigla)})</span><button type="button" data-togli-citta="${i}" aria-label="Togli ${esc(c.nome)}">✕</button></span>`).join('');
  $('campoCitta').disabled = bozza.citta.length >= 5;
  $('campoCitta').placeholder = bozza.citta.length >= 5 ? 'Hai già 5 città' : 'Scrivi il nome del comune';
  aggiornaSaluto();
}
function renderCalcio() {
  $('calcioSi').classList.toggle('attiva', bozza.calcio);
  $('calcioNo').classList.toggle('attiva', !bozza.calcio);
  $('bloccoSquadra').classList.toggle('nascosto', !bozza.calcio);
}
function proponi(lista) {
  proposte = lista;
  $('suggerimentiCitta').innerHTML = lista.map((c, i) => `<li><button type="button" data-proposta="${i}">${esc(c.nome)} <span class="piccolo">(${esc(c.sigla)})</span></button></li>`).join('');
}
function cercaComuni(testo) {
  const q = senzaAccenti(testo).trim();
  if (q.length < 2 || !comuni) return [];
  const inizio = comuni.filter((c) => c.k.startsWith(q));
  const dentro = q.length >= 3 ? comuni.filter((c) => !c.k.startsWith(q) && c.k.includes(q)) : [];
  return [...inizio, ...dentro].slice(0, 8);
}
async function coordinate(c) {
  try {
    const q = new URLSearchParams({ name: c.nome, count: 10, language: 'it', countryCode: 'IT', format: 'json' });
    const j = await (await fetch(`https://geocoding-api.open-meteo.com/v1/search?${q}`)).json();
    const r = (j.results || []).find((x) => senzaAccenti(x.name) === senzaAccenti(c.nome)) || (j.results || [])[0];
    if (r) { c.lat = +r.latitude.toFixed(3); c.lon = +r.longitude.toFixed(3); }
  } catch (e) { console.warn('coordinate', e); }
  attese.delete(c);
}
const attese = new Set(); // città di cui si stanno cercando le coordinate
function aggiungiCitta(c) {
  $('statoCitta').classList.remove('errore');
  if (bozza.citta.length >= 5) { $('statoCitta').textContent = 'Puoi scegliere al massimo 5 città.'; return; }
  if (bozza.citta.some((x) => x.nome === c.nome && x.sigla === c.sigla)) { $('statoCitta').textContent = `${c.nome} c'è già.`; return; }
  const nuova = { nome: c.nome, sigla: c.sigla };
  bozza.citta.push(nuova);
  attese.add(nuova); coordinate(nuova); // per il meteo; se non arrivano, il meteo di quella città non compare
  $('campoCitta').value = ''; proponi([]);
  $('statoCitta').textContent = `✅ ${c.nome} aggiunta.`;
  renderChip();
}
async function aggiungiDaTesto() {
  const testo = $('campoCitta').value.replace(/\s+/g, ' ').trim();
  if (!testo) { $('statoCitta').textContent = 'Scrivi prima il nome della città.'; return; }
  await caricaComuni();
  const uguali = comuni.filter((c) => c.k === senzaAccenti(testo));
  if (uguali.length === 1) return aggiungiCitta(uguali[0]);
  if (uguali.length > 1) { proponi(uguali); $('statoCitta').textContent = 'Ci sono più comuni con questo nome: tocca quello giusto qui sopra.'; return; }
  const simili = cercaComuni(testo.slice(0, Math.max(3, testo.length - 2)));
  proponi(simili);
  $('statoCitta').textContent = simili.length ? `Non trovo «${testo}» tra i comuni italiani. Forse è uno di questi?` : `Non trovo «${testo}» tra i comuni italiani: controlla come è scritto.`;
  $('statoCitta').classList.add('errore');
}
$('campoNome').addEventListener('input', aggiornaSaluto);
$('campoCitta').addEventListener('input', async () => { await caricaComuni(); proponi(cercaComuni($('campoCitta').value)); });
$('campoCitta').addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); aggiungiDaTesto(); } });
$('aggiungiCitta').onclick = aggiungiDaTesto;
$('suggerimentiCitta').addEventListener('click', (e) => { const b = e.target.closest('[data-proposta]'); if (b) aggiungiCitta(proposte[+b.dataset.proposta]); });
$('chipCitta').addEventListener('click', (e) => { const b = e.target.closest('[data-togli-citta]'); if (b) { bozza.citta.splice(+b.dataset.togliCitta, 1); $('statoCitta').textContent = ''; renderChip(); } });
$('calcioSi').onclick = () => { bozza.calcio = true; renderCalcio(); };
$('calcioNo').onclick = () => { bozza.calcio = false; renderCalcio(); };
$('salvaConfig').onclick = async () => {
  aggiornaSaluto();
  bozza.squadra = bozza.calcio ? $('campoSquadra').value : '';
  // aspetta (poco) le coordinate delle città appena aggiunte, servono per il meteo
  for (let i = 0; i < 40 && bozza.citta.some((c) => attese.has(c)); i++) await sleep(150);
  salvaImpostazioni({ ...bozza, fatto: true });
  if (primaConfig) window.evento('onboarding-completato');
  await nuovoTG();
};
/** Dopo un cambio di preferenze: via il TG di oggi già preparato e se ne prepara uno nuovo. */
async function nuovoTG() {
  fermaTutto();
  for (const k of await db.keys()) if (/^(edizione|audio|titoli|varia|saluto):/.test(String(k))) await db.del(k);
  vocePerOggiKO = false; $('avvisi').innerHTML = '';
  applicaImpostazioni(null);
  if (Ed.gen) { mostra('tg'); mostraScheda('tg'); prepara(true); if (CONFIG.avvioAutomatico) avvioAutomatico(); }
  else avviaApp();
}

/* ---------- Impostazioni ---------- */
$('apriImpostazioni').onclick = () => {
  const imp = impostazioni();
  const sq = imp.squadra ? (Ed.grezzo?.squadre_disponibili || []).find((q) => q.id === imp.squadra)?.nome : '';
  $('riassuntoPreferenze').innerHTML = `<b>Famiglia:</b> ${esc(imp.nome || '—')}<br><b>Città:</b> ${esc(imp.citta.map((c) => c.nome).join(', ') || 'nessuna')}<br><b>Calcio:</b> ${imp.calcio ? 'sì' + (sq ? ` (${esc(sq)})` : '') : 'no'}`;
  $('chiaveMascherata').textContent = chiave ? chiave.slice(0, 6) + '…' + chiave.slice(-4) : '(nessuna)';
  $('statoImpostazioni').textContent = '';
  $('statoProva').textContent = !PUBBLICO.PREMIUM_ENABLED ? '' : premiumAttivo() ? '⭐ TG di Famiglia Premium attivo. Grazie!'
    : !giornoProva() ? `Prova gratuita di ${PUBBLICO.giorni_prova} giorni: parte dal primo TG ascoltato.`
    : giorniRimasti() > 0 ? `Prova gratuita: mancano ${giorniRimasti()} ${giorniRimasti() === 1 ? 'giorno' : 'giorni'}.`
    : giornoProva() <= PUBBLICO.giorni_prova ? "Prova gratuita: oggi è l'ultimo giorno." : 'La prova gratuita è finita.';
  $('infoVersione').textContent = `Versione ${CONFIG.versione} · suoni di oggi: ${PACCHETTO.nome} · voce: ${ls.get('tg_modello_voce') || '—'} · testo: ${ls.get('tg_modello_testo') || '—'}` + (Ed.grezzo ? ` · dati del ${new Date(Ed.grezzo.generato).toLocaleString('it-IT')}` : '');
  $('impostazioni').showModal();
};
$('chiudiImpostazioni').onclick = () => $('impostazioni').close();
$('modificaPreferenze').onclick = () => { $('impostazioni').close(); fermaTutto(); mostraConfig(false); };
$('salvaNuova').onclick = () => salvaChiaveDa($('nuovaChiave'), $('statoImpostazioni'), () => { vocePerOggiKO = false; $('avvisi').innerHTML = ''; prepara(true); });
$('ricomincia').onclick = async () => {
  if (!confirm('Vuoi davvero ricominciare da zero? Si cancellano la chiave, le città e le preferenze da questo telefono.')) return;
  fermaTutto();
  ls.svuota();
  try { indexedDB.deleteDatabase('tg-di-famiglia-app'); } catch {}
  try { for (const k of await caches.keys()) if (k.startsWith('tgapp-')) await caches.delete(k); } catch {}
  location.reload();
};
$('rigenera').onclick = async () => {
  $('impostazioni').close(); fermaTutto(); vocePerOggiKO = false; $('avvisi').innerHTML = '';
  if (Ed.grezzo) for (const k of await db.keys()) if (String(k).includes(Ed.grezzo.generato)) await db.del(k);
  prepara(true);
};

$('caffeImpostazioni').onclick = () => { window.evento('caffe'); window.open(PUBBLICO.kofi_caffe, '_blank', 'noopener'); };

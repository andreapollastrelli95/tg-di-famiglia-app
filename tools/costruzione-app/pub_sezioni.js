/* =====================================================================
   SEZIONI COMPLETE (Varie, Novità, Tech & AI, Altro): le stesse dell'app di famiglia, ma sulle città
   dell'utente. Il testo lo scrive Gemini sul telefono, con la chiave dell'utente, la prima volta che si
   apre la scheda ogni giorno (poi resta in cache fino a domani).
   ===================================================================== */
const registroAscolto = {}; // id -> { titolo, testo } dei testi che si possono ascoltare
const GIORNI_BREVI = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
const GIORNI_LUNGHI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
const MESI_IT = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const cittaUtente = () => impostazioniAttive().citta;
const nomiCittaUtente = () => elencoNomi(cittaUtente().map((c) => c.nome));
const nomeDialetto = (d) => `dialetto di ${d}`;
function fineSettimana(iso) {
  const g = new Date(iso + 'T12:00:00'), w = (g.getDay() + 6) % 7; // 0 = lunedì
  const ven = new Date(g); ven.setDate(g.getDate() + (w <= 4 ? 4 - w : -(w - 4)));
  const dom = new Date(ven); dom.setDate(ven.getDate() + 2);
  return [ven, dom];
}
const righeNotizie = (lista, massimo) => lista.slice(0, massimo).map((n) => `${n.fonte} | ${(n.data || '').slice(5, 16).replace('T', ' ')} | ${n.titolo}${n.sommario ? ' — ' + n.sommario.slice(0, 200) : ''}`).join('\n') || '(nessuna)';
const perCategoria = (cat) => (Ed.grezzo?.notizie || []).filter((n) => cat.includes(n.categoria));
const MA = { S: { type: 'STRING' } };
const ogg = (campi, altro = {}) => { const prop = Object.fromEntries(campi.map((c) => [c, MA.S])); Object.assign(prop, altro); return { type: 'OBJECT', properties: prop, required: Object.keys(prop), propertyOrdering: Object.keys(prop) }; };
const lista = (item) => ({ type: 'ARRAY', items: item });
const elencoStr = { type: 'ARRAY', items: MA.S };

/* ---------- Segnaposto e ricerca: se una sezione non c'è, un tasto la prepara ---------- */
let statoExtra = '', statoTech = '', extraInCorso = null, techInCorso = null;
function conCercati() { return Ed.extra; }
function tastoCerca(sez, motivo) {
  const tech = ['lavoro', 'tech'].includes(sez);
  const inCorso = tech ? techInCorso : extraInCorso;
  const stato = tech ? statoTech : statoExtra;
  if (inCorso) return '<p class="scheda cerca-ora">🔎 Sto preparando questa sezione con l\'intelligenza artificiale: ci vogliono circa 30 secondi…</p>';
  return `<div class="scheda cerca-ora"><p style="margin-top:0">${esc(motivo || 'Questa sezione si prepara con l\'intelligenza artificiale quando apri la scheda.')}</p>
    <button class="btn rosso" data-cerca="${sez}" type="button">▶️ Prepara ora</button>${stato ? `<p class="piccolo" style="margin:8px 0 0">${esc(stato)}</p>` : ''}</div>`;
}
async function cercaOra(sez) { return ['lavoro', 'tech'].includes(sez) ? preparaTech(true) : preparaExtra(true); }

/* ---------- Varie e Novità: sport, partite, cultura, eventi, detto, sentieri, ricetta, fai da te ---------- */
const chiaveExtra = () => `varia:${VERSIONE_CACHE}:${Ed.grezzo?.generato}:extra:${codice(JSON.stringify([cittaUtente().map((c) => c.nome), impostazioniAttive().calcio]))}`;
function promptExtra() {
  const iso = oggiISO(), g = new Date(iso + 'T12:00:00');
  const oggi = g.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const [ven, dom] = fineSettimana(iso);
  const citta = cittaUtente(), nomi = citta.map((c) => c.nome);
  const sigle = [...new Set(citta.map((c) => c.sigla))];
  const locali = sigle.map((s) => `NOTIZIE E EVENTI LOCALI – ${citta.filter((c) => c.sigla === s).map((c) => c.nome).join(', ')} (provincia ${s}):\n${righeNotizie(perCategoria(['locale']).filter((n) => n.provincia === s), 70)}`).join('\n\n');
  const tvSport = (Ed.grezzo?.tv?.sport || []).map((t) => `${t.canale} | ${t.ora} | ${t.titolo}`).join('\n') || '(nessun dato)';
  const giornoAnno = Math.round((giornoUTC(iso) - giornoUTC(iso.slice(0, 4) + '-01-01')) / 864e5) + 1;
  const dialetto = nomi.length ? nomi[giornoAnno % nomi.length] : '';
  return `Sei il redattore di un notiziario per una famiglia che vive a ${elencoNomi(nomi) || 'in Italia'}. Oggi è ${oggi}.
Per le sezioni basate sugli elenchi usa SOLO le informazioni degli elenchi: non inventare eventi, date, orari, luoghi, canali TV o risultati. Quando non c'è materiale lascia "testo" vuoto ("") e "lista" vuota. I testi servono per essere letti ad alta voce: frasi brevi, niente elenchi puntati né emoji. Scrivi in italiano corretto.

COMPITO 1 – "eventi_citta": per ciascuna città (${nomi.join(', ') || 'nessuna'}) gli eventi e le sagre del fine settimana da venerdì ${ven.getDate()} ${MESI_IT[ven.getMonth()]} a domenica ${dom.getDate()} ${MESI_IT[dom.getMonth()]} (dagli elenchi locali). Per ogni città "citta" (il nome esatto), "lista" (fino a 6 voci con "titolo", "dove", "quando") e "testo" (tra 40 e 70 parole).
COMPITO 2 – "cultura": per ciascuna città concerti, spettacoli teatrali e mostre dei prossimi 30 giorni (dagli elenchi locali): "citta", "lista" (fino a 6 voci con "titolo", "tipo", "dove", "quando") e "testo" (tra 40 e 70 parole).
COMPITO 3 – "altri_sport": tre testi, "tennis" (Sinner e gli altri italiani), "formula1" e "motogp", ciascuno tra 60 e 80 parole: notizie principali, risultati recenti e, solo se indicati negli elenchi, prossimi appuntamenti con orario e canale TV.
COMPITO 4 – "partite_oggi": le partite di calcio di oggi di squadre italiane (Serie A, coppe europee, Nazionale). "lista": "partita", "competizione", "ora", "canale" (vuoto se non risulta). "testo": tra 40 e 80 parole. Se non ci sono partite scrivi: "Dalle notizie raccolte non risultano partite di squadre italiane in programma oggi." e lascia la lista vuota.
COMPITO 5 – "detto": un proverbio popolare in ${dialetto ? nomeDialetto(dialetto) : 'dialetto italiano'}, realmente tramandato nella tradizione di quella zona (non inventarne uno). Oggi è il giorno ${giornoAnno} dell'anno: non scegliere sempre i più ovvi. Campi: "dialetto" (${dialetto ? `"${dialetto}"` : 'il nome del dialetto'}), "proverbio", "traduzione", "spiegazione" (30-40 parole).
COMPITO 6 – "ricetta": una ricetta tradizionale della cucina di ${elencoNomi(nomi) || 'una regione italiana'}, diversa ogni giorno (giorno ${giornoAnno}): "nome", "zona", "storia" (1-2 frasi), "porzioni", "ingredienti" (uno per voce, con le quantità), "procedimento" (passaggi, uno per voce), "consiglio" (un trucco della nonna, massimo 25 parole). Per questo compito puoi usare la tua conoscenza.
COMPITO 7 – "fai_da_te": 5 idee semplici per il tempo libero a ${MESI_IT[g.getMonth()]}: 3 di hobbistica e 2 di giardinaggio o orto, adatte alla stagione. "titolo" (massimo 7 parole), "tipo" ("hobbistica" o "giardinaggio"), "cosa_serve" (massimo 20 parole), "come_fare" (40-60 parole), "difficolta" ("facile" o "media"). Per questo compito puoi usare la tua conoscenza.
COMPITO 8 – "sentieri": 5 percorsi a piedi facili (camminate, trekking leggeri, sentieri nella natura) realmente esistenti e conosciuti nei dintorni di ${elencoNomi(nomi) || 'le tue città'}. "nome", "comune" (dove si trova), "citta" (la città scelta più vicina, nome esatto), "difficolta" ("facile" o "media"), "durata", "descrizione" (30-50 parole), "cerca" (testo per cercarlo su Google Maps). Se non conosci percorsi sicuri per una zona, proponi meno voci: non inventare.

Rispondi solo con il JSON richiesto.

${locali || 'NOTIZIE E EVENTI LOCALI: (nessuna città scelta)'}

TENNIS:\n${righeNotizie(perCategoria(['tennis']), 30)}
FORMULA 1:\n${righeNotizie(perCategoria(['formula1']), 30)}
MOTOGP:\n${righeNotizie(perCategoria(['motogp']), 30)}
CALCIO E SPORT (per le partite di oggi):\n${righeNotizie(perCategoria(['sport', 'calcio']), 100)}
SPORT IN TV OGGI (canale | ora | programma):\n${tvSport}`;
}
function schemaExtra() {
  const ev = lista(ogg(['titolo', 'dove', 'quando'])), cu = lista(ogg(['titolo', 'tipo', 'dove', 'quando']));
  const ordine = ['eventi_citta', 'cultura', 'altri_sport', 'partite_oggi', 'detto', 'ricetta', 'fai_da_te', 'sentieri'];
  return { type: 'OBJECT', required: ordine, propertyOrdering: ordine, properties: {
    eventi_citta: lista(ogg(['citta', 'testo'], { lista: ev })), cultura: lista(ogg(['citta', 'testo'], { lista: cu })),
    altri_sport: ogg(['tennis', 'formula1', 'motogp']), partite_oggi: ogg(['testo'], { lista: lista(ogg(['partita', 'competizione', 'ora', 'canale'])) }),
    detto: ogg(['dialetto', 'proverbio', 'traduzione', 'spiegazione']),
    ricetta: ogg(['nome', 'zona', 'storia', 'porzioni', 'consiglio'], { ingredienti: elencoStr, procedimento: elencoStr }),
    fai_da_te: lista(ogg(['titolo', 'tipo', 'cosa_serve', 'come_fare', 'difficolta'])),
    sentieri: lista(ogg(['nome', 'comune', 'citta', 'difficolta', 'durata', 'descrizione', 'cerca'])),
  } };
}
function normalizzaExtra(j) {
  const per = (v) => Object.fromEntries((v || []).filter((x) => x?.citta).map((x) => [x.citta, { testo: (x.testo || '').trim(), lista: (x.lista || []).filter((e) => e && Object.values(e).some(Boolean)) }]));
  const r = j.ricetta || {};
  return {
    eventi_citta: per(j.eventi_citta), cultura: per(j.cultura),
    altri_sport: Object.fromEntries(['tennis', 'formula1', 'motogp'].map((c) => [c, ((j.altri_sport || {})[c] || '').trim()])),
    partite_oggi: { testo: (j.partite_oggi?.testo || '').trim(), lista: (j.partite_oggi?.lista || []).filter((m) => m?.partita) },
    detto: j.detto?.proverbio ? { ...j.detto, scelto_da: 'ia' } : null,
    ricetta: (r.ingredienti?.length && r.procedimento?.length) ? r : null,
    fai_da_te: (j.fai_da_te || []).filter((x) => x?.titolo && x?.come_fare).slice(0, 5),
    sentieri: (j.sentieri || []).filter((x) => x?.nome),
  };
}
/** I dati del giorno possono arrivare dopo l'apertura della scheda: si aspetta (al massimo 40 s). */
async function attendiGrezzo() { for (let i = 0; i < 80 && !Ed.grezzo; i++) await sleep(500); return !!Ed.grezzo; }
function preparaExtra(forza = false) {
  if (extraInCorso) return extraInCorso; // impostato subito: aprire due schede insieme non fa partire due richieste
  statoExtra = '';
  extraInCorso = (async () => {
    try {
      if (!(await attendiGrezzo())) throw new ErroreGemini('dati', 'Le notizie di oggi non sono ancora arrivate.');
      const k = chiaveExtra();
      const c = forza ? null : await db.get(k);
      if (c) Ed.extra = c;
      else if (!sbloccata()) statoExtra = 'Serve la chiave Gemini: aggiungila da ⚙️ Impostazioni.';
      else { Ed.extra = normalizzaExtra(await jsonLibero(promptExtra(), schemaExtra())); db.set(k, Ed.extra); }
    } catch (e) { console.warn('extra', e); statoExtra = (e.messaggioUtente || 'Non è arrivato niente.') + ' Riprova tra poco.'; }
    extraInCorso = null; renderExtra();
  })();
  return extraInCorso;
}
function renderExtra() {
  const g = Ed.grezzo, x = Ed.extra, citta = cittaUtente(), imp = impostazioniAttive();
  if (g && !Ed.tech) Ed.tech = tecnoDiBase(g);
  const spiega = (t) => `<p class="spiega">${t}</p>`;
  const ascolta = (id, titolo, testo, etichetta = '▶️ Ascolta') => { registroAscolto[id] = { titolo, testo }; return `<button class="btn rosso" data-ascolta="${id}" type="button">${etichetta}</button>`; };
  const sezione = (id, titolo, corpo) => `<section data-sezione="${id}" class="nascosto"><h2>${titolo}</h2>${corpo}</section>`;
  const elenco = (l, riga) => (l?.length ? `<ul class="elenco">${l.map(riga).join('')}</ul>` : '');
  const senzaCitta = '<p class="scheda">Per vedere le sezioni della tua zona aggiungi le tue città da ⚙️ Impostazioni → Nome, città e calcio.</p>';
  const manca = (sez, perCitta) => (perCitta && !citta.length ? senzaCitta : tastoCerca(sez, x ? 'Per questa sezione oggi non ho trovato niente.' : undefined));
  let h = '';
  // ---- VARIE
  const sport = [['tennis', '🎾 Tennis'], ['formula1', '🏎️ Formula 1'], ['motogp', '🏍️ MotoGP']];
  h += sezione('sport', '🎾 Altri sport', spiega('Tennis (Sinner e gli altri italiani), Formula 1 e MotoGP: le notizie principali, i risultati e, quando sono noti, gli orari in TV.')
    + (x && sport.some(([c]) => x.altri_sport?.[c]) ? sport.filter(([c]) => x.altri_sport[c]).map(([c, nome]) => `<article class="scheda"><h3 style="margin-top:0">${nome}</h3><p>${esc(x.altri_sport[c])}</p>${ascolta('sport-' + c, nome.replace(/^\S+ /, ''), x.altri_sport[c])}</article>`).join('') : manca('sport')));
  const pa = x?.partite_oggi;
  h += sezione('partite', '⚽ Partite di oggi', spiega('Orario e canale TV delle partite di oggi delle squadre italiane: Serie A, coppe e Nazionale. Se manca il canale, non era indicato nelle notizie raccolte.')
    + (pa?.testo ? `<div class="scheda"><p>${esc(pa.testo)}</p>${ascolta('partite', 'Partite di oggi', pa.testo)}${elenco(pa.lista, (m) => `<li><b>${esc(m.ora || '—')}</b> · ${esc(m.partita)}<span>${esc([m.competizione, m.canale].filter(Boolean).join(' · '))}</span></li>`)}</div>` : manca('partite')));
  const scelta = citta.find((c) => c.nome === ls.get('tg_citta')) || citta[0];
  const cu = scelta && x?.cultura?.[scelta.nome];
  h += sezione('cultura', '🎭 Concerti, teatro e mostre', spiega('Che cosa c\'è da vedere e da ascoltare nei prossimi 30 giorni nelle tue città. Scegli la città:')
    + (citta.length > 1 ? `<div class="scelte">${citta.map((c) => `<button class="btn ${c === scelta ? 'attiva' : ''}" data-citta="${esc(c.nome)}" type="button">${esc(c.nome)}</button>`).join('')}</div>` : '')
    + (cu?.testo ? `<div class="scheda"><p>${esc(cu.testo)}</p>${ascolta('cultura-' + codice(scelta.nome), 'Concerti, teatro e mostre a ' + scelta.nome, cu.testo)}${elenco(cu.lista, (ev) => `<li><b>${esc(ev.titolo)}</b><span>${esc([ev.tipo, ev.dove, ev.quando].filter(Boolean).join(' · '))}</span></li>`)}</div>`
      : (x && citta.length ? '<p class="scheda">Per questa città oggi non risultano appuntamenti nelle notizie raccolte.</p>' : manca('cultura', true))));
  if ($('extraVarie')) $('extraVarie').innerHTML = h;
  // ---- NOVITÀ
  h = '';
  const [ven, dom] = fineSettimana(oggiISO());
  h += sezione('eventi', '🎪 Eventi e sagre nelle tue città', spiega(`Sagre, feste e appuntamenti nel fine settimana da venerdì ${ven.getDate()} a domenica ${dom.getDate()} ${MESI_IT[dom.getMonth()]}, nelle città che hai scelto.`)
    + (citta.length ? citta.map((c) => {
      const ec = x?.eventi_citta?.[c.nome];
      if (!x) return '';
      return `<h3>📍 ${esc(c.nome)}</h3>` + (ec?.testo ? `<div class="scheda"><p style="margin-top:0">${esc(ec.testo)}</p>${ascolta('eventi-' + codice(c.nome), 'Eventi e sagre a ' + c.nome, ec.testo)}${elenco(ec.lista, (e2) => `<li><b>${esc(e2.titolo)}</b><span>${esc([e2.dove, e2.quando].filter(Boolean).join(' · '))}</span></li>`)}</div>`
        : `<p class="scheda">Per questo fine settimana a ${esc(c.nome)} non risultano eventi nelle notizie raccolte.</p>`);
    }).join('') + (x ? '' : manca('eventi')) : senzaCitta));
  const d = x?.detto;
  h += sezione('detto', '💬 Il detto del giorno', spiega('Ogni giorno un proverbio nel dialetto di una delle tue città, con la traduzione e la spiegazione.')
    + (d?.proverbio ? `<article class="scheda accadde"><p class="piccolo" style="margin-top:0">In ${esc(String(d.dialetto || '').toLowerCase())}</p><p class="detto">“${esc(d.proverbio)}”</p>
        <p><b>Vuol dire:</b> ${esc(d.traduzione)}</p><p>${esc(d.spiegazione)}</p>
        ${ascolta('detto', 'Il detto del giorno', `${d.proverbio}. Vuol dire: ${d.traduzione}. ${d.spiegazione}`)}
        <p class="piccolo">Scelto dall'intelligenza artificiale: la grafia dialettale può non essere perfetta.</p></article>` : manca('detto', true)));
  if ($('contenutoNovita')) $('contenutoNovita').innerHTML = h;
  if ($('sceltaDialetti')) $('sceltaDialetti').innerHTML = citta.length ? citta.map((c) => `<button class="btn" data-dialetto="${esc(c.nome)}" type="button">${esc(c.nome)}</button>`).join('') : '<p class="piccolo">Aggiungi le tue città da ⚙️ Impostazioni per sentire il TG nel loro dialetto.</p>';
  $('paginaPartiteNascondi')?.remove();
  document.querySelector('#paginaVarie [data-apri="partite"]')?.classList.toggle('nascosto', !imp.calcio);
  renderSalute();
  renderTech();
  renderAltro();
  apriSezione('varie', sezioneAperta.varie, false); apriSezione('novita', sezioneAperta.novita, false);
}
function prossimaDomenica() {
  const oggi = new Date(oggiISO() + 'T12:00:00');
  oggi.setDate(oggi.getDate() + ((7 - oggi.getDay()) % 7));
  return oggi.toLocaleDateString('sv-SE');
}
function renderSalute() {
  const g = Ed.grezzo, x = Ed.extra;
  if (!$('sentieriContenuto')) return;
  const tutti = x?.sentieri || [];
  let h = '';
  if (tutti.length) {
    const scelto = tutti[Math.floor(giornoUTC(oggiISO()) / 864e5 / 7) % tutti.length];
    const altri = tutti.filter((t) => t !== scelto);
    const dom = prossimaDomenica();
    const luogo = (g?.meteo_luoghi || []).find((m) => senzaAccenti(m.localita) === senzaAccenti(scelto.citta));
    const prev = luogo?.giorni?.find((d) => d.data === dom);
    const meteoTesto = prev ? `${meteoCodice(prev.codice).emoji} ${meteoCodice(prev.codice).testo}, da ${prev.tmin} a ${prev.tmax} gradi, pioggia ${prev.pioggia_prob ?? '–'}%` : '';
    const consiglioPioggia = prev && (prev.pioggia_prob ?? 0) >= 60 ? ' Per domenica è prevista pioggia: meglio un percorso breve o rimandare.' : '';
    registroAscolto['sentiero'] = { titolo: 'Il sentiero della domenica', testo: `Il sentiero di questa domenica: ${scelto.nome}, a ${scelto.comune}. ${scelto.descrizione} Difficoltà ${scelto.difficolta}, durata ${scelto.durata}.${prev ? ` Il meteo previsto per domenica: ${meteoCodice(prev.codice).testo}, da ${prev.tmin} a ${prev.tmax} gradi.` : ''}${consiglioPioggia} Prima di partire controlla sempre accessi e condizioni del sentiero.` };
    h += `<article class="scheda scintilla"><p class="piccolo" style="margin-top:0">Il consiglio per ${esc(giornoNome(dom))}</p><h3 style="margin:0 0 6px">${esc(scelto.nome)}</h3>
      <div class="fonte" style="margin:0 0 8px">${esc(scelto.comune)} · ${esc(scelto.difficolta)} · ${esc(scelto.durata)}</div><p>${esc(scelto.descrizione)}</p>
      ${meteoTesto ? `<p class="evidenza"><b>Meteo di domenica:</b> ${esc(meteoTesto)}${esc(consiglioPioggia)}</p>` : ''}
      <div class="riga-btn"><button class="btn rosso" data-ascolta="sentiero" type="button">▶️ Ascolta</button><a class="btn" href="https://www.google.com/maps/search/${encodeURIComponent(scelto.cerca || scelto.nome + ' ' + scelto.comune)}" target="_blank" rel="noopener">🗺️ Come arrivare</a></div></article>`;
    h += '<h3>Altri percorsi</h3>' + altri.map((t) => `<article class="scheda"><h3 style="margin:0 0 6px">${esc(t.nome)}</h3>
      <div class="fonte" style="margin:0 0 8px">${esc(t.comune)} · ${esc(t.difficolta)} · ${esc(t.durata)}</div><p>${esc(t.descrizione)}</p>
      <a class="btn" href="https://www.google.com/maps/search/${encodeURIComponent(t.cerca || t.nome + ' ' + t.comune)}" target="_blank" rel="noopener">🗺️ Come arrivare</a></article>`).join('')
      + '<p class="piccolo">Percorsi proposti dall\'intelligenza artificiale: prima di partire verifica sempre accessi, orari e condizioni; porta acqua e scarpe adatte.</p>';
  } else h = cittaUtente().length ? tastoCerca('sentieri', 'I percorsi si preparano con l\'intelligenza artificiale quando apri la scheda.') : '<p class="scheda">Aggiungi le tue città da ⚙️ Impostazioni per avere percorsi vicino a te.</p>';
  $('sentieriContenuto').innerHTML = h;
  $('ricettaOggi').innerHTML = x?.ricetta ? schedaRicetta(x.ricetta, 'La ricetta di oggi', 'ricetta') : tastoCerca('ricetta', 'La ricetta del giorno si prepara con l\'intelligenza artificiale quando apri la scheda.');
  $('faidateOggi').innerHTML = x?.fai_da_te?.length ? schedeFaidate(x.fai_da_te, 'faidate') : tastoCerca('faidate', 'Le idee del giorno si preparano con l\'intelligenza artificiale quando apri la scheda.');
}
const SCHEMA_RICETTA2 = ogg(['nome', 'zona', 'storia', 'porzioni', 'consiglio'], { ingredienti: elencoStr, procedimento: elencoStr });
let ultimoPiatto = '';
$('altraRicetta').onclick = async () => {
  const st = $('statoRicetta');
  st.classList.remove('errore');
  if (!sbloccata()) { st.textContent = 'Per altre ricette serve la chiave Gemini: aggiungila da ⚙️ Impostazioni.'; return; }
  st.textContent = 'Apro il ricettario…'; $('ricettaNuova').innerHTML = ''; $('altraRicetta').disabled = true;
  try {
    const zone = nomiCittaUtente() || 'una regione italiana';
    const r = await jsonLibero(`Scrivi in italiano una ricetta tradizionale della cucina di ${zone}, diversa da "${ultimoPiatto || Ed.extra?.ricetta?.nome || ''}", come si fa in famiglia. "nome", "zona", "storia" (1-2 frasi), "porzioni", "ingredienti" (uno per voce, con le quantità), "procedimento" (passaggi in ordine, uno per voce), "consiglio" (un trucco della nonna, massimo 25 parole). Niente emoji.`, SCHEMA_RICETTA2);
    ultimoPiatto = r.nome;
    $('ricettaNuova').innerHTML = schedaRicetta(r, 'Pescata a caso', 'ricetta-' + codice(r.nome));
    st.textContent = '';
  } catch (e) { console.warn('ricetta', e); st.textContent = e.messaggioUtente || 'Il ricettario non risponde. Riprova tra poco.'; st.classList.add('errore'); }
  $('altraRicetta').disabled = false;
};
function dopoTG() { document.querySelectorAll('.condividi-fine').forEach((x) => x.classList.remove('nascosto')); }

/* ---------- Tech & AI e Altro ---------- */
function tecnoDiBase(g) {
  const youtube = [...(g.tech?.youtube || [])].sort((a, b) => String(b.data).localeCompare(String(a.data))).slice(0, 10);
  return { notizie: [], tendenze: '', idee: [], futuro: [], video: youtube, scintilla: null, lavoro: null,
    podcast: (g.podcast || []).filter((p) => p.gruppo === 'tech').slice(0, 10).map((p) => ({ ...p, spiegazione: riassunto(p.descrizione) })) };
}
function promptTech() {
  const g = Ed.grezzo, iso = oggiISO();
  const oggi = new Date(iso + 'T12:00:00').toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const elenco = (cat, max) => (g.notizie || []).filter((n) => n.categoria === cat).slice(0, max).map((n) => `${n.id} | ${n.fonte} | ${(n.data || '').slice(5, 16).replace('T', ' ')} | ${n.titolo}${n.sommario ? ' — ' + n.sommario.slice(0, 200) : ''}`).join('\n') || '(nessuna)';
  const video = (g.tech?.youtube || []).slice(0, 60).map((v) => `${v.vid} | ${v.canale} | ${(v.data || '').slice(0, 10)} | ${v.titolo} — ${(v.descrizione || '').slice(0, 150)}`).join('\n') || '(nessuno)';
  const vl = (g.altro?.lavoro?.video_cercati || []).map((v) => `${v.vid} | ${v.canale} | ${v.quando} | ${v.visualizzazioni} | ${v.titolo}`).join('\n') || '(nessuno)';
  const r = casuale(giornoUTC(iso) / 864e5);
  const c = g.tech?.concetti || {};
  const sc = [(c.vicini || ['orto'])[Math.floor(r() * (c.vicini || ['orto']).length)], (c.lontani || ['intelligenza artificiale'])[Math.floor(r() * (c.lontani || ['x']).length)]];
  Ed._scintilla = sc;
  return `Sei il curatore di una rubrica su tecnologia e intelligenza artificiale per una famiglia italiana. Oggi è ${oggi}.
Scrivi in italiano semplice e chiaro, da leggere ad alta voce: frasi brevi, niente elenchi puntati, niente emoji, sigle spiegate. Per notizie, futuro, video usa SOLO le informazioni degli elenchi: non inventare fatti, cifre, nomi o date.

COMPITO 1 – "notizie": le 10 notizie più importanti del giorno su tecnologia e intelligenza artificiale, dall'elenco NOTIZIE TECH (almeno 6 sull'IA; evita offerte, recensioni e doppioni). Per ciascuna "id", "titolo" (massimo 10 parole) e "testo" (45-65 parole).
COMPITO 2 – "tendenze": 70-90 parole sui trend futuri che emergono dalle notizie di oggi.
COMPITO 3 – "idee": 10 idee nuove e concrete da realizzare con la tecnologia e l'IA, per persone, famiglie, piccole imprese o il territorio. Per ciascuna "titolo" (massimo 8 parole), "idea" (40-60 parole), "primo_passo" (massimo 20 parole), "difficolta" ("facile", "media" o "impegnativa").
COMPITO 4 – "futuro": 10 pillole di futuro, le scoperte più sorprendenti su scienza, tecnologia, IA o robotica, dagli elenchi NOTIZIE TECH e SCIENZA E FUTURO. "id", "titolo" (massimo 8 parole), "testo" (35-55 parole).
COMPITO 5 – "video": fino a 10 video dall'elenco VIDEO che parlano di notizie su tecnologia o IA. "vid" e "perche" (massimo 25 parole).
COMPITO 6 – "scintilla": unisci i due concetti lontani "${sc[0]}" e "${sc[1]}" in modo inaspettato ma sensato. "ponte", "nome_idea" (massimo 5 parole), "idea" (60-80 parole), "intuizione" (40-60 parole), "primo_passo" (massimo 20 parole).
COMPITO 7 – "lavoro": le 6 notizie più interessanti sul futuro del lavoro (IA e occupazione, nuove professioni, lavoro da remoto, formazione), dagli elenchi NOTIZIE TECH, SCIENZA E FUTURO e LAVORO ED ECONOMIA. "id", "titolo" (massimo 10 parole), "testo" (40-60 parole). Poi "lavoro_video": i 3 video più seri dall'elenco VIDEO SUL LAVORO ("vid", "perche" massimo 25 parole) e "lavoro_intro": una frase (massimo 30 parole) sul tema del giorno.

Rispondi solo con il JSON richiesto.

NOTIZIE TECH:\n${elenco('tech', 120)}

SCIENZA E FUTURO:\n${elenco('futuro', 45)}

VIDEO (vid | canale | data | titolo — descrizione):\n${video}

LAVORO ED ECONOMIA:\n${elenco('lavoro', 50)}

VIDEO SUL LAVORO (vid | canale | quando | visualizzazioni | titolo):\n${vl}`;
}
function schemaTech() {
  const ord = ['notizie', 'tendenze', 'idee', 'futuro', 'video', 'scintilla', 'lavoro', 'lavoro_video', 'lavoro_intro'];
  return { type: 'OBJECT', required: ord, propertyOrdering: ord, properties: {
    notizie: lista(ogg(['id', 'titolo', 'testo'])), tendenze: MA.S, idee: lista(ogg(['titolo', 'idea', 'primo_passo', 'difficolta'])),
    futuro: lista(ogg(['id', 'titolo', 'testo'])), video: lista(ogg(['vid', 'perche'])),
    scintilla: ogg(['ponte', 'nome_idea', 'idea', 'intuizione', 'primo_passo']),
    lavoro: lista(ogg(['id', 'titolo', 'testo'])), lavoro_video: lista(ogg(['vid', 'perche'])), lavoro_intro: MA.S,
  } };
}
function costruisciTech(j) {
  const g = Ed.grezzo, base = tecnoDiBase(g);
  const per = Object.fromEntries(g.notizie.map((n) => [n.id, n]));
  const nota = (n, cat) => completaNotizia({ id: n.id, titolo: n.titolo, testo: n.testo, fonti_ids: [] }, cat);
  const per_vid = Object.fromEntries((g.tech?.youtube || []).map((v) => [v.vid, v]));
  const video = []; for (const v of j.video || []) if (per_vid[v.vid] && !video.some((x) => x.id === per_vid[v.vid].id)) video.push({ ...per_vid[v.vid], perche: (v.perche || '').trim() });
  const cercati = Object.fromEntries((g.altro?.lavoro?.video_cercati || []).map((v) => [v.vid, v]));
  const lv = []; for (const v of j.lavoro_video || []) if (cercati[v.vid] && !lv.some((x) => x.id === cercati[v.vid].id)) lv.push({ ...cercati[v.vid], perche: (v.perche || '').trim() });
  return {
    ...base,
    notizie: (j.notizie || []).filter((n) => per[n.id]).slice(0, 10).map((n) => nota(n, 'tech')),
    tendenze: (j.tendenze || '').trim(), idee: (j.idee || []).slice(0, 10),
    futuro: (j.futuro || []).slice(0, 10).map((f) => ({ titolo: pulisciTitolo(f.titolo), testo: (f.testo || '').trim(), fonte: per[f.id]?.fonte || '', link: per[f.id]?.link || '' })),
    video: video.length ? video.slice(0, 10) : base.video,
    scintilla: j.scintilla?.idea ? { ...j.scintilla, a: Ed._scintilla?.[0], b: Ed._scintilla?.[1] } : null,
    lavoro: { intro: (j.lavoro_intro || '').trim(), notizie: (j.lavoro || []).filter((n) => per[n.id]).slice(0, 6).map((n) => nota(n, 'lavoro')), video: lv.slice(0, 3) },
  };
}
function preparaTech(forza = false) {
  if (techInCorso) return techInCorso;
  statoTech = '';
  techInCorso = (async () => {
    try {
      if (!(await attendiGrezzo())) throw new ErroreGemini('dati', 'Le notizie di oggi non sono ancora arrivate.');
      const k = `varia:${VERSIONE_CACHE}:${Ed.grezzo.generato}:tech`;
      const c = forza ? null : await db.get(k);
      if (c) Ed.tech = c;
      else if (!sbloccata()) statoTech = 'Serve la chiave Gemini: aggiungila da ⚙️ Impostazioni.';
      else {
        const t = costruisciTech(await jsonLibero(promptTech(), schemaTech()));
        if (!t.notizie.length && !t.lavoro.notizie.length) throw new ErroreGemini('vuoto', 'La risposta non conteneva notizie utilizzabili.');
        Ed.tech = t; db.set(k, Ed.tech);
      }
    } catch (e) { console.warn('tech', e); statoTech = (e.messaggioUtente || 'Non è arrivato niente.') + ' Riprova tra poco.'; }
    techInCorso = null; renderTech(); renderAltro();
  })();
  renderTech(); renderAltro();
  return techInCorso;
}

"""Crea app/index.html della versione pubblica partendo dall'app di famiglia."""
import re
import sys

SRC = "C:/Users/andre/tg-di-famiglia/index.html"
DST = "C:/Users/andre/tg-di-famiglia-app/app/index.html"
s = open(SRC, encoding="utf-8").read()


def rep(a, b, n=1):
    global s
    c = s.count(a)
    assert c == n, (c, a[:100])
    s = s.replace(a, b)


def taglia(inizio, fine, sostituto=""):
    """Toglie da 'inizio' (compreso) a 'fine' (escluso)."""
    global s
    assert s.count(inizio) == 1, ("inizio", inizio[:80], s.count(inizio))
    i = s.index(inizio)
    j = s.index(fine, i)
    s = s[:i] + sostituto + s[j:]


# =========================================================== HEAD
rep('''<title>TG di Famiglia</title>
<meta name="description" content="Il notiziario quotidiano di famiglia">''', '''<title>TG di Famiglia – Il tuo telegiornale personale</title>
<meta name="description" content="TG di Famiglia: il tuo telegiornale personale in 5 minuti, con le notizie della tua città, podcast e radio. Gratis.">''')
rep('''<meta name="format-detection" content="telephone=no">''', '''<meta name="format-detection" content="telephone=no">
<link rel="apple-touch-icon" sizes="180x180" href="icons/apple-touch-icon.png">
<script>
/* Statistiche anonime senza cookie (GoatCounter). Finché il codice è il segnaposto non parte niente. */
window.GOATCOUNTER_CODICE = 'TUO-CODICE';
if (!/TUO-CODICE/.test(window.GOATCOUNTER_CODICE)) {
  const sc = document.createElement('script');
  sc.async = true; sc.src = 'https://gc.zgo.at/count.js';
  sc.dataset.goatcounter = `https://${window.GOATCOUNTER_CODICE}.goatcounter.com/count`;
  document.head.appendChild(sc);
}
/** Evento anonimo: solo il nome dell'azione, mai chiave, nomi o città. */
window.evento = (nome) => {
  try {
    const invia = () => window.goatcounter?.count?.({ path: 'evento/' + nome, title: nome, event: true });
    if (window.goatcounter?.count) invia(); else setTimeout(invia, 3000);
  } catch {}
};
</script>''')

# =========================================================== CSS in più
rep('''.badge.tuscia{background:#fde9c8;color:#6b3f00}''', '''.badge.locale{background:#fde9c8;color:#6b3f00}
.etichetta-demo{display:inline-block;background:var(--giallo);border:2px solid #e2c23d;color:var(--testo);font-weight:800;border-radius:999px;padding:4px 14px;font-size:17px;margin-bottom:10px}
.lucchetto{font-size:.9em;margin-left:4px}
.chip{display:inline-flex;align-items:center;gap:6px;background:var(--blu-chiaro);color:var(--blu);border-radius:999px;padding:6px 6px 6px 14px;font-weight:700;margin:0 6px 8px 0;font-size:18px}
.chip button{border:none;background:var(--blu);color:var(--carta);border-radius:50%;width:30px;height:30px;font-size:16px;line-height:1}
.suggerimenti{list-style:none;margin:-6px 0 12px;padding:0;border:2px solid var(--blu);border-radius:14px;overflow:hidden;background:var(--carta)}
.suggerimenti:empty{display:none}
.suggerimenti li button{width:100%;text-align:left;border:none;border-top:1px solid var(--bordo);background:var(--carta);color:var(--testo);padding:12px 14px;font-size:19px}
.suggerimenti li:first-child button{border-top:none}
.interruttore{display:flex;gap:10px;margin:6px 0 14px}
.interruttore .btn{flex:1}
.interruttore .btn.attiva{background:var(--blu);color:var(--carta)}
.avvertenza{font-size:16px;color:var(--tenue);margin:6px 0 18px}
.passi{padding-left:0;list-style:none;counter-reset:passo;margin:0 0 14px}
.passi li{counter-increment:passo;display:flex;gap:12px;align-items:flex-start;margin-bottom:12px}
.passi li::before{content:counter(passo);display:grid;place-items:center;flex:none;width:36px;height:36px;border-radius:50%;background:var(--rosso);color:#fff;font-weight:800}
details.perche{margin:4px 0 12px}
details.perche summary{color:var(--blu);font-weight:700;cursor:pointer}
.caffe{font-size:17px}''')
rep('''@media (max-width:420px){''', '''.sottotitolo{font-size:16px;opacity:.9}
@media (max-width:420px){''')

# =========================================================== HTML: intestazione, demo, sblocco, configurazione
rep('''      <h1>TG di Famiglia</h1>
      <div class="data" id="oggi"></div>''', '''      <h1>TG di Famiglia</h1>
      <div class="sottotitolo">Il tuo telegiornale personale in 5 minuti</div>
      <div class="data" id="oggi"></div>''')
taglia('''  <!-- Primo avvio -->''', '''  <!-- Schermata principale -->''', '''  <!-- DEMO: edizione dimostrativa, statica, senza chiave -->
  <section id="schermataDemo" class="nascosto">
    <div class="scheda player">
      <span class="etichetta-demo">🎬 Edizione dimostrativa</span>
      <button class="tasto-play" id="tastoDemo" aria-label="Guarda la demo">
        <svg id="iconaDemo" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>
      </button>
      <div class="etichetta-play" id="etichettaDemo">▶ Guarda la demo</div>
      <p class="stato" id="statoDemo" role="status" aria-live="polite">Ecco come funziona: una piccola edizione di prova, letta dalla voce del telefono.</p>
      <div class="riga-btn" style="margin-top:14px">
        <button class="btn" id="tgOggiBloccato" type="button">📺 Il TG di oggi <span class="lucchetto">🔒</span></button>
        <button class="btn pieno" id="apriSblocco" type="button">🔑 Sblocca gratis</button>
      </div>
    </div>
    <h2>📰 Le notizie di esempio</h2>
    <div id="demoNotizie"></div>
    <h2>🎧 Podcast di esempio</h2>
    <div id="demoPodcast"></div>
  </section>

  <!-- CONFIGURAZIONE: dopo lo sblocco e dalle impostazioni -->
  <section id="schermataConfig" class="setup nascosto">
    <div class="scheda">
      <h2>✨ Prepariamo il tuo TG</h2>
      <p>Tre domande e si parte. Puoi cambiare tutto quando vuoi dall'ingranaggio ⚙️ in alto.</p>
      <label for="campoNome"><b>1. Il nome della famiglia</b> <span class="piccolo">(facoltativo)</span></label>
      <input id="campoNome" class="campo" type="text" autocomplete="off" maxlength="40" placeholder="Es. Rossi">
      <p class="piccolo" id="anteprimaSaluto" style="margin-top:-6px"></p>
      <label for="campoCitta"><b>2. Le tue città</b> <span class="piccolo">(da 0 a 5)</span></label>
      <div id="chipCitta"></div>
      <input id="campoCitta" class="campo" type="text" autocomplete="off" placeholder="Scrivi il nome del comune">
      <ul class="suggerimenti" id="suggerimentiCitta"></ul>
      <div class="riga-btn"><button class="btn" id="aggiungiCitta" type="button">➕ Aggiungi città</button></div>
      <p class="stato" id="statoCitta" role="status" aria-live="polite"></p>
      <p style="margin:18px 0 4px"><b>3. Ti interessa il calcio?</b></p>
      <div class="interruttore" role="group" aria-label="Calcio">
        <button class="btn" id="calcioSi" type="button">⚽ Sì</button>
        <button class="btn" id="calcioNo" type="button">No, grazie</button>
      </div>
      <div id="bloccoSquadra">
        <label for="campoSquadra"><b>Squadra del cuore</b> <span class="piccolo">(facoltativa)</span></label>
        <select id="campoSquadra" class="campo"><option value="">Nessuna in particolare</option></select>
      </div>
      <div class="riga-btn" style="margin-top:8px"><button class="btn rosso" id="salvaConfig" type="button">▶ Inizia il mio TG</button></div>
      <p class="stato" id="statoConfig" role="status" aria-live="polite"></p>
    </div>
  </section>

''')

# schede: niente NOVITÀ, TECH, ALTRO
rep('''      <button id="schedaNovita" type="button">✨ NOVITÀ</button>
      <button id="schedaTech" type="button">🤖 TECH &amp; AI</button>
      <button id="schedaAltro" type="button">🌍 ALTRO</button>
''', '')
# avvertenza sotto le notizie
rep('''    <div id="listaNotizie"><p class="segnaposto scheda">Le notizie compariranno qui appena pronte.</p></div>
    </div><!-- /paginaTG -->''', '''    <div id="listaNotizie"><p class="segnaposto scheda">Le notizie compariranno qui appena pronte.</p></div>
    <p class="avvertenza">ℹ️ Le notizie sono riassunti scritti dall'intelligenza artificiale a partire dalle fonti indicate: possono contenere errori. Per i dettagli e per verificare apri sempre l'articolo originale con «Approfondisci».</p>
    </div><!-- /paginaTG -->''')
# VARIE: solo meteo, stasera in TV, accadde oggi
taglia('''    <div id="paginaVarie" class="nascosto">''', '''  </section>
</main>''', '''    <div id="paginaVarie" class="nascosto">
      <div class="menu-sezioni" id="menuVarie">
        <button class="btn" data-apri="meteo" id="tastoMeteo" type="button">🌦️ Meteo</button>
        <button class="btn" data-apri="tv" type="button">📺 Stasera in TV</button>
        <button class="btn" data-apri="accadde" type="button">📜 Accadde oggi</button>
      </div>
      <div id="contenutoVarie"></div>
    </div>
''')

# dialoghi: sblocco + impostazioni
taglia('''<dialog id="impostazioni">''', '''<audio id="audio"''', '''<dialog id="sblocco">
  <h2>Inserisci la tua chiave API per sbloccare gratuitamente tutte le funzionalità dell'app</h2>
  <ol class="passi">
    <li><span>Apri <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener"><b>aistudio.google.com</b></a> e accedi con il tuo account Google, quello di Gmail.</span></li>
    <li><span>Premi <b>«Create API key»</b> (in italiano <b>«Crea chiave API»</b>). Se te lo chiede, accetta le condizioni.</span></li>
    <li><span>Premi <b>Copia</b> accanto alla chiave (è una lunga serie di lettere e numeri).</span></li>
    <li><span>Torna qui, incollala nel riquadro e premi <b>Sblocca</b>.</span></li>
  </ol>
  <p><a class="btn pieno" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener" style="width:100%">🔑 Apri Google AI Studio</a></p>
  <p class="piccolo">✅ È gratuita, non serve la carta di credito, la chiave resta solo sul tuo telefono.</p>
  <details class="perche"><summary>Perché serve?</summary>
    <p class="piccolo">Ogni giorno l'intelligenza artificiale di Google (Gemini) sceglie le notizie e scrive il tuo TG su misura, con la tua città e la tua squadra. La chiave è il tuo accesso personale e gratuito a Gemini: viene usata solo dal tuo telefono per parlare con Google e non passa da nessun altro server.</p>
  </details>
  <label for="campoChiave"><b>La tua chiave</b></label>
  <input id="campoChiave" class="campo" type="text" inputmode="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Incolla qui la chiave">
  <div class="riga-btn">
    <button class="btn" id="incolla" type="button">📋 Incolla</button>
    <button class="btn rosso" id="salvaChiave" type="button">🔓 Sblocca</button>
  </div>
  <p class="stato" id="statoChiave" role="status" aria-live="polite"></p>
  <div class="riga-btn" style="margin-top:8px"><button class="btn" id="piuTardi" type="button">Più tardi</button></div>
</dialog>

<dialog id="impostazioni">
  <h2>⚙️ Impostazioni</h2>
  <p id="riassuntoPreferenze"></p>
  <div class="riga-btn"><button class="btn pieno" id="modificaPreferenze" type="button">✏️ Nome, città e calcio</button></div>
  <h3>🔑 Chiave Gemini</h3>
  <p>Chiave salvata: <b id="chiaveMascherata"></b></p>
  <label for="nuovaChiave"><b>Cambia chiave</b></label>
  <input id="nuovaChiave" class="campo" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Incolla la nuova chiave">
  <div class="riga-btn">
    <button class="btn pieno" id="salvaNuova" type="button">Salva nuova chiave</button>
  </div>
  <p class="stato" id="statoImpostazioni" role="status" aria-live="polite"></p>
  <div class="riga-btn" style="margin-top:14px">
    <button class="btn" id="rigenera" type="button">🔄 Rifai il notiziario di oggi</button>
    <button class="btn rosso" id="ricomincia" type="button">🗑 Ricomincia da zero</button>
  </div>
  <p class="piccolo" style="margin-top:16px"><a href="../privacy.html" target="_blank" rel="noopener">Privacy</a> · <a href="../" target="_blank" rel="noopener">Informazioni sull'app</a><span id="caffe"></span></p>
  <p class="piccolo" id="infoVersione"></p>
  <div class="riga-btn" style="margin-top:10px"><button class="btn" id="chiudiImpostazioni" type="button">Chiudi</button></div>
</dialog>

''')

# =========================================================== CONFIG
rep('''  saluto: 'Buongiorno Famiglia! Queste sono le notizie e i podcast del giorno consigliati. Buon ascolto e buona giornata.',''',
    '''  saluto: 'Buongiorno Famiglia! Ecco il TG di oggi. Buon ascolto.', // si adatta a nome e città (vedi salutoPer)''')
rep('''  righeMassime: { generale: 150, tuscia: 60, sport: 50, calcio: 50, altre: 35 },''',
    '''  righeMassime: { generale: 150, locale: 120, sport: 50, calcio: 50, altre: 35 },''')
rep('''  sezioni: [
    { categoria: 'generale', quante: 5, etichetta: 'Attualità', classe: '' },
    { categoria: 'tuscia', quante: 3, etichetta: '🏛️ Tuscia', classe: 'tuscia', annuncio: 'Notizie dalla Tuscia.' },
    { categoria: 'sport', quante: 2, etichetta: '⚽ Sport', classe: 'calcio', annuncio: 'Notizie sportive.' },
  ],''', '''  // Scaletta: costruita da applicaImpostazioni() in base alle città e al calcio scelti dall'utente
  sezioni: [{ categoria: 'generale', quante: 10, etichetta: 'Attualità', classe: '' }],''')
rep('''  versione: '2.7.1',
};''', '''  versione: '1.0.0',
  dati: '../data/',          // dati raccolti ogni mattina da GitHub Actions
  // Fase successiva: con il proxy (cartella proxy/) la chiave sta sul server e gli utenti non devono crearla.
  useProxy: false,
  proxyUrl: 'https://tg-di-famiglia-proxy.TUO-ACCOUNT.workers.dev',
  kofi: 'https://ko-fi.com/TUO-NOME', // tasto donazione: resta nascosto finché c'è il segnaposto
};''')
rep('''const TOTALE_NOTIZIE = CONFIG.sezioni.reduce((t, x) => t + x.quante, 0);''', '''let TOTALE_NOTIZIE = 10;''')

# localStorage con prefisso proprio (sullo stesso dominio c'è un'altra app)
rep('''const ls = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  del(k) { try { localStorage.removeItem(k); } catch {} },
};''', '''const LS_PREFISSO = 'tgapp:'; // sullo stesso dominio possono esserci altre app: chiavi tutte con prefisso
const ls = {
  get(k) { try { return localStorage.getItem(LS_PREFISSO + k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(LS_PREFISSO + k, v); } catch {} },
  del(k) { try { localStorage.removeItem(LS_PREFISSO + k); } catch {} },
  svuota() { try { Object.keys(localStorage).filter((k) => k.startsWith(LS_PREFISSO)).forEach((k) => localStorage.removeItem(k)); } catch {} },
};''')
rep('''    const r = indexedDB.open('tg-di-famiglia', 1);''', '''    const r = indexedDB.open('tg-di-famiglia-app', 1);''')

# proxy (non attivo)
rep('''  const url = `${CONFIG.api}/models/${encodeURIComponent(modello)}:${stream ? 'streamGenerateContent?alt=sse' : 'generateContent'}`;''',
    '''  const base = CONFIG.useProxy ? CONFIG.proxyUrl + '/v1beta' : CONFIG.api;
  const url = `${base}/models/${encodeURIComponent(modello)}:${stream ? 'streamGenerateContent?alt=sse' : 'generateContent'}`;''')
rep('''    res = await fetch(url, { method: 'POST', signal: ctrl.signal, headers: { 'Content-Type': 'application/json', 'x-goog-api-key': chiave }, body: JSON.stringify(corpo) });''',
    '''    const intestazioni = CONFIG.useProxy ? { 'Content-Type': 'application/json', 'x-tg-utente': idAnonimo() } : { 'Content-Type': 'application/json', 'x-goog-api-key': chiave };
    res = await fetch(url, { method: 'POST', signal: ctrl.signal, headers: intestazioni, body: JSON.stringify(corpo) });''')
rep('''async function verificaChiave(k) {''', '''/** Identificativo casuale del telefono, usato solo dal proxy (fase successiva) per il limite giornaliero. */
function idAnonimo() {
  let id = ls.get('tg_id');
  if (!id) { id = (crypto.randomUUID?.() || String(Math.random()).slice(2)); ls.set('tg_id', id); }
  return id;
}
const sbloccata = () => CONFIG.useProxy || !!chiave;

async function verificaChiave(k) {''')
rep('''  if (!chiave) throw new ErroreGemini('senzaChiave',''', '''  if (!sbloccata()) throw new ErroreGemini('senzaChiave',''')

# =========================================================== PROMPT dinamico
taglia('''function promptRedazione(grezzo) {''', '''function schemaRedazione(grezzo) {''', r'''function promptRedazione(grezzo) {
  const imp = impostazioni();
  const giorno = new Date(grezzo.generato).toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const giornoMese = new Date(grezzo.generato).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' });
  const riga = (n) => `${n.id} | ${n.fonte} | ${(n.data || '').slice(5, 16).replace('T', ' ')} | ${n.titolo}${n.sommario ? ' — ' + n.sommario.slice(0, 160) : ''}`;
  const elenco = (cat, filtro = () => true) => grezzo.notizie.filter((n) => n.categoria === cat && filtro(n)).slice(0, CONFIG.righeMassime[cat] || CONFIG.righeMassime.altre).map(riga).join('\n') || '(nessuna)';
  const squadre = grezzo.squadre || [];
  const pod = grezzo.podcast.filter((p) => !p.gruppo && (imp.calcio || !p.calcio)).map((p) => `${p.id} | ${p.locale ? `LOCALE (${p.zona})` : p.calcio ? 'CALCIO' : 'attualità'} | ${p.nome} | episodio: ${p.episodio} | ${(p.descrizione || '').slice(0, 320)}`);
  const sez = Object.fromEntries(CONFIG.sezioni.map((x) => [x.categoria, x.quante]));
  const nomiCitta = imp.citta.map((c) => c.nome);
  const luogoMeteo = grezzo.meteo_luoghi?.[0];
  const meteo = luogoMeteo ? meteoDaDomani(luogoMeteo).map((d) => `${giornoNome(d.data)} | ${meteoCodice(d.codice).testo} | min ${d.tmin}° max ${d.tmax}° | pioggia ${d.pioggia_prob ?? '?'}% (${d.pioggia_mm} mm) | vento ${d.vento} km/h`) : [];
  const tv = (grezzo.tv?.serata || []).map((t) => `${t.canale} | ${t.ora} | ${t.titolo}${t.prima_tv ? ' [prima TV]' : ''} | ${t.descrizione || ''}`);
  const tvSport = imp.calcio ? (grezzo.tv?.sport || []).map((t) => `${t.canale} | ${t.ora} | ${t.titolo}`) : [];
  const amato = squadre.find((q) => q.cuore);
  const distribuzione = nomiCitta.length === 1 ? `tutte su ${nomiCitta[0]} e la sua provincia`
    : `divise tra ${elencoNomi(nomiCitta)} (almeno una per città quando c'è materiale)`;
  const regole = [`- ${sez.generale} di categoria "generale" (dall'elenco NOTIZIE NAZIONALI): le più importanti del giorno in Italia e nel mondo, variando gli argomenti (politica, economia, esteri, cronaca, scienza). Preferisci i fatti riportati da più testate; evita doppioni, gossip e notizie minori.`];
  if (sez.locale) regole.push(`- ${sez.locale} di categoria "locale" (dagli elenchi NOTIZIE LOCALI), ${distribuzione}: le più rilevanti per chi ci vive (cronaca, amministrazione, sanità, viabilità, lavoro, eventi importanti). Il titolo deve cominciare con il nome della città (o della provincia, se la notizia riguarda un altro comune) seguito da una virgola, per esempio "${nomiCitta[0]}, …". Scarta comunicati promozionali, doppioni e notizie di luoghi omonimi in altre regioni. Le voci locali hanno solo il titolo: per queste il testo è più breve (tra 30 e 50 parole) e non deve aggiungere niente che il titolo non dica. Se per una città non c'è niente di adatto, usa un'altra notizia locale; se non ce n'è nessuna, metti al suo posto una notizia nazionale in più (categoria "generale").`);
  if (sez.sport) regole.push(`- ${sez.sport} di categoria "sport" (dall'elenco NOTIZIE SPORTIVE${amato ? ` e dall'elenco SQUADRA DEL CUORE` : ''}): calcio italiano (Serie A, Nazionale, coppe europee, Champions League)${amato ? `, dando la precedenza alla ${amato.nome} se c'è una notizia importante` : ''}.`);
  const locali = (grezzo.province || []).map((p) => `NOTIZIE LOCALI – provincia di ${p.nome} (città scelte: ${p.citta.join(', ')}):\n${elenco('locale', (n) => n.provincia === p.sigla)}`).join('\n\n');
  return `Sei il caporedattore di un telegiornale italiano ascoltato ogni mattina da una famiglia${nomiCitta.length ? ` che segue le notizie di ${elencoNomi(nomiCitta)}` : ''}. Oggi è ${giorno}.
Qui sotto trovi il materiale raccolto stamattina: notizie (formato: id | fonte | data | titolo — sommario), podcast${meteo.length ? ', previsioni meteo' : ''} e guida TV.

PRIMA DI TUTTO – "scaletta": l'elenco delle ${TOTALE_NOTIZIE} notizie che hai scelto per il telegiornale secondo le regole del compito 1, nello stesso ordine: per ciascuna solo "id", "categoria" e "titolo". Serve per leggere subito i titoli di testa.

COMPITO 1 – "notizie": le stesse ${TOTALE_NOTIZIE} notizie della scaletta, con gli stessi id e gli stessi titoli, esattamente in quest'ordine:
${regole.join('\n')}
Per ciascuna:
- "id": l'id della voce più completa su quel fatto; "fonti_ids": tutti gli id che parlano dello stesso fatto (compreso "id").
- "titolo": massimo 10 parole, chiaro.
- "testo": tra 60 e 90 parole, riscritto con parole tue, in tono neutrale e fattuale da telegiornale, pensato per essere letto ad alta voce: frasi brevi, niente elenchi, niente emoji, sigle spiegate la prima volta, numeri leggibili (nel titolo invece scrivi anni e numeri in cifre). Usa solo le informazioni presenti nei titoli e nei sommari: non inventare dettagli, cifre o dichiarazioni, e non copiare frasi intere dagli articoli.

COMPITO 2 – "accadde_oggi": una curiosità storica realmente accaduta il ${giornoMese} di un anno passato, tra 45 e 55 parole (circa 20 secondi di lettura). Scegli un fatto celebre e certo, indica l'anno, non inventare nulla. Non iniziare con "Accadde oggi".

COMPITO 3 – "podcast": scegli esattamente ${CONFIG.podcast} podcast dall'elenco PODCAST (tutti, se sono meno di ${CONFIG.podcast})${imp.calcio ? ', con almeno 1 di CALCIO se presente' : ''}${pod.some((p) => p.includes('| LOCALE')) ? ', mettendo per primi i podcast LOCALI recenti e pertinenti' : ''}, poi i più interessanti e attuali. Per ciascuno "id" e "spiegazione": 2 frasi brevi (massimo 35 parole in tutto) che spiegano di cosa parla l'episodio.

COMPITO 4 – "squadre": ${squadre.length ? `per ogni sezione di calcio indicata sotto, le notizie più importanti prese dal suo elenco, nel numero indicato ("squadra" = id della sezione). Per ciascuna "id", "fonti_ids", "titolo" (massimo 10 parole) e "testo" (tra 40 e 60 parole, stesse regole del compito 1). Evita voci inconsistenti e doppioni; nella sezione "calcio" copri Serie A, coppe europee e calciomercato senza ripetere le notizie già scelte per la squadra.` : 'restituisci un elenco vuoto.'}

COMPITO 5 – "meteo": ${meteo.length ? `previsioni per ${luogoMeteo.localita} da leggere ad alta voce, massimo 60 parole, molto riassuntive: prima domani (cielo, temperatura minima e massima, pioggia), poi in una o due frasi la tendenza del resto della settimana. Usa solo i dati dell'elenco METEO; scrivi "gradi" e non il simbolo.` : 'restituisci una stringa vuota.'}

COMPITO 6 – "tv": "Stasera in TV" da leggere ad alta voce in circa 30 secondi, tra 70 e 80 parole: i programmi più interessanti della prima serata (con canale e orario)${imp.calcio ? ' e le partite o gli eventi sportivi in onda stasera, se presenti negli elenchi' : ''}. Non inventare programmi. Non iniziare con "Stasera in TV". Se gli elenchi sono vuoti restituisci una stringa vuota.

Rispondi solo con il JSON richiesto.

NOTIZIE NAZIONALI (categoria "generale"):
${elenco('generale')}
${sez.locale ? `\n${locali}\n` : ''}${sez.sport ? `\nNOTIZIE SPORTIVE (categoria "sport"):\n${elenco('sport')}\n` : ''}${amato ? `\nSQUADRA DEL CUORE – ${amato.nome} (se la scegli tra le notizie sportive usa la categoria "sport"):\n${elenco(amato.id)}\n` : ''}
${squadre.map((q) => `SEZIONE CALCIO "${q.id}" (${q.nome}) – scegline ${quanteNotizie(q)}:\n${elenco(q.id)}`).join('\n\n')}

PODCAST:
${pod.join('\n') || '(nessuno)'}
${meteo.length ? `\nMETEO (${luogoMeteo.localita}, da domani):\n${meteo.join('\n')}\n` : ''}
TV PRIMA SERATA (canale | ora | titolo | descrizione):
${tv.join('\n') || '(nessun dato)'}
${tvSport.length ? `\nTV SPORT DI STASERA:\n${tvSport.join('\n')}` : ''}`;
}
''')

# =========================================================== DATI: grezzo + città, squadra e meteo dell'utente
taglia('''async function caricaGrezzo() {''', '''/** Edizione scritta e letta sul server''', r'''async function caricaGrezzo() {
  try {
    const r = await fetch(CONFIG.dati + 'grezzo.json', { cache: 'no-store' });
    if (!r.ok) throw new Error(r.status);
    const g = await r.json();
    await arricchisci(g);
    ls.set('tg_ultimo_grezzo', g.generato);
    return g;
  } catch (e) {
    console.warn('grezzo.json', e);
    return null;
  }
}

/* ---------- Preferenze dell'utente (solo su questo telefono) ---------- */
function impostazioni() {
  let v = {};
  try { v = JSON.parse(ls.get('tg_impostazioni') || '{}') || {}; } catch {}
  return { nome: '', citta: [], calcio: true, squadra: '', fatto: false, ...v, citta: Array.isArray(v.citta) ? v.citta.slice(0, 5) : [] };
}
function salvaImpostazioni(v) { ls.set('tg_impostazioni', JSON.stringify(v)); }
const elencoNomi = (l) => (l.length <= 1 ? (l[0] || '') : l.slice(0, -1).join(', ') + ' e ' + l[l.length - 1]);
function salutoPer(imp) {
  const nomi = imp.citta.map((c) => c.nome);
  return `Buongiorno Famiglia${imp.nome ? ' ' + imp.nome : ''}! Ecco il TG di oggi${nomi.length ? `, con le notizie da ${elencoNomi(nomi)}` : ''}. Buon ascolto.`;
}
/** Scaletta del giorno: 10 notizie; le locali in proporzione alle città, 2 di calcio se il calcio è attivo. */
function applicaImpostazioni(g) {
  const imp = impostazioni();
  const nc = imp.citta.length;
  const disponibili = g ? g.notizie.filter((n) => n.categoria === 'locale').length : nc;
  let locali = !nc ? 0 : nc === 1 ? 2 : nc === 2 ? 3 : 4;
  locali = Math.min(locali, disponibili); // nessuna notizia locale trovata: si usano notizie nazionali
  const sport = imp.calcio ? 2 : 0;
  CONFIG.sezioni = [{ categoria: 'generale', quante: 10 - locali - sport, etichetta: 'Attualità', classe: '' }];
  if (locali) CONFIG.sezioni.push({ categoria: 'locale', quante: locali, etichetta: '📍 Dalla tua zona', classe: 'locale', annuncio: `Notizie da ${elencoNomi(imp.citta.map((c) => c.nome))}.` });
  if (sport) CONFIG.sezioni.push({ categoria: 'sport', quante: sport, etichetta: '⚽ Calcio', classe: 'calcio', annuncio: 'Notizie di calcio.' });
  TOTALE_NOTIZIE = CONFIG.sezioni.reduce((t, x) => t + x.quante, 0);
  CONFIG.saluto = salutoPer(imp);
  $('schedaCalcio').classList.toggle('nascosto', !imp.calcio);
}
const senzaAccenti = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const nomina = (testo, nome) => new RegExp(`(^|[^a-z])${senzaAccenti(nome).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}([^a-z]|$)`).test(senzaAccenti(testo));

/** Aggiunge ai dati del mattino quelli che dipendono dall'utente: notizie e podcast delle sue province,
 *  notizie della squadra del cuore, meteo delle sue città. Se qualcosa manca si va avanti senza. */
async function arricchisci(g) {
  const imp = impostazioni();
  const json = (u) => fetch(u, { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null);
  const sigle = [...new Set(imp.citta.map((c) => c.sigla).filter(Boolean))];
  const nota = (g.squadre_disponibili || []).find((q) => q.id === imp.squadra);
  const [province, squadra, meteo] = await Promise.all([
    Promise.all(sigle.map((s) => json(`${CONFIG.dati}province/${s}.json`))),
    imp.calcio && nota ? json(`${CONFIG.dati}squadre/${nota.id}.json`) : null,
    meteoCitta(imp.citta),
  ]);
  g.province = [];
  for (const p of province.filter(Boolean)) {
    const citta = imp.citta.filter((c) => c.sigla === p.sigla).map((c) => c.nome);
    // prima le notizie che nominano una delle città scelte, poi il resto della provincia
    const lista = [...p.notizie].sort((a, b) => Number(citta.some((c) => nomina(b.titolo, c))) - Number(citta.some((c) => nomina(a.titolo, c))));
    lista.forEach((n) => g.notizie.push({ ...n, categoria: 'locale', provincia: p.sigla, sommario: n.sommario || '' }));
    g.province.push({ sigla: p.sigla, nome: p.nome, citta });
    (p.podcast || []).forEach((x, i) => g.podcast.push({ ...x, id: `l${p.sigla}${i}`, locale: true, zona: p.nome }));
  }
  g.squadre = [];
  if (imp.calcio) {
    if (nota && squadra?.notizie?.length) {
      squadra.notizie.forEach((n) => g.notizie.push({ ...n, categoria: nota.id }));
      g.squadre.push({ id: nota.id, nome: nota.nome, emoji: '❤️', notizie: 3, cuore: true });
    }
    g.squadre.push({ id: 'calcio', nome: 'Serie A, Champions e calciomercato', emoji: '⚽', notizie: 5, podcast_generali: true,
      radio: { nome: 'Radio Sportiva', url: 'https://sportiva.inmystream.it/stream/sportiva' } });
  }
  g.meteo_luoghi = meteo;
  g.meteo = meteo[0] || null;
  applicaImpostazioni(g);
}
/** Previsioni Open-Meteo (gratuite, senza chiave) per le città con coordinate, in una sola richiesta. */
async function meteoCitta(citta) {
  const conCoord = citta.filter((c) => c.lat != null && c.lon != null);
  if (!conCoord.length) return [];
  const q = new URLSearchParams({
    latitude: conCoord.map((c) => c.lat).join(','), longitude: conCoord.map((c) => c.lon).join(','), timezone: 'Europe/Rome', forecast_days: 8,
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max',
  });
  try {
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 15000);
    const r = await fetch(`https://api.open-meteo.com/v1/forecast?${q}`, { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return [];
    let dati = await r.json();
    if (!Array.isArray(dati)) dati = [dati];
    return dati.map((d, i) => ({
      id: 'm' + i, localita: conCoord[i].nome,
      giorni: d.daily.time.map((data, k) => ({
        data, codice: d.daily.weather_code[k], tmax: Math.round(d.daily.temperature_2m_max[k]), tmin: Math.round(d.daily.temperature_2m_min[k]),
        pioggia_prob: d.daily.precipitation_probability_max[k], pioggia_mm: d.daily.precipitation_sum[k], vento: Math.round(d.daily.wind_speed_10m_max[k]),
      })),
    }));
  } catch (e) { console.warn('meteo', e); return []; }
}

''')
# niente edizione dal server nella versione pubblica: ogni TG è personale
taglia('''/** Edizione scritta e letta sul server''', '''function prepara(forza = false) {''', '''async function caricaEdizioneServer() { return null; } // versione pubblica: ogni TG è personale, lo scrive il telefono
function usaEdizioneServer() {}

''')

# podcast: niente calcio se il calcio è spento
rep('''  const generali = g.podcast.filter((p) => !p.gruppo); // quelli di squadra stanno nella scheda VARIE''',
    '''  const calcio = impostazioni().calcio;
  const generali = g.podcast.filter((p) => !p.gruppo && (calcio || !p.calcio));''')
rep('''  if (!lista.some((p) => p.calcio)) {''', '''  if (calcio && !lista.some((p) => p.calcio)) {''')

# =========================================================== rassegna della domenica: tolta
taglia('''/* ---------- Rassegna stampa della domenica ---------- */''', '''let stazioni = null;''')

# =========================================================== VARIE: meteo delle città dell'utente, TV, accadde
taglia('''  // ---- scheda VARIE: meteo, stasera in TV, accadde oggi (la rassegna è fissa nella pagina)''', '''  h += '</section><section data-sezione="tv" class="nascosto"><h2>📺 Stasera in TV</h2>';''', r'''  // ---- scheda VARIE: meteo delle città scelte, stasera in TV, accadde oggi
  const luoghi = g.meteo_luoghi || [];
  $('tastoMeteo').classList.toggle('nascosto', !luoghi.length);
  const mt = luoghi.find((l) => l.localita === ls.get('tg_meteo')) || luoghi[0];
  const testoM = mt ? (mt === luoghi[0] && v.meteo ? v.meteo : testoMeteo(mt)) : '';
  const idM = mt ? 'meteo-' + codice(mt.localita) : 'meteo';
  if (testoM) registroAscolto[idM] = { titolo: 'Meteo a ' + mt.localita, testo: testoM };
  const giorni = mt ? meteoDaDomani(mt).slice(0, 7) : [];
  let h = `<section data-sezione="meteo" class="nascosto"><h2>🌦️ Meteo${mt ? ' a ' + esc(mt.localita) : ''}</h2>`
    + (luoghi.length > 1 ? `<div class="scelte">${luoghi.map((l) => `<button class="btn ${l === mt ? 'attiva' : ''}" data-luogo="${esc(l.localita)}" type="button">${esc(l.localita)}</button>`).join('')}</div>` : '');
  h += testoM ? `<div class="scheda"><p>${esc(testoM)}</p>
      <button class="btn rosso" data-ascolta="${idM}" type="button">▶️ Ascolta il meteo</button>
      <table class="meteo-giorni"><tbody>${giorni.map((d) => `<tr><td>${esc(giornoNome(d.data))}</td><td>${meteoCodice(d.codice).emoji} ${esc(meteoCodice(d.codice).testo)}</td><td style="white-space:nowrap">${d.tmin}° / ${d.tmax}°</td><td style="white-space:nowrap">💧 ${d.pioggia_prob ?? '–'}%</td></tr>`).join('')}</tbody></table>
    </div>` : '<p class="scheda">Le previsioni non sono disponibili oggi.</p>';
''')
rep('''  $('contenutoVarie').innerHTML = h + '</section><div id="extraVarie"></div>';
  renderExtra();
  apriSezione('calcio', sezioneAperta.calcio, false);
}''', '''  $('contenutoVarie').innerHTML = h + '</section>';
  apriSezione('calcio', sezioneAperta.calcio, false);
  apriSezione('varie', sezioneAperta.varie, false);
}''')
rep('''    $('contenutoVarie').innerHTML = ['meteo', 'tv', 'accadde'].map((id) => `<section data-sezione="${id}" class="nascosto">${attesa('Arriva tra poco, appena le notizie sono pronte.')}</section>`).join('') + '<div id="extraVarie"></div>';
    renderExtra();
    apriSezione('calcio', sezioneAperta.calcio, false);''', '''    $('contenutoVarie').innerHTML = ['meteo', 'tv', 'accadde'].map((id) => `<section data-sezione="${id}" class="nascosto">${attesa('Arriva tra poco, appena le notizie sono pronte.')}</section>`).join('');
    apriSezione('calcio', sezioneAperta.calcio, false);''')
rep('''const sezioneAperta = { calcio: null, varie: null, novita: null, tech: null, altro: null };''', '''const sezioneAperta = { calcio: null, varie: null };''')
rep('''  const pagina = $({ calcio: 'paginaCalcio', varie: 'paginaVarie', novita: 'paginaNovita', tech: 'paginaTech', altro: 'paginaAltro' }[scheda]);''',
    '''  const pagina = $({ calcio: 'paginaCalcio', varie: 'paginaVarie' }[scheda]);''')

# tutte le sezioni locali e i giochi con l'AI: tolti (resta il registro dei testi da ascoltare)
taglia('''/* ---------- Sezioni extra: Altri sport''', '''function toccoSchede(e) {''', '''const registroAscolto = {}; // id -> { titolo, testo } dei testi che si possono ascoltare

''')
# gestione dei tocchi
taglia('''function toccoSchede(e) {''', '''$('chiediCalcio').onclick = chiediCalcio;''', r'''function toccoSchede(e) {
  const v = Ed.varie;
  let b;
  if ((b = e.target.closest('[data-apri]'))) return apriSezione(b.closest('#paginaCalcio') ? 'calcio' : 'varie', b.dataset.apri);
  if ((b = e.target.closest('[data-luogo]'))) { ls.set('tg_meteo', b.dataset.luogo); return renderVarie(); }
  if ((b = e.target.closest('[data-ascolta]')) && registroAscolto[b.dataset.ascolta]) {
    const r = registroAscolto[b.dataset.ascolta];
    return ascoltaVaria(b.dataset.ascolta, r.titolo, r.testo);
  }
  if ((b = e.target.closest('[data-preferita]'))) return suonaRadioScelta(radioPreferite()[+b.dataset.preferita]);
  if ((b = e.target.closest('[data-togli]'))) { const l = radioPreferite(); l.splice(+b.dataset.togli, 1); return salvaRadioPreferite(l); }
  if ((b = e.target.closest('[data-prova]'))) return suonaRadioScelta(risultatiRadio[+b.dataset.prova]);
  if ((b = e.target.closest('[data-aggiungi]'))) {
    const r = risultatiRadio[+b.dataset.aggiungi], l = radioPreferite();
    if (!l.some((x) => x.url === r.url)) { l.push({ nome: r.nome, url: r.url, ...(r.tipo ? { tipo: r.tipo } : {}) }); salvaRadioPreferite(l); }
    $('statoRadio').textContent = `${r.nome} aggiunta alle preferite.`;
    return;
  }
  if (!v) return;
  if ((b = e.target.closest('[data-ascolta]'))) {
    const id = b.dataset.ascolta;
    if (id === 'tv') ascoltaVaria('tv', 'Stasera in TV', 'Stasera in TV.\n\n' + v.tv);
    else if (id === 'accadde') ascoltaVaria('accadde', 'Accadde oggi', 'Accadde oggi.\n\n' + Ed.accadde);
    else if (id.startsWith('squadra-')) {
      const q = v.squadre[+id.split('-')[1]];
      ascoltaVaria('squadra-' + q.id, 'Notizie ' + q.nome, `Le notizie: ${q.nome}.\n\n` + q.notizie.map((n) => `${n.titolo}.\n\n${n.testo}`).join('\n\n'));
    }
  } else if ((b = e.target.closest('[data-podcast-squadra]'))) {
    const [i, j] = b.dataset.podcastSquadra.split(':').map(Number);
    window.evento('podcast');
    suonaPodcast(v.squadre[i].podcast[j]);
  } else if ((b = e.target.closest('[data-radio-squadra]'))) {
    const q = v.squadre[+b.dataset.radioSquadra];
    suonaDiretta(q.radio.nome, q.radio.url, 'Radio in diretta');
  }
}
$('paginaCalcio').addEventListener('click', toccoSchede);
$('paginaVarie').addEventListener('click', toccoSchede);
$('paginaRadio').addEventListener('click', toccoSchede);
// statistiche anonime: Approfondisci e podcast aperti
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (a && /Approfondisci/.test(a.textContent)) window.evento('approfondisci');
  else if (a && a.closest('.podcast')) window.evento('podcast');
}, true);
''')
rep('''['TG', 'Podcast', 'Radio', 'Calcio', 'Varie', 'Novita', 'Tech', 'Altro']''', '''['TG', 'Podcast', 'Radio', 'Calcio', 'Varie']''', 2)
rep('''  if (b) suonaPodcast(Ed.podcast[+b.dataset.podcast]);''', '''  if (b) { window.evento('podcast'); suonaPodcast(Ed.podcast[+b.dataset.podcast]); }''')
rep('''  if (!chiave) { out.textContent = 'Per fare domande all\\'AI serve la chiave Gemini: tocca ⚙️ in alto e incollala.'; return; }''',
    '''  if (!sbloccata()) { out.textContent = 'Per fare domande all\\'AI serve la chiave Gemini: tocca ⚙️ in alto e incollala.'; return; }''')


# =========================================================== condivisione, premium, donazione, regalo
rep("""<meta name="format-detection" content="telephone=no">""", """<meta name="format-detection" content="telephone=no">
<meta property="og:title" content="TG di Famiglia – Il tuo telegiornale personale">
<meta property="og:description" content="Ogni mattina le notizie più importanti, lette come al telegiornale. Gratis.">
<meta property="og:image" content="https://tg-di-famiglia.pages.dev/og-image.png">""")
rep(""".caffe{font-size:17px}""", """.caffe{font-size:17px}
.btn.whatsapp{background:#1fa855;border-color:#1fa855;color:#fff}
.condividi-fine{text-align:center}
.premio{list-style:none;padding:0;margin:0 0 14px}
.premio li{padding:6px 0}
.prezzo{font-size:34px;font-weight:900;color:var(--rosso);margin:6px 0}""")
rep("""      <div class="comandi nascosto" id="comandiTG">""", """      <div class="riga-btn" style="margin-top:12px"><button class="btn whatsapp" data-condividi type="button">💬 Condividi su WhatsApp</button></div>
      <div class="comandi nascosto" id="comandiTG">""")
rep("""    <h2>📰 Le notizie di oggi</h2>""", """    <div class="scheda condividi-fine nascosto"><p style="margin-top:0"><b>Ti è piaciuto il TG di oggi?</b> Fallo provare a chi vuoi bene.</p>
      <div class="riga-btn"><button class="btn whatsapp" data-condividi type="button">💬 Condividi su WhatsApp</button><a class="btn" href="../regalo.html">🎁 Regala un biglietto</a></div></div>
    <h2>📰 Le notizie di oggi</h2>""")
rep("""      <h2>🎧 Podcast consigliati</h2>""", """      <div class="scheda condividi-fine nascosto"><p style="margin-top:0"><b>Ti è piaciuto il TG di oggi?</b></p><div class="riga-btn"><button class="btn whatsapp" data-condividi type="button">💬 Condividi su WhatsApp</button></div></div>
      <h2>🎧 Podcast consigliati</h2>""")
rep("""  <!-- CONFIGURAZIONE: dopo lo sblocco e dalle impostazioni -->""", """  <!-- PREMIUM: dal 16° giorno, se la prova è finita -->
  <section id="schermataPremium" class="setup nascosto">
    <div class="scheda">
      <h2>Continua con TG di Famiglia Premium</h2>
      <p>La prova gratuita è finita. Con Premium il tuo TG continua ogni mattina:</p>
      <ul class="premio">
        <li>📺 Il TG personale di ogni giorno, con il saluto per la tua famiglia</li>
        <li>📍 Le notizie e il meteo delle tue città</li>
        <li>⚽ Le notizie della tua squadra del cuore</li>
        <li>🎧 Dieci podcast consigliati al giorno, radio e le tue preferite</li>
        <li>🚫 Nessuna pubblicità</li>
      </ul>
      <p class="prezzo" id="prezzoPremium">1,99 €/mese</p>
      <p class="piccolo" style="margin-top:0">Disdici quando vuoi.</p>
      <div class="riga-btn"><button class="btn rosso" id="abbonati" type="button">⭐ Abbonati</button></div>
      <p class="piccolo">Il pagamento avviene su Ko-fi; dopo l'abbonamento ricevi un codice personale da inserire qui sotto.</p>
      <div id="bloccoCodice">
        <label for="campoCodice"><b>Hai già un codice Premium?</b></label>
        <input id="campoCodice" class="campo" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="TGF-XXXX-XXXX-XXXX">
        <div class="riga-btn"><button class="btn pieno" id="attivaCodice" type="button">Attiva</button></div>
      </div>
      <p class="stato" id="statoPremium" role="status" aria-live="polite"></p>
      <p style="margin-top:18px">Restano sempre gratis:</p>
      <div class="riga-btn">
        <button class="btn" id="premiumDemo" type="button">🎬 La demo</button>
        <a class="btn" href="../regalo.html">🎁 Biglietto regalo</a>
        <button class="btn whatsapp" data-condividi type="button">💬 Condividi</button>
      </div>
    </div>
  </section>

  <!-- CONFIGURAZIONE: dopo lo sblocco e dalle impostazioni -->""")
rep("""<dialog id="impostazioni">""", """<dialog id="donazione">
  <h2>Ti sta piacendo TG di Famiglia? ☕</h2>
  <p>È fatto da una piccola squadra, senza pubblicità. Se vuoi, offrici un caffè (2 €).</p>
  <div class="riga-btn"><button class="btn rosso" id="offriCaffe" type="button">☕ Offri un caffè</button><button class="btn" id="altraVolta" type="button">Magari un'altra volta</button></div>
</dialog>

<dialog id="impostazioni">""")
rep("""  <div class="riga-btn"><button class="btn pieno" id="modificaPreferenze" type="button">✏️ Nome, città e calcio</button></div>""",
    """  <div class="riga-btn"><button class="btn pieno" id="modificaPreferenze" type="button">✏️ Nome, città e calcio</button></div>
  <p class="piccolo" id="statoProva"></p>
  <div class="riga-btn"><button class="btn whatsapp" data-condividi type="button">💬 Condividi su WhatsApp</button><a class="btn" href="../regalo.html">🎁 Regala un biglietto</a></div>
  <div id="sostieni"><h3>☕ Sostieni TG di Famiglia</h3><p class="piccolo">Nessuna pubblicità: se ti piace, puoi offrirci un caffè.</p>
    <div class="riga-btn"><button class="btn" id="caffeImpostazioni" type="button">☕ Offri un caffè</button></div></div>""")
rep("""  <p class="piccolo" style="margin-top:16px"><a href="../privacy.html" target="_blank" rel="noopener">Privacy</a> · <a href="../" target="_blank" rel="noopener">Informazioni sull'app</a><span id="caffe"></span></p>""",
    """  <p class="piccolo" style="margin-top:16px"><a href="../privacy.html" target="_blank" rel="noopener">Privacy</a> · <a href="../" target="_blank" rel="noopener">Informazioni sull'app</a> · <a href="mailto:tgdifamiglia.app@gmail.com">Contatti</a></p>""")
rep("""  kofi: 'https://ko-fi.com/TUO-NOME', // tasto donazione: resta nascosto finché c'è il segnaposto
""", "")
rep("""async function avviaTG() {
  window.speechSynthesis?.cancel();""", """async function avviaTG() {
  if (bloccato()) { mostraPremium(); return false; } // prova finita e niente Premium
  window.speechSynthesis?.cancel();""")
rep("""  if (!Ed.grezzo && Ed.finito) prepara(true); else { prepara(); controllaEdizione(); }
  return vaiA({ t: 'sigla' });""", """  if (!Ed.grezzo && Ed.finito) prepara(true); else { prepara(); controllaEdizione(); }
  const parte = await vaiA({ t: 'sigla' });
  if (parte) iniziaProva(); // i 15 giorni partono dal primo TG ascoltato
  return parte;""")
rep("""  $('comandiTG').classList.add('nascosto');
  aggiornaTastoPlay();
  if (daSolo""", """  $('comandiTG').classList.add('nascosto');
  aggiornaTastoPlay();
  if (daSolo) dopoTG();
  if (daSolo""")
s = s.replace("/* ---------- Avvio ---------- */", open("C:/Users/andre/AppData/Local/Temp/claude/3465bcb2245e1ee7/d465ab2b-79d1-4121-8b9e-51fe9f9fe4d0/scratchpad/pub_premium.js", encoding="utf-8").read() + "\n/* ---------- Avvio ---------- */", 1)


# =========================================================== installazione (niente store)
rep("""        <button class="btn pieno" id="apriSblocco" type="button">🔑 Sblocca gratis</button>
      </div>""", """        <button class="btn pieno" id="apriSblocco" type="button">🔑 Sblocca gratis</button>
      </div>
      <div class="riga-btn" style="margin-top:10px"><button class="btn rosso nascosto" data-installa type="button">📲 Installa l'app sul telefono</button></div>""")
rep("""      <div class="riga-btn" style="margin-top:12px"><button class="btn whatsapp" data-condividi type="button">💬 Condividi su WhatsApp</button></div>
      <div class="comandi nascosto" id="comandiTG">""", """      <div class="riga-btn" style="margin-top:12px"><button class="btn whatsapp" data-condividi type="button">💬 Condividi su WhatsApp</button><button class="btn nascosto" data-installa type="button">📲 Installa l'app</button></div>
      <div class="comandi nascosto" id="comandiTG">""")
rep("""  <p class="piccolo" id="statoProva"></p>""", """  <p class="piccolo" id="statoProva"></p>
  <div class="riga-btn" style="margin-bottom:10px"><button class="btn nascosto" data-installa type="button">📲 Installa l'app sul telefono</button></div>""")
rep("""<dialog id="donazione">""", """<dialog id="guidaInstalla">
  <h2>📲 Installa TG di Famiglia</h2>
  <p>Non serve nessuno store: l'app si mette sulla schermata Home come le altre.</p>
  <h3>🍏 iPhone e iPad (Safari)</h3>
  <ol class="passi">
    <li><span>Apri questa pagina con <b>Safari</b>.</span></li>
    <li><span>Tocca il tasto <b>Condividi</b> (il quadrato con la freccia in su, in basso).</span></li>
    <li><span>Scorri e scegli <b>«Aggiungi alla schermata Home»</b>, poi <b>Aggiungi</b>.</span></li>
  </ol>
  <h3>🤖 Android (Chrome)</h3>
  <ol class="passi">
    <li><span>Apri questa pagina con <b>Chrome</b>.</span></li>
    <li><span>Tocca il menu <b>⋮</b> in alto a destra.</span></li>
    <li><span>Scegli <b>«Installa app»</b> oppure <b>«Aggiungi a schermata Home»</b>.</span></li>
  </ol>
  <div class="riga-btn"><button class="btn pieno" id="chiudiGuidaInstalla" type="button">Ho capito</button></div>
</dialog>

<dialog id="donazione">""")

# =========================================================== SCHERMATE, DEMO, SBLOCCO, CONFIGURAZIONE, AVVIO
taglia('''/* ---------- Schermate ---------- */''', '''$('tastoPlay').onclick =''', open("C:/Users/andre/AppData/Local/Temp/claude/3465bcb2245e1ee7/d465ab2b-79d1-4121-8b9e-51fe9f9fe4d0/scratchpad/pub_schermate.js", encoding="utf-8").read())
rep('''$('tastoPlay').onclick = () => { if (P.modo === 'tg') pausaOContinua(); else avviaTG(); };''',
    '''$('tastoPlay').onclick = () => { if (P.modo === 'tg') pausaOContinua(); else { window.evento('play'); avviaTG(); } };''')
taglia('''/* ---------- Avvio ---------- */''', '''</script>''', open("C:/Users/andre/AppData/Local/Temp/claude/3465bcb2245e1ee7/d465ab2b-79d1-4121-8b9e-51fe9f9fe4d0/scratchpad/pub_avvio.js", encoding="utf-8").read())

rep("""    <!-- Scheda CALCIO: quattro tasti che aprono Juve, Inter, calcio generale e le domande all'AI -->""", """    <!-- Scheda CALCIO (solo se il calcio è attivo): squadra del cuore, calcio in generale e le domande all'AI -->""")
rep("""placeholder="Es. Chi sono gli infortunati della Juve? Quando gioca l'Inter?\"""", """placeholder="Es. Chi è in testa alla Serie A? Quando gioca la Nazionale?\"""")
rep("""    if (/^(edizione|audio|varia|titoli|rassegna|dialetto):/.test(k)""", """    if (/^(edizione|audio|varia|titoli):/.test(k)""")
open(DST, "w", encoding="utf-8", newline="\n").write(s)
print("ok", len(s))

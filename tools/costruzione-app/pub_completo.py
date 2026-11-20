# Eseguito da pubblica_app.py (stesso spazio di nomi: s, rep, taglia).
# Riporta nell'app pubblica le sezioni dell'app di famiglia rendendole dinamiche (città e squadra dell'utente)
# e aggiunge i livelli Base / Completo.
QUI_JS = open(QUI + "pub_sezioni.js", encoding="utf-8").read()

# =========================================================== CSS
rep('''.sottotitolo{font-size:16px;opacity:.9}''', '''.sottotitolo{font-size:16px;opacity:.9}
.funzione{display:flex;align-items:center;gap:10px;width:100%;text-align:left;background:var(--carta);border:1px solid var(--bordo);border-radius:14px;padding:12px 14px;margin:0 0 8px;font-size:18px;color:var(--testo)}
.funzione span:nth-child(2){flex:1}
.funzione.bloccata{border:2px dashed var(--blu);cursor:pointer}
.funzione .badge{margin:0;white-space:nowrap}
.tabella-sblocca{width:100%;border-collapse:collapse;font-size:16px;margin:10px 0 16px}
.tabella-sblocca th,.tabella-sblocca td{padding:8px 6px;border-top:1px solid var(--bordo);text-align:center}
.tabella-sblocca td:first-child,.tabella-sblocca th:first-child{text-align:left}
.opzioni{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:12px 0}
.opzione{display:flex;flex-direction:column;gap:6px;border:2px solid var(--blu);border-radius:16px;padding:14px;background:var(--carta)}
.opzione .prezzo{font-size:28px}
.offerta{background:var(--giallo);border:2px solid #e2c23d;border-radius:14px;padding:12px 14px;font-size:18px;margin:0 0 14px}
@media (max-width:520px){.opzioni{grid-template-columns:1fr}}''')

# =========================================================== HTML
# demo: tutte le funzioni
rep('''    <h2>📰 Le notizie di esempio</h2>''', '''    <h2>✨ Cosa c'è nel TG di Famiglia</h2>
    <div id="demoFunzioni"></div>
    <h2>📰 Le notizie di esempio</h2>''')
# schermata "Sblocca tutto"
rep('''  <!-- CONFIGURAZIONE: dopo lo sblocco e dalle impostazioni -->''', '''  <!-- SBLOCCA TUTTO: confronto Base / Completo, opzioni e codice -->
  <section id="schermataSblocca" class="setup nascosto">
    <div class="scheda">
      <h2>🔓 Sblocca tutto: TG di Famiglia Completo</h2>
      <p class="offerta" id="sbloccaSituazione"></p>
      <table class="tabella-sblocca" id="sbloccaTabella"></table>
      <h3>Scegli come sbloccare</h3>
      <div class="opzioni">
        <div class="opzione"><div id="opzioni3M"></div><button class="btn rosso" id="scegli3M" type="button">Scegli</button></div>
        <div class="opzione"><div id="opzioni1M"></div><button class="btn pieno" id="scegli1M" type="button">Scegli</button></div>
      </div>
      <p class="piccolo">Il pagamento avviene su Ko-fi. Dopo il contributo ricevi un <b>codice personale</b>: inseriscilo qui sotto. Il mensile si disdice quando vuoi.</p>
      <label for="campoCodice"><b>Hai un codice?</b></label>
      <input id="campoCodice" class="campo" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="TGF-3M-XXXX-XXXX">
      <div class="riga-btn"><button class="btn pieno" id="attivaCodice" type="button">🔓 Sblocca</button></div>
      <p class="stato" id="statoSblocca" role="status" aria-live="polite"></p>
      <p style="margin-top:18px">Restano sempre gratis: la demo, il biglietto regalo e la condivisione.</p>
      <div class="riga-btn">
        <a class="btn" href="../regalo.html">🎁 Biglietto regalo</a>
        <button class="btn whatsapp" data-condividi type="button">💬 Condividi</button>
        <button class="btn" id="sbloccaIndietro" type="button">← Indietro</button>
      </div>
    </div>
  </section>

  <!-- CONFIGURAZIONE: dopo lo sblocco e dalle impostazioni -->''')
# riquadro della chiave: una riga in più
rep('''  <p class="piccolo">✅ È gratuita, non serve la carta di credito, la chiave resta solo sul tuo telefono.</p>''',
    '''  <p class="piccolo">✅ È gratuita, non serve la carta di credito, la chiave resta solo sul tuo telefono.</p>
  <p class="piccolo" id="rigaOfferta">🎄 La chiave è gratuita. TG di Famiglia è gratis fino al 31/12/2026.</p>''')
# configurazione: nota sulla squadra
rep('''        <select id="campoSquadra" class="campo"><option value="">Nessuna in particolare</option></select>''',
    '''        <select id="campoSquadra" class="campo"><option value="">Nessuna in particolare</option></select>
        <p class="piccolo nascosto" id="notaSquadra" style="margin-top:-6px">🔒 La squadra del cuore fa parte di TG di Famiglia Completo.</p>''')
rep('''      <label for="campoCitta"><b>2. Le tue città</b> <span class="piccolo">(da 0 a 5)</span></label>''',
    '''      <label for="campoCitta"><b>2. Le tue città</b> <span class="piccolo">(1 gratis, fino a 5 con il Completo)</span></label>''')
# radio della zona
rep('''      <h2>⭐ Radio preferite</h2>''', '''      <h2>📍 Radio della tua zona</h2>
      <div class="scheda" id="radioZona"><p class="piccolo">Apri la scheda per cercare le radio delle tue città.</p></div>
      <h2>⭐ Radio preferite</h2>''')
# VARIE: id del meteo, testi senza luoghi fissi, rassegna senza la zona fissa
rep('''        <button class="btn" data-apri="meteo" type="button">🌦️ Meteo</button>''', '''        <button class="btn" data-apri="meteo" id="tastoMeteo" type="button">🌦️ Meteo</button>''')
rep('''        <p class="spiega">Idee per una camminata, un trekking leggero o un percorso nella natura la domenica, nella Tuscia, a Orvieto, a Civitavecchia e sui Monti della Tolfa. Ogni settimana c'è un percorso consigliato con il meteo previsto per domenica; sotto trovi tutti gli altri, con il tasto per arrivarci.</p>''',
    '''        <p class="spiega">Idee per una camminata, un trekking leggero o un percorso nella natura vicino alle tue città, con il meteo previsto per domenica e il tasto per arrivarci. I percorsi li propone l'intelligenza artificiale: verifica sempre accessi e condizioni prima di partire.</p>''')
rep('''        <p class="spiega">Le ricette della tradizione della Tuscia, di Orvieto, di Civitavecchia e di Tolfa. Ogni giorno ce n'è una nuova, con ingredienti e passaggi; con il tasto qui sotto ne peschi un'altra a caso.</p>''',
    '''        <p class="spiega">Le ricette della tradizione delle tue zone. Ogni giorno ce n'è una nuova, con ingredienti e passaggi; con il tasto qui sotto ne peschi un'altra.</p>''')
rep('''            <button class="btn rosso" data-rassegna="tuscia" type="button">🏛️ La settimana nella Tuscia (5 minuti)</button>
''', '')
# NOVITÀ: eventi delle città dell'utente, niente differenziata, dialetti dinamici
rep('''        <button class="btn" data-apri="eventi" type="button">🎪 Eventi e sagre nella Tuscia</button>
        <button class="btn" data-apri="differenziata" type="button">♻️ Raccolta differenziata</button>''', '''        <button class="btn" data-apri="eventi" type="button">🎪 Eventi e sagre nelle tue città</button>''')
s = re.sub(r'(<div class="scelte">)\s*<button class="btn" data-dialetto="viterbese".*?</div>', r'<div class="scelte" id="sceltaDialetti"></div>', s, count=1, flags=re.S)
assert 'id="sceltaDialetti"' in s and 'data-dialetto="viterbese"' not in s
rep('''    <!-- Scheda NOVITÀ: eventi del fine settimana, differenziata, detto del giorno e i giochi con l'intelligenza artificiale -->''',
    '''    <!-- Scheda NOVITÀ: eventi nelle città dell'utente, detto del giorno e i giochi con l'intelligenza artificiale -->''')

# =========================================================== JS: TG Base senza sigla, stacchi e musica
rep('''  const s = [{ t: 'sigla' }, { t: 'saluto' }];''', '''  const s = ha('sigla') ? [{ t: 'sigla' }, { t: 'saluto' }] : [{ t: 'saluto' }];''')
rep('''  for (let k = 0; k <= n; k++) s.push({ t: 'suono', k: 'voce' + k, blocco: k, lungo: k === 0 }, { t: 'voce', k });
  return s;''', '''  for (let k = 0; k <= n; k++) s.push({ t: 'suono', k: 'voce' + k, blocco: k, lungo: k === 0 }, { t: 'voce', k });
  return ha('sigla') ? s : s.filter((p) => p.t !== 'suono'); // versione Base: solo la voce''')
s = s.replace('''    impostaSorgente(URL_TAPPETO, true);''', '''    impostaSorgente(ha('sigla') ? URL_TAPPETO : URL_SILENZIO, true);''', 1)
rep('''  if (daSolo && CONFIG.podcastAFineTG && Ed.podcast?.length) {''', '''  if (daSolo && CONFIG.podcastAFineTG && ha('podcast') && Ed.podcast?.length) {''')
# città e squadra secondo il livello
rep('''  const imp = impostazioni();
  const nc = imp.citta.length;''', '''  const imp = impostazioniAttive();
  const nc = imp.citta.length;''')
rep('''async function arricchisci(g) {
  const imp = impostazioni();''', '''async function arricchisci(g) {
  const imp = impostazioniAttive();''')
rep('''function promptRedazione(grezzo) {
  const imp = impostazioni();''', '''function promptRedazione(grezzo) {
  const imp = impostazioniAttive();''')
rep('''function salvaImpostazioni(v) { ls.set('tg_impostazioni', JSON.stringify(v)); }''', '''function salvaImpostazioni(v) { ls.set('tg_impostazioni', JSON.stringify(v)); }
/** Le preferenze che valgono oggi: con la Base 1 città e niente squadra del cuore. */
function impostazioniAttive() {
  const imp = impostazioni();
  return { ...imp, citta: imp.citta.slice(0, ha('citta5') ? 5 : 1), squadra: ha('squadra') ? imp.squadra : '' };
}''')
# schede con il lucchetto
rep('''for (const id of ['TG', 'Podcast', 'Radio', 'Calcio', 'Varie', 'Novita', 'Tech', 'Altro']) $('scheda' + id).onclick = () => mostraScheda(id.toLowerCase());''',
    '''for (const id of ['TG', 'Podcast', 'Radio', 'Calcio', 'Varie', 'Novita', 'Tech', 'Altro']) $('scheda' + id).onclick = () => apriScheda(id);''')
# rassegna: dati dal sito pubblico, senza la zona fissa
rep('''    const r = await fetch('data/settimana.json', { cache: 'no-store' });''', '''    const r = await fetch(CONFIG.dati + 'settimana.json', { cache: 'no-store' });''')
s = re.sub(r"\n  tuscia: \{ titolo: 'La settimana nella Tuscia'.*?\n(?=  [a-z]+: \{|\};)", "\n", s, count=1, flags=re.S)
assert "La settimana nella Tuscia" not in s
# tocchi: via le zone della differenziata e dei sentieri fissi; città della cultura = indice delle città dell'utente
for riga in ['''  if ((b = e.target.closest('[data-zona-sentieri]'))) { ls.set('tg_zona_sentieri', b.dataset.zonaSentieri); return renderSalute(); }\n''',
             '''  if ((b = e.target.closest('[data-zona-civ]'))) { ls.set('tg_zona_civ', b.dataset.zonaCiv); return renderExtra(); }\n''',
             '''  if ((b = e.target.closest('[data-zona-orv]'))) { ls.set('tg_zona_orv', b.dataset.zonaOrv); return renderExtra(); }\n''',
             '''  if ((b = e.target.closest('[data-zona]'))) { ls.set('tg_zona_viterbo', b.dataset.zona); return renderExtra(); }\n''']:
    rep(riga, '')
rep('''$('paginaAltro').addEventListener('click', toccoSchede);''', '''$('paginaAltro').addEventListener('click', toccoSchede);
// statistiche anonime: Approfondisci e podcast aperti
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href]');
  if (a && /Approfondisci/.test(a.textContent)) window.evento('approfondisci');
  else if (a && a.closest('.podcast')) window.evento('podcast');
}, true);''')

# =========================================================== sezioni extra: riscritte per le città dell'utente
taglia('''/* ---------- Sezioni extra: Altri sport''', '''/* ---------- Scheda ALTRO''', "")
taglia('''/* ---------- VARIE: sentieri della salute''', '''function schedaRicetta(r, etichetta, id) {''', "")
taglia('''let ultimoPiatto = '';''', '''const SCHEMA_FAIDATE = {''', "")
taglia('''function differenziataHtml(dati) {''', '''/* ---------- Podcast fai da te''', "")
# TG in dialetto: dialetti delle città dell'utente
taglia('''      const DESCRIZIONI = {''', '''      testo = await testoLibero(`Riscrivi il telegiornale''', '''      const DESCRIZIONI = {}, STILI = {};
''')
s = re.sub(r"\$\{dialetto === 'orvietano' \? `.*?` : ''\}", "", s, count=1, flags=re.S)
rep('''  const titolo = 'TG in dialetto ' + dialetto;''', '''  const titolo = 'TG in ' + nomeDialetto(dialetto);''')
rep('''      testo = await testoLibero(`Riscrivi il telegiornale qui sotto in dialetto ${dialetto}${DESCRIZIONI[dialetto] || ''}, come lo racconterebbe una persona del posto, simpatica ma rispettosa.${STILI[dialetto] || ''}''',
    '''      testo = await testoLibero(`Riscrivi il telegiornale qui sotto in ${nomeDialetto(dialetto)}, come lo racconterebbe una persona del posto, simpatica ma rispettosa. Usa le forme e le espressioni tipiche di quella parlata e qualche paragone preso dalla vita del luogo; scrivi le parole come si pronunciano.''')
# Cerca ora: il riquadro si prepara quando si apre la sezione
s = s.replace("/* ---------- Avvio ---------- */", QUI_JS + "\n/* ---------- Avvio ---------- */", 1)
assert "differenziataHtml" not in s and "ZONE_SENTIERI" not in s

# testi dei segnaposto: le sezioni si preparano sul telefono, non "ogni mattina sul server"
s = s.replace("Questa sezione viene preparata ogni mattina insieme al notiziario: oggi non è ancora disponibile.", "Questa sezione si prepara con l&rsquo;intelligenza artificiale quando apri la scheda (serve la chiave Gemini): se non compare, riprova tra poco.")

rep("""    if (id === 'meteo') ascoltaVaria('meteo', 'Meteo a ' + (Ed.grezzo.meteo?.localita || 'Viterbo'), v.meteo);""", """    if (id === 'meteo') ascoltaVaria('meteo', 'Meteo', v.meteo);""")

/* TG di Famiglia – generatore di biglietti regalo (gratuito per tutti).
   Uso:  <div id="regalo"></div><script src="regalo.js"></script>
         RegaloTG.monta(document.getElementById('regalo'), { radice: './' });
   Crea un biglietto A5 (PNG e PDF) con il QR personalizzato: ?famiglia=<Nome>&citta=<città>.
   Statistiche: solo "biglietto creato/scaricato/inviato", mai il nome. */
(function () {
  'use strict';
  const SITO = 'https://tg-di-famiglia.pages.dev';
  const TEMI = {
    natale: { nome: '🎄 Natale', titolo: 'Buon Natale!', sfondo: '#0f3d2e', sfondo2: '#155240', accento: '#d9b25a', chiaro: '#f7f0e1', deco: ['🎄', '⭐', '🎁', '❄️'] },
    papa: { nome: '👔 Festa del papà', titolo: 'Auguri papà!', sfondo: '#12355b', sfondo2: '#1b4a7d', accento: '#f2b134', chiaro: '#f4f7fb', deco: ['👔', '☕', '⚽', '🛠️'] },
    mamma: { nome: '🌷 Festa della mamma', titolo: 'Auguri mamma!', sfondo: '#7a1f4b', sfondo2: '#952a5e', accento: '#f6c1d7', chiaro: '#fff3f8', deco: ['🌷', '💐', '💖', '🌸'] },
    compleanno: { nome: '🎂 Compleanno', titolo: 'Buon compleanno!', sfondo: '#3b2a7a', sfondo2: '#4c3896', accento: '#ffcc33', chiaro: '#f6f3ff', deco: ['🎂', '🎈', '🎉', '🎁'] },
    nonni: { nome: '👵 Nonni', titolo: 'Ai nonni, con affetto', sfondo: '#6b3f1d', sfondo2: '#83502a', accento: '#f2d9a0', chiaro: '#fff8ea', deco: ['👵', '👴', '🌻', '☕'] },
  };
  const evento = (n) => { try { window.evento ? window.evento(n) : window.goatcounter?.count?.({ path: 'evento/' + n, title: n, event: true }); } catch {} };
  const carica = (src) => new Promise((ok, ko) => { if (document.querySelector(`script[src="${src}"]`)) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  const pulisci = (t, max) => String(t || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);

  function linkRegalo(famiglia, citta) {
    const p = new URLSearchParams();
    if (famiglia) p.set('famiglia', famiglia);
    if (citta) p.set('citta', citta);
    p.set('da', 'regalo');
    return `${SITO}/?${p}`;
  }

  /** Disegna il biglietto A5 a 300 dpi (1748 × 2480). */
  function disegna(cv, { tema, famiglia, messaggio, url }) {
    const t = TEMI[tema] || TEMI.natale;
    const W = 1748, H = 2480;
    cv.width = W; cv.height = H;
    const c = cv.getContext('2d');
    const serif = 'Georgia, "Times New Roman", serif', sans = '-apple-system, "Segoe UI", Roboto, Arial, sans-serif';
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, t.sfondo); g.addColorStop(1, t.sfondo2);
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    // decorazioni
    c.textAlign = 'center'; c.textBaseline = 'middle';
    const deco = (e, x, y, s, a = 1) => { c.globalAlpha = a; c.font = `${s}px "Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif`; c.fillText(e, x, y); c.globalAlpha = 1; };
    [[160, 150], [460, 110], [1288, 110], [1588, 150]].forEach(([x, y], i) => deco(t.deco[i % 4], x, y, 120));
    [[110, 820], [1638, 900], [120, 1500], [1630, 1420]].forEach(([x, y], i) => deco(t.deco[(i + 1) % 4], x, y, 110, 0.85));
    // titolo
    c.fillStyle = t.accento; c.font = `bold 66px ${sans}`;
    c.fillText('UN REGALO PER VOI', W / 2, 300);
    c.fillStyle = t.chiaro; c.font = `bold ${t.titolo.length > 16 ? 132 : 158}px ${serif}`;
    c.fillText(t.titolo, W / 2, 440, W - 200);
    if (famiglia) { c.font = `italic 84px ${serif}`; c.fillStyle = t.accento; c.fillText(`per la Famiglia ${famiglia}`, W / 2, 575, W - 200); }
    // messaggio (al massimo 3 righe)
    if (messaggio) {
      c.font = `italic 58px ${serif}`; c.fillStyle = t.chiaro;
      const parole = messaggio.split(' '), righe = [];
      let r = '';
      for (const p of parole) { const prova = r ? r + ' ' + p : p; if (c.measureText(prova).width > W - 360 && r) { righe.push(r); r = p; } else r = prova; }
      if (r) righe.push(r);
      righe.slice(0, 3).forEach((x, i) => c.fillText((i === 0 ? '«' : '') + x + (i === Math.min(righe.length, 3) - 1 ? '»' : ''), W / 2, 690 + i * 74, W - 300));
    }
    // riquadro bianco con il QR
    const lato = 820, qx = (W - lato) / 2, qy = 930;
    const tondo = (x, y, w, h, rr) => { c.beginPath(); c.moveTo(x + rr, y); c.arcTo(x + w, y, x + w, y + h, rr); c.arcTo(x + w, y + h, x, y + h, rr); c.arcTo(x, y + h, x, y, rr); c.arcTo(x, y, x + w, y, rr); c.closePath(); };
    c.fillStyle = t.accento; tondo(qx - 34, qy - 34, lato + 68, lato + 68, 60); c.fill();
    c.fillStyle = '#ffffff'; tondo(qx - 14, qy - 14, lato + 28, lato + 28, 46); c.fill();
    const qr = window.qrcode(0, 'M'); qr.addData(url); qr.make();
    const n = qr.getModuleCount(), m = 40, cella = (lato - 2 * m) / n;
    c.fillStyle = '#111418';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (qr.isDark(y, x)) c.fillRect(Math.floor(qx + m + x * cella), Math.floor(qy + m + y * cella), Math.ceil(cella), Math.ceil(cella));
    // sotto il QR
    c.fillStyle = t.chiaro; c.font = `bold 72px ${sans}`;
    c.fillText('📺 Il vostro TG di Famiglia', W / 2, 1900);
    c.font = `52px ${sans}`; c.fillStyle = t.accento;
    c.fillText('Inquadrate il QR con la fotocamera e premete ▶ play', W / 2, 1985, W - 160);
    // istruzioni
    c.fillStyle = 'rgba(255,255,255,0.94)'; tondo(110, 2050, W - 220, 340, 40); c.fill();
    c.textAlign = 'left'; c.fillStyle = '#1d2a24';
    const col = (x, titolo, righe) => { c.font = `bold 46px ${sans}`; c.fillText(titolo, x, 2110); c.font = `38px ${sans}`; righe.forEach((r, i) => c.fillText(r, x, 2172 + i * 54)); };
    col(160, 'Android (Chrome)', ['1. Aprite il link in Chrome', '2. Menu ⋮ → «Installa app»', '3. Premete ▶ e ascoltate']);
    col(W / 2 + 40, 'iPhone (Safari)', ['1. Aprite il link in Safari', '2. Condividi → «Aggiungi', '    alla schermata Home»']);
    c.textAlign = 'center'; c.fillStyle = t.chiaro; c.font = `40px ${sans}`;
    c.fillText(SITO.replace('https://', ''), W / 2, 2440);
  }

  function monta(box, opz = {}) {
    const radice = opz.radice || './';
    box.innerHTML = `
      <div class="regalo-form">
        <label><b>Nome della famiglia</b><input class="campo" id="rgFamiglia" maxlength="30" placeholder="Es. Rossi" autocomplete="off"></label>
        <label><b>Città</b> <span class="piccolo">(facoltative, separate da virgola)</span><input class="campo" id="rgCitta" maxlength="80" placeholder="Es. Bergamo, Lecce" autocomplete="off"></label>
        <label><b>Messaggio di auguri</b> <span class="piccolo">(breve)</span><input class="campo" id="rgMessaggio" maxlength="110" placeholder="Es. Per ascoltare le notizie ogni mattina con il caffè" autocomplete="off"></label>
        <p style="margin:6px 0"><b>Tema</b></p>
        <div class="regalo-temi">${Object.entries(TEMI).map(([k, v], i) => `<button type="button" class="btn ${i === 0 ? 'attiva' : ''}" data-tema="${k}">${v.nome}</button>`).join('')}</div>
        <div class="riga-btn" style="margin-top:12px"><button type="button" class="btn rosso" id="rgCrea">🎁 Crea il biglietto</button></div>
      </div>
      <div id="rgRisultato" hidden>
        <canvas id="rgTela" style="width:100%;max-width:420px;display:block;margin:16px auto;border-radius:12px;box-shadow:0 6px 24px rgba(0,0,0,.25)"></canvas>
        <div class="riga-btn">
          <button type="button" class="btn pieno" id="rgPdf">📄 Scarica PDF (A5)</button>
          <button type="button" class="btn" id="rgPng">🖼️ Scarica immagine</button>
        </div>
        <div class="riga-btn" style="margin-top:10px"><button type="button" class="btn whatsapp" id="rgWa">💬 Invia il regalo su WhatsApp</button></div>
        <p class="piccolo" id="rgLink" style="word-break:break-all"></p>
      </div>`;
    let tema = 'natale', ultimo = null;
    box.querySelector('.regalo-temi').addEventListener('click', (e) => {
      const b = e.target.closest('[data-tema]'); if (!b) return;
      tema = b.dataset.tema;
      box.querySelectorAll('[data-tema]').forEach((x) => x.classList.toggle('attiva', x === b));
      if (ultimo) crea(false);
    });
    async function crea(conta = true) {
      await carica(radice + 'lib/qrcode.js');
      const famiglia = pulisci(box.querySelector('#rgFamiglia').value, 30).replace(/(^|\s)(\p{L})/gu, (m, a, b) => a + b.toUpperCase());
      const citta = pulisci(box.querySelector('#rgCitta').value, 80).split(',').map((x) => x.trim()).filter(Boolean).slice(0, 5).join(',');
      const messaggio = pulisci(box.querySelector('#rgMessaggio').value, 110);
      const url = linkRegalo(famiglia, citta);
      const cv = box.querySelector('#rgTela');
      disegna(cv, { tema, famiglia, messaggio, url });
      ultimo = { famiglia, url, tema };
      box.querySelector('#rgRisultato').hidden = false;
      box.querySelector('#rgLink').textContent = 'Link del regalo: ' + url;
      if (conta) { evento('biglietto-creato'); cv.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
    }
    const nomeFile = () => `TG di Famiglia - biglietto ${TEMI[ultimo.tema].nome.replace(/^\S+\s/, '')}${ultimo.famiglia ? ' - ' + ultimo.famiglia : ''}`;
    box.querySelector('#rgCrea').onclick = () => crea(true);
    box.querySelector('#rgPng').onclick = () => {
      box.querySelector('#rgTela').toBlob((b) => { const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nomeFile() + '.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 5000); });
      evento('biglietto-scaricato');
    };
    box.querySelector('#rgPdf').onclick = async () => {
      await carica(radice + 'lib/jspdf.umd.min.js');
      const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      pdf.addImage(box.querySelector('#rgTela').toDataURL('image/jpeg', 0.92), 'JPEG', 0, 0, 148, 210);
      pdf.setProperties({ title: 'TG di Famiglia – biglietto regalo', creator: 'TG di Famiglia' });
      pdf.save(nomeFile() + '.pdf');
      evento('biglietto-scaricato');
    };
    box.querySelector('#rgWa').onclick = () => {
      evento('regalo-whatsapp');
      const testo = `Ti ho regalato un TG tutto tuo! Apri il link e premi play 🎁 ${ultimo.url}`;
      window.open('https://wa.me/?text=' + encodeURIComponent(testo), '_blank', 'noopener');
    };
  }

  window.RegaloTG = { monta, disegna, linkRegalo, TEMI, SITO };
})();

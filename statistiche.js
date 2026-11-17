/* Statistiche anonime senza cookie (GoatCounter): parte solo quando in config.json c'è il codice vero. */
(function () {
  const codice = 'TUO-CODICE'; // stesso codice di config.json e app/index.html
  window.evento = (nome) => { try { window.goatcounter?.count?.({ path: 'evento/' + nome, title: nome, event: true }); } catch {} };
  if (/TUO-CODICE/.test(codice)) return;
  const s = document.createElement('script');
  s.async = true; s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = `https://${codice}.goatcounter.com/count`;
  document.head.appendChild(s);
})();

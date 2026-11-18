/* Statistiche anonime senza cookie (GoatCounter): parte solo quando in config.json c'è il codice vero. */
(function () {
  const codice = 'tgdifamiglia'; // https://tgdifamiglia.goatcounter.com (anche in app/index.html)
  window.evento = (nome) => { try { window.goatcounter?.count?.({ path: 'evento/' + nome, title: nome, event: true }); } catch {} };
  if (document.querySelector('script[data-goatcounter]')) return; // già caricato dalla pagina
  const s = document.createElement('script');
  s.async = true; s.src = 'https://gc.zgo.at/count.js';
  s.dataset.goatcounter = `https://${codice}.goatcounter.com/count`;
  document.head.appendChild(s);
})();

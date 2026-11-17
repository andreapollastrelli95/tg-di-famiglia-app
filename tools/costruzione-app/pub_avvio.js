/* ---------- Avvio ---------- */
$('oggi').textContent = new Date().toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
chiaveDaIndirizzo();
leggiParametri();
window.evento('apertura-app');
if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) window.evento('avvio-standalone');
window.addEventListener('appinstalled', () => window.evento('installata'));
(async () => {
  await Promise.race([caricaPubblico(), sleep(4000)]);
  aggiornaTastiInstalla();
  if (new URLSearchParams(location.search).has('installa') && !installata()) setTimeout(installa, 800); // dal tasto della landing
  await controllaCodiceSalvato();
  if (sbloccata() && impostazioni().fatto) {
    if (bloccato()) return mostraPremium();     // prova finita e niente Premium
    applicaImpostazioni(null); avviaApp(); avvisoFineProva();
  } else if (sbloccata()) mostraConfig(true);   // chiave già inserita ma configurazione non finita
  else mostraDemo();                            // primo avvio: subito la demo, senza chiedere niente
})();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW', e));
document.addEventListener('visibilitychange', () => {
  // Riaperta il giorno dopo senza ricaricare: controlla se ci sono dati nuovi
  if (document.visibilityState === 'visible' && sbloccata() && impostazioni().fatto && !audioAttivo() && Ed.finito) {
    if (bloccato()) return mostraPremium();
    caricaGrezzo().then((g) => { if (g && Ed.grezzo && g.generato !== Ed.grezzo.generato) { $('avvisi').innerHTML = ''; prepara(true); } });
  }
});

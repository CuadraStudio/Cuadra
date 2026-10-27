(() => {
  const button = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.menu-links');
  const menu = document.querySelector('.alfajor-menu');
  const label = document.querySelector('.menu-word');
  const desktopNav = window.matchMedia('(min-width:601px)');
  function setOpen(open, restoreFocus = false) {
    if (desktopNav.matches) open = false;
    document.body.classList.toggle('menu-open', open);
    button.setAttribute('aria-expanded', String(open));
    button.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    label.firstChild.textContent = open ? 'Cerrar ' : 'Abrir menú ';
    label.querySelector('.menu-sign').textContent = open ? '−' : '+';
    nav.inert = !desktopNav.matches && !open;
    if (restoreFocus) button.focus();
  }
  button.addEventListener('click', () => setOpen(button.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    setOpen(false);
    const target = document.querySelector(link.hash);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && button.getAttribute('aria-expanded') === 'true') setOpen(false, true);
  });
  document.addEventListener('click', event => {
    if (!menu.contains(event.target)) setOpen(false);
  });
  menu.addEventListener('focusout', event => {
    if (event.relatedTarget && !menu.contains(event.relatedTarget)) setOpen(false);
  });
  desktopNav.addEventListener('change', () => setOpen(false));
  setOpen(false);
})();

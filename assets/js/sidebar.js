// Poignée de la barre latérale : repliée/dépliée sur grand écran (mémorisé), tiroir sur mobile (jamais mémorisé).
(() => {
  'use strict';

  const root = document.documentElement;
  const sidebar = document.querySelector('.sidebar');
  const button = sidebar?.querySelector('.sidebar-toggle');
  if (!sidebar || !button) return;

  const KEY = 'sidebar';
  const mobile = window.matchMedia('(max-width: 48rem)'); // = breakpoint de main.css

  const store = {
    set(value) { try { localStorage.setItem(KEY, value); } catch { /* ignoré */ } },
    remove() { try { localStorage.removeItem(KEY); } catch { /* ignoré */ } },
  };

  const isVisible = () => (mobile.matches
    ? root.classList.contains('sidebar-open')
    : !root.classList.contains('sidebar-collapsed'));

  const sync = () => {
    const visible = isVisible();
    const label = visible ? 'Masquer la navigation' : 'Afficher la navigation';
    button.setAttribute('aria-expanded', String(visible));
    button.setAttribute('aria-label', label);
    button.title = label;
  };

  const closeDrawer = () => {
    root.classList.remove('sidebar-open');
    sync();
  };

  button.addEventListener('click', () => {
    if (mobile.matches) {
      root.classList.toggle('sidebar-open');
    } else if (root.classList.toggle('sidebar-collapsed')) {
      store.set('collapsed');
    } else {
      store.remove();
    }
    sync();
  });

  // Tiroir mobile : fermeture par Échap ou clic en dehors
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !root.classList.contains('sidebar-open')) return;
    closeDrawer();
    button.focus();
  });

  document.addEventListener('click', (event) => {
    if (!root.classList.contains('sidebar-open')) return;
    if (sidebar.contains(event.target)) return;
    closeDrawer();
  });

  mobile.addEventListener('change', closeDrawer);
  sync();
})();

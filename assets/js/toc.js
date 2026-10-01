// Table des matières : surligne la section en cours de lecture (scrollspy).
(() => {
  'use strict';

  const toc = document.querySelector('.toc');
  if (!toc) return;

  const OFFSET = 120; // px sous le haut de l'écran où une section devient "active"

  const entries = [...toc.querySelectorAll('a[href^="#"]')]
    .map((link) => ({
      link,
      heading: document.getElementById(decodeURIComponent(link.hash.slice(1))),
    }))
    .filter((entry) => entry.heading);

  if (!entries.length) return;

  let current = null;

  // Garde le lien actif visible quand la ToC sticky déborde (sans faire défiler la page)
  const keepVisible = (link) => {
    if (toc.scrollHeight <= toc.clientHeight) return;
    const box = toc.getBoundingClientRect();
    const item = link.getBoundingClientRect();
    if (item.top < box.top) toc.scrollTop -= box.top - item.top + 8;
    else if (item.bottom > box.bottom) toc.scrollTop += item.bottom - box.bottom + 8;
  };

  const update = () => {
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let active = entries[0];
    if (atBottom) {
      active = entries[entries.length - 1];
    } else {
      for (const entry of entries) {
        if (entry.heading.getBoundingClientRect().top - OFFSET > 0) break;
        active = entry;
      }
    }
    if (active === current) return;
    current?.link.removeAttribute('aria-current');
    active.link.setAttribute('aria-current', 'location');
    current = active;
    keepVisible(active.link);
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();

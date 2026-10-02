// Bouton "Copier" sur les blocs marqués {copy=true} (div.code-block, cf. render-codeblock.html). Vanilla JS, aucune dépendance.
(() => {
  'use strict';

  // Icônes SVG inline (tracé 24×24, même style que callout-icon.html)
  const svg = (paths) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths}</svg>`;
  const ICON = svg('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>');
  const DONE = svg('<path d="M20 6 9 17l-5-5"/>');
  const FAIL = svg('<path d="M18 6 6 18M6 6l12 12"/>');

  const LABEL = 'Copier le code dans le presse-papiers';
  const LABEL_DONE = 'Code copié';
  const LABEL_FAIL = 'Échec de la copie';
  const TOAST_MS = 1200;

  // Bulle "Copié !" brève à côté du bouton (aria-hidden : l'aria-label du bouton annonce déjà le résultat)
  const toast = (box) => {
    box.querySelector('.copy-toast')?.remove();
    const el = document.createElement('span');
    el.className = 'copy-toast';
    el.textContent = 'Copié !';
    el.setAttribute('aria-hidden', 'true');
    box.append(el);
    setTimeout(() => el.remove(), TOAST_MS);
  };

  const copyText = async (text) => {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    // Repli pour les contextes non sécurisés (ex : ouverture en file://)
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    const ok = document.execCommand('copy');
    area.remove();
    if (!ok) throw new Error('copy failed');
  };

  document.querySelectorAll('.code-block').forEach((box) => {
    const code = box.querySelector('pre > code');
    if (!code) return;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-btn';
    button.innerHTML = ICON;
    button.title = 'Copier';
    button.setAttribute('aria-label', LABEL);

    let timer;
    button.addEventListener('click', async () => {
      try {
        await copyText(code.textContent);
        button.innerHTML = DONE;
        button.setAttribute('aria-label', LABEL_DONE);
        button.classList.add('is-done');
        toast(box);
      } catch {
        button.innerHTML = FAIL;
        button.setAttribute('aria-label', LABEL_FAIL);
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        button.innerHTML = ICON;
        button.setAttribute('aria-label', LABEL);
        button.classList.remove('is-done');
      }, 2000);
    });

    box.append(button);
  });
})();

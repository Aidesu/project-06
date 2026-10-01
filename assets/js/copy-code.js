// Bouton "Copier" sur chaque bloc <pre><code>. Vanilla JS, aucune dépendance.
(() => {
  'use strict';

  const LABEL = 'Copier';
  const DONE = 'Copié !';
  const FAIL = 'Échec';

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

  document.querySelectorAll('pre > code').forEach((code) => {
    const pre = code.parentElement;
    const box = document.createElement('div');
    box.className = 'code-block';
    pre.before(box);
    box.append(pre);

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-btn';
    button.textContent = LABEL;
    button.setAttribute('aria-label', 'Copier le code dans le presse-papiers');
    button.setAttribute('aria-live', 'polite');

    let timer;
    button.addEventListener('click', async () => {
      try {
        await copyText(code.textContent);
        button.textContent = DONE;
        button.classList.add('is-done');
      } catch {
        button.textContent = FAIL;
      }
      clearTimeout(timer);
      timer = setTimeout(() => {
        button.textContent = LABEL;
        button.classList.remove('is-done');
      }, 2000);
    });

    box.append(button);
  });
})();

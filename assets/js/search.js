// Recherche client-side : Fuse.js + index JSON généré par Hugo (layouts/home.json).
// Fuse et l'index ne sont chargés qu'au premier focus du champ.
(() => {
  'use strict';

  const root = document.querySelector('.search');
  if (!root) return;

  const input = root.querySelector('.search-input');
  const list = root.querySelector('.search-results');
  const MAX_RESULTS = 8;
  const MIN_QUERY = 2;

  let fuse = null;
  let loading = null;
  let results = [];
  let active = -1;

  root.hidden = false;

  const init = () => {
    loading ??= Promise.all([
      import(root.dataset.fuse),
      fetch(root.dataset.index).then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      }),
    ]).then(([{ default: Fuse }, data]) => {
      fuse = new Fuse(data, {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'tags', weight: 2 },
          { name: 'description', weight: 1.5 },
          { name: 'content', weight: 1 },
        ],
        ignoreLocation: true,
        ignoreDiacritics: true,
        threshold: 0.3,
        minMatchCharLength: MIN_QUERY,
      });
    }).catch((err) => {
      loading = null; // nouvel essai au prochain focus
      throw err;
    });
    return loading;
  };

  const excerpt = (item) => {
    const text = item.description || item.content || '';
    return text.length > 140 ? `${text.slice(0, 140).trimEnd()}…` : text;
  };

  const setActive = (index) => {
    const options = list.querySelectorAll('[role="option"]');
    options.forEach((el, i) => el.setAttribute('aria-selected', String(i === index)));
    active = index;
    if (index >= 0 && options[index]) {
      input.setAttribute('aria-activedescendant', options[index].id);
      options[index].scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const open = () => {
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  };

  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    setActive(-1);
  };

  const message = (text) => {
    const li = document.createElement('li');
    li.className = 'search-empty';
    li.textContent = text;
    list.replaceChildren(li);
    results = [];
    open();
  };

  const render = () => {
    if (!results.length) {
      message(`Aucun résultat pour « ${input.value.trim()} »`);
      return;
    }
    list.replaceChildren(...results.map(({ item }, i) => {
      const li = document.createElement('li');
      li.id = `search-result-${i}`;
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', 'false');

      const link = document.createElement('a');
      link.href = item.url;
      link.tabIndex = -1;

      const title = document.createElement('span');
      title.className = 'search-title';
      title.textContent = item.title;

      const meta = document.createElement('span');
      meta.className = 'search-meta';
      meta.textContent = item.section;

      const text = document.createElement('span');
      text.className = 'search-excerpt';
      text.textContent = excerpt(item);

      link.append(title, meta, text);
      li.append(link);
      return li;
    }));
    open();
    setActive(0);
  };

  const search = () => {
    const query = input.value.trim();
    if (query.length < MIN_QUERY) {
      close();
      return;
    }
    if (!fuse) {
      init().then(search, () => message('Index de recherche indisponible.'));
      return;
    }
    results = fuse.search(query, { limit: MAX_RESULTS });
    render();
  };

  input.addEventListener('focus', () => { init().catch(() => {}); });
  input.addEventListener('input', search);

  input.addEventListener('keydown', (event) => {
    const count = results.length;
    switch (event.key) {
      case 'ArrowDown':
        if (!count) return;
        event.preventDefault();
        setActive((active + 1) % count);
        break;
      case 'ArrowUp':
        if (!count) return;
        event.preventDefault();
        setActive((active - 1 + count) % count);
        break;
      case 'Enter':
        if (active >= 0 && results[active]) {
          event.preventDefault();
          window.location.assign(results[active].item.url);
        }
        break;
      case 'Escape':
        if (!list.hidden) {
          close();
        } else {
          input.value = '';
          input.blur();
        }
        break;
    }
  });

  // Raccourci "/" pour focaliser la recherche (hors champs de saisie)
  document.addEventListener('keydown', (event) => {
    if (event.key !== '/' || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target;
    if (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
    event.preventDefault();
    input.focus();
  });

  document.addEventListener('click', (event) => {
    if (!root.contains(event.target)) close();
  });

  root.addEventListener('focusin', () => {
    if (results.length && input.value.trim().length >= MIN_QUERY) open();
  });
})();

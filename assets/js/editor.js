// Éditeur Markdown de LittleWiki : Front Matter, barre d'outils, aperçu en direct, export .md.
// Vanilla JS. Seule dépendance : marked (vendor, chargé à la demande pour l'aperçu).
(() => {
  'use strict';

  const root = document.querySelector('.editor');
  if (!root) return;

  const DATA = JSON.parse(document.getElementById('editor-data').textContent);
  const STORAGE_KEY = 'littlewiki-editor-draft';
  const VIEW_KEY = 'littlewiki-editor-view';
  const WORDS_PER_MINUTE = 213; // valeur utilisée par Hugo pour .ReadingTime

  const $ = (sel) => root.querySelector(sel);
  const body = $('#ed-body');
  const fields = {
    title: $('#ed-title'),
    section: $('#ed-section'),
    slug: $('#ed-slug'),
    date: $('#ed-date'),
    description: $('#ed-description'),
    tags: $('#ed-tags'),
    categories: $('#ed-categories'),
  };
  const status = $('.editor-status');
  const panes = $('.editor-panes');
  const suggest = $('#wiki-suggest');
  const preview = {
    title: $('[data-preview="title"]'),
    meta: $('[data-preview="meta"]'),
    tags: $('[data-preview="tags"]'),
    body: $('[data-preview="body"]'),
  };

  // ---------- Stockage (peut être indisponible : navigation privée, etc.) ----------

  const store = {
    get(key) { try { return localStorage.getItem(key); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } },
    remove(key) { try { localStorage.removeItem(key); } catch { /* ignoré */ } },
  };

  // ---------- Utilitaires ----------

  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));

  const slugify = (s) => s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  // Proche de `anchorize` (Goldmark, style GitHub) : ancres des titres
  const anchorize = (s) => s.trim().toLowerCase()
    .replace(/[^\p{L}\p{N}\s_-]/gu, '')
    .replace(/\s/g, '-');

  const splitList = (s) => s.split(',').map((t) => t.trim()).filter(Boolean);

  const pad = (n) => String(n).padStart(2, '0');

  // Valeur pour <input type="datetime-local"> (heure locale)
  const toLocalInput = (d) =>
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

  // Date ISO 8601 avec décalage horaire, comme les articles existants (2026-10-01T11:00:00+02:00)
  const toIsoOffset = (d) => {
    const off = -d.getTimezoneOffset();
    const sign = off >= 0 ? '+' : '-';
    const abs = Math.abs(off);
    return `${toLocalInput(d)}:00${sign}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
  };

  const yamlString = (s) => `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  const yamlList = (items) => `[${items.map(yamlString).join(', ')}]`;

  let statusTimer;
  const say = (text, tone = '') => {
    status.textContent = text;
    status.dataset.tone = tone;
    clearTimeout(statusTimer);
    if (tone) {
      statusTimer = setTimeout(() => { status.dataset.tone = ''; }, 2500);
    }
  };

  // ---------- Sections ----------

  DATA.sections.forEach((s) => {
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = s.footer ? `${s.title} (pied de page)` : s.title;
    fields.section.append(opt);
  });

  // ---------- Nom de fichier : suit le titre tant qu'il n'a pas été modifié à la main ----------

  let slugTouched = false;

  const filePath = () => `content/${fields.section.value}/${fields.slug.value || 'sans-titre'}.md`;

  const updatePath = () => {
    const path = filePath();
    const exists = DATA.pages.some((p) => p.path === `${fields.section.value}/${fields.slug.value}`);
    const help = $('#ed-path');
    help.textContent = exists
      ? `Attention : ${path} existe déjà sur le wiki (il sera remplacé).`
      : `Destination : ${path}`;
    help.classList.toggle('is-warning', exists);
    $('[data-stat="path"]').textContent = path;
  };

  fields.title.addEventListener('input', () => {
    if (!slugTouched) fields.slug.value = slugify(fields.title.value);
    if (fields.title.value.trim()) setTitleError(false);
  });

  fields.slug.addEventListener('input', () => {
    slugTouched = fields.slug.value !== '';
  });

  fields.slug.addEventListener('change', () => {
    fields.slug.value = slugify(fields.slug.value);
  });

  const setTitleError = (on) => {
    fields.title.setAttribute('aria-invalid', String(on));
    $('#ed-title-error').hidden = !on;
    if (on) {
      fields.title.setAttribute('aria-describedby', 'ed-title-error');
    } else {
      fields.title.removeAttribute('aria-describedby');
    }
  };

  // ---------- Génération du fichier ----------

  const buildMarkdown = () => {
    const date = fields.date.value ? new Date(fields.date.value) : new Date();
    const lines = [
      '---',
      `title: ${yamlString(fields.title.value.trim())}`,
      `date: ${toIsoOffset(date)}`,
      'draft: false',
    ];
    const description = fields.description.value.trim();
    if (description) lines.push(`description: ${yamlString(description)}`);
    lines.push(`tags: ${yamlList(splitList(fields.tags.value))}`);
    lines.push(`categories: ${yamlList(splitList(fields.categories.value))}`);
    lines.push('---', '');
    const content = body.value.replace(/\s+$/, '');
    return `${lines.join('\n')}\n${content}\n`;
  };

  const validate = () => {
    if (fields.title.value.trim()) return true;
    $('.editor-meta').open = true;
    setTitleError(true);
    fields.title.focus();
    say('Ajoute un titre avant d’exporter.', 'error');
    return false;
  };

  const download = () => {
    if (!validate()) return;
    if (!fields.slug.value) fields.slug.value = slugify(fields.title.value);
    const blob = new Blob([buildMarkdown()], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fields.slug.value}.md`;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    say(`Téléchargé : ${a.download} → à placer dans content/${fields.section.value}/`, 'success');
  };

  const copyMarkdown = async () => {
    if (!validate()) return;
    const text = buildMarkdown();
    try {
      await navigator.clipboard.writeText(text);
      say('Fichier Markdown copié dans le presse-papiers.', 'success');
    } catch {
      say('Copie impossible dans ce contexte : utilise « Télécharger .md ».', 'error');
    }
  };

  // ---------- Import d'un .md existant ----------

  // Lecture volontairement simple du Front Matter : clés de premier niveau utilisées par le wiki
  const parseFrontMatter = (text) => {
    const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
    if (!match) return { meta: {}, content: text };
    const meta = {};
    let listKey = null;
    match[1].split(/\r?\n/).forEach((line) => {
      const item = line.match(/^\s*-\s+(.*)$/);
      if (item && listKey) {
        meta[listKey].push(unquote(item[1]));
        return;
      }
      const kv = line.match(/^([A-Za-z_]+):\s*(.*?)\s*(#.*)?$/);
      if (!kv) return;
      const [, key, raw] = kv;
      listKey = null;
      if (raw === '') {
        meta[key] = [];
        listKey = key;
      } else if (raw.startsWith('[')) {
        meta[key] = raw.replace(/^\[|\]$/g, '').split(',').map(unquote).filter(Boolean);
      } else {
        meta[key] = unquote(raw);
      }
    });
    return { meta, content: text.slice(match[0].length).replace(/^\s*\n/, '') };
  };

  const unquote = (s) => {
    const t = s.trim();
    if (/^".*"$/.test(t)) return t.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    if (/^'.*'$/.test(t)) return t.slice(1, -1).replace(/''/g, "'");
    return t;
  };

  const openFile = async (file) => {
    if (!file) return;
    if (hasContent() && !confirm('Remplacer le brouillon en cours par ce fichier ?')) return;
    const { meta, content } = parseFrontMatter(await file.text());
    const date = meta.date ? new Date(meta.date) : null;
    applyState({
      title: meta.title || '',
      section: fields.section.value,
      slug: file.name.replace(/\.(md|markdown)$/i, ''),
      slugTouched: true,
      date: date && !Number.isNaN(date.getTime()) ? toLocalInput(date) : toLocalInput(new Date()),
      description: meta.description || '',
      tags: [].concat(meta.tags || []).join(', '),
      categories: [].concat(meta.categories || []).join(', '),
      body: content,
    });
    say(`Fichier ouvert : ${file.name}. Vérifie la section avant d’exporter.`, 'success');
  };

  // ---------- Brouillon (autosauvegarde) ----------

  const hasContent = () => Boolean(fields.title.value.trim() || body.value.trim());

  const getState = () => ({
    title: fields.title.value,
    section: fields.section.value,
    slug: fields.slug.value,
    slugTouched,
    date: fields.date.value,
    description: fields.description.value,
    tags: fields.tags.value,
    categories: fields.categories.value,
    body: body.value,
  });

  const applyState = (s) => {
    fields.title.value = s.title || '';
    if (s.section && DATA.sections.some((x) => x.name === s.section)) fields.section.value = s.section;
    fields.slug.value = s.slug || slugify(s.title || '');
    slugTouched = Boolean(s.slugTouched);
    fields.date.value = s.date || toLocalInput(new Date());
    fields.description.value = s.description || '';
    fields.tags.value = s.tags || '';
    fields.categories.value = s.categories || '';
    body.value = s.body || '';
    setTitleError(false);
    refresh();
  };

  let saveTimer;
  const scheduleSave = () => {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      if (store.set(STORAGE_KEY, JSON.stringify(getState()))) {
        const now = new Date();
        say(`Brouillon enregistré dans ce navigateur · ${pad(now.getHours())}:${pad(now.getMinutes())}`);
      }
    }, 500);
  };

  const reset = () => {
    if (hasContent() && !confirm('Effacer le brouillon et repartir d’une page blanche ?')) return;
    store.remove(STORAGE_KEY);
    applyState({ section: fields.section.value });
    say('Nouveau brouillon.');
    fields.title.focus();
  };

  // ---------- Insertion de texte (conserve l'historique Ctrl+Z) ----------

  const insert = (text, selectFrom, selectTo) => {
    body.focus();
    const start = body.selectionStart;
    const ok = text === ''
      ? document.execCommand('delete')
      : document.execCommand('insertText', false, text);
    if (!ok) {
      body.setRangeText(text, start, body.selectionEnd, 'end');
      body.dispatchEvent(new Event('input'));
    }
    if (selectFrom !== undefined) {
      body.setSelectionRange(start + selectFrom, start + (selectTo ?? selectFrom));
    }
  };

  const selection = () => body.value.slice(body.selectionStart, body.selectionEnd);

  // Entoure la sélection (ou un texte d'exemple sélectionné)
  const wrap = (before, after, placeholder) => {
    const sel = selection() || placeholder;
    insert(before + sel + after, before.length, before.length + sel.length);
  };

  // Bloc sur ses propres lignes, séparé par des lignes vides
  const block = (text, cursorOffset, cursorEnd) => {
    const startText = body.value.slice(0, body.selectionStart);
    const endText = body.value.slice(body.selectionEnd);
    const lead = startText === '' || startText.endsWith('\n\n') ? '' : startText.endsWith('\n') ? '\n' : '\n\n';
    const trail = endText.startsWith('\n\n') ? '' : endText.startsWith('\n') ? '\n' : '\n\n';
    insert(lead + text + trail, lead.length + cursorOffset, lead.length + (cursorEnd ?? cursorOffset));
  };

  // Préfixe chaque ligne de la sélection (titres, listes)
  const prefixLines = (makePrefix) => {
    const value = body.value;
    const lineStart = value.lastIndexOf('\n', body.selectionStart - 1) + 1;
    let lineEnd = value.indexOf('\n', body.selectionEnd);
    if (lineEnd === -1) lineEnd = value.length;
    body.setSelectionRange(lineStart, lineEnd);
    const lines = value.slice(lineStart, lineEnd).split('\n');
    const out = lines.map((l, i) => makePrefix(i) + l.replace(/^(#{1,6}\s|[-*+]\s|\d+\.\s)/, '')).join('\n');
    insert(out, out.length);
  };

  const COMMANDS = {
    h2: () => prefixLines(() => '## '),
    h3: () => prefixLines(() => '### '),
    bold: () => wrap('**', '**', 'texte en gras'),
    italic: () => wrap('*', '*', 'texte en italique'),
    code: () => wrap('`', '`', 'code'),
    command: () => {
      const sel = selection() || 'commande';
      block(`\`\`\`bash {copy=true}\n${sel}\n\`\`\``, 20, 20 + sel.length);
    },
    codeblock: () => {
      const sel = selection() || 'exemple';
      block(`\`\`\`text\n${sel}\n\`\`\``, 8, 8 + sel.length);
    },
    link: () => {
      const sel = selection() || 'texte du lien';
      insert(`[${sel}](https://)`, sel.length + 3, sel.length + 11);
    },
    wikilink: () => {
      const sel = selection();
      insert(`[[${sel}]]`, 2, 2 + sel.length);
      if (!sel) showSuggestions();
    },
    ul: () => prefixLines(() => '- '),
    ol: () => prefixLines((i) => `${i + 1}. `),
    table: () => block('| Colonne 1 | Colonne 2 |\n|-----------|-----------|\n| Valeur    | Valeur    |', 2, 11),
    hr: () => block('---', 3),
    callout: (btn) => {
      const sel = selection() || 'Contenu de l’encadré.';
      const quoted = sel.split('\n').map((l) => `> ${l}`).join('\n');
      const head = `> [!${btn.dataset.type}]\n`;
      block(head + quoted, head.length + 2, head.length + quoted.length);
      btn.closest('details').open = false;
    },
  };

  root.querySelectorAll('[data-cmd]').forEach((btn) => {
    // Garder la sélection du textarea au clic
    btn.addEventListener('mousedown', (e) => e.preventDefault());
    btn.addEventListener('click', () => COMMANDS[btn.dataset.cmd](btn));
  });

  // Fermer le menu Callout au clic extérieur / Échap
  const menu = $('.tool-menu');
  document.addEventListener('click', (e) => {
    if (menu.open && !menu.contains(e.target)) menu.open = false;
  });
  menu.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { menu.open = false; menu.querySelector('summary').focus(); }
  });

  // ---------- Clavier ----------

  body.addEventListener('keydown', (e) => {
    if (suggestKeys(e)) return;

    const mod = e.ctrlKey || e.metaKey;
    if (mod && !e.shiftKey && !e.altKey) {
      const map = { b: 'bold', i: 'italic', k: 'link', e: 'code' };
      const cmd = map[e.key.toLowerCase()];
      if (cmd) {
        e.preventDefault();
        COMMANDS[cmd]();
        return;
      }
    }

    // Entrée dans une liste : continue la liste (ou la termine si l'élément est vide)
    if (e.key === 'Enter' && !e.shiftKey && !mod && body.selectionStart === body.selectionEnd) {
      const pos = body.selectionStart;
      const lineStart = body.value.lastIndexOf('\n', pos - 1) + 1;
      const line = body.value.slice(lineStart, pos);
      const m = line.match(/^(\s*)([-*+]|(\d+)\.)\s(\[[ xX]\]\s)?(.*)$/);
      if (!m) return;
      e.preventDefault();
      if (m[5] === '' && !m[4]) {
        body.setSelectionRange(lineStart, pos);
        insert('');
        return;
      }
      const marker = m[3] ? `${Number(m[3]) + 1}.` : m[2];
      insert(`\n${m[1]}${marker} ${m[4] ? '[ ] ' : ''}`);
    }
  });

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      download();
    }
  });

  // ---------- Suggestions [[lien wiki]] ----------

  let suggestions = [];
  let suggestActive = 0;

  const wikiQuery = () => {
    const before = body.value.slice(0, body.selectionStart);
    const m = before.match(/\[\[([^\]\n|#]*)$/);
    return m ? m[1] : null;
  };

  const showSuggestions = () => {
    const q = wikiQuery();
    if (q === null) { hideSuggestions(); return; }
    const needle = slugify(q);
    suggestions = DATA.pages
      .filter((p) => !needle || slugify(`${p.title} ${p.path}`).includes(needle))
      .slice(0, 8);
    if (!suggestions.length) { hideSuggestions(); return; }
    suggestActive = 0;
    suggest.replaceChildren(...suggestions.map((p, i) => {
      const li = document.createElement('li');
      li.id = `wiki-suggest-${i}`;
      li.setAttribute('role', 'option');
      li.innerHTML = `<span class="ws-title">${escapeHtml(p.title)}</span><span class="ws-path">${escapeHtml(p.path || '/')}</span>`;
      li.addEventListener('mousedown', (e) => { e.preventDefault(); pickSuggestion(i); });
      return li;
    }));
    suggest.hidden = false;
    markSuggestion();
  };

  const markSuggestion = () => {
    suggest.querySelectorAll('li').forEach((li, i) => li.setAttribute('aria-selected', String(i === suggestActive)));
    body.setAttribute('aria-activedescendant', `wiki-suggest-${suggestActive}`);
  };

  const hideSuggestions = () => {
    suggest.hidden = true;
    body.removeAttribute('aria-activedescendant');
  };

  const pickSuggestion = (i) => {
    const q = wikiQuery();
    const page = suggestions[i];
    if (q === null || !page) return;
    // Nom de fichier : court et stable (le titre peut changer)
    const name = page.file === '_index' ? page.path : page.file;
    const after = body.value.slice(body.selectionStart);
    body.setSelectionRange(body.selectionStart - q.length, body.selectionStart + (after.startsWith(']]') ? 2 : 0));
    insert(`${name}]]`);
    hideSuggestions();
  };

  const suggestKeys = (e) => {
    if (suggest.hidden) return false;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = suggestions.length;
      suggestActive = (suggestActive + (e.key === 'ArrowDown' ? 1 : n - 1)) % n;
      markSuggestion();
      return true;
    }
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      pickSuggestion(suggestActive);
      return true;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      hideSuggestions();
      return true;
    }
    return false;
  };

  body.addEventListener('blur', () => setTimeout(hideSuggestions, 100));
  body.addEventListener('click', showSuggestions);

  // ---------- Aperçu ----------

  const findPage = (name) => {
    const key = name.trim().replace(/^\//, '').replace(/\.md$/, '').toLowerCase();
    // Priorité identique à wikilinks/keys.html : chemin > nom de fichier > titre
    return DATA.pages.find((p) => p.path.toLowerCase() === key)
      || DATA.pages.find((p) => p.file.toLowerCase() === key)
      || DATA.pages.find((p) => p.title.toLowerCase() === key);
  };

  const renderWikilink = (inner) => {
    const [target, ...labelParts] = inner.replace(/\\\|/g, '|').split('|');
    const label = labelParts.join('|').trim();
    const [name, ...anchorParts] = target.split('#');
    const anchor = anchorParts.join('#').trim();
    if (!name.trim()) {
      return `<a class="wikilink" href="#${escapeHtml(anchorize(anchor))}">${escapeHtml(label || anchor)}</a>`;
    }
    const page = findPage(name);
    if (!page) {
      return `<span class="wikilink wikilink-broken" title="Page introuvable : ${escapeHtml(name.trim())}">${escapeHtml(label || name.trim())}</span>`;
    }
    const href = page.url + (anchor ? `#${anchorize(anchor)}` : '');
    const text = label || (anchor ? `${page.title} › ${anchor}` : page.title);
    return `<a class="wikilink" href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(text)}</a>`;
  };

  const CALLOUTS = { note: 'note', info: 'note', tip: 'tip', hint: 'tip', warning: 'warning', important: 'warning', caution: 'error', danger: 'error', error: 'error' };
  const CALLOUT_LABELS = { note: 'Note', tip: 'Astuce', warning: 'Attention', error: 'Erreur' };
  const calloutIcon = (type) => root.querySelector(`[data-callout-icon="${type}"]`)?.innerHTML || '';

  let marked = null;

  const setupMarked = (lib) => {
    marked = new lib.Marked({ gfm: true });
    marked.use({
      extensions: [{
        name: 'wikilink',
        level: 'inline',
        start: (src) => src.indexOf('[['),
        tokenizer(src) {
          const m = src.match(/^\[\[([^[\]\n]+)\]\]/);
          if (m) return { type: 'wikilink', raw: m[0], inner: m[1] };
          return undefined;
        },
        renderer: (token) => renderWikilink(token.inner),
      }],
      renderer: {
        // Comme Hugo (goldmark unsafe = false) : le HTML brut n'est pas rendu
        html: () => '<!-- raw HTML omitted -->',
        code({ text, lang }) {
          const info = (lang || '').trim();
          const language = info.split(/[\s{]/)[0];
          const copy = /\{[^}]*\bcopy\s*=\s*true\b[^}]*\}/.test(info);
          const pre = `<pre><code${language ? ` class="language-${escapeHtml(language)}"` : ''}>${escapeHtml(text)}</code></pre>`;
          if (language === 'mermaid') {
            return `<div class="editor-badge-wrap"><span class="editor-badge">Schéma Mermaid · rendu sur le wiki</span>${pre}</div>`;
          }
          return copy
            ? `<div class="code-block editor-badge-wrap"><span class="editor-badge">Bouton Copier</span>${pre}</div>`
            : pre;
        },
        blockquote({ tokens }) {
          const first = tokens[0];
          const m = first?.type === 'paragraph' && first.raw.match(/^\[!(\w+)\][ \t]*([^\n]*)\n?/);
          if (!m) return `<blockquote>${this.parser.parse(tokens)}</blockquote>`;
          const type = CALLOUTS[m[1].toLowerCase()] || 'note';
          const title = m[2].trim() || CALLOUT_LABELS[type];
          const rest = first.raw.slice(m[0].length);
          const inner = (rest.trim() ? marked.parse(rest) : '') + this.parser.parse(tokens.slice(1));
          return `<div class="callout callout-${type}" role="note"><p class="callout-title">${calloutIcon(type)}<span>${escapeHtml(title)}</span></p><div class="callout-body">${inner}</div></div>`;
        },
        heading({ tokens, depth, text }) {
          return `<h${depth} id="${escapeHtml(anchorize(text))}">${this.parser.parseInline(tokens)}</h${depth}>`;
        },
      },
    });
  };

  const renderPreview = () => {
    const title = fields.title.value.trim();
    preview.title.textContent = title || 'Sans titre';
    preview.title.classList.toggle('is-placeholder', !title);

    const words = (body.value.match(/\S+/g) || []).length;
    const minutes = Math.max(1, Math.ceil(words / WORDS_PER_MINUTE));
    const date = fields.date.value ? new Date(fields.date.value) : new Date();
    const dateText = Number.isNaN(date.getTime())
      ? ''
      : `${date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} · `;
    preview.meta.textContent = `${dateText}${minutes} min de lecture`;
    preview.tags.replaceChildren(...splitList(fields.tags.value).map((t) => {
      const li = document.createElement('li');
      li.innerHTML = `<a>#${escapeHtml(t)}</a>`;
      return li;
    }));

    $('[data-stat="words"]').textContent = `${words} mot${words > 1 ? 's' : ''}`;
    $('[data-stat="reading"]').textContent = `${minutes} min de lecture`;

    if (!marked) return;
    preview.body.innerHTML = body.value.trim()
      ? marked.parse(body.value)
      : '<p class="meta">L’aperçu apparaîtra ici.</p>';
  };

  // Zone d'écriture à la hauteur de son contenu : c'est la page qui défile (barre d'outils collée en haut)
  const autosize = () => {
    const y = window.scrollY;
    body.style.height = 'auto';
    body.style.height = `${body.scrollHeight + 2}px`;
    window.scrollTo(0, y);
  };

  let frame;
  const refresh = () => {
    autosize();
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      renderPreview();
      updatePath();
    });
  };

  window.addEventListener('resize', autosize);

  // Hauteur réelle de la barre (elle passe sur plusieurs lignes sur petit écran)
  const bar = $('.editor-bar');
  new ResizeObserver(() => {
    root.style.setProperty('--editor-bar-h', `${bar.offsetHeight}px`);
  }).observe(bar);

  import(root.dataset.marked)
    .then((lib) => { setupMarked(lib); refresh(); })
    .catch(() => {
      preview.body.innerHTML = '<p class="meta">Aperçu indisponible (chargement de marked impossible). L’export fonctionne toujours.</p>';
    });

  // ---------- Affichage : Écrire / Côte à côte / Aperçu ----------

  const views = root.querySelectorAll('input[name="view"]');
  const setView = (view) => {
    panes.dataset.view = view;
    views.forEach((r) => { r.checked = r.value === view; });
    autosize();
    store.set(VIEW_KEY, view);
  };
  views.forEach((r) => r.addEventListener('change', () => setView(r.value)));
  setView(store.get(VIEW_KEY) || (matchMedia('(min-width: 64rem)').matches ? 'split' : 'write'));

  // ---------- Événements ----------

  root.addEventListener('input', (e) => {
    if (e.target.type === 'file' || e.target.name === 'view') return;
    refresh();
    scheduleSave();
    if (e.target === body) showSuggestions();
  });
  fields.section.addEventListener('change', () => { refresh(); scheduleSave(); });

  root.querySelector('[data-action="download"]').addEventListener('click', download);
  root.querySelector('[data-action="copy"]').addEventListener('click', copyMarkdown);
  root.querySelector('[data-action="new"]').addEventListener('click', reset);

  // Retour : page précédente si elle fait partie du wiki, sinon le lien (accueil)
  root.querySelector('[data-action="back"]').addEventListener('click', (e) => {
    let fromWiki = false;
    try { fromWiki = new URL(document.referrer).origin === location.origin; } catch { /* pas de référent */ }
    if (fromWiki && history.length > 1) {
      e.preventDefault();
      history.back();
    }
  });

  // Sauvegarde immédiate en quittant la page (retour, lien, fermeture d'onglet)
  window.addEventListener('pagehide', () => {
    clearTimeout(saveTimer);
    if (hasContent()) store.set(STORAGE_KEY, JSON.stringify(getState()));
  });
  root.querySelector('[data-action="open"]').addEventListener('change', (e) => {
    openFile(e.target.files[0]);
    e.target.value = '';
  });

  // Glisser-déposer un .md sur l'éditeur
  root.addEventListener('dragover', (e) => {
    if ([...e.dataTransfer.types].includes('Files')) {
      e.preventDefault();
      root.classList.add('is-dragging');
    }
  });
  root.addEventListener('dragleave', (e) => {
    if (!root.contains(e.relatedTarget)) root.classList.remove('is-dragging');
  });
  root.addEventListener('drop', (e) => {
    root.classList.remove('is-dragging');
    const file = e.dataTransfer.files[0];
    if (!file) return;
    e.preventDefault();
    openFile(file);
  });

  // ---------- Démarrage ----------

  let saved = null;
  try { saved = JSON.parse(store.get(STORAGE_KEY)); } catch { /* brouillon illisible */ }
  if (saved) {
    applyState(saved);
    say('Brouillon restauré.');
  } else {
    applyState({ section: DATA.sections.find((s) => !s.footer)?.name });
  }
})();

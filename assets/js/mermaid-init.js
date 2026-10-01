// Rendu des blocs ```mermaid (voir layouts/_markup/render-codeblock-mermaid.html).
// Les couleurs sont lues depuis les variables CSS de main.css : une seule source de vérité.
(() => {
  'use strict';

  if (!window.mermaid) return;

  const css = getComputedStyle(document.documentElement);
  const v = (name) => css.getPropertyValue(name).trim();

  window.mermaid.initialize({
    startOnLoad: false,
    securityLevel: 'strict',
    // Taille réelle : un flowchart LR large défile au lieu d'être réduit et illisible
    flowchart: { useMaxWidth: false },
    theme: 'base',
    themeVariables: {
      darkMode: true,
      fontFamily: v('--font-sans'),
      background: v('--bg'),
      textColor: v('--text'),
      lineColor: v('--cyan'),

      primaryColor: v('--bg-elevated'),
      primaryTextColor: v('--text'),
      primaryBorderColor: v('--pink'),
      secondaryColor: v('--bg-code'),
      secondaryTextColor: v('--text'),
      secondaryBorderColor: v('--cyan'),
      tertiaryColor: v('--bg'),
      tertiaryTextColor: v('--text'),
      tertiaryBorderColor: v('--border'),

      mainBkg: v('--bg-elevated'),
      clusterBkg: v('--bg-code'),
      clusterBorder: v('--border'),
      edgeLabelBackground: v('--bg'),

      noteBkgColor: v('--bg-elevated'),
      noteTextColor: v('--text'),
      noteBorderColor: v('--cyan'),

      actorBkg: v('--bg-elevated'),
      actorBorder: v('--pink'),
      actorTextColor: v('--text'),
      signalColor: v('--cyan'),
      signalTextColor: v('--text'),
    },
  });

  window.mermaid
    .run({ querySelector: 'pre.mermaid' })
    .catch((err) => console.error('Mermaid :', err));
})();

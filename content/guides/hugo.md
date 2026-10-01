---
title: "Hugo"
date: 2026-10-01
draft: false
description: "Les commandes Hugo essentielles pour faire vivre ce wiki."
tags: ["hugo", "docs-as-code"]
categories: ["outils"]
---

## Serveur de développement

Lance le site en local avec rechargement automatique :

```bash
hugo server
```

Le site est alors disponible sur `http://localhost:1313/`.

## Créer une page

L'archétype `archetypes/default.md` pré-remplit le Front Matter :

```bash
hugo new content guides/ma-nouvelle-page.md
```

## Générer le site

```bash
hugo --minify
```

Le résultat statique est écrit dans `public/`.

Pour la mise en forme des pages, voir [[callouts]] et [[mermaid|les schémas Mermaid]].

## Organisation du projet

| Dossier       | Rôle                                  |
|---------------|---------------------------------------|
| `content/`    | Articles Markdown                     |
| `layouts/`    | Templates HTML                        |
| `assets/`     | CSS et JS traités par Hugo            |
| `static/`     | Images et médias copiés tels quels    |

---
title: "Callouts"
date: 2026-10-01
draft: false
description: "Mettre en valeur notes, astuces, avertissements et erreurs."
tags: ["docs-as-code", "markdown"]
categories: ["outils"]
---

## Syntaxe Markdown (recommandée)

Compatible GitHub et Obsidian : le fichier reste lisible en dehors de Hugo.

```markdown
> [!NOTE]
> Une information utile.

> [!WARNING] Titre personnalisé
> Le titre est optionnel.
```

> [!NOTE]
> Hugo génère le site statique dans `public/`.

> [!TIP]
> `hugo server --navigateToChanged` ouvre automatiquement la page modifiée.

> [!WARNING] Port déjà utilisé
> Si le port `1313` est occupé, Hugo en choisit un autre : vérifiez la sortie du terminal.

> [!CAUTION]
> Ne jamais écrire de secrets (tokens, mots de passe) dans `content/` : tout y est publié.

## Shortcode Hugo

Utile pour un contenu plus riche (listes, blocs de code…).

```go-html-template
{{</* callout type="tip" title="Commande utile" */>}}
Contenu **Markdown**.
{{</* /callout */>}}
```

{{< callout type="tip" title="Commande utile" >}}
Prévisualiser aussi les brouillons :

```bash {copy=true}
hugo server --buildDrafts
```
{{< /callout >}}

## Types disponibles

| Type      | Alias acceptés           | Usage                     |
|-----------|--------------------------|---------------------------|
| `note`    | `info`                   | Information neutre        |
| `tip`     | `hint`                   | Astuce, bonne pratique    |
| `warning` | `important`              | Point d'attention         |
| `error`   | `caution`, `danger`      | Risque, action destructive |

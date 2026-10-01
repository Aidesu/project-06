---
title: "Liens"
date: 2026-10-01
draft: false
description: "Relier les pages du wiki avec la syntaxe [[lien]] d'Obsidian."
tags: ["docs-as-code", "markdown"]
categories: ["outils"]
---

## Syntaxe

| Écriture                                  | Résultat                                      |
|-------------------------------------------|-----------------------------------------------|
| `[[hugo]]`                   | [[hugo]]                         |
| `[[hugo\|l'aide-mémoire Hugo]]` | [[hugo\|l'aide-mémoire Hugo]] |
| `[[mermaid#Pipeline CI/CD]]` | [[mermaid#Pipeline CI/CD]]       |
| `[[#Résolution des noms]]`                | [[#Résolution des noms]]                      |

Dans un tableau, le `|` doit être échappé en `\|`.

## Résolution des noms

Le nom entre crochets est comparé, sans tenir compte de la casse, à :

1. le chemin de la page : `[[guides/callouts]]` ;
2. le nom du fichier : `[[callouts]]` ;
3. le titre : `[[Callouts]]`.

Exemple par le titre : [[Callouts]].

> [!WARNING] Lien cassé
> Un lien vers une page inexistante s'affiche en rouge et produit un avertissement à la compilation (`hugo --panicOnWarning` le transforme en erreur).

## Rétroliens

En bas de chaque page, la liste **« Pages qui mentionnent celle-ci »** est générée automatiquement à partir des `[[liens]]` des autres pages. Les liens écrits dans des blocs de code sont ignorés.

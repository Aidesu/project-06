---
title: "Mermaid"
date: 2026-10-01
draft: false
description: "Dessiner des schémas d'architecture as code avec des blocs Mermaid."
tags: ["mermaid", "docs-as-code", "ci-cd"]
categories: ["outils"]
---

## Principe

Un bloc de code typé `mermaid` est rendu en schéma. Sans JavaScript, le code source reste affiché.

````markdown
```mermaid
flowchart LR
    A[Commit] --> B[Build]
```
````

## Pipeline CI/CD

```mermaid
flowchart LR
    dev([Développeuse]) -->|push| repo[(Dépôt)]
    repo --> lint[Lint]
    lint --> test[Tests]
    test --> build[Build Hugo]
    build --> deploy{Branche main ?}
    deploy -->|oui| prod[Production]
    deploy -->|non| preview[Preview]
```

## Diagramme de séquence

```mermaid
sequenceDiagram
    participant U as Utilisateur
    participant N as Nginx
    participant A as API
    U->>N: GET /api/status
    N->>A: proxy_pass
    A-->>N: 200 OK
    N-->>U: 200 OK
```

## Types utiles

| Mot-clé           | Usage                          |
|-------------------|--------------------------------|
| `flowchart`       | Pipelines, architectures       |
| `sequenceDiagram` | Échanges entre services        |
| `stateDiagram-v2` | Cycles de vie (déploiement…)   |
| `gitGraph`        | Stratégies de branches         |

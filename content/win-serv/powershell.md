---
title: "PowerShell"
date: 2026-10-10T12:15:00+02:00
draft: false
description: "Bases de PowerShell : trouver une commande, lire l'aide, le pipeline."
tags: ["windows", "powershell"]
categories: ["windows-server"]
weight: 10
---

## PowerShell ?

**PowerShell est un outil qui permet de communiquer avec un ordinateur en tapant des commandes.** Il sert à gérer les fichiers, contrôler les programmes et automatiser des tâches. Au lieu de cliquer partout dans une interface, on écrit des instructions dans un shell que l'ordinateur exécute.

Les commandes (cmdlets) suivent toujours la forme **Verbe-Nom** : `Get-NetAdapter`, `Set-TimeZone`, `Restart-Computer`…

---

## Trouver une commande

Lister les commandes qui contiennent un mot :
```powershell {copy=true}
Get-Command *DNS*
```

Afficher la syntaxe (paramètres) d'une commande :
```powershell {copy=true}
Get-Command Install-ADDSDomain -Syntax
```

---

## Aide

```powershell {copy=true}
Get-Help Get-NetAdapter -Examples
Get-Help Get-NetAdapter -Full
```

> [!TIP]
> Lancer `Update-Help` (en administrateur) la première fois pour télécharger l'aide complète.

---

## Pipeline

Le `|` envoie le résultat d'une commande à la suivante :
```powershell {copy=true}
Get-Service | Where-Object Status -eq "Running"
Get-Process | Sort-Object CPU -Descending | Select-Object -First 5
```

Voir les propriétés et méthodes d'un objet :
```powershell {copy=true}
Get-NetAdapter | Get-Member
```

---

## Récapitulatif

| Commande        | Rôle                                    |
|-----------------|-----------------------------------------|
| `Get-Command`   | Chercher une commande                   |
| `Get-Help`      | Lire l'aide d'une commande              |
| `Get-Member`    | Propriétés et méthodes d'un objet       |
| `Where-Object`  | Filtrer les résultats                   |
| `Select-Object` | Garder certaines propriétés / lignes    |
| `Sort-Object`   | Trier les résultats                     |

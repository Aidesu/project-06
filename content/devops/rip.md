---
title: "RIP"
date: 2026-10-01T11:28:01+02:00
draft: false
description: "Configurer le routage dynamique RIP v2 sur un routeur Cisco : réseaux annoncés, redistribution et route par défaut."
tags: ["cisco", "routage", "rip", "réseau"]
categories: ["réseau"]
---

## RIP ?

RIP (Routing Information Protocol) est un protocole de routage dynamique à vecteur de distance : les routeurs s'échangent leurs routes et choisissent le chemin avec le moins de sauts (15 maximum).

---

## Configuration RIP v2

Activer RIP v2 :
```cisco {copy=true}
router rip
version 2
no auto-summary
```

> [!TIP]
> `no auto-summary` empêche RIP de résumer les réseaux à leur classe (A, B, C), indispensable avec des sous-réseaux.

Annoncer un réseau directement connecté :
```cisco
network 10.0.200.0
```

Redistribuer les routes statiques et annoncer la route par défaut :
```cisco {copy=true}
redistribute static
default-information originate
```

> [!WARNING] Route par défaut
> `default-information originate` n'annonce la route par défaut que si elle existe sur le routeur (`ip route 0.0.0.0 0.0.0.0 [NEXT-HOP]`).

---

## Vérification

| Commande                  | Affiche                              |
|---------------------------|--------------------------------------|
| `show ip route rip`       | Routes apprises par RIP (`R`)        |
| `show ip protocols`       | Version, réseaux annoncés, voisins   |
| `show running-config \| section rip` | Configuration RIP          |

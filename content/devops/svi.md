---
title: "SVI"
date: 2026-10-01T11:00:00+02:00
draft: false
description: "Configurer une SVI (Switched Virtual Interface) pour donner une IP de management à un switch Cisco."
tags: ["cisco", "switch", "vlan", "réseau"]
categories: ["réseau"]
---

## SVI ?

Une SVI (Switched Virtual Interface) est une interface virtuelle associée à un VLAN. Elle donne une adresse IP au switch pour l'administrer à distance.

---

## Configuration

Créer la SVI du VLAN de management :
```bash
interface vlan 99
```

Configurer l'IP et activer l'interface :
```bash
ip address 10.0.99.5 255.255.255.0
no shutdown
exit
```

Configurer la gateway :
```bash
ip default-gateway 10.0.99.1
```

> [!WARNING] SVI en *down*
> La SVI reste `down` tant que le VLAN n'existe pas et qu'aucun port actif n'y est affecté (access ou trunk). Voir [[switch#VLAN]].

---

## Vérification

| Commande                  | Affiche                              |
|---------------------------|--------------------------------------|
| `show ip interface brief` | État et IP de `Vlan99`               |
| `show running-config`     | Configuration de la SVI et gateway   |
| `ping 10.0.99.1`          | Joignabilité de la gateway           |

> [!NOTE]
> Pour administrer le switch à distance via cette IP, voir [[connect-ssh|la connexion SSH]].

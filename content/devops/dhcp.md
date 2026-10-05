---
title: "DHCP"
date: 2026-10-05T14:49:00+04:00
draft: false
description: "Serveur DHCP sur routeur Cisco (pool, exclusions, relais)."
tags: ["cisco", "dhcp", "réseau"]
categories: ["réseau"]
---

## DHCP ?

Le DHCP (Dynamic Host Configuration Protocol) attribue automatiquement une adresse IP, une passerelle et un DNS aux machines d'un réseau.

---

## Routeur serveur DHCP

Exclure les adresses réservées (routeur, serveurs, imprimantes…) :
```cisco {copy=true}
ip dhcp excluded-address 10.0.99.1 10.0.99.50
```

> [!TIP]
> Les exclusions se configurent **en dehors** du pool, en mode `configure terminal`.

Créer le pool :
```cisco {copy=true}
ip dhcp pool [NAME]
network 10.0.99.0 255.255.255.0
default-router 10.0.99.1
dns-server 8.8.8.8
exit
```

---

## Relais DHCP

Si le serveur DHCP est sur un autre réseau, l'indiquer sur l'interface du routeur côté clients :
```cisco {copy=true}
interface g0/0.99
ip helper-address 10.0.100.100
exit
```

> [!WARNING] Broadcast
> Une requête DHCP est un broadcast : elle ne traverse pas le routeur sans `ip helper-address`.

---

## Vérification

| Commande                    | Affiche                              |
|-----------------------------|--------------------------------------|
| `show ip dhcp binding`      | Adresses attribuées (IP ↔ MAC)       |
| `show ip dhcp pool`         | Pools, plages et adresses utilisées  |
| `show ip dhcp conflict`     | Conflits d'adresses détectés         |

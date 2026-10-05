---
title: "LACP"
date: 2026-10-05T14:49:00+04:00
draft: false
description: "Agréger des liens entre switchs (EtherChannel LACP)."
tags: ["cisco", "switch", "lacp", "etherchannel", "réseau"]
categories: ["réseau"]
---

## LACP ?

LACP (Link Aggregation Control Protocol) regroupe plusieurs liens physiques en un seul lien logique (EtherChannel) : plus de bande passante et de la redondance si un câble tombe.

---

## Configuration EtherChannel

À faire sur **les deux switchs**.

Regrouper les interfaces :
```cisco {copy=true}
interface range fa0/23-24
channel-group 1 mode active
exit
```

> [!TIP] Modes LACP
> `active` négocie, `passive` attend. Au moins un côté doit être en `active`.

Configurer le port-channel en trunk :
```cisco {copy=true}
interface port-channel 1
switchport mode trunk
switchport trunk allowed vlan 50,100
switchport trunk native vlan 99
exit
```

> [!WARNING] Configuration identique
> Les interfaces du groupe doivent avoir la même vitesse, le même duplex et les mêmes VLANs, sinon le lien ne monte pas.

---

## Vérification

| Commande                      | Affiche                                  |
|-------------------------------|------------------------------------------|
| `show etherchannel summary`   | Groupes, protocole, état des ports (`P` = actif) |
| `show interfaces port-channel 1` | État du lien logique                  |
| `show interfaces trunk`       | VLANs autorisés et VLAN natif            |

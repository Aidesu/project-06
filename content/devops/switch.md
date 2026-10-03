---
title: "Switch"
date: 2026-10-02T14:05:21+02:00
draft: false
description: "Aide-mémoire des commandes Cisco IOS pour configurer un switch : interfaces, VLAN, trunk, management et sauvegarde."
tags: ["cisco", "switch", "vlan", "réseau"]
categories: ["réseau"]
---

## Switch ?

Un switch est un équipement réseau qui relie plusieurs appareils entre eux afin qu'ils puissent communiquer au sein d'un même réseau local.

---

## Modes IOS

| Prompt               | Mode           | Usage                          |
|----------------------|----------------|--------------------------------|
| `Switch>`            | Utilisateur    | Consultation limitée           |
| `Switch#`            | Privilégié     | Commandes `show`, sauvegarde   |
| `Switch(config)#`    | Configuration  | Réglages globaux               |
| `Switch(config-if)#` | Interface      | Réglages d'une interface       |

---

## Commandes de base

Passer en mode privilégié :
```bash {copy=true}
enable
```

Passer en mode configuration :
```bash {copy=true}
configure terminal
```

Changer le nom du switch :
```bash
hostname [NAME]
```

Désactiver la résolution DNS :
```bash {copy=true}
no ip domain-lookup
```

> [!TIP]
> Évite d'attendre de longues secondes quand une commande mal tapée est interprétée comme un nom d'hôte.

Quitter le mode actuel :
```bash {copy=true}
exit
```

Revenir directement au mode privilégié :
```bash {copy=true}
end
```

---

## Interfaces

Afficher les interfaces :
```bash {copy=true}
show ip interface brief
```

Sélectionner une interface :
```bash
interface f0/1
```

Sélectionner plusieurs interfaces :
```bash
interface range f0/1-16
```

Activer une interface :
```bash {copy=true}
no shutdown
```

Désactiver une interface :
```bash {copy=true}
shutdown
```

Ajouter une description :
```bash
description [DESCRIPTION]
```

Afficher l'état des interfaces :
```bash {copy=true}
show interfaces status
```

| Abréviation | Interface          | Débit     |
|-------------|--------------------|-----------|
| `f0/1`      | FastEthernet0/1    | 100 Mb/s  |
| `g0/1`      | GigabitEthernet0/1 | 1 Gb/s    |

---

## VLAN

Les VLANs permettent de diviser un réseau physique en plusieurs réseaux logiques indépendants afin de mieux organiser et sécuriser les communications.

Créer un VLAN :
```bash
vlan 10
name MY_VLAN
```

Afficher les VLANs :
```bash {copy=true}
show vlan brief
```

Affecter une interface à un VLAN :
```bash
interface f0/1
switchport mode access
switchport access vlan 10
```

Affecter une range d'interfaces à un VLAN :
```bash
interface range f0/1-16
switchport mode access
switchport access vlan 10
```

---

## Trunk

Un trunk transporte plusieurs VLANs sur un seul lien, généralement entre deux switchs ou vers un routeur.

Passer une interface en trunk :
```bash
interface g0/1
switchport mode trunk
```

Afficher les trunks :
```bash {copy=true}
show interfaces trunk
```

> [!WARNING] Native VLAN
> Le VLAN natif (non tagué, VLAN 1 par défaut) doit être identique des deux côtés du trunk, sinon IOS remonte un *native VLAN mismatch*.

---

## IP de management

Configurer une IP sur le VLAN de management :
```bash
interface vlan 1
ip address 192.168.1.2 255.255.255.0
no shutdown
```

Configurer la gateway :
```bash
ip default-gateway 192.168.1.1
```

> [!NOTE]
> Pour un VLAN de management dédié, voir [[svi|la configuration SVI]]. Pour administrer le switch à distance, voir [[connect-ssh|la connexion SSH]].

---

## Vérification

| Commande                 | Affiche                         |
|--------------------------|---------------------------------|
| `show running-config`    | Configuration actuelle (RAM)    |
| `show startup-config`    | Configuration sauvegardée       |
| `show vlan brief`        | VLANs et ports associés         |
| `show mac address-table` | Table MAC                       |
| `show version`           | Informations du switch          |
| `ping [IP]`              | Test de connexion               |

---

## Sauvegarde

Sauvegarder la configuration :
```bash {copy=true}
copy running-config startup-config
```

Alternative :
```bash {copy=true}
write memory
```

> [!CAUTION]
> Sans sauvegarde, toute la configuration est perdue au redémarrage du switch.

---
title: "Connect SSH"
date: 2026-10-01T11:03:26+02:00
draft: false
description: "Activer l'accès SSH sur un switch ou routeur Cisco : utilisateur local, clés RSA et lignes VTY."
tags: ["cisco", "ssh", "sécurité", "réseau"]
categories: ["réseau"]
---

## SSH ?

SSH (Secure Shell) permet d'administrer un équipement à distance via une connexion chiffrée, contrairement à Telnet.

> [!NOTE] Prérequis
> Le switch doit avoir une IP joignable, voir [[svi|la configuration SVI]].

---

## Configuration

Changer le nom de l'équipement :
```cisco
hostname [NAME]
```

Créer un utilisateur local :
```cisco
username [USERNAME] secret [PWD]
```

Définir un nom de domaine :
```cisco
ip domain-name [DOMAIN]
```

Générer les clés RSA et forcer SSH v2 :
```cisco
crypto key generate rsa general-keys modulus 1024
ip ssh version 2
```

> [!TIP]
> Le `hostname` et le `ip domain-name` sont obligatoires : sans eux, la génération des clés RSA échoue.

Autoriser SSH sur les lignes VTY :
```cisco {copy=true}
line vty 0 15
login local
transport input ssh
```

> [!WARNING] Mot de passe enable
> Sans `enable secret [PWD]`, l'accès au mode privilégié est refusé à distance.

---

## Vérification

| Commande                    | Affiche                          |
|-----------------------------|----------------------------------|
| `show ip ssh`               | Version SSH et état du service   |
| `show ssh`                  | Sessions SSH ouvertes            |
| `ssh -l [USERNAME] [IP]`    | Connexion depuis un autre équipement |

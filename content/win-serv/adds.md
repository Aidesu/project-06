---
title: "AD DS"
date: 2026-10-11T12:00:00+02:00
draft: true
description: "Installer Active Directory, créer un domaine et gérer OU, utilisateurs et groupes."
tags: ["windows", "powershell", "active-directory"]
categories: ["windows-server"]
weight: 30
---

## AD DS ?

AD DS (Active Directory Domain Services) centralise les **comptes**, les **ordinateurs** et les **droits** d'un réseau dans un domaine. Le serveur qui l'héberge s'appelle un **contrôleur de domaine** (DC).

> [!NOTE] Prérequis
> Serveur renommé et en IP fixe, voir [[configuration|la configuration]].

---

## Installer le rôle

```powershell {copy=true}
Install-WindowsFeature AD-Domain-Services -IncludeManagementTools
```

> [!TIP]
> `-IncludeManagementTools` installe aussi les outils d'administration (module PowerShell `ActiveDirectory`, consoles).

---

## Créer le domaine (nouvelle forêt)

Tester avant d'installer :
```powershell {copy=true}
Test-ADDSForestInstallation -DomainName "ad.deafiaa.com" -InstallDns
```

Créer la forêt et le domaine :
```powershell {copy=true}
Install-ADDSForest -DomainName "ad.deafiaa.com" -DomainNetbiosName "DEAFIAA" -InstallDns
```

Le mot de passe **DSRM** (mode restauration) est demandé, puis le serveur redémarre automatiquement.

> [!TIP] Nom de domaine
> Utiliser un sous-domaine d'un domaine que l'on possède (`ad.deafiaa.com`) plutôt que `.local`.

> [!WARNING] DNS
> Après l'installation, le DNS du serveur doit pointer vers **lui-même** : les clients du domaine utilisent ce DC comme serveur DNS.

| Commande                        | Cas                                         |
|---------------------------------|---------------------------------------------|
| `Install-ADDSForest`            | Premier DC : nouvelle forêt + domaine       |
| `Install-ADDSDomainController`  | Ajouter un DC à un domaine existant         |
| `Install-ADDSDomain`            | Nouveau domaine dans une forêt existante    |

---

## Vérification

```powershell {copy=true}
Get-ADDomain
Get-ADForest
Get-ADDomainController
Get-Service ADWS, KDC, Netlogon, DNS
```

---

## OU, utilisateurs et groupes

Créer une OU (unité d'organisation, un « dossier » d'objets) :
```powershell {copy=true}
New-ADOrganizationalUnit -Name "Utilisateurs" -Path "DC=ad,DC=deafiaa,DC=com"
```

Créer un utilisateur (le mot de passe est demandé, jamais écrit en clair) :
```powershell {copy=true}
New-ADUser -Name "Jean Dupont" -SamAccountName "jdupont" -UserPrincipalName "jdupont@ad.deafiaa.com" -Path "OU=Utilisateurs,DC=ad,DC=deafiaa,DC=com" -AccountPassword (Read-Host -AsSecureString "Mot de passe") -Enabled $true
```

Créer un groupe et y ajouter l'utilisateur :
```powershell {copy=true}
New-ADGroup -Name "GG_Compta" -GroupScope Global -Path "OU=Utilisateurs,DC=ad,DC=deafiaa,DC=com"
Add-ADGroupMember -Identity "GG_Compta" -Members "jdupont"
```

> [!NOTE] Chemin (DN)
> `ad.deafiaa.com` s'écrit `DC=ad,DC=deafiaa,DC=com` ; une OU s'ajoute devant : `OU=Utilisateurs,DC=...`.

| Commande                | Affiche                          |
|-------------------------|----------------------------------|
| `Get-ADUser -Filter *`  | Tous les utilisateurs            |
| `Get-ADGroup -Filter *` | Tous les groupes                 |
| `Get-ADGroupMember [G]` | Membres d'un groupe              |
| `Get-ADOrganizationalUnit -Filter *` | Toutes les OU       |

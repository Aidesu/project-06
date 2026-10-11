---
title: "Configuration"
date: 2026-10-10T12:15:00+02:00
draft: false
description: "Nom, fuseau horaire et configuration réseau (IP fixe, DHCP) en PowerShell."
tags: ["windows", "powershell", "réseau"]
categories: ["windows-server"]
weight: 20
---

## Configuration serveur

> [!NOTE] Prérequis
> Ouvrir PowerShell **en administrateur**. Bases : voir [[powershell|PowerShell]].

Afficher le nom actuel :
```powershell {copy=true}
hostname
```

Renommer le serveur (redémarrage nécessaire) :
```powershell {copy=true}
Rename-Computer -NewName "SRV-HV01" -Restart
```

Régler le fuseau horaire (Paris) :
```powershell {copy=true}
Set-TimeZone -Id "Romance Standard Time"
```

Redémarrer / éteindre :
```powershell {copy=true}
Restart-Computer
Stop-Computer
```

---

## Réseau

### Afficher la configuration

```powershell {copy=true}
Get-NetAdapter
Get-NetIPConfiguration
Get-NetIPAddress -AddressFamily IPv4
Get-NetRoute -DestinationPrefix "0.0.0.0/0"
Get-DnsClientServerAddress
```

> [!TIP]
> Le nom de l'interface (`InterfaceAlias`, ex. `Ethernet`) se lit dans `Get-NetAdapter`.

---

### IP fixe

```powershell {copy=true}
$if = "Ethernet"

Set-NetIPInterface -InterfaceAlias $if -Dhcp Disabled
Remove-NetIPAddress -InterfaceAlias $if -AddressFamily IPv4 -Confirm:$false
Remove-NetRoute -InterfaceAlias $if -DestinationPrefix "0.0.0.0/0" -Confirm:$false

New-NetIPAddress -InterfaceAlias $if -IPAddress 10.100.100.200 -PrefixLength 8 -DefaultGateway 10.0.0.1
Set-DnsClientServerAddress -InterfaceAlias $if -ServerAddresses 10.100.100.100, 9.9.9.9
```

> [!WARNING] Passerelle
> La passerelle doit être dans le même réseau que l'IP (ici `10.0.0.0/8`), sinon `New-NetIPAddress` échoue.

> [!NOTE]
> `Remove-NetRoute` renvoie une erreur s'il n'y a pas de route par défaut : sans gravité.

---

### Repasser en DHCP

```powershell {copy=true}
$if = "Ethernet"

Set-NetIPInterface -InterfaceAlias $if -Dhcp Enabled
Set-DnsClientServerAddress -InterfaceAlias $if -ResetServerAddresses
```

---

### Tester

```powershell {copy=true}
Test-NetConnection 1.1.1.1
Test-NetConnection 10.100.150.200 -Port 443
Resolve-DnsName deafiaa.com
```

| Commande                         | Vérifie                              |
|----------------------------------|--------------------------------------|
| `Test-NetConnection [IP]`        | Ping (connectivité)                  |
| `Test-NetConnection [IP] -Port`  | Port TCP ouvert                      |
| `Resolve-DnsName [NOM]`          | Résolution DNS                       |

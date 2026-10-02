---
title: "Connect SSH"
date: 2026-10-01T11:03:26+02:00
draft: false
tags: []
categories: []
---

## Configuration SSH

SSH (Secure Shell)

```markdown {copy=true}
hostname [name]
```

```markdown {copy=true}
username [username] secret [pwd]
```

```markdown {copy=true}
ip domain-name [domain]
```
```markdown {copy=true}
crypto key generate rsa general-keys modulus 1024
ip ssh version 2
```
```markdown {copy=true}
line vty 0 15
login local
transport input
```


> [!NOTE]
> Creer un mot de passe dans la machine `enable secret [PWD]`

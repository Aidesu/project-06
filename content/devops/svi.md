---
title: "SVI"
date: 2026-10-01T11:00:00+02:00
draft: false
tags: []
categories: []
---

## Configuration SVI

SVI (Switched Virtual Interface)

```markdown {copy=true}
interface vlan 99
```

```markdown {copy=true}
ip address 10.0.99.5 255.255.255.0
exit
ip default-gateway 10.0.99.1
```

---
title: "RIP"
date: 2026-10-01T11:28:01+02:00
draft: false
tags: []
categories: []
---

## Configuration RIP v2

RIP (Routing Information Protocole)

```markdown
router rip
version 2
no auto-summary
```

```markdown
network 10.0.200.0
```

```markdown
redistribute static
default-information originate
```

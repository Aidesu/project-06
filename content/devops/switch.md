---
title: "Switch"
date: 2026-10-02T14:05:21+02:00
draft: false
tags: []
categories: []
---

## Switch

```markdown
Switch(config)#vlan 10
Switch(config-vlan)#name EMPLOYEE
Switch(config-vlan)#vlan 20
Switch(config-vlan)#name SERVERS
Switch(config-vlan)#vlan 99
Switch(config-vlan)#name ADMIN
```

Affectation des vlans au ports

```markdown
Switch(config)#interface range f0/0-15
Switch(config-if-range)#switchport access vlan 10
Switch(config-if-range)#exit
Switch(config)#int range f0/16-20 
Switch(config-if-range)#switchport access vlan 20
Switch(config-if-range)#exit
Switch(config)#int f0/41
Switch(config-if)#switchport access vlan 99
Switch(config-if)#exit
Switch(config)#int g0/1
Switch(config-if)#switchport mode trunk
```
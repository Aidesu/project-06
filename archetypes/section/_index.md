---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
date: {{ .Date }}
draft: false
description: ""
# Couverture (ratio 2:3), chemin depuis static/ — sans image, couverture dégradée par défaut :
# cover: "images/covers/{{ .File.ContentBaseName }}.svg"
weight: {{ mul (add (len site.Sections) 1) 10 }}
---

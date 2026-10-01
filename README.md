<div align="center">

# LittleWiki

**Personal technical documentation, built as code.**

DevOps notes, networking, commands and procedures, a static, dependency-free wiki generated with Hugo.

[![Hugo](https://img.shields.io/badge/Hugo-Extended%200.146+-FF4088?logo=hugo&logoColor=white)](https://gohugo.io/)
[![Markdown](https://img.shields.io/badge/Markdown-YAML%20Front%20Matter-000000?logo=markdown&logoColor=white)](https://commonmark.org/)
[![Mermaid](https://img.shields.io/badge/Mermaid-12-FF3670?logo=mermaid&logoColor=white)](https://mermaid.js.org/)
[![Fuse.js](https://img.shields.io/badge/Fuse.js-7.5-2C3E50)](https://www.fusejs.io/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](#-license)
[![Built with Claude Code](https://img.shields.io/badge/Built%20with-Claude%20Code-D97757?logo=anthropic&logoColor=white)](https://claude.com/claude-code)

Live on **[https://wiki.deafiaa.com](https://wiki.deafiaa.com)**.

</div>

---

## 📑 Table of Contents

- [Features](#-features)
- [Prerequisites](#-prerequisites)
- [Getting Started](#-getting-started)
- [Production Build / CI](#-production-build--ci)
- [Writing Content](#-writing-content)
- [Project Structure](#-project-structure)
- [License](#-license)

---

## ✨ Features

| Module                  | Description                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------ |
| 📚 **Bookshelf**        | Home page listing every documentation as a book cover                                |
| 🔎 **Search**           | Client-side full-text search with Fuse.js (`/` shortcut), no backend                 |
| 📊 **Diagrams as code** | Native rendering of ` ```mermaid ` code blocks                                       |
| 💬 **Callouts**         | Note, tip, warning and error blocks  Markdown alerts or Hugo shortcode              |
| 🔗 **Wiki links**       | Obsidian-style `[[page]]` internal links with automatic backlinks                    |
| 🧭 **Table of contents**| Sticky sidebar highlighting the section currently being read                         |
| 📋 **Code blocks**      | "Copy" button on every code block, plus reading time on each article                 |
| 🎨 **Modern UI**        | Dark theme, responsive, still usable without JavaScript                              |

---

## ✅ Prerequisites

- [Hugo](https://gohugo.io/installation/) **Extended 0.146+** (`hugo version` must print `+extended`)

---

## 🚀 Getting Started

```bash
# Start the development server (live reload)
hugo server

# Production build into public/
hugo --minify --panicOnWarning
```

The site is then available at **[http://localhost:1313](http://localhost:1313)**.

> 💡 `--panicOnWarning` makes the build fail on a broken `[[…]]` link, a missing cover image or an unknown callout type.

---

## 📦 Production Build / CI

| Command                                              | Action                                                                     |
| ---------------------------------------------------- | -------------------------------------------------------------------------- |
| `scripts/build.sh`                                   | Strict build with the locally installed Hugo                               |
| `scripts/build.sh --install --base-url <url>`        | Downloads the pinned Hugo (0.167.0), verifies its SHA-256, then builds     |
| `scripts/build.sh --lint`                            | Also runs markdownlint-cli2 and lychee                                     |
| `scripts/build.sh --help`                            | Lists every option                                                         |

In CI (`CI=true`), the pinned Hugo version is downloaded automatically into `.cache/`. The script builds in strict mode, then checks the generated site (search index, no private files).

---

## ✍️ Writing Content

```bash
# New documentation (a new book on the shelf)
hugo new content --kind section terraform

# New article
hugo new content terraform/getting-started.md
```

Each documentation can have a cover: a 2:3 image in `static/images/covers/`, referenced by `cover` in the section's `_index.md`.

| Syntax                                                   | Result                                  |
| -------------------------------------------------------- | --------------------------------------- |
| ` ```mermaid `                                           | Mermaid diagram                         |
| `> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`, `> [!CAUTION]`  | Callout                                 |
| `{{< callout type="tip" title="…" >}}…{{< /callout >}}`  | Callout (shortcode)                     |
| `[[page]]`, `[[page\|label]]`, `[[page#section]]`        | Internal link + automatic backlink      |

Detailed cheat sheets are available in the wiki's **Guides** documentation.

---

## 📁 Project Structure

```
archetypes/              # Templates for new pages (article, section)
assets/
├── css/                 # Stylesheet (theme variables at the top of main.css)
└── js/                  # Scripts (copy, search, ToC, Mermaid)
    └── vendor/          #   Bundled libraries  versions & licenses in its README
content/                 # Markdown content (one folder = one documentation)
layouts/                 # Hugo templates
scripts/
└── build.sh             # Production / CI build
static/
└── images/              # Images and cover art
```

---

## 📄 License

Released under the **MIT** License. See the `LICENSE` file for details.
Bundled libraries: Fuse.js (Apache-2.0), Mermaid (MIT).

---

<div align="center">

created by **Carla Deafiaa**

</div>

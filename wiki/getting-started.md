---
title: Teste
order: 1
---

# Introduction

Welcome to the **SerJunior** wiki. This page is a markdown file located at `wiki/introduction.md`.

## How the wiki works

All markdown files inside the `wiki/` folder are automatically picked up and listed in the sidebar. The sidebar is generated at build time — no manual config needed.

## Frontmatter fields

Each page supports the following frontmatter fields at the top of the file:

| Field     | Type    | Description                                          |
|-----------|---------|------------------------------------------------------|
| `title`   | string  | Display name in the sidebar (falls back to filename) |
| `order`   | number  | Sort order within the section (default: 999)         |
| `section` | string  | Override the section heading for subdirectory pages  |

## Raw HTML

Because `rehype-raw` is enabled, you can drop raw HTML anywhere in your markdown:

<div style="background: #ede9fe; border-radius: 8px; padding: 1rem; margin: 1rem 0;">
  <strong>Custom HTML block</strong> — style it however you like.
</div>

## Adding pages

1. Create a `.md` file anywhere inside `wiki/`
2. Add frontmatter with at least a `title`
3. The sidebar updates automatically on the next build (or hot-reload in dev)

## Subdirectory sections

Files in subdirectories become sidebar sections:

```
wiki/
  introduction.md       ← root level
  getting-started.md    ← root level
  advanced/
    configuration.md    ← "Advanced" section
    deployment.md       ← "Advanced" section
```

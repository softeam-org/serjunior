---
title: Getting Started
order: 2
---

# Getting Started

## Development

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. The wiki renders at `/#/wiki/introduction`.

## Building

```bash
npm run build
```

Output lands in `dist/`.

## Deployment

Push to `main` — the GitHub Actions workflow builds and deploys to the `gh-pages` branch automatically.

> **Note:** Make sure GitHub Pages is set to serve from the `gh-pages` branch in your repository settings.

## Writing wiki pages

Create a markdown file in `wiki/`, add frontmatter, and you're done:

```markdown
---
title: My New Page
order: 3
---

# My New Page

Content goes here. You can use **Markdown**, `code`, and even raw HTML.

<div class="my-custom-class">
  <p>Custom HTML layout!</p>
</div>
```

## Styling

- **Wiki styles** → `src/styles/wiki.css`
- **Landing page styles** → `src/styles/landing.css`
- **Global / CSS variables** → `src/styles/global.css`

CSS variables are defined in `global.css` and used everywhere, so changing a color in one place updates the whole site.

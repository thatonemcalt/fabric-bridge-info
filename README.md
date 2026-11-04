# FabricBridge site

Static site for the FabricBridge GitHub Pages page. **No build tooling** — plain HTML/CSS/JS,
runs anywhere, including straight off a GitHub repo.

```
fabricbridge-site/
├── index.html   ← all content + structure
├── styles.css   ← theme system (dark default + light), all layout
└── app.js       ← terminal demo, boot visualizer, mod explorer, theming, filters
```

## Deploy to GitHub Pages (two options)

**Option A — from this repo (`koolaidguyhey/fabricbridge` or whatever it ends up being):**
1. Copy `index.html`, `styles.css`, `app.js` into a `docs/` folder in the repo (or a `gh-pages` branch).
2. Repo → Settings → Pages → Source: *Deploy from branch* → `main` `/docs`.
3. Site live at `https://koolaidguyhey.github.io/<repo>/`.

**Option B — dedicated repo:** push these three files to a repo named
`koolaidguyhey.github.io` (user site, served at the root) or any repo with Pages enabled.

## Before launch checklist

- [ ] **Logo is pending** — the nav brand + footer currently use a placeholder inline SVG
      bridge glyph in a marked slot (`<!-- LOGO SLOT -->` in `index.html`); swap it (and the
      favicon data-URI in `<head>`) when the real logo lands.
- [ ] The three support cards + a few footer links are `data-soon` placeholders — point them
      at the real GitHub repo / issue templates / Modrinth page when known.
- [ ] Optionally drop an `Inter` webfont link in `<head>` (system fonts are the current
      stack and look fine — the link is just polish).

## Built-in interactive pieces

- **Terminal playground** — emulates `/fb` command surface: `fb status`, `fb why <mod>`
  (axiom/jamlib/automodpack wired; unknown mods get a probe fallback), `fb degraded`,
  `fb skipped`, `whoami`, `stop`, `clear`, command history with ↑/↓.
- **Boot visualizer** — stage bar (agent → census → mixin → entrypoints → world → done)
  with animated log lines from a real belt run's shape.
- **Reality-check disclaimer** — the "mod health" section is one honest card: MOST fabric
  mods work; don't expect ALL to. What degrades does so calmly, with a reason at boot.
- **Dark/light switch** — top-right toggle; persists to `localStorage`, respects
  `prefers-color-scheme` on first visit. Color scheme: emerald ink on slate (dark) /
  warm paper (light).
- Scroll-reveal, scroll-spy nav, count-up stats, copy-buttons, searchable command table.

Accessibility: keyboard-focusable console, `prefers-reduced-motion` respected, semantic
headings, all color pairs checked against the mark scheme (ok/warn/bad = green/amber/red).

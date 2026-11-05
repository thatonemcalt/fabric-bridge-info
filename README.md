# FabricBridge site

Static site for the FabricBridge GitHub Pages page. **No build tooling** — plain HTML/CSS/JS,
runs anywhere, including straight off a GitHub repo.

```
fabricbridge-site/
├── index.html   ← all content + structure
├── styles.css   ← theme system (dark default + light), all layout
└── app.js       ← terminal demo, boot visualizer, mod explorer, theming, filters
```

## Deploy to GitHub Pages — live setup

The site lives in repo **`thatonemcalt/fabric-bridge-info`**, deployed from the
`main` branch root via GitHub Pages:

**Live at: <https://thatonemcalt.github.io/fabric-bridge-info/>**

 Afterwards:
1. Repo → Settings → Pages → Source: *Deploy from branch* → `main` `/`.
2. Site builds at `https://thatonemcalt.github.io/fabric-bridge-info/`.
## Before launch checklist

- [x] **Logo** — `fabric-bridge.png` is the master art; transparent-color derivatives are
      generated in-repo (`fabric-bridge-logo*.png`, `fabric-bridge-favicon.png`) and wired
      into the nav, hero, footer, and favicon.
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

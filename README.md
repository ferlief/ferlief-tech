# ferlief.tech

Personal site and work portfolio: websites and landing pages, advertising pieces, and engineering projects. Hand-written HTML, CSS and JavaScript — no framework, no external dependency, no build step.

## Structure

| Path | What it is |
| --- | --- |
| `index.html` | Home: offer, services, featured work, process, contact |
| `sites/` | Websites and landing pages showcase |
| `sites/clinica-vitalis/` | Demonstration piece: medical clinic landing page |
| `design/` | Design and advertising showcase |
| `design/serra-alta/` | Demonstration piece: product advertising campaign |
| `projetos/` | Open repositories, built from `data/atividade.json` |
| `experiencia/`, `blog/` | Text pages |
| `porta-voz/` | Chatbot that answers only with reviewed text and cites its source |
| `css/`, `js/` | Design system and site modules |
| `CODE_STANDARDS.md` | Code standard: language, naming, tests, security |

Both demonstration pieces are **fictional brands**, labeled as such in a bar at the top of each page. No real client, borrowed name, or invented result appears in this portfolio.

Each piece carries its own CSS and does not load `css/base.css`: a demonstration needs the client's identity, not the portfolio's, and it needs to keep standing if the surrounding site changes its look.

Some directory names are Portuguese (`projetos/`, `experiencia/`, `porta-voz/`, `data/atividade.json`). They are published URLs — renaming them breaks links and search rankings, so they stay. New paths are English.

## Porta-voz

`porta-voz/` is a chatbot that answers questions about my work using only text I wrote and reviewed, citing the source file, and abstaining when it finds no basis. Retrieval is BM25 in plain JavaScript over a static index; rewriting the result into prose is optional, behind a click, and runs through WebGPU on the visitor's own machine.

There is no server and no API key — the spend ceiling is zero by construction, and the typed question never leaves the tab.

The source, tests, evaluation set and threat model live in `ferlief/porta-voz` (private). Only the copies the site serves are here: `js/porta-voz/`, `css/porta-voz.css` and `data/porta-voz-indice.json`. Do not edit those copies — the next sync overwrites them.

The published index holds the full text of every passage and is public by construction: only what passed the review gate in the other repository is in it.

It answers in Portuguese, because the reviewed corpus behind it is my own writing in Portuguese.

## Technical decisions

- **No image files.** Icons are inline SVG, packaging is a gradient box, avatars are initials. The pieces open instantly on any connection and can be rescaled without re-exporting.
- **Container queries.** Text inside each advertising piece is sized in `cqw`, so the A3 poster and the story keep their internal proportions at any screen width.
- **Light and dark themes** and **PT/EN language** cover the whole site, persisted in `localStorage`, falling back to the browser's preference (`js/tema.js`, `js/idioma.js`, `js/i18n.js`).
- **Activity feed** in the footer: `data/atividade.json`, updated by `.github/workflows/atividade.yml` from GitHub's public API. It only reads — it never invents a number.

The interchangeable layout engine (Mouse Tracker and Million Dollar Homepage) was removed in favor of a commercial site. It remains in history, at commit `ed893c4`.

## Run locally

```
python -m http.server 8420
```

## License

MIT — full visibility is the point.

# Contributing to ferlief-tech

## Language

**English, everywhere.** Code, comments, commit messages, branch
names, and the documentation in this repository.

Two narrow exceptions: the copy the site's visitors read — which lives
in the PT/EN dictionary (`js/i18n.js`) and in the demonstration pieces
under `sites/` and `design/` — and domain terms that change meaning
when translated. `CODE_STANDARDS.md` has the full rule.

## Commit messages

**[Conventional Commits](https://www.conventionalcommits.org/),
imperative mood.** This is the one repository in the ecosystem whose
explicit purpose is to be read by people hiring (see `CLAUDE.md`), so
the reason is sharper here — but the rule is the same everywhere now:
the standard of people who write software seriously, not something
specific to this repository.

```
<type>(<scope>): short imperative summary, ≤50 chars

Body explaining WHY this change exists, not what changed — the diff
already shows what. Wrap at ~72 columns.
```

Common types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`,
`build`, `ci`.

This is guidance going forward, not a history rewrite — earlier
Portuguese commits stay as they are. Rewriting published history
(`git rebase`, `filter-branch`) is not something to do for a style
convention.

No attribution line for code-generation tooling. `.claude/settings.json`
enforces this for Claude Code sessions.

References: [conventionalcommits.org](https://www.conventionalcommits.org/)
for the format, Chris Beams's seven rules ("How to Write a Git Commit
Message") for the prose.

## Code standards

`CODE_STANDARDS.md` defines how the code is written: language, naming,
comments, structure, errors, tests, security, accessibility. **Read it
before writing code.**

## Before opening a PR

The site has no framework and no build step, deliberately — it is part
of the showcase: the demonstration pages in `sites/` and `design/`
prove that a finished piece ships with nothing but HTML and CSS. A
contribution that introduces an external dependency or a build step
changes the point of the project; discuss it before opening the PR.

Two rules that are not negotiable in the portfolio pieces: **a
fictional brand is labeled fictional** on the page itself, and **no
number goes in without a source** — not in a testimonial, not in a
results metric.

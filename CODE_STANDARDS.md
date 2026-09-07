# Code standards

How code and documentation are written across this ecosystem.

`CONTRIBUTING.md` covers commit format and the rules specific to the
portfolio pieces. This file covers the code itself.

---

## 1. Language

**Everything is written in English.** Identifiers, file and directory
names, comments, commit messages, branch names, test names, log
output, error messages — and the repository's documentation:
`README.md`, `CONTRIBUTING.md`, `CLAUDE.md`, design notes, threat
models, evaluation protocols.

This holds regardless of the language spoken while the code is being
written. Conversation language and code language are independent
axes: a discussion in Portuguese that produces `calcularTotal`, and a
later one in English that produces `calculateTotal`, leaves one
codebase with two vocabularies for the same idea. That is the exact
failure a convention exists to prevent.

**Why English rather than the author's first language:**

- Every language keyword, every standard library, and every
  third-party API is already in English. Portuguese identifiers force
  the reader to switch languages mid-expression:
  `const passagens = results.filter(...)`.
- A repository whose stated purpose is to be read by people hiring is
  read by people who do not speak Portuguese. Code that cannot be
  read is code that cannot be evaluated.
- Contributors, tooling, linters, and error messages assume it.

**The exceptions**, all narrow:

- **Copy the audience reads.** Interface strings, page content, and
  the demonstration pieces serve Brazilian clients; their language is
  a commercial decision. On this site that copy lives in the PT/EN
  dictionary (`js/i18n.js`) and inside `sites/` and `design/`.
  Documentation is not covered by this exception — a `README.md` is
  read by the people evaluating the work, and half of them do not
  read Portuguese.
- **A project written for a Portuguese-speaking community.**
  `protocolo-vies` is written for Latin American researchers; its
  audience is the reason it exists, so it stays in Portuguese
  end to end. This is an exception granted per project and stated out
  loud, never assumed.
- **Domain terms with no honest translation.** A legal, cultural, or
  regulatory term that changes meaning when translated (`CPF`, `CNPJ`,
  `SUS`) keeps its original form. Document it in a comment the first
  time it appears. This exception covers proper nouns, not laziness:
  `corpus`, `layout`, and `evidence` all translate fine.
- **A published path.** A directory that is already a live URL
  (`projetos/`, `experiencia/`, `porta-voz/`) is not renamed: the cost
  is broken links and lost search rankings, paid by visitors, for a
  consistency nobody sees. New paths are English.

## 2. Naming

Names carry intent. Length is not a cost worth optimizing.

- `camelCase` for variables and functions in JavaScript;
  `snake_case` in Python. `PascalCase` for classes in both.
  `SCREAMING_SNAKE_CASE` for module-level constants.
- `kebab-case` for file and directory names on the web;
  `snake_case` for Python modules.
- Functions are verb phrases (`buildIndex`, `hasEnoughEvidence`).
  Booleans read as predicates (`isReviewed`, `hasMatch`) — never
  `flag`, `status`, or a bare noun.
- Say what the value *is*, not what type it has. `passages`, not
  `passageArray`.
- No abbreviation that is not already universal in the domain. `idf`
  and `bm25` are fine in a retrieval module; `psg` for passage is not.
- A name that needs a comment to be understood is the wrong name.
  Fix the name.

## 3. Comments

**Comment the why, never the what.** The diff shows what changed and
the code shows what it does. Neither shows why the author chose this
over the obvious alternative.

Worth writing:

- The reason a non-obvious approach was taken, and what was rejected.
- A constraint that is invisible from the code: a contract with
  another file, an ordering that matters, a value that must stay in
  sync somewhere else.
- A bug that motivated a line, so nobody "simplifies" it back.
- Anything the next reader would otherwise have to re-derive.

Not worth writing:

- `// increment the counter` above `counter++`.
- Commented-out code. Git remembers it; delete it.
- A comment that repeats the function name in a sentence.

Comments go stale silently. When code changes, the comments around it
are part of the change.

## 4. Structure

- **One reason to change per module.** A file that both fetches data
  and renders it has two reasons to change, and both edits will
  collide.
- **Separate signal from policy.** Measurement and computation in one
  place; thresholds and decisions in another, where they can be seen
  and adjusted without touching the logic.
- **Fail closed.** When a gate cannot determine that something is
  allowed, it denies. The default of any security- or
  privacy-relevant decision is the safe one, and the unsafe path
  requires an explicit affirmative signal.
- **Pure where possible.** A function that maps input to output
  without touching global state is a function you can test.
- **No dependency without a reason that survives being said out
  loud.** In this repository specifically, no external dependency and
  no build step — that constraint is part of the portfolio, not an
  accident. See `CONTRIBUTING.md`.

## 5. Errors

- Fail loudly and early. A silent fallback hides the bug and moves
  the failure somewhere unrelated.
- Catch the specific error, never the broad one. A bare `except:` or
  `catch (e) {}` swallows the failure you most need to see.
- The message names what failed and what to do: not `invalid input`,
  but `expected reviewed: true, got 'True' — see corpus/_READ-FIRST.md`.
- Never expose an internal path, token, or stack trace to a user.

## 6. Tests

- Every bug fixed gets a test that fails without the fix. Otherwise
  it comes back.
- Test behavior, not implementation. A test that breaks on a rename
  and not on a wrong answer is a liability.
- Name the test after what it proves:
  `test_gate_rejects_true_variants`, not `test_gate_2`.
- **A contract between two implementations gets a shared fixture.**
  When the same rule is written twice — once in a build script, once
  in the browser — a fixture generated by one and asserted by the
  other is the only thing that catches drift. Drift there fails
  silently: the search returns nothing and raises no error.
- Tests run without network, without a real dataset, and in any
  order.

## 7. Security and privacy

- **Never build markup by concatenating text you did not write.**
  User input, file content, and model output go into the DOM as
  `textContent`, never `innerHTML`.
- Secrets live in the environment, never in the repository, never in
  client-side code. A key shipped to a browser is a published key.
- Prefer removing a class of attack to mitigating it. No endpoint
  cannot be flooded; no key cannot leak. Architecture beats
  configuration, because configuration is what is wrong at 3 a.m.
- Pin external dependencies to an exact version. A CDN URL without a
  version is a dependency that changes underneath you.
- Anything published is public forever, including in git history.
  Decide before committing, not after.

## 8. Accessibility and internationalization

- Semantic HTML before ARIA. A `<button>` beats a `<div role="button">`.
- Every interactive element is reachable and operable by keyboard,
  with a visible focus style.
- Every image has `alt`; decorative ones get `alt=""`.
- Color is never the only carrier of meaning.
- Respect the user's declared preferences — theme, language, reduced
  motion — over the browser's defaults, and never override an
  explicit choice with a system one.
- User-facing strings live in the dictionary, not in the markup. A
  page that skips this is the one page that stays untranslated.

## 9. Before opening a pull request

- [ ] Every identifier, comment, and commit message is in English.
- [ ] Commits follow Conventional Commits, imperative mood, body
      explaining why (`CONTRIBUTING.md`).
- [ ] Tests pass, and new behavior has a test.
- [ ] Read your own diff as a hostile reviewer before pushing.
- [ ] Comments near changed code are still true.
- [ ] Nothing secret, personal, or unreviewed is in the diff.
- [ ] Known limitations are written down, not left for the reader to
      discover.

## 10. Current state — this is not yet true

Stating a standard is not meeting it. As of 2026-09-07:

| Area | State |
|---|---|
| `README.md`, `CONTRIBUTING.md`, `CLAUDE.md`, `CODE_STANDARDS.md` | English |
| `js/*.js` (`atividade`, `idioma`, `tema`, `projetos`, `i18n`) | Portuguese identifiers and comments |
| `js/porta-voz/*` | Portuguese identifiers and comments |
| `scripts/atualiza_atividade.py` | Portuguese |
| `js/i18n.js` dictionary values | PT and EN — correct, this is visitor copy |
| Commit history | Mixed; Portuguese before 2026-09 |
| Published directory names | Portuguese, and staying — see section 1 |

The rule applies to **new code from now on**. Existing code is
migrated when it is touched for another reason, never in a rename-only
commit that produces a large diff nobody can review.

Commit history is not rewritten for style. `CONTRIBUTING.md` already
says this, and it is right: rewriting published history breaks every
checkout that has it, and buys nothing.

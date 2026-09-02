# Contribuindo com ferlief-tech

## Mensagens de commit

**Inglês, sempre — [Conventional Commits](https://www.conventionalcommits.org/), modo imperativo.** Este é o único repositório do ecossistema cujo objetivo explícito é ser lido por recrutador (ver `CLAUDE.md`), então o motivo é ainda mais direto aqui — mas a regra é a mesma do resto do ecossistema agora: padrão de quem programa de forma séria hoje, não algo específico deste repositório.

```
<type>(<scope>): short imperative summary, ≤50 chars

Body explaining WHY this change exists, not what changed — the diff
already shows what. Wrap at ~72 columns.
```

Tipos comuns: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `build`, `ci`.

Isto é orientação daqui pra frente, não reescrita de histórico — commits anteriores em português ficam como estão. Reescrever histórico público (`git rebase`, `filter-branch`) não é ação a se tomar por padronização de estilo.

Referências: [conventionalcommits.org](https://www.conventionalcommits.org/) para o formato, as 7 regras de Chris Beams ("How to Write a Git Commit Message") para a prosa. Sem linha de atribuição a ferramenta de geração de código.

## Antes de abrir um PR

O motor de layouts (`js/motor.js`, `js/catalogo.js`, `js/layouts/`) é sem framework e sem build step, deliberadamente — é parte da vitrine. Uma contribuição que introduza dependência externa ou etapa de build muda o próprio ponto do projeto; discuta antes de abrir o PR.

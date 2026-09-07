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

## Padrão de código

`CODE_STANDARDS.md` define como o código é escrito: idioma,
nomenclatura, comentários, estrutura, erros, testes, segurança e
acessibilidade. A regra de base é **todo código em inglês** —
identificador, arquivo, comentário e commit — com exceção para texto
que o usuário lê e para termo de domínio sem tradução honesta.

Esse documento está em inglês de propósito: um texto que exige código
em inglês e é escrito em português desmente a própria regra.

## Antes de abrir um PR

O site é sem framework e sem build step, deliberadamente — é parte da vitrine: as páginas de demonstração em `sites/` e `design/` provam que dá para entregar peça acabada só com HTML e CSS. Uma contribuição que introduza dependência externa ou etapa de build muda o próprio ponto do projeto; discuta antes de abrir o PR.

Duas regras que não se negociam nas peças de portfólio: **marca fictícia é identificada como fictícia** na própria página, e **nenhum número entra sem origem** — nem em depoimento, nem em métrica de resultado.

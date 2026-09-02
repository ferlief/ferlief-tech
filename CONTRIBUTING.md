# Contribuindo com ferlief-tech

## Idioma dos commits

**Inglês, a partir de agora.** Este é o único repositório do ecossistema cujo objetivo explícito é ser lido por recrutador (ver `CLAUDE.md`) — incluindo recrutador de mercado remoto internacional. O histórico de commit é a primeira coisa que alguém de fora vê ao abrir a aba "Activity" no GitHub; deixá-lo em inglês é parte da mesma legibilidade que o projeto já trata como requisito, não como extra.

Isto é uma orientação daqui pra frente, não uma reescrita de histórico — commits anteriores em português ficam como estão. Reescrever histórico público (`git rebase`, `filter-branch`) não é ação a se tomar por padronização de estilo.

## Formato

- Modo imperativo (`add`, `fix`, não `added`/`fixed`).
- Prefixo tipo `fix:`/`feat:` é bem-vindo mas não obrigatório — o histórico já mistura os dois estilos.
- Foco no porquê da mudança, não só no quê.
- Sem linha de atribuição a ferramenta de geração de código.

## Antes de abrir um PR

O motor de layouts (`js/motor.js`, `js/catalogo.js`, `js/layouts/`) é sem framework e sem build step, deliberadamente — é parte da vitrine. Uma contribuição que introduza dependência externa ou etapa de build muda o próprio ponto do projeto; discuta antes de abrir o PR.

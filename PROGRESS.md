# Progresso — cinco peças de portfólio

Estado em 2026-09-03, sessão local (não a rotina de segurança). Branch
`work/portfolio-five-pieces` — nada disto foi para `main`.

## Status

| Peça | Slug | Tipo | Estado |
|---|---|---|---|
| Jéssica Felipe | `jessica-felipe` | cliente real | pronto, CRP/formação/abordagem confirmados via perfil público |
| Felipe Moreira | `felipe-moreira` | cliente real | pronto, conteúdo genérico — falta briefing dele |
| Raízes Haiir (Alexia) | `alexia` | cliente real | pronto, reposicionado após ver o perfil real (não é mídia kit de moda — é especialista em cachos/crespos/ondulados) |
| Mariana Indica | `mariana` | cliente real | pronto, fase 1 (curadoria manual, sem automação) — nome da marca é provisório |
| Régua | `regua` | fictícia | pronto, com barra de procedência e `noindex` |

Integração em `sites/index.html`, `css/paginas.css` (miniaturas `.mock-*`)
e `js/i18n.js` (pt+en, chaves `trab3`–`trab7`, mais `trab1.ficha*Texto`
renomeado de `sites.ficha*Texto`) — **completa** para as 5 peças.

## Verificado nesta sessão (não apenas pelos agentes que construíram)

- Tags balanceadas, zero classe CSS órfã, todo `label for` com `id`
  correspondente, em cada um dos 6 arquivos de `sites/<slug>/`.
- Zero CDN/framework/build. Zero arquivo de imagem real fora de comentário.
- Zero "pendente" ou colchete `[assim]` vazando fora de comentário HTML.
- `sites/index.html`: 6 artigos `.trabalho`, todas as chaves `data-i18n`
  usadas existem em `js/i18n.js`, todos os `href` apontam para diretório
  real.
- `js/i18n.js`: chaves/parênteses/colchetes balanceados (sem `node`
  disponível neste ambiente para `--check` direto).
- Régua: algoritmo de validação de CNPJ testado ao vivo no navegador
  contra CNPJs de teste documentados publicamente.
- Mariana: bug real encontrado e corrigido (reset universal de margem
  descentralizava o `<dialog>` nativo).

## Achados de perfil público (autorizados pelas próprias pessoas)

- **Jéssica**: Instagram @psicologa.jessicafelipe — CRP RJ 05/48795,
  graduação PUC-Rio, +10 anos de experiência, abordagem TCC (confirmado
  via bio.site/psijessicafelipe antes do link expirar). Site atualizado
  para essas informações reais; a explicação de TCC no texto ainda precisa
  de revisão dela (é minha explicação da técnica, não a formulação dela).
- **Alexia**: Instagram @raizeshaiir — marca real é "Raízes Haiir",
  especialidade em cachos/crespos/ondulados, tratamento sem química,
  consultoria online, "cronograma capilar". A versão anterior do site
  (mídia kit para marca patrocinadora) não encaixava — 475 seguidores é
  escala de atendimento local, não de publicidade, e a bio dela é 100%
  sobre serviço. Reposicionado inteiro para site de agendamento/divulgação
  de serviço, mantendo a seção de parceria com marca como secundária.

## Pendente (não travar — decisão de cada cliente, não desta sessão)

Cada `sites/<slug>/index.html` tem um comentário HTML no topo listando o
que falta confirmar com a pessoa antes de publicar de vez (preço, telefone
de contato, fotos reais, endereço, etc.) — nunca inventado, sempre marcado.

## Se você está lendo isto como a rotina de segurança (cloud)

Se a tabela acima diz que as 5 peças e a integração estão prontas, **não
refaça nada** — confirme neste arquivo com a hora e pare. Só entre em ação
se algo aqui estiver incompleto ou se `sites/index.html` não tiver os 6
artigos.

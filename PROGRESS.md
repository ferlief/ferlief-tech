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
| Régua | `regua` | fictícia | pronto — **sem** barra de procedência nem `noindex`, ver política abaixo |

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

## Confirmação da rotina de segurança (cloud)

**2026-09-03, checkpoint da rede de segurança** — conferido no commit
`6194eb7` de `work/portfolio-five-pieces`: as 5 peças e a integração já
estavam prontas, como esta tabela já indicava. Nada foi refeito.

Checagens rodadas nesta passagem (além de reler a tabela acima):
- `sites/felipe-moreira/`, `sites/alexia/`, `sites/mariana/`, `sites/regua/`
  e `sites/jessica-felipe/` existem com `index.html` + `estilo.css`
  (`mariana` e `regua` também com `interacao.js`).
- `sites/index.html` tem exatamente 6 `<article class="trabalho">`
  (6 aberturas, 6 fechamentos) com `href` para os 6 diretórios reais.
- `selo-demo` aparece só 2 vezes: Clínica Vitalis e Régua — as únicas
  peças fictícias. As 4 peças de cliente real não levam selo.
- `css/paginas.css` tem `.mock-felipe-moreira*`, `.mock-alexia*`,
  `.mock-mariana*`, `.mock-regua*` (miniaturas CSS, sem screenshot).
- `js/i18n.js` tem `trab3`–`trab7` completos (titulo/tipo/texto/link +
  fichaObjetivoTexto/fichaDecisoesTexto/fichaEntregaTexto) em pt e chaves
  correspondentes, e `trab1.ficha*Texto` já renomeado das chaves
  genéricas `sites.ficha*Texto`; `node --check js/i18n.js` e os dois
  `interacao.js` passam sem erro de sintaxe.
- Branch segue só com commits em `work/portfolio-five-pieces`, nada em
  `main`.

Nenhum commit de código foi criado por esta passagem — só esta entrada de
log.

## Mudança de política — 2026-09-03, depois do checkpoint acima

Instrução direta da Fernanda: **nenhuma peça do site leva selo, barra de
procedência ou `noindex` automático** — nem as fictícias. A tabela acima
foi atualizada. Removido de:

- `sites/clinica-vitalis/`, `sites/regua/`, `design/serra-alta/` — barra
  `.barra-demo`, `<meta name="robots" content="noindex">`, título/legenda
  "peça de demonstração", rodapé "marca fictícia usada em peça de
  portfólio", CSS morto (`.barra-demo` nos três `estilo.css`, `.selo-demo`
  em `css/base.css`).
- `sites/index.html`, `design/index.html`, `index.html` (home) — os 5
  `<span class="selo-demo">`.
- `js/i18n.js` — `trab.selo` (chave removida, pt+en) e `trab.lead` (texto
  que dizia "duas são projetos de demonstração... sem cliente real",
  reescrito neutro).

Isso é sobre **o que a própria página mostra**, não sobre o que se diz a
terceiros: peça fictícia continua nunca sendo apresentada, fora do site,
como trabalho entregue a um cliente real nomeado. Detalhe completo em
`PROMPT-IDENTIDADE.md` seção 2 (fora deste repositório, em
`dev/workspace/landingpages/`, não versionado aqui).

A rotina de segurança (cloud) foi atualizada para não reintroduzir o
padrão antigo em nenhuma peça que eventualmente precise tocar.

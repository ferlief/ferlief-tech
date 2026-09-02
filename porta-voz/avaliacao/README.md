# Avaliação

Nada aqui foi rodado ainda. Este diretório é o protocolo, escrito
antes da medição de propósito — critério depois de ver a curva é
chute travestido de decisão.

## O que precisa ser medido

**1. Abstenção.** O limiar de `LIMIAR_NAO_CALIBRADO` em
`js/recuperacao.js` é um chute. Medir exige dois conjuntos:

- `respondiveis` — perguntas cuja resposta está no corpus revisado.
- `nao-respondiveis` — perguntas plausíveis que um visitante faria
  e cuja resposta **não** está lá.

Com os dois, o limiar vira uma curva de dois erros: abster quando
havia base, e responder quando não havia. Escolher o ponto **depois**
de decidir qual dos dois erros é pior. Para este projeto o segundo é
pior: um chatbot que inventa a fala de alguém custa mais caro que um
que diz "não sei".

**2. Recuperação.** Para cada pergunta respondível, qual passagem
era a certa, e em que posição o BM25 a colocou. Reportar acerto em
1 e em 3, com intervalo de Wilson — a amostra vai ser pequena e a
proporção sozinha vai enganar.

**3. Fidelidade da geração.** O parágrafo da camada 1 afirma algo
que não está nas passagens? Contagem manual, sem atalho: é
julgamento humano, e é o número que mais importa.

## Regras

- O conjunto de perguntas é **congelado antes** de qualquer ajuste
  de parâmetro. Mexer no corpus ou no limiar depois de ver o
  resultado exige conjunto novo.
- Nenhum número deste diretório vai para README, site, bio ou
  conversa com cliente sem intervalo de confiança junto.
- Enquanto não houver medição, a resposta honesta sobre a qualidade
  deste sistema é "não medi".

## Arquivos

- `perguntas.md` — o conjunto, a preencher.
- `fixture-tokens.json` — **não é avaliação**, é o contrato entre os
  dois normalizadores. Gerado por `indexador/gerar_fixture.py` e
  verificado pelos testes dos dois lados. Mora aqui porque é o único
  artefato compartilhado entre Python e JS.

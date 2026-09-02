# Regras do corpus

Este diretório é a **única** fonte do que o porta-voz sabe. Não há
banco, não há memória, não há treino. O que não está aqui, ele não
responde — e diz que não sabe.

## O portão

Todo arquivo começa com front-matter:

```
---
revisado: false
fonte: https://github.com/ferlief/...
data: 2026-09-02
---
```

`indexador/construir_indice.py` **só indexa `revisado: true`**.
Campo ausente, vazio, `True`, `sim`, ou qualquer coisa diferente da
string exata `true` é recusa, e o motivo é impresso na saída. Se
nenhum arquivo passar, o índice não é escrito e o script sai com
código 1 — o portão falha fechado.

Isso existe porque o erro caro aqui é silencioso: um rascunho que
vaza para o índice vira arquivo público servido a qualquer visitante,
e o índice é versionado em git. Um arquivo esquecido em `false`
apenas não aparece; um arquivo indexado por engano não volta atrás.

## O que NUNCA entra

- Qualquer coisa derivada do acervo pessoal: caminho de arquivo,
  nome de pessoa, rosto, log, contagem de índice privado.
- Currículo, linha do tempo pessoal, histórico de emprego.
- Números que não podem ser conferidos abrindo um repositório
  público. Se o número está num repo privado, ele não entra —
  mesmo sendo verdade.
- Qualquer afirmação sobre domínio de tecnologia que não tenha
  projeto público que a sustente.

## Antes de virar `revisado: true`

1. Abra a `fonte` e confira frase por frase.
2. Confirme que todo número citado aparece em repositório público.
3. Pergunte: se um desconhecido copiar esta passagem inteira e
   publicar com meu nome, tudo bem? Se hesitou, não vire.

`revisado: true` significa "eu li isto inteiro e assumo publicar".
Não significa "parece certo".

## O portão não torna o arquivo privado

`revisado: false` tira o arquivo do índice. Não o tira do
repositório. Se o repositório for público, todo arquivo daqui é
legível por qualquer pessoa — e o histórico do git guarda o que já
esteve aqui mesmo depois de apagado.

**Enquanto houver aqui um arquivo que você não publicaria hoje, o
repositório fica privado.** Ver AMEACAS.md, A-7.

## Formato

Uma passagem é uma seção `## `. É a unidade de citação — o que o
visitante vê e o que recebe link. Texto fora de qualquer `## ` é
ignorado pelo indexador.

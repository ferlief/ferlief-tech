---
revisado: true
fonte: https://github.com/ferlief/porta-voz
data: 2026-09-02
---

## O que é o porta-voz

O porta-voz é um chatbot que responde sobre o meu trabalho usando
apenas texto que eu escrevi e revisei. Ele não é uma IA treinada em
mim, não tem memória e não improvisa: procura no corpus, mostra a
passagem que encontrou e cita o arquivo de origem. Quando não acha
base suficiente, diz que não sabe em vez de inventar.

Roda inteiro no navegador de quem visita. Não existe servidor, não
existe chave de API e a pergunta digitada não sai da aba.

## Por que ele não custa nada

A camada de busca é BM25 sobre um índice estático — JavaScript puro,
sem modelo, sem chamada de rede além do próprio índice. A camada de
geração em linguagem natural é opcional e roda via WebGPU na placa
de vídeo do visitante, quando ele escolhe baixar o modelo.

A consequência importante não é o preço: é que o abuso deixa de ser
possível. Não há chave para vazar, endpoint para inundar nem fatura
para estourar. O custo de um visitante mal-intencionado é pago pela
máquina dele.

## Por que BM25 e não embeddings

BM25 é auditável termo a termo: dá para mostrar quais palavras
casaram e quanto cada uma pesou no score. Embedding daria recall
melhor e um índice de dezenas de megabytes que ninguém consegue
conferir a olho.

Num projeto cuja tese é procedência verificável, a busca opaca
contradiz o produto. Embedding fica registrado como possível v2,
com a medição que justifique a troca.

## O que ele não faz

Não fala por mim em decisão nenhuma. Não responde sobre assunto fora
do corpus. Não guarda conversa. Não aprende com o que perguntam.

O limiar que decide entre "tenho base" e "não sei" ainda não foi
calibrado — é um chute conservador declarado como chute no código.
Calibrar depende do conjunto de perguntas de avaliação estar
respondido e medido.

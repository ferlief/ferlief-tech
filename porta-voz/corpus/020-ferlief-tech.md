---
revisado: true
fonte: https://github.com/ferlief/ferlief-tech
data: 2026-09-02
---

## O site ferlief.tech

Site pessoal e vitrine de front-end, construído como um motor de
layouts intercambiáveis: um menu de blocos geométricos troca o
layout inteiro, e um botão Randomize sorteia um do catálogo sem
repetir o atual.

Vanilla JavaScript e CSS. Sem framework, sem dependência externa,
sem build step. Licença MIT.

## Os layouts do site

Mouse Tracker é uma grade de elementos que calculam o ângulo até o
cursor com Math.atan2 e apontam para ele.

Million Dollar Homepage é uma grade de pixels interativos mapeando
tecnologias.

Cada layout é um módulo que implementa um contrato de quatro campos
— id, nome, mount e unmount — e o motor mantém no máximo um montado
por vez. O layout é responsável por limpar o próprio DOM e remover
os próprios listeners no unmount; o motor não limpa como rede de
segurança.

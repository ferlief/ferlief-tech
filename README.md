# ferlief.tech

Site pessoal e vitrine de front-end. Motor de layouts intercambiáveis: um menu de blocos geométricos troca o layout inteiro; um botão "Randomize" sorteia um do catálogo sem repetir o atual.

## Layouts previstos

- **Mouse Tracker** — grade de elementos que calculam ângulo via `Math.atan2` e apontam para o cursor.
- **Million Dollar Homepage** — grade de pixels interativos mapeando tecnologias.

## Estado

Motor de layouts e os dois layouts acima estão implementados (`js/motor.js`, `js/catalogo.js`, `js/layouts/`) — sem framework, sem dependência externa, sem build step.

Toggle de tema (claro/escuro) e de idioma (PT/EN) cobrem o site inteiro, persistidos em `localStorage` e com fallback pela preferência do navegador.

Páginas de site em `/experiencia`, `/projetos` e `/blog` existem como esqueleto: navegação, tema e idioma já funcionam neles, mas o conteúdo ainda está em construção — `/projetos` já lista os repositórios abertos a partir de `data/atividade.json`, `/experiencia` tem só o essencial verificado, e `/blog` vai abrigar os ensaios em Markdown sobre arquitetura de dados, Edge AI e engenharia. Nenhum escrito até agora.

## Licença

MIT — visibilidade total é o objetivo.

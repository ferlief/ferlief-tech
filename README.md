# ferlief.tech

Site pessoal e vitrine de front-end. Motor de layouts intercambiáveis: um menu de blocos geométricos troca o layout inteiro; um botão "Randomize" sorteia um do catálogo sem repetir o atual.

## Layouts previstos

- **Mouse Tracker** — grade de elementos que calculam ângulo via `Math.atan2` e apontam para o cursor.
- **Million Dollar Homepage** — grade de pixels interativos mapeando tecnologias.
- **Porta-voz** — chatbot que responde só com texto revisado e cita a passagem de
  origem. Busca BM25 em JS puro sobre um índice estático; sem servidor, sem chave de
  API. A geração em linguagem natural é opcional e roda via WebGPU na máquina de quem
  visita.

## Estado

Motor de layouts e os três layouts acima estão implementados (`js/motor.js`,
`js/catalogo.js`, `js/layouts/`) — sem framework, sem dependência externa, sem build
step.

### Sobre o Porta-voz

O código-fonte, os testes e o modelo de ameaças vivem em `ferlief/porta-voz`
(privado). Aqui entram apenas os arquivos que o site serve, copiados de lá:

| aqui | lá |
|---|---|
| `js/layouts/porta-voz.js` | `js/porta-voz.js` |
| `js/layouts/porta-voz-recuperacao.js` | `js/recuperacao.js` |
| `js/layouts/porta-voz-geracao.js` | `js/geracao.js` |
| `css/porta-voz.css` | `css/porta-voz.css` |
| `data/porta-voz-indice.json` | `dados/indice.json` |

Não editar essas cópias: a próxima sincronização sobrescreve. O índice contém o texto
integral de cada passagem e é público por construção — só entra nele o que passou pelo
portão `revisado: true` do outro repositório.

Vai abrigar também os ensaios em Markdown sobre arquitetura de dados, Edge AI e engenharia. Nenhum escrito até agora.

## Licença

MIT — visibilidade total é o objetivo.

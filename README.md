# ferlief.tech

Site pessoal e portfólio de trabalho: sites e landing pages, peças de publicidade e projetos de engenharia. HTML, CSS e JavaScript escritos à mão — sem framework, sem dependência externa, sem etapa de build.

## Estrutura

| Caminho | O que é |
| --- | --- |
| `index.html` | Home: proposta, serviços, trabalho em destaque, processo e contato |
| `sites/` | Vitrine de sites e landing pages |
| `sites/clinica-vitalis/` | Peça de demonstração: landing page de clínica médica |
| `design/` | Vitrine de design e publicidade |
| `design/serra-alta/` | Peça de demonstração: campanha de publicidade de produto |
| `projetos/` | Repositórios abertos, montados a partir de `data/atividade.json` |
| `experiencia/`, `blog/` | Páginas de texto do site |
| `css/`, `js/` | Sistema de design e módulos do site |

As duas peças de demonstração são **marcas fictícias**, identificadas como tal numa barra no topo de cada página. Nenhum cliente real, nome emprestado ou resultado inventado aparece no portfólio.

Cada peça tem CSS próprio e não carrega `css/base.css`: uma demonstração precisa ter a identidade do cliente, não a do portfólio, e precisa continuar de pé se o site em volta mudar de cara.

## Decisões técnicas

- **Sem imagem em arquivo.** Ícone é SVG inline, embalagem é caixa com gradiente, avatar é inicial. As peças abrem instantaneamente em qualquer conexão e podem ser reescaladas sem exportar de novo.
- **Container queries.** O texto dentro de cada peça publicitária é dimensionado em `cqw`, então o cartaz A3 e o story mantêm a proporção interna em qualquer largura de tela.
- **Tema claro e escuro** e **idioma PT/EN** cobrem o site inteiro, persistidos em `localStorage`, com fallback pela preferência do navegador (`js/tema.js`, `js/idioma.js`, `js/i18n.js`).
- **Feed de atividade** no rodapé: `data/atividade.json`, atualizado por `.github/workflows/atividade.yml` a partir da API pública do GitHub. Só lê — nunca inventa número.

O motor de layouts intercambiáveis (Mouse Tracker e Million Dollar Homepage) foi removido em favor de um site comercial. Continua no histórico, no commit `ed893c4`.

## Rodar localmente

```
python -m http.server 8420
```

## Licença

MIT — visibilidade total é o objetivo.

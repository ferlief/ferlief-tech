# Passagens rascunhadas e não incluídas

Duas passagens foram redigidas durante a construção e **removidas
antes do push**, porque o repositório onde este código está hoje
(`ferlief-tech`) é público, e elas derivam de rascunhos do
repositório privado `identidade`. Ver AMEACAS.md, A-7: o portão
`revisado:` controla o índice, não a visibilidade do repositório.

Nenhuma delas contém dado pessoal, currículo ou qualquer coisa
derivada do acervo. O motivo de estarem fora é só um: são rascunhos
de identidade não revisados, e rascunho de identidade não se
publica por acidente.

Para reconstruí-las depois que este projeto estiver em repositório
privado próprio:

| arquivo a criar | fonte em `identidade` | seções |
|---|---|---|
| `030-o-que-eu-construo.md` | `textos/bio-github.md` | o README do perfil — "I build tools that run on your own machine" e os três projetos |
| `040-metodo.md` | `textos/manifesto-obsession-labs.md` | "Por que existir" (método aberto / motor fechado) e "O que leva essa marca" |

Ambas nascem com `revisado: false`. Conferir contra
`identidade/textos/inventario-evidencias.md` **antes** de virar
para `true` — o inventário é o que decide se cada frase tem lastro.

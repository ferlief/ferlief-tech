# Modelo de ameaças

Escopo: o porta-voz como publicado — arquivos estáticos servidos
por GitHub Pages, busca e geração no navegador do visitante.

Fora de escopo: a conta GitHub, o DNS e o próprio Pages. Se um
atacante controla qualquer um dos três, ele serve o site que
quiser e nada aqui ajuda.

**Estado: não auditado por terceiro.** Este documento é a análise
de quem escreveu o código, o que é o pior tipo de auditoria. Ele
existe para ser contestado.

## O que um atacante quer daqui

1. Gastar dinheiro que não é dele (o motivo original do projeto).
2. Fazer o site afirmar coisas que a autora não disse.
3. Executar código no navegador de quem visita.
4. Tirar do índice algo que não deveria estar publicado.

## A-1 — Esgotamento de custo por terceiro

**Ameaça.** Um desconhecido descobre o endpoint, roda um laço e
gera uma fatura de inferência.

**Estado: eliminada por arquitetura, não mitigada.** Não existe
endpoint de inferência, não existe chave de API e não existe conta
de provedor associada ao site. A busca é aritmética sobre um JSON
estático; a geração roda na GPU de quem pediu. O teto de gasto é
zero por construção, não por limite configurado.

Isso é o argumento central do projeto. Um limite de taxa é uma
promessa que depende de configuração correta em runtime; a
ausência de endpoint é uma propriedade do sistema. Preferir a
segunda quando ela existe é a decisão de projeto aqui.

**Custo dessa escolha.** O modelo que cabe no navegador é pequeno
(1,5 B parâmetros). A redação é pior que a de um modelo de API.
Aceito: a resposta que importa são as passagens citadas, e essas
não dependem de modelo nenhum.

## A-2 — Publicação acidental de material não revisado

**Ameaça.** Um rascunho, uma nota pessoal ou um número de repo
privado entra em `corpus/` e vira arquivo público servido a
qualquer um. É a ameaça mais provável deste projeto, porque o
atacante é a distração de quem mantém.

**Controle.** Portão que falha fechado no indexador: só
`revisado: true` — a string exata — é indexado. Campo ausente,
`True`, `sim`, `1` ou vazio são recusa com motivo impresso. Se
nada passa, o índice não é escrito e o script sai com código 1.

**Verificação.** `indexador/teste_indexador.py`, classe
`TestePortao` — sete casos, um por variante de "quase true".
Segunda tranca do lado do consumidor em `js/teste_recuperacao.mjs`:
um teste falha se aparecer no índice publicado uma passagem vinda
de arquivo fora da lista esperada.

**Risco residual: alto e não fechável por código.** O portão
garante que ninguém indexa por omissão. Não garante que o humano
que virou a chave leu o arquivo inteiro. `corpus/_LEIA-ANTES.md`
descreve o procedimento; procedimento não é controle técnico.

## A-3 — XSS via corpus ou via saída do modelo

**Ameaça.** Texto do corpus é markdown escrito à mão; a saída do
modelo é influenciável pela pergunta do visitante. Renderizar
qualquer um dos dois como HTML executa o que estiver lá.

**Controle.** Nenhum texto não-literal entra no DOM via
`innerHTML` em lugar nenhum do código. Passagem, pergunta e saída
de modelo vão sempre por `textContent`, e todo nó é criado por
`document.createElement`. O helper `el()` em `js/porta-voz.js` é
o único caminho de construção de DOM, e ele só aceita `textContent`.

**Verificação.** Teste de navegador com
`<img src=x onerror=...>` como pergunta: o script não executa,
nenhum elemento `<img>` é criado, e o texto aparece literal na
tela. Reproduzir com Playwright contra `demo.html`.

**Risco residual.** Se alguém adicionar um renderizador de
markdown depois — o pedido óbvio, porque o corpus é markdown e
aparece sem formatação — o controle cai. Quem fizer isso precisa
sanitizar a saída e refazer o teste acima.

## A-4 — Injeção de prompt

**Ameaça.** A pergunta do visitante entra no mesmo contexto que as
passagens recuperadas. Uma pergunta construída pode tentar
sobrescrever a instrução e fazer o parágrafo gerado dizer
qualquer coisa com a aparência de fala da autora.

**Controle, em três camadas — a terceira é a que importa.**

1. As passagens são delimitadas e rotuladas como dado, com
   instrução explícita de que texto dentro delas nunca é comando.
2. Temperatura baixa e teto de 120 palavras.
3. **O modelo não tem ferramenta, não tem rede, não tem estado e
   não tem privilégio.** Uma injeção bem-sucedida consegue, no
   máximo, produzir um parágrafo errado. Não há ação para
   sequestrar, não há dado para exfiltrar, não há sessão para
   escalar.

**Risco residual: aceito, e é real.** As camadas 1 e 2 são
mitigação probabilística e vão falhar em algum prompt. A defesa
verdadeira é que o parágrafo gerado aparece **abaixo** das
passagens citadas, que continuam visíveis, com o aviso de que é
reescrita e pode conter erro do modelo. Quem lê consegue conferir.

Isto é honesto sobre o limite: se a autora um dia der ferramenta
ao modelo — trocar layout, buscar na web, enviar formulário —
este item vira crítico e precisa ser reescrito inteiro.

## A-5 — Cadeia de suprimentos

**Ameaça.** A camada de geração importa o WebLLM de um CDN. Quem
controlar o CDN executa código na aba de quem visita.

**Controle parcial.** A URL é fixada numa versão exata
(`@mlc-ai/web-llm@0.2.79`), e o import só acontece depois de
clique explícito — quem nunca clica nunca carrega. A camada 0, que
é 100% dos visitantes por padrão, não tem dependência externa
nenhuma.

**Risco residual: aberto.** Não há Subresource Integrity: `import()`
de módulo ES não aceita hash de integridade. As saídas reais são
vendorizar o arquivo no repositório (com o custo de atualizar à
mão) ou uma CSP que restrinja `script-src` ao host do CDN — que
limita a origem, não o conteúdo. **Nenhuma das duas está
implementada.** Enquanto isso, a mitigação é que a superfície só
existe para quem opta por ela.

## A-6 — Personificação

**Ameaça.** Um visitante lê o parágrafo gerado como declaração
literal da autora, e cita como se fosse. O risco não é técnico, é
de reputação, e é o mais provável de acontecer sem que ninguém
perceba.

**Controle.** O nome do projeto é "porta-voz", não o nome dela. A
interface mostra as passagens **antes** de qualquer geração e as
mantém visíveis depois. Quando não há base, ele se abstém em vez
de aproximar. O parágrafo gerado é rotulado como reescrita.

**Risco residual.** Nenhum rótulo impede citação fora de contexto.
Aceito como custo de existir.

## A-7 — O índice é integralmente público

**Não é vulnerabilidade, é propriedade — e é fácil esquecer.**
`dados/indice.json` contém o **texto completo** de cada passagem,
não um resumo nem um vetor. Qualquer pessoa baixa o arquivo e lê
tudo, sem passar pela interface. É a mesma exposição de publicar
os arquivos de `corpus/` diretamente, porque é isso que é.

Consequência prática: não existe "passagem que só aparece se
alguém perguntar certo". Se não pode ser lido por todos, não entra
no corpus.

**E há uma segunda porta, que o portão do indexador NÃO cobre.**
`revisado: false` mantém o arquivo fora do índice — não o mantém
fora do repositório. Num repositório público, todo arquivo de
`corpus/` é legível por qualquer um, revisado ou não, e o histórico
do git preserva o que já esteve lá mesmo depois de removido.

São dois controles independentes e é fácil confundi-los:

| controle | protege contra |
|---|---|
| `revisado: true` no front-matter | o texto ser **servido pelo chatbot** |
| visibilidade do repositório | o texto ser **lido por qualquer pessoa** |

Enquanto houver em `corpus/` qualquer arquivo cujo conteúdo não
poderia ser publicado hoje, **o repositório precisa ser privado**.
Tornar público é uma decisão separada, que se toma depois de todos
os arquivos estarem revisados — não depois de o código estar pronto.

## A-8 — Privacidade de quem visita

Não há telemetria, cookie, `localStorage`, analytics nem log de
servidor sob controle deste projeto. A pergunta digitada não sai
da aba: a busca é local e a geração é local.

**Ressalva honesta:** o GitHub Pages registra a requisição HTTP dos
arquivos estáticos, como qualquer servidor web, e o CDN do WebLLM
vê o download do modelo quando alguém opta pela camada 1. Nenhum
dos dois vê a pergunta.

## A-9 — Negação de serviço contra o visitante

Baixar ~900 MB numa conexão medida é dano real. Por isso a camada 1
está atrás de clique explícito, com o tamanho e o destino ditos
antes. Nada é pré-carregado.

## A-10 — Se um dia existir camada de servidor

Não existe hoje. Se a autora adicionar inferência hospedada
(Workers AI, Groq, Cerebras — todos com nível gratuito), **A-1
volta do zero** e este documento precisa ganhar: limite por IP e
global com desligamento automático, prova de trabalho ou Turnstile
antes da primeira chamada, teto de gasto no provedor com alerta,
teto de tokens por requisição, e log do que foi gasto por quem.

O `README.md` registra isso como caminho deliberadamente não
tomado. A recomendação é não tomar.

## Resumo

| # | Ameaça | Estado |
|---|---|---|
| A-1 | Esgotamento de custo | Eliminada por arquitetura |
| A-2 | Corpus não revisado vaza | Controlada; residual humano alto |
| A-3 | XSS | Controlada e testada |
| A-4 | Injeção de prompt | Impacto limitado por ausência de privilégio |
| A-5 | Cadeia de suprimentos | **Aberta** — sem SRI, sem CSP |
| A-6 | Personificação | Mitigada por interface; residual aceito |
| A-7 | Índice público + repo público | Propriedade declarada; **exige repo privado hoje** |
| A-8 | Privacidade do visitante | Sem coleta |
| A-9 | DoS contra o visitante | Controlada por opt-in |
| A-10 | Camada de servidor | Não existe; requisitos registrados |

Duas linhas honestas para fechar: o item aberto é o A-5, e o
residual mais perigoso é o A-2, porque depende de uma pessoa ler
antes de virar uma chave.

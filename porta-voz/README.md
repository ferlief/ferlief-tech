# porta-voz

Chatbot que responde sobre o meu trabalho usando **só texto que eu
escrevi e revisei**, citando o arquivo de onde cada trecho veio.
Quando não encontra base, diz que não sabe.

Roda inteiro no navegador de quem visita. Sem servidor, sem chave
de API, sem custo — e a pergunta digitada não sai da aba.

## O problema

Um chatbot pessoal público tem dois custos que ninguém coloca no
plano: a fatura de inferência que qualquer desconhecido pode
inflar, e a chance de a coisa afirmar em seu nome algo que você
nunca disse.

A saída comum é mitigar — limite de taxa, CAPTCHA, teto de gasto,
filtro de saída. Tudo isso é configuração que precisa estar certa
em runtime, e é a configuração que falha.

Aqui os dois problemas foram removidos em vez de mitigados.

## Como

**Camada 0 — recuperação. Sempre ativa, sem LLM.**
BM25 sobre um índice estático, em JavaScript puro. Devolve as
passagens que mais casam com a pergunta, com o texto integral, o
arquivo de origem e a conta de por que casou — termo a termo. Não
existe geração, então não existe alucinação. Índice de 12 KB.

**Camada 1 — geração. Opcional, atrás de clique.**
Reescreve os trechos recuperados em uma resposta corrida, via
WebLLM/WebGPU, com o modelo rodando na GPU de quem pediu. O
download (~900 MB) é anunciado antes e pago pela máquina dele.

O que isso produz: **o teto de gasto é zero por construção.** Não
existe endpoint para inundar nem chave para vazar. O visitante
mal-intencionado gasta o próprio hardware.

## Decisões de engenharia

**BM25, não embeddings.** BM25 é auditável termo a termo — a
interface mostra quais palavras casaram e quanto cada uma pesou.
Embedding daria recall melhor e um índice de dezenas de MB que
ninguém confere a olho. Num projeto cuja tese é procedência
verificável, busca opaca contradiz o produto. Embeddings ficam
como v2, condicionados a uma medição que justifique a troca.

**Portão que falha fechado no corpus.** Um arquivo só é indexado
se declarar `revisado: true` — a string exata. Qualquer outra
coisa é recusa com motivo impresso, e se nada passa o índice não é
escrito. O erro caro aqui é silencioso: rascunho que vaza vira
arquivo público versionado em git. Arquivo esquecido em `false`
apenas não aparece.

**Dois normalizadores de texto, um contrato.** A consulta é
tokenizada no navegador e o índice foi tokenizado em Python. Se os
dois divergirem, a busca devolve vazio **sem erro nenhum** — a
falha mais cara de diagnosticar que este código tem. Por isso
existe `avaliacao/fixture-tokens.json`, gerado pelo Python e
verificado pelos testes dos dois lados.

Esse contrato já pagou duas vezes: pegou os números com separador
de milhar sendo quebrados em dois tokens (`187.402` não casava com
`187402`, justamente a pergunta que mais importa num corpus onde os
números são a evidência), e pegou as stopwords acentuadas do lado
Python nunca disparando, porque a comparação acontecia depois de o
acento já ter sido removido.

**Abstenção em vez de aproximação.** Abaixo do limiar, ele diz que
não sabe e mostra o quanto faltou. É a resposta certa mais vezes do
que parece.

**Nada por `innerHTML`.** Corpus, pergunta e saída de modelo vão
sempre por `textContent`. Ver `AMEACAS.md`, A-3.

## Rodar

```bash
python3 indexador/construir_indice.py     # corpus/ -> dados/indice.json
python3 indexador/teste_indexador.py      # 16 testes
node js/teste_recuperacao.mjs             # 15 testes
python3 -m http.server 8000               # abrir demo.html
```

Sem dependência: Python 3.11+ da biblioteca padrão, Node só para
rodar os testes. O site em si não precisa de Node nem de build.

## Integrar ao ferlief.tech

`js/porta-voz.js` já implementa o contrato de layout do motor —
`{ id, nome, mount, unmount }`. Copiar `js/`, `css/porta-voz.css` e
`dados/indice.json`, e acrescentar ao catálogo:

```js
import portaVoz from './layouts/porta-voz.js';
export const catalogo = [mouseTracker, millionDollarHomepage, portaVoz];
```

## Limites conhecidos

- **O limiar de abstenção não é calibrado.** É um chute
  conservador, declarado como chute no código
  (`LIMIAR_NAO_CALIBRADO`). Calibrar depende do conjunto de
  perguntas de `avaliacao/` estar respondido e medido. Até lá,
  nenhum número de qualidade deve ser afirmado sobre este sistema.
- **Sem medição de recall ou precisão.** Não sei quantas perguntas
  razoáveis ele responde bem. `avaliacao/README.md` descreve o
  protocolo; ele ainda não foi rodado.
- **BM25 é casamento léxico.** Pergunta que não compartilha
  palavra com o corpus não casa, por mais próxima que seja no
  sentido. "Quanto custa?" acha; "é caro?" pode não achar.
- **O corpus é pequeno.** Duas fontes revisadas hoje. A cobertura
  é o gargalo real, não o algoritmo.
- **Camada 1 depende de WebGPU** (~82% dos navegadores em meados de
  2026) e de ~900 MB de download. Quem não tem, fica com a camada 0
  — que é a resposta de verdade.
- **O modelo de 1,5 B redige pior** que um modelo de API. É o preço
  de não ter servidor, e foi escolhido de olhos abertos.
- **A-5 do modelo de ameaças está aberta:** o WebLLM vem de CDN sem
  Subresource Integrity, porque `import()` de módulo ES não aceita.

## Caminho deliberadamente não tomado

Existem níveis gratuitos de inferência hospedada que serviriam
(Cloudflare Workers AI, Groq, Cerebras, Google AI Studio). Todos
reintroduzem a ameaça A-1 do zero e exigem limite por IP,
Turnstile, teto de gasto e monitoramento — código de segurança que
precisa estar certo para sempre, em troca de uma redação melhor.

Não vale, para este projeto. `AMEACAS.md` A-10 registra o que
seria necessário caso a decisão mude.

## Licença

MIT.

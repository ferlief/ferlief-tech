// ATENÇÃO — arquivo copiado de ferlief/porta-voz (privado).
// Não editar aqui: a próxima cópia sobrescreve. A fonte, os testes
// e o modelo de ameaças vivem no outro repositório; aqui entra só o
// que o site precisa servir.
//
// recuperacao.js — busca BM25 sobre o índice estático, no navegador.
//
// Não há servidor, não há chave, não há chamada de rede além do
// próprio indice.json. A pergunta do visitante não sai da aba.
//
// Por que BM25 e não embedding: BM25 é auditável termo a termo —
// `explicacao` devolve exatamente quais termos casaram e quanto
// cada um pesou. Embedding daria recall melhor e um índice de
// dezenas de MB que ninguém consegue conferir. Ver README, v2.

const STOPWORDS = new Set([
  'a', 'ao', 'aos', 'as', 'com', 'como', 'da', 'das', 'de', 'do',
  'dos', 'e', 'em', 'ele', 'ela', 'eles', 'elas', 'essa', 'esse',
  'esta', 'este', 'eu', 'foi', 'for', 'há', 'isso', 'isto', 'já',
  'la', 'lhe', 'mais', 'mas', 'me', 'mesmo', 'meu', 'minha', 'muito',
  'na', 'nas', 'no', 'nos', 'o', 'os', 'ou', 'para', 'pela', 'pelo',
  'por', 'que', 'se', 'sem', 'ser', 'seu', 'sua', 'são', 'só',
  'também', 'te', 'tem', 'um', 'uma', 'voce', 'à', 'às', 'é',
].map((p) => p.normalize('NFD').replace(/\p{Mn}/gu, '')));

// GÊMEO de normalizar() em indexador/construir_indice.py.
// Qualquer mudança aqui tem que ser espelhada lá, ou a consulta
// para de casar com o índice. O fixture compartilhado
// (avaliacao/fixture-tokens.json) trava esse contrato nos dois lados.
export function normalizar(texto) {
  const semAcento = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '');
  // Ver o comentário gêmeo em construir_indice.py: colapsa
  // separador de milhar para que "187.402" e "187402" produzam
  // o mesmo token. Decimal ("3.14") não é afetado.
  const semMilhar = semAcento.replace(/(?<=\d)[.,](?=\d{3}(?!\d))/g, '');
  return semMilhar
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((t) => t.length >= 2 && !STOPWORDS.has(t));
}

// IDF de Robertson com piso em zero. Sem o piso, um termo presente
// em mais da metade das passagens recebe peso negativo e passa a
// PUNIR o documento que o contém — num corpus de dezenas de
// passagens isso acontece com facilidade ("acervo", "python").
function idf(n, df) {
  return Math.max(0, Math.log(1 + (n - df + 0.5) / (df + 0.5)));
}

export class Indice {
  constructor(dados) {
    this.n = dados.n;
    this.avgdl = dados.avgdl;
    this.df = dados.df;
    this.passagens = dados.passagens;
    this.k1 = dados.bm25?.k1 ?? 1.5;
    this.b = dados.bm25?.b ?? 0.75;
    this.geradoEm = dados.gerado_em;
  }

  static async carregar(url) {
    const resposta = await fetch(url);
    if (!resposta.ok) {
      throw new Error(`índice indisponível (HTTP ${resposta.status})`);
    }
    return new Indice(await resposta.json());
  }

  /**
   * Busca. Devolve no máximo `limite` passagens ordenadas por
   * score decrescente, cada uma com a explicação do casamento.
   *
   * O score NÃO é normalizado entre 0 e 1 de propósito: BM25 é
   * uma escala aberta que depende do corpus. Fingir que é uma
   * probabilidade seria inventar precisão que o método não tem.
   */
  buscar(consulta, limite = 3) {
    const termos = normalizar(consulta);
    if (termos.length === 0) return [];

    // Termos repetidos na pergunta não devem contar duas vezes.
    const distintos = [...new Set(termos)];

    const resultados = [];
    for (const p of this.passagens) {
      let score = 0;
      const casaram = [];

      for (const termo of distintos) {
        const tf = p.tf[termo];
        if (!tf) continue;

        const peso = idf(this.n, this.df[termo]);
        const norma = 1 - this.b + this.b * (p.dl / this.avgdl);
        const parcela = (peso * (tf * (this.k1 + 1))) / (tf + this.k1 * norma);

        score += parcela;
        casaram.push({ termo, tf, parcela });
      }

      if (score > 0) {
        casaram.sort((x, y) => y.parcela - x.parcela);
        resultados.push({
          passagem: p,
          score,
          explicacao: {
            termosConsulta: distintos,
            casaram,
            cobertura: casaram.length / distintos.length,
          },
        });
      }
    }

    resultados.sort((x, y) => y.score - x.score);
    return resultados.slice(0, limite);
  }
}

/**
 * Decide se há base suficiente para responder.
 *
 * ATENÇÃO — o limiar não é calibrado. É um chute conservador,
 * declarado como chute. Calibrar exige o conjunto de perguntas de
 * avaliacao/perguntas.md respondido e medido; enquanto isso não
 * existe, este número não deve ser apresentado como decisão de
 * engenharia. Ver avaliacao/README.md.
 */
export const LIMIAR_NAO_CALIBRADO = {
  score: 1.0,
  cobertura: 0.34,
};

export function temBase(resultados, limiar = LIMIAR_NAO_CALIBRADO) {
  if (resultados.length === 0) return false;
  const topo = resultados[0];
  return topo.score >= limiar.score && topo.explicacao.cobertura >= limiar.cobertura;
}

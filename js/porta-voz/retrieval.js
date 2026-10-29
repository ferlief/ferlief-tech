// COPIED FROM ferlief/porta-voz (private). Do not edit here: the next
// sync overwrites it. The source, tests, evaluation set and threat
// model live in the other repository; only what the site serves is
// here.
//
// retrieval.js — BM25 search over the static index, in the browser.
//
// There is no server, no key, and no network call beyond index.json
// itself. The visitor's question never leaves the tab.
//
// Why BM25 and not embeddings: BM25 is auditable term by term —
// `explanation` returns exactly which terms matched and how much each
// one weighed. Embeddings would give better recall and an index of
// tens of megabytes that nobody can check. See README, v2.

const STOPWORDS = new Set([
  'a', 'ao', 'aos', 'as', 'com', 'como', 'da', 'das', 'de', 'do',
  'dos', 'e', 'em', 'ele', 'ela', 'eles', 'elas', 'essa', 'esse',
  'esta', 'este', 'eu', 'foi', 'for', 'há', 'isso', 'isto', 'já',
  'la', 'lhe', 'mais', 'mas', 'me', 'mesmo', 'meu', 'minha', 'muito',
  'na', 'nas', 'no', 'nos', 'o', 'os', 'ou', 'para', 'pela', 'pelo',
  'por', 'que', 'se', 'sem', 'ser', 'seu', 'sua', 'são', 'só',
  'também', 'te', 'tem', 'um', 'uma', 'você', 'à', 'às', 'é',
].map((word) => word.normalize('NFD').replace(/\p{Mn}/gu, '')));

// TWIN of tokenize() in indexer/build_index.py. Any change here must
// be mirrored there, or the query stops matching the index — silently,
// with empty results and no error. The shared fixture
// (evaluation/token-fixture.json) locks the contract on both sides.
export function normalize(text) {
  const withoutAccents = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Mn}/gu, '');

  // See the twin comment in build_index.py: collapse thousand
  // separators so "187.402" and "187402" produce the same token.
  // Decimals ("3.14") are untouched.
  const withoutSeparators = withoutAccents.replace(/(?<=\d)[.,](?=\d{3}(?!\d))/g, '');

  return withoutSeparators
    .replace(/[^a-z0-9]+/g, ' ')
    .split(' ')
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token));
}

// Robertson IDF with a floor at zero. Without the floor, a term
// present in more than half the passages gets a negative weight and
// starts PENALIZING the documents that contain it — on a corpus of a
// few dozen passages that happens easily ("corpus", "index").
function inverseDocumentFrequency(total, documentFrequency) {
  return Math.max(0, Math.log(1 + (total - documentFrequency + 0.5) / (documentFrequency + 0.5)));
}

export class Index {
  constructor(data) {
    this.count = data.count;
    this.averageLength = data.averageLength;
    this.documentFrequency = data.documentFrequency;
    this.passages = data.passages;
    this.k1 = data.bm25?.k1 ?? 1.5;
    this.b = data.bm25?.b ?? 0.75;
    this.builtFrom = data.builtFrom;
  }

  static async load(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`index unavailable (HTTP ${response.status})`);
    }
    return new Index(await response.json());
  }

  /**
   * Search. Returns at most `limit` passages ordered by descending
   * score, each with an explanation of why it matched.
   *
   * The score is deliberately NOT normalized to 0..1: BM25 is an open
   * scale that depends on the corpus. Presenting it as a probability
   * would invent precision the method does not have.
   */
  search(query, limit = 3) {
    const terms = normalize(query);
    if (terms.length === 0) return [];

    // A term repeated in the question must not count twice.
    const distinct = [...new Set(terms)];

    const results = [];
    for (const passage of this.passages) {
      let score = 0;
      const matched = [];

      for (const term of distinct) {
        const frequency = passage.tf[term];
        if (!frequency) continue;

        const weight = inverseDocumentFrequency(this.count, this.documentFrequency[term]);
        const norm = 1 - this.b + this.b * (passage.length / this.averageLength);
        const contribution = (weight * (frequency * (this.k1 + 1)))
          / (frequency + this.k1 * norm);

        score += contribution;
        matched.push({ term, frequency, contribution });
      }

      if (score > 0) {
        matched.sort((a, b) => b.contribution - a.contribution);
        results.push({
          passage,
          score,
          explanation: {
            queryTerms: distinct,
            matched,
            coverage: matched.length / distinct.length,
          },
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  }
}

/**
 * Decides whether there is enough basis to answer.
 *
 * WARNING — this threshold is not calibrated. It is a conservative
 * guess, declared as a guess. Calibrating requires the question set in
 * evaluation/questions.md to be reviewed, frozen and measured; until
 * that exists, this number must not be presented as an engineering
 * decision. See evaluation/README.md.
 */
export const UNCALIBRATED_THRESHOLD = {
  score: 1.0,
  coverage: 0.34,
};

export function hasBasis(results, threshold = UNCALIBRATED_THRESHOLD) {
  if (results.length === 0) return false;
  const top = results[0];
  return top.score >= threshold.score && top.explanation.coverage >= threshold.coverage;
}

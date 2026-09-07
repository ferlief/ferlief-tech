// COPIED FROM ferlief/porta-voz (private). Do not edit here: the next
// sync overwrites it. The source, tests, evaluation set and threat
// model live in the other repository; only what the site serves is
// here.
//
// porta-voz.js — the conversation UI.
//
// Exports { id, name, mount, unmount }. That contract came from a
// layout engine ferlief.tech no longer has; it survives because a
// single mount point is all the page needs and the shape is easy to
// test. mount() builds all of its DOM inside the container and keeps
// the references unmount() needs to tear down.
//
// SECURITY RULE FOR THIS FILE: no text that is not a literal in this
// source enters the DOM through innerHTML. Corpus passages, the
// visitor's question, and model output are ALWAYS textContent. The
// corpus is hand-written markdown and model output is influenced by
// the question; rendering either as HTML is self-inflicted XSS. See
// THREAT-MODEL.md, T-3.

import { Index, hasBasis, UNCALIBRATED_THRESHOLD } from './retrieval.js';

// Relative to js/porta-voz/ in this repository — the index is served
// from data/, alongside the activity feed.
const INDEX_URL = new URL('../../data/porta-voz-indice.json', import.meta.url).href;

// Interface strings are Portuguese: this is copy the visitor reads,
// and the corpus behind it is Portuguese. See CODE_STANDARDS.md § 1.
const EXAMPLES = [
  'o que é o porta-voz?',
  'por que BM25 e não embeddings?',
  'como funciona o motor de layouts?',
  'quanto custa rodar isso?',
];

let state = null;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text; // never innerHTML
  return node;
}

function buildProvenance(result) {
  const { passage, score, explanation } = result;

  const block = el('article', 'pv-passage');
  block.appendChild(el('h3', 'pv-passage-title', passage.title));
  block.appendChild(el('p', 'pv-passage-text', passage.text));

  const footer = el('footer', 'pv-provenance');
  footer.appendChild(el('span', 'pv-file', passage.source.file));

  const details = el('details', 'pv-explanation');
  details.appendChild(el('summary', null, `score ${score.toFixed(2)} — por que casou`));

  const list = el('ul', 'pv-terms');
  for (const { term, frequency, contribution } of explanation.matched) {
    list.appendChild(
      el('li', null, `${term} — aparece ${frequency}×, peso ${contribution.toFixed(2)}`),
    );
  }
  details.appendChild(list);

  const missing = explanation.queryTerms.filter(
    (term) => !explanation.matched.some((m) => m.term === term),
  );
  if (missing.length > 0) {
    details.appendChild(
      el('p', 'pv-missing', `não encontrados no corpus: ${missing.join(', ')}`),
    );
  }

  footer.appendChild(details);
  block.appendChild(footer);
  return block;
}

function buildAbstention(results) {
  const block = el('div', 'pv-abstention');
  block.appendChild(
    el('p', null,
      'Não tenho base no corpus para responder isso. Prefiro dizer que ' +
      'não sei a inventar uma resposta que soe como ela.'),
  );
  if (results.length > 0) {
    block.appendChild(
      el('p', 'pv-abstention-note',
        `O melhor casamento ficou em ${results[0].score.toFixed(2)}, ` +
        `abaixo do limiar de ${UNCALIBRATED_THRESHOLD.score.toFixed(2)}.`),
    );
  }
  return block;
}

function answer(question) {
  const { index, response } = state;
  response.replaceChildren();

  const echo = el('p', 'pv-question-echo');
  echo.appendChild(el('span', 'pv-label', 'pergunta'));
  echo.appendChild(el('span', null, question)); // textContent, not innerHTML
  response.appendChild(echo);

  const results = index.search(question, 3);

  if (!hasBasis(results)) {
    response.appendChild(buildAbstention(results));
    return;
  }

  response.appendChild(el('p', 'pv-passages-heading', 'Do que ela escreveu:'));
  for (const result of results) {
    response.appendChild(buildProvenance(result));
  }

  // Layer 1 sits behind an explicit click: downloading ~900 MB on
  // someone's connection without asking is not acceptable, and the
  // answer above is already complete without it.
  const offer = el('div', 'pv-generate-offer');
  offer.appendChild(
    el('p', 'pv-offer-text',
      'Quer isso redigido como resposta corrida? O modelo baixa e roda ' +
      'na sua máquina — nada é enviado para servidor nenhum.'),
  );
  const button = el('button', 'pv-generate-button', 'Gerar na minha máquina');
  button.type = 'button';
  button.addEventListener('click', () => startGeneration(results, question, offer));
  offer.appendChild(button);
  response.appendChild(offer);
}

async function startGeneration(results, question, host) {
  host.replaceChildren();
  const status = el('p', 'pv-generate-status', 'Verificando suporte a WebGPU…');
  host.appendChild(status);

  try {
    const { generate, checkSupport } = await import('./generation.js');
    const support = await checkSupport();
    if (!support.ok) {
      status.textContent =
        `Geração indisponível neste navegador: ${support.reason}. ` +
        'Os trechos acima continuam valendo — eles são a resposta.';
      return;
    }

    const output = el('p', 'pv-generated-text');
    host.appendChild(output);

    await generate({
      question,
      passages: results.map((r) => r.passage),
      onProgress: (message) => { status.textContent = message; },
      onToken: (chunk) => {
        status.textContent = 'Gerando na sua GPU…';
        output.textContent += chunk; // append textContent, never innerHTML
      },
    });

    status.textContent =
      'Gerado localmente. Os trechos citados acima são a fonte — ' +
      'este parágrafo é reescrita, e pode conter erro do modelo.';
  } catch (error) {
    status.textContent = `Falhou: ${error.message}. Os trechos acima continuam valendo.`;
  }
}

export default {
  id: 'porta-voz',
  name: 'Porta-voz',

  mount(container) {
    const root = el('section', 'pv-root');

    const header = el('header', 'pv-header');
    header.appendChild(el('h2', 'pv-title', 'Porta-voz'));
    header.appendChild(
      el('p', 'pv-subtitle',
        'Responde só com texto revisado, e cita de onde veio. ' +
        'Roda no seu navegador — a pergunta não sai desta aba.'),
    );
    root.appendChild(header);

    const form = el('form', 'pv-form');
    const field = el('input', 'pv-field');
    field.type = 'text';
    field.name = 'pergunta';
    field.autocomplete = 'off';
    field.placeholder = 'pergunte alguma coisa…';
    field.setAttribute('aria-label', 'Sua pergunta');

    const submit = el('button', 'pv-submit', 'Perguntar');
    submit.type = 'submit';
    submit.disabled = true;

    form.append(field, submit);
    root.appendChild(form);

    const suggestions = el('ul', 'pv-suggestions');
    for (const example of EXAMPLES) {
      const item = el('li');
      const button = el('button', 'pv-suggestion', example);
      button.type = 'button';
      button.addEventListener('click', () => {
        field.value = example;
        form.requestSubmit();
      });
      item.appendChild(button);
      suggestions.appendChild(item);
    }
    root.appendChild(suggestions);

    const response = el('div', 'pv-response');
    response.setAttribute('aria-live', 'polite');
    root.appendChild(response);

    const footer = el('footer', 'pv-footer');
    root.appendChild(footer);

    container.appendChild(root);

    const onSubmit = (event) => {
      event.preventDefault();
      const question = field.value.trim();
      if (question) answer(question);
    };
    form.addEventListener('submit', onSubmit);

    state = { root, form, field, submit, response, index: null, onSubmit };

    Index.load(INDEX_URL).then(
      (index) => {
        if (!state || state.root !== root) return; // unmounted mid-fetch
        state.index = index;
        submit.disabled = false;
        footer.textContent =
          `${index.passages.length} passagens revisadas · corpus de ` +
          `${index.builtFrom} · nenhuma chamada de rede a partir daqui`;
      },
      (error) => {
        if (!state || state.root !== root) return;
        footer.textContent = `Índice não carregou: ${error.message}`;
      },
    );
  },

  unmount() {
    if (!state) return;
    state.form.removeEventListener('submit', state.onSubmit);
    state.root.remove();
    state = null;
  },
};

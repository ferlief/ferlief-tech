// porta-voz.js — layout de conversa para o motor de ferlief.tech.
//
// Implementa o contrato de js/motor.js: { id, nome, mount, unmount }.
// mount() cria todo o DOM dentro do container e guarda as referências
// que unmount() precisa desfazer — o motor não limpa como rede de
// segurança.
//
// REGRA DE SEGURANÇA DESTE ARQUIVO: nenhum texto que não seja
// literal deste código entra no DOM via innerHTML. Passagem do
// corpus, pergunta do visitante e saída de modelo são SEMPRE
// textContent. O corpus é markdown escrito por uma pessoa e a saída
// do modelo é influenciável pela pergunta; renderizar qualquer um
// dos dois como HTML é XSS auto-infligido. Ver AMEACAS.md, A-3.

import { Indice, temBase, LIMIAR_NAO_CALIBRADO } from './recuperacao.js';

const URL_INDICE = new URL('../dados/indice.json', import.meta.url).href;

const EXEMPLOS = [
  'o que é o porta-voz?',
  'por que BM25 e não embeddings?',
  'como funciona o motor de layouts?',
  'quanto custa rodar isso?',
];

let estado = null;

function el(tag, classe, texto) {
  const n = document.createElement(tag);
  if (classe) n.className = classe;
  if (texto !== undefined) n.textContent = texto; // nunca innerHTML
  return n;
}

function montarProcedencia(resultado) {
  const { passagem, score, explicacao } = resultado;

  const bloco = el('article', 'pv-passagem');
  bloco.appendChild(el('h3', 'pv-passagem-titulo', passagem.titulo));
  bloco.appendChild(el('p', 'pv-passagem-texto', passagem.texto));

  const rodape = el('footer', 'pv-procedencia');
  rodape.appendChild(el('span', 'pv-arquivo', passagem.origem.arquivo));

  const detalhe = el('details', 'pv-explicacao');
  detalhe.appendChild(el('summary', null, `score ${score.toFixed(2)} — por que casou`));

  const lista = el('ul', 'pv-termos');
  for (const { termo, tf, parcela } of explicacao.casaram) {
    lista.appendChild(
      el('li', null, `${termo} — aparece ${tf}×, peso ${parcela.toFixed(2)}`),
    );
  }
  detalhe.appendChild(lista);

  const ausentes = explicacao.termosConsulta.filter(
    (t) => !explicacao.casaram.some((c) => c.termo === t),
  );
  if (ausentes.length > 0) {
    detalhe.appendChild(
      el('p', 'pv-ausentes', `não encontrados no corpus: ${ausentes.join(', ')}`),
    );
  }

  rodape.appendChild(detalhe);
  bloco.appendChild(rodape);
  return bloco;
}

function montarAbstencao(resultados) {
  const bloco = el('div', 'pv-abstencao');
  bloco.appendChild(
    el('p', null,
      'Não tenho base no corpus para responder isso. Prefiro dizer que ' +
      'não sei a inventar uma resposta que soe como ela.'),
  );
  if (resultados.length > 0) {
    bloco.appendChild(
      el('p', 'pv-abstencao-nota',
        `O melhor casamento ficou em ${resultados[0].score.toFixed(2)}, ` +
        `abaixo do limiar de ${LIMIAR_NAO_CALIBRADO.score.toFixed(2)}.`),
    );
  }
  return bloco;
}

function responder(pergunta) {
  const { indice, resposta } = estado;
  resposta.replaceChildren();

  const eco = el('p', 'pv-pergunta-eco');
  eco.appendChild(el('span', 'pv-rotulo', 'pergunta'));
  eco.appendChild(el('span', null, pergunta)); // textContent, não innerHTML
  resposta.appendChild(eco);

  const resultados = indice.buscar(pergunta, 3);

  if (!temBase(resultados)) {
    resposta.appendChild(montarAbstencao(resultados));
    return;
  }

  resposta.appendChild(
    el('p', 'pv-cabecalho-trechos', 'Do que ela escreveu:'),
  );
  for (const r of resultados) {
    resposta.appendChild(montarProcedencia(r));
  }

  // Camada 1 fica atrás de um clique explícito: baixar ~900 MB na
  // conexão de alguém sem perguntar não é aceitável, e a resposta
  // acima já é completa sem isso.
  const acao = el('div', 'pv-oferta-geracao');
  acao.appendChild(
    el('p', 'pv-oferta-texto',
      'Quer isso redigido como resposta corrida? O modelo baixa e roda ' +
      'na sua máquina — nada é enviado para servidor nenhum.'),
  );
  const botao = el('button', 'pv-btn-gerar', 'Gerar na minha máquina');
  botao.type = 'button';
  botao.addEventListener('click', () => iniciarGeracao(resultados, pergunta, acao));
  acao.appendChild(botao);
  resposta.appendChild(acao);
}

async function iniciarGeracao(resultados, pergunta, hospedeiro) {
  hospedeiro.replaceChildren();
  const estadoTexto = el('p', 'pv-estado-geracao', 'Verificando suporte a WebGPU…');
  hospedeiro.appendChild(estadoTexto);

  try {
    const { gerar, verificarSuporte } = await import('./geracao.js');
    const suporte = await verificarSuporte();
    if (!suporte.ok) {
      estadoTexto.textContent =
        `Geração indisponível neste navegador: ${suporte.motivo}. ` +
        'Os trechos acima continuam valendo — eles são a resposta.';
      return;
    }

    const saida = el('p', 'pv-texto-gerado');
    hospedeiro.appendChild(saida);

    await gerar({
      pergunta,
      passagens: resultados.map((r) => r.passagem),
      aoProgredir: (msg) => { estadoTexto.textContent = msg; },
      aoEmitir: (pedaco) => {
        estadoTexto.textContent = 'Gerando na sua GPU…';
        saida.textContent += pedaco; // append textContent, nunca innerHTML
      },
    });

    estadoTexto.textContent =
      'Gerado localmente. Os trechos citados acima são a fonte — ' +
      'este parágrafo é reescrita, e pode conter erro do modelo.';
  } catch (erro) {
    estadoTexto.textContent = `Falhou: ${erro.message}. Os trechos acima continuam valendo.`;
  }
}

export default {
  id: 'porta-voz',
  nome: 'Porta-voz',

  mount(container) {
    const raiz = el('section', 'pv-raiz');

    const cabecalho = el('header', 'pv-cabecalho');
    cabecalho.appendChild(el('h2', 'pv-titulo', 'Porta-voz'));
    cabecalho.appendChild(
      el('p', 'pv-subtitulo',
        'Responde só com texto revisado, e cita de onde veio. ' +
        'Roda no seu navegador — a pergunta não sai desta aba.'),
    );
    raiz.appendChild(cabecalho);

    const form = el('form', 'pv-form');
    const campo = el('input', 'pv-campo');
    campo.type = 'text';
    campo.name = 'pergunta';
    campo.autocomplete = 'off';
    campo.placeholder = 'pergunte alguma coisa…';
    campo.setAttribute('aria-label', 'Sua pergunta');

    const enviar = el('button', 'pv-enviar', 'Perguntar');
    enviar.type = 'submit';
    enviar.disabled = true;

    form.append(campo, enviar);
    raiz.appendChild(form);

    const sugestoes = el('ul', 'pv-sugestoes');
    for (const exemplo of EXEMPLOS) {
      const item = el('li');
      const b = el('button', 'pv-sugestao', exemplo);
      b.type = 'button';
      b.addEventListener('click', () => {
        campo.value = exemplo;
        form.requestSubmit();
      });
      item.appendChild(b);
      sugestoes.appendChild(item);
    }
    raiz.appendChild(sugestoes);

    const resposta = el('div', 'pv-resposta');
    resposta.setAttribute('aria-live', 'polite');
    raiz.appendChild(resposta);

    const rodape = el('footer', 'pv-rodape');
    raiz.appendChild(rodape);

    container.appendChild(raiz);

    const aoEnviar = (evento) => {
      evento.preventDefault();
      const pergunta = campo.value.trim();
      if (pergunta) responder(pergunta);
    };
    form.addEventListener('submit', aoEnviar);

    estado = { raiz, form, campo, enviar, resposta, indice: null, aoEnviar };

    Indice.carregar(URL_INDICE).then(
      (indice) => {
        if (!estado || estado.raiz !== raiz) return; // desmontou durante o fetch
        estado.indice = indice;
        enviar.disabled = false;
        rodape.textContent =
          `${indice.passagens.length} passagens revisadas · índice de ` +
          `${indice.geradoEm.slice(0, 10)} · nenhuma chamada de rede a partir daqui`;
      },
      (erro) => {
        if (!estado || estado.raiz !== raiz) return;
        rodape.textContent = `Índice não carregou: ${erro.message}`;
      },
    );
  },

  unmount() {
    if (!estado) return;
    estado.form.removeEventListener('submit', estado.aoEnviar);
    estado.raiz.remove();
    estado = null;
  },
};

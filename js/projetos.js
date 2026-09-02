// projetos.js — lista de projetos abertos em /projetos, a partir de
// data/atividade.json (mesma fonte do rodapé de atividade: só lê,
// nunca decide nem inventa número). Descrição de cada projeto ainda
// não foi escrita — fica marcada como pendente em vez de inventada.

import { EVENTO_MUDANCA, idiomaEfetivo, t } from './i18n.js';

let projetos = [];

function formatarData(iso) {
  const idioma = idiomaEfetivo() === 'en' ? 'en-US' : 'pt-BR';
  return new Intl.DateTimeFormat(idioma, { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
}

function renderLista() {
  const raiz = document.getElementById('projetos-lista');
  if (!raiz) return;

  if (!projetos.length) return;

  raiz.replaceChildren(
    ...projetos.map((projeto) => {
      const card = document.createElement('article');
      card.className = 'projeto-card';

      const nome = document.createElement('h3');
      nome.className = 'projeto-nome';
      nome.textContent = projeto.repo;

      const desc = document.createElement('p');
      desc.className = 'projeto-desc';
      desc.textContent = t('proj.descricaoPendente');

      const link = document.createElement('a');
      link.className = 'projeto-link';
      link.href = projeto.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = t('proj.linkRepo');

      card.append(nome, desc, link);

      if (projeto.ultimo_commit) {
        const commit = document.createElement('p');
        commit.className = 'projeto-commit';
        commit.textContent = `${formatarData(projeto.ultimo_commit.data)} — ${projeto.ultimo_commit.mensagem}`;
        card.appendChild(commit);
      }

      return card;
    }),
  );
}

async function montarProjetos() {
  const raiz = document.getElementById('projetos-lista');
  if (!raiz) return;

  try {
    const resposta = await fetch('/data/atividade.json', { cache: 'no-store' });
    if (!resposta.ok) return;
    const dados = await resposta.json();
    projetos = dados.projetos || [];
  } catch {
    return;
  }

  renderLista();
}

window.addEventListener(EVENTO_MUDANCA, renderLista);

montarProjetos();

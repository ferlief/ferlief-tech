// atividade.js — feed de atividade verificável, alimentado por
// data/atividade.json (gerado por .github/workflows/atividade.yml, que
// lê a API pública do GitHub). Só lê; nunca decide nem inventa número —
// se um projeto ainda não tem resultados.json publicado, o campo
// 'resultado' fica ausente no rodapé, não zerado ou inventado.

import { EVENTO_MUDANCA, t } from './i18n.js';

async function montarAtividade() {
  const raiz = document.getElementById('atividade-root');
  if (!raiz) return;

  let dados;
  try {
    const resposta = await fetch('/data/atividade.json', { cache: 'no-store' });
    if (!resposta.ok) return;
    dados = await resposta.json();
  } catch {
    return;
  }

  const projetos = (dados.projetos || []).filter((p) => p.ultimo_commit);
  if (!projetos.length) return;

  const lista = document.createElement('div');
  lista.className = 'atividade-lista';

  for (const projeto of projetos) {
    const item = document.createElement('a');
    item.className = 'atividade-item';
    item.href = projeto.url;
    item.target = '_blank';
    item.rel = 'noopener';

    const repo = document.createElement('span');
    repo.className = 'atividade-repo';
    repo.textContent = projeto.repo;
    item.appendChild(repo);

    const commit = document.createElement('span');
    commit.className = 'atividade-commit';
    commit.textContent = projeto.ultimo_commit.mensagem;
    item.appendChild(commit);

    if (projeto.resultado && projeto.resultado.rotulo) {
      const resultado = document.createElement('span');
      resultado.className = 'atividade-resultado';
      resultado.textContent = projeto.resultado.rotulo;
      item.appendChild(resultado);
    }

    lista.appendChild(item);
  }

  const rotulo = document.createElement('span');
  rotulo.className = 'atividade-rotulo';
  rotulo.textContent = t('atividade.rotulo');

  raiz.replaceChildren(rotulo, lista);
}

window.addEventListener(EVENTO_MUDANCA, () => {
  const rotulo = document.querySelector('#atividade-root .atividade-rotulo');
  if (rotulo) rotulo.textContent = t('atividade.rotulo');
});

montarAtividade();

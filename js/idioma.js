// idioma.js — toggle PT/EN, mesmo padrão de js/tema.js: o botão
// mostra o idioma-alvo (bandeira + nome no próprio idioma, não
// traduzido — é convenção de seletor de idioma, não texto de UI).
//
// Também aplica a tradução genérica de texto estático da página:
// qualquer elemento com [data-i18n="chave"] recebe t(chave) como
// textContent, e [data-i18n-aria-label="chave"] recebe t(chave) como
// aria-label. Isso cobre nav, títulos e parágrafos fixos de qualquer
// página sem precisar de script dedicado. Conteúdo montado em runtime
// (js/projetos.js, js/atividade.js) escuta EVENTO_MUDANCA e cuida da
// própria re-renderização.
//
// Roda em toda página que inclui este módulo, com ou sem #btn-idioma
// no DOM (a home tem o botão; qualquer página com header compartilhado
// também tem, mas a tradução genérica não depende disso).

import { EVENTO_MUDANCA, idiomaEfetivo, definirIdioma, t } from './i18n.js';

const NOME_IDIOMA = { pt: 'Português', en: 'English' };

const btn = document.getElementById('btn-idioma');
const shape = btn?.querySelector('.shape');
const label = document.getElementById('btn-idioma-label');

function aplicarTextosEstaticos() {
  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
  });
}

function sincronizarBotao() {
  const atual = idiomaEfetivo();
  const alvo = atual === 'pt' ? 'en' : 'pt';

  btn.setAttribute('aria-pressed', String(atual === 'en'));
  btn.setAttribute('aria-label', `${atual === 'pt' ? 'Switch to English' : 'Mudar para português'}`);
  shape.className = `shape ${alvo === 'en' ? 'shape-bandeira-uk' : 'shape-bandeira-br'}`;
  label.textContent = NOME_IDIOMA[alvo];
}

function alternar() {
  definirIdioma(idiomaEfetivo() === 'pt' ? 'en' : 'pt');
}

if (btn) {
  btn.addEventListener('click', alternar);
  sincronizarBotao();
}

window.addEventListener(EVENTO_MUDANCA, () => {
  if (btn) sincronizarBotao();
  aplicarTextosEstaticos();
});

aplicarTextosEstaticos();

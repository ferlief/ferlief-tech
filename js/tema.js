// tema.js — toggle claro/escuro.
//
// Estado: data-theme em <html> ('light' | 'dark' | ausente). Ausente
// significa "segue a preferência de sistema" — é o que css/base.css
// resolve via prefers-color-scheme. Uma escolha explícita no botão
// grava data-theme e persiste em localStorage; a partir daí o site
// ignora mudança de preferência de sistema até o usuário limpar o
// localStorage.
//
// O flash-guard que lê localStorage antes do primeiro paint está
// inline em index.html, não aqui — este módulo carrega depois do CSS
// e só sincroniza rótulo/aria-pressed do botão com o estado já
// aplicado.

import { EVENTO_MUDANCA, t } from './i18n.js';

const STORAGE_KEY = 'tema';

const btn = document.getElementById('btn-tema');
const shape = btn?.querySelector('.shape');
const label = document.getElementById('btn-tema-label');
const sistemaEscuro = window.matchMedia('(prefers-color-scheme: dark)');

function temaEfetivo() {
  const explicito = document.documentElement.dataset.theme;
  if (explicito === 'light' || explicito === 'dark') return explicito;
  return sistemaEscuro.matches ? 'dark' : 'light';
}

function sincronizarBotao() {
  const atual = temaEfetivo();
  const alvo = atual === 'dark' ? 'light' : 'dark';

  btn.setAttribute('aria-pressed', String(atual === 'light'));
  shape.className = `shape ${alvo === 'light' ? 'shape-sol' : 'shape-lua'}`;
  label.textContent = alvo === 'light' ? t('tema.claro') : t('tema.escuro');
}

function alternar() {
  const proximo = temaEfetivo() === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = proximo;
  try {
    localStorage.setItem(STORAGE_KEY, proximo);
  } catch {}
  sincronizarBotao();
}

if (btn) {
  btn.addEventListener('click', alternar);
  sistemaEscuro.addEventListener('change', () => {
    if (!document.documentElement.dataset.theme) sincronizarBotao();
  });
  window.addEventListener(EVENTO_MUDANCA, sincronizarBotao);
  sincronizarBotao();
}

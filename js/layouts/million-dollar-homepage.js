// million-dollar-homepage.js — grade de blocos, cada um mapeado a uma
// tecnologia real do stack. Hover (ou foco por teclado) mostra uma
// prévia no painel lateral; clique fixa o bloco até outro clique ou Esc.
//
// Implementa o contrato de layout definido em js/motor.js:
// export default { id, nome, mount(container), unmount() }.

import { EVENTO_MUDANCA, t } from '../i18n.js';

const CSS_HREF = 'css/million-dollar-homepage.css';
const CSS_ID = 'css-million-dollar-homepage';

// Conjunto de tecnologias reais do stack (ver CLAUDE.md do repositório
// e dos projetos irmãos em dev/workspace). Cada uma vira um bloco na
// grade, identificada por uma sigla curta e uma cor própria. nome/
// sigla/cor não mudam com idioma (são nomes próprios); categoria e
// descrição vêm do dicionário (js/i18n.js) via as chaves abaixo.
const TECNOLOGIAS = [
  { id: 'python', sigla: 'PY', nome: 'Python', categoriaChave: 'categoria.linguagem', cor: '#f4c542',
    descricaoChave: 'tech.python' },
  { id: 'sqlite', sigla: 'SQL', nome: 'SQLite', categoriaChave: 'categoria.dados', cor: '#5ecbf0',
    descricaoChave: 'tech.sqlite' },
  { id: 'git', sigla: 'GIT', nome: 'Git', categoriaChave: 'categoria.ferramentas', cor: '#f0654d',
    descricaoChave: 'tech.git' },
  { id: 'clip', sigla: 'CLIP', nome: 'CLIP', categoriaChave: 'categoria.visao', cor: '#b48af0',
    descricaoChave: 'tech.clip' },
  { id: 'pytorch', sigla: 'PT', nome: 'PyTorch', categoriaChave: 'categoria.deeplearning', cor: '#f0764d',
    descricaoChave: 'tech.pytorch' },
  { id: 'js-vanilla', sigla: 'JS', nome: 'JavaScript vanilla', categoriaChave: 'categoria.frontend', cor: '#f0d642',
    descricaoChave: 'tech.js-vanilla' },
  { id: 'phash', sigla: 'PHASH', nome: 'Hash perceptual', categoriaChave: 'categoria.visao', cor: '#5ef0a8',
    descricaoChave: 'tech.phash' },
  { id: 'peft', sigla: 'PEFT', nome: 'PEFT / LoRA', categoriaChave: 'categoria.deeplearning', cor: '#f05ec2',
    descricaoChave: 'tech.peft' },
  { id: 'docker', sigla: 'DKR', nome: 'Docker', categoriaChave: 'categoria.infra', cor: '#5e9bf0',
    descricaoChave: 'tech.docker' },
  { id: 'cli', sigla: 'SH', nome: 'Linux / CLI', categoriaChave: 'categoria.ferramentas', cor: '#9ef05e',
    descricaoChave: 'tech.cli' },
  { id: 'html-css', sigla: 'CSS', nome: 'HTML & CSS', categoriaChave: 'categoria.frontend', cor: '#f0975e',
    descricaoChave: 'tech.html-css' },
  { id: 'numpy', sigla: 'NP', nome: 'NumPy / Pandas', categoriaChave: 'categoria.dados', cor: '#7ef0e0',
    descricaoChave: 'tech.numpy' },
];

const COLUNAS = 8;
const LINHAS = 6;
const TOTAL_BLOCOS = COLUNAS * LINHAS;

// Passo coprimo com TECNOLOGIAS.length (12) para espalhar as
// tecnologias pela grade sem repetir vizinhos, de forma determinística
// (mesmo resultado a cada mount, sem depender de Math.random).
const PASSO = 7;

function tecnologiaDoBloco(indice) {
  return TECNOLOGIAS[(indice * PASSO) % TECNOLOGIAS.length];
}

// Estado e referências vivas apenas entre mount() e unmount().
let listeners = [];
let elementos = null; // { wrapper, grid, painel }
let tecPinada = null; // id da tecnologia fixada por clique, ou null

function on(alvo, tipo, handler, opts) {
  alvo.addEventListener(tipo, handler, opts);
  listeners.push({ alvo, tipo, handler, opts });
}

function removerListeners() {
  for (const { alvo, tipo, handler, opts } of listeners) {
    alvo.removeEventListener(tipo, handler, opts);
  }
  listeners = [];
}

function garantirCss() {
  if (document.getElementById(CSS_ID)) return;
  const link = document.createElement('link');
  link.id = CSS_ID;
  link.rel = 'stylesheet';
  link.href = CSS_HREF;
  document.head.appendChild(link);
}

function removerCss() {
  document.getElementById(CSS_ID)?.remove();
}

function renderPainelVazio(painel) {
  painel.replaceChildren();
  const vazio = document.createElement('p');
  vazio.className = 'mdh-painel-vazio';
  vazio.textContent = t('mdh.painelVazio');
  painel.appendChild(vazio);
}

function renderPainelTech(painel, tech, fixada) {
  painel.replaceChildren();

  const swatch = document.createElement('span');
  swatch.className = 'mdh-painel-swatch';
  swatch.style.setProperty('--cor', tech.cor);
  swatch.setAttribute('aria-hidden', 'true');

  const categoria = document.createElement('p');
  categoria.className = 'mdh-painel-categoria';
  categoria.textContent = t(tech.categoriaChave);

  const nome = document.createElement('h2');
  nome.className = 'mdh-painel-nome';
  nome.textContent = tech.nome;

  const desc = document.createElement('p');
  desc.className = 'mdh-painel-desc';
  desc.textContent = t(tech.descricaoChave);

  painel.append(swatch, categoria, nome, desc);

  if (fixada) {
    const estado = document.createElement('p');
    estado.className = 'mdh-painel-estado';
    estado.textContent = t('mdh.painelFixado');
    painel.appendChild(estado);
  }
}

function atualizarPainel() {
  const { painel } = elementos;
  if (tecPinada) {
    const tech = TECNOLOGIAS.find((t) => t.id === tecPinada);
    renderPainelTech(painel, tech, true);
  } else {
    renderPainelVazio(painel);
  }
}

function mostrarPreview(techId) {
  const tech = TECNOLOGIAS.find((t) => t.id === techId);
  if (!tech) return;
  renderPainelTech(elementos.painel, tech, tech.id === tecPinada);
}

function atualizarAriaPressed() {
  for (const bloco of elementos.grid.children) {
    bloco.setAttribute('aria-pressed', String(bloco.dataset.techId === tecPinada));
  }
}

function alternarFixar(techId) {
  tecPinada = tecPinada === techId ? null : techId;
  atualizarAriaPressed();
  atualizarPainel();
}

function blocoDoEvento(evento) {
  return evento.target.closest?.('.mdh-bloco') ?? null;
}

function montarDom(container) {
  const wrapper = document.createElement('div');
  wrapper.className = 'mdh-layout';

  const intro = document.createElement('p');
  intro.className = 'mdh-intro';
  preencherIntro(intro);

  const area = document.createElement('div');
  area.className = 'mdh-area';

  const grid = document.createElement('div');
  grid.className = 'mdh-grid';
  grid.setAttribute('role', 'list');

  for (let i = 0; i < TOTAL_BLOCOS; i++) {
    const tech = tecnologiaDoBloco(i);

    const bloco = document.createElement('button');
    bloco.type = 'button';
    bloco.className = 'mdh-bloco';
    bloco.dataset.techId = tech.id;
    bloco.style.setProperty('--cor', tech.cor);
    bloco.setAttribute('role', 'listitem');
    bloco.setAttribute('aria-pressed', 'false');
    bloco.setAttribute('aria-label', `${tech.nome} — ${t(tech.categoriaChave)}`);
    bloco.textContent = tech.sigla;

    grid.appendChild(bloco);
  }

  const painel = document.createElement('aside');
  painel.className = 'mdh-painel';
  painel.setAttribute('aria-live', 'polite');

  area.append(grid, painel);
  wrapper.append(intro, area);
  container.appendChild(wrapper);

  return { wrapper, intro, grid, painel };
}

function preencherIntro(intro) {
  intro.replaceChildren();
  const titulo = document.createElement('strong');
  titulo.textContent = t('mdh.introTitulo');
  intro.append(titulo, document.createTextNode(t('mdh.introTexto')));
}

// Reaplica textos traduzidos sem remontar o DOM: intro, aria-label de
// cada bloco (que embute a categoria) e o painel lateral, no estado
// em que já estava (fixado ou vazio — não tenta preservar um preview
// de hover transitório).
function atualizarTextosEstaticos() {
  if (!elementos) return;

  preencherIntro(elementos.intro);

  for (const bloco of elementos.grid.children) {
    const tech = TECNOLOGIAS.find((tec) => tec.id === bloco.dataset.techId);
    if (tech) bloco.setAttribute('aria-label', `${tech.nome} — ${t(tech.categoriaChave)}`);
  }

  atualizarPainel();
}

const layout = {
  id: 'million-dollar-homepage',
  nome: 'Million Dollar Homepage',

  mount(container) {
    garantirCss();

    tecPinada = null;
    elementos = montarDom(container);
    renderPainelVazio(elementos.painel);

    const { grid } = elementos;

    on(grid, 'pointerover', (ev) => {
      const bloco = blocoDoEvento(ev);
      if (bloco) mostrarPreview(bloco.dataset.techId);
    });

    on(grid, 'focusin', (ev) => {
      const bloco = blocoDoEvento(ev);
      if (bloco) mostrarPreview(bloco.dataset.techId);
    });

    on(grid, 'pointerleave', () => atualizarPainel());

    on(grid, 'focusout', (ev) => {
      // Só volta ao estado "padrão/fixado" quando o foco realmente sai
      // da grade (não ao pular de um bloco para o vizinho).
      if (!grid.contains(ev.relatedTarget)) atualizarPainel();
    });

    on(grid, 'click', (ev) => {
      const bloco = blocoDoEvento(ev);
      if (bloco) alternarFixar(bloco.dataset.techId);
    });

    on(document, 'keydown', (ev) => {
      if (ev.key === 'Escape' && tecPinada) {
        tecPinada = null;
        atualizarAriaPressed();
        atualizarPainel();
      }
    });

    on(window, EVENTO_MUDANCA, atualizarTextosEstaticos);
  },

  unmount() {
    removerListeners();
    removerCss();
    elementos?.wrapper.remove();
    elementos = null;
    tecPinada = null;
  },
};

export default layout;

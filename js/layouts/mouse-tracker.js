// mouse-tracker.js — layout "Mouse Tracker": grade de setas que giram para
// apontar para o cursor, ângulo calculado via Math.atan2(dy, dx) a cada
// frame.
//
// CSS específico (css/mouse-tracker.css) é injetado como <link> em
// document.head dentro de mount() e removido em unmount() — não há
// <link> estático em index.html para este layout. Decisão: o HTML raiz
// não deveria conhecer o CSS de um layout específico do catálogo (isso
// acoplaria o esqueleto estático a uma escolha que só o motor faz em
// runtime); cada módulo de layout é responsável pelo próprio CSS,
// simetricamente ao que já faz com o próprio DOM em mount/unmount.

const CSS_HREF = 'css/mouse-tracker.css';
const CSS_MARCADOR = 'mouse-tracker'; // data-layout-css do <link>, evita duplicar se algo já injetou

const TAMANHO_CELULA = 48; // px — lado alvo de cada célula da grade
const RAIO_DESTAQUE = 280; // px — distância além da qual a seta fica no opacity mínimo
const OPACITY_MIN = 0.28;

// Estado do módulo (uma instância monta por vez, conforme contrato) ----
let containerEl = null;
let linkEl = null;
let celulas = []; // [{ el, cx, cy }] — cx/cy = centro da célula em coords de viewport
let mouseX = 0;
let mouseY = 0;
let rafId = null;
let resizeTimer = null;

function injetarCss() {
  if (document.querySelector(`link[data-layout-css="${CSS_MARCADOR}"]`)) return;
  linkEl = document.createElement('link');
  linkEl.rel = 'stylesheet';
  linkEl.href = CSS_HREF;
  linkEl.dataset.layoutCss = CSS_MARCADOR;
  document.head.appendChild(linkEl);
}

function removerCss() {
  linkEl?.remove();
  linkEl = null;
}

// Reconstrói a grade inteira a partir do tamanho atual do container.
// Chamada em mount() e de novo (com debounce) a cada resize, já que o
// número de colunas/linhas depende do espaço disponível.
function construirGrade() {
  containerEl.replaceChildren();
  celulas = [];

  const { width, height } = containerEl.getBoundingClientRect();
  const colunas = Math.max(1, Math.floor(width / TAMANHO_CELULA));
  const linhas = Math.max(1, Math.floor(height / TAMANHO_CELULA));

  const grade = document.createElement('div');
  grade.className = 'mt-grade';
  // Geometria do grid (display/colunas/linhas/tamanho) é toda inline,
  // de propósito — não depende do <link> de mouse-tracker.css, que
  // carrega de forma assíncrona. Se essas regras vivessem só no CSS
  // externo, o getBoundingClientRect() logo abaixo (usado pra cachear o
  // centro de cada célula) rodaria antes do stylesheet chegar na
  // primeira montagem, medindo caixas no layout padrão do navegador em
  // vez do grid real. O CSS externo cuida só do que é puramente
  // decorativo (forma da seta, cor, transição) e pode chegar depois sem
  // quebrar o cálculo de ângulo.
  grade.style.display = 'grid';
  grade.style.gridTemplateColumns = `repeat(${colunas}, 1fr)`;
  grade.style.gridTemplateRows = `repeat(${linhas}, 1fr)`;
  // Largura/altura fixadas em px (não 100%): #layout-root só tem
  // min-height via CSS, então uma altura percentual no filho resolveria
  // para 'auto' e o grid colapsaria para a altura do conteúdo em vez de
  // preencher o container.
  grade.style.width = `${width}px`;
  grade.style.height = `${height}px`;

  for (let i = 0; i < colunas * linhas; i++) {
    const celula = document.createElement('div');
    celula.className = 'mt-celula';

    const seta = document.createElement('div');
    seta.className = 'mt-seta';
    celula.appendChild(seta);

    grade.appendChild(celula);
  }

  containerEl.appendChild(grade);

  // Centros calculados uma vez após o layout estar no DOM — lidos aqui,
  // fora do loop de animação, para o rAF só escrever (rotate/opacity) e
  // nunca ler geometria a cada frame.
  for (const celula of grade.children) {
    const rect = celula.getBoundingClientRect();
    celulas.push({
      el: celula.firstElementChild,
      cx: rect.left + rect.width / 2,
      cy: rect.top + rect.height / 2,
    });
  }
}

function apontarParaCursor() {
  for (const { el, cx, cy } of celulas) {
    const dx = mouseX - cx;
    const dy = mouseY - cy;
    const anguloGraus = Math.atan2(dy, dx) * (180 / Math.PI);
    const distancia = Math.hypot(dx, dy);
    const opacity = OPACITY_MIN + (1 - OPACITY_MIN) * Math.max(0, 1 - distancia / RAIO_DESTAQUE);

    el.style.transform = `rotate(${anguloGraus}deg)`;
    el.style.opacity = opacity.toFixed(3);
  }

  rafId = requestAnimationFrame(apontarParaCursor);
}

function onMouseMove(evento) {
  mouseX = evento.clientX;
  mouseY = evento.clientY;
}

function onResize() {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(construirGrade, 150);
}

function mount(container) {
  containerEl = container;

  injetarCss();
  construirGrade();

  // Mira inicial no centro do viewport, pra grade já nascer com um
  // padrão de setas divergentes em vez de todas apontando pro canto
  // (0,0) até o primeiro mousemove.
  mouseX = window.innerWidth / 2;
  mouseY = window.innerHeight / 2;

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('resize', onResize);
  rafId = requestAnimationFrame(apontarParaCursor);
}

function unmount() {
  cancelAnimationFrame(rafId);
  rafId = null;

  clearTimeout(resizeTimer);
  resizeTimer = null;

  window.removeEventListener('mousemove', onMouseMove);
  window.removeEventListener('resize', onResize);

  removerCss();

  containerEl?.replaceChildren();
  containerEl = null;
  celulas = [];
}

export default {
  id: 'mouse-tracker',
  nome: 'Mouse Tracker',
  mount,
  unmount,
};

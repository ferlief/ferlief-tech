// million-dollar-homepage.js — grade de blocos, cada um mapeado a uma
// tecnologia real do stack. Hover (ou foco por teclado) mostra uma
// prévia no painel lateral; clique fixa o bloco até outro clique ou Esc.
//
// Implementa o contrato de layout definido em js/motor.js:
// export default { id, nome, mount(container), unmount() }.

const CSS_HREF = 'css/million-dollar-homepage.css';
const CSS_ID = 'css-million-dollar-homepage';

// Conjunto de tecnologias reais do stack (ver CLAUDE.md do repositório
// e dos projetos irmãos em dev/workspace). Cada uma vira um bloco na
// grade, identificada por uma sigla curta e uma cor própria.
const TECNOLOGIAS = [
  { id: 'python', sigla: 'PY', nome: 'Python', categoria: 'Linguagem', cor: '#f4c542',
    descricao: 'Linguagem principal do backend, dos scripts de dados e dos pipelines de visão computacional.' },
  { id: 'sqlite', sigla: 'SQL', nome: 'SQLite', categoria: 'Dados', cor: '#5ecbf0',
    descricao: 'Banco relacional embutido que conecta os produtos de acervo, com sha256 como chave — nunca o caminho do arquivo.' },
  { id: 'git', sigla: 'GIT', nome: 'Git', categoria: 'Ferramentas', cor: '#f0654d',
    descricao: 'Controle de versão: um repositório por projeto, histórico auditável de decisões técnicas.' },
  { id: 'clip', sigla: 'CLIP', nome: 'CLIP', categoria: 'Visão computacional', cor: '#b48af0',
    descricao: 'Modelo multimodal usado para embeddings de imagem e texto no mesmo espaço vetorial.' },
  { id: 'pytorch', sigla: 'PT', nome: 'PyTorch', categoria: 'Deep learning', cor: '#f0764d',
    descricao: 'Framework de treino e inferência para os modelos de visão e de reconhecimento facial.' },
  { id: 'js-vanilla', sigla: 'JS', nome: 'JavaScript vanilla', categoria: 'Front-end', cor: '#f0d642',
    descricao: 'Este próprio site: zero framework, zero dependência externa, DOM manipulado diretamente.' },
  { id: 'phash', sigla: 'PHASH', nome: 'Hash perceptual', categoria: 'Visão computacional', cor: '#5ef0a8',
    descricao: 'Assinatura tolerante a pequenas variações de imagem, usada na deduplicação do acervo.' },
  { id: 'peft', sigla: 'PEFT', nome: 'PEFT / LoRA', categoria: 'Deep learning', cor: '#f05ec2',
    descricao: 'Fine-tuning eficiente de modelos grandes, ajustando poucos parâmetros sem esquecimento catastrófico.' },
  { id: 'docker', sigla: 'DKR', nome: 'Docker', categoria: 'Infraestrutura', cor: '#5e9bf0',
    descricao: 'Containerização para ambientes reprodutíveis, aprendida dentro de projetos que a justificam.' },
  { id: 'cli', sigla: 'SH', nome: 'Linux / CLI', categoria: 'Ferramentas', cor: '#9ef05e',
    descricao: 'Ambiente de desenvolvimento e automação via shell — base de todo o fluxo de trabalho.' },
  { id: 'html-css', sigla: 'CSS', nome: 'HTML & CSS', categoria: 'Front-end', cor: '#f0975e',
    descricao: 'Estrutura e estilo deste site, escritos à mão, sem framework nem CDN.' },
  { id: 'numpy', sigla: 'NP', nome: 'NumPy / Pandas', categoria: 'Dados', cor: '#7ef0e0',
    descricao: 'Manipulação vetorizada de dados tabulares e arrays, base de qualquer pipeline de dados em Python.' },
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
  vazio.textContent = 'Passe o mouse (ou navegue com Tab) sobre um bloco para ver a tecnologia. Clique para fixar.';
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
  categoria.textContent = tech.categoria;

  const nome = document.createElement('h2');
  nome.className = 'mdh-painel-nome';
  nome.textContent = tech.nome;

  const desc = document.createElement('p');
  desc.className = 'mdh-painel-desc';
  desc.textContent = tech.descricao;

  painel.append(swatch, categoria, nome, desc);

  if (fixada) {
    const estado = document.createElement('p');
    estado.className = 'mdh-painel-estado';
    estado.textContent = 'Fixado — clique de novo no bloco ou pressione Esc para soltar.';
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
  intro.innerHTML = '<strong>Million Dollar Homepage</strong> — cada bloco da grade é uma tecnologia real do stack. Passe o mouse, navegue com Tab ou clique para explorar.';

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
    bloco.setAttribute('aria-label', `${tech.nome} — ${tech.categoria}`);
    bloco.textContent = tech.sigla;

    grid.appendChild(bloco);
  }

  const painel = document.createElement('aside');
  painel.className = 'mdh-painel';
  painel.setAttribute('aria-live', 'polite');

  area.append(grid, painel);
  wrapper.append(intro, area);
  container.appendChild(wrapper);

  return { wrapper, grid, painel };
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

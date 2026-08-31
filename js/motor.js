// motor.js — motor de layouts intercambiáveis de ferlief.tech
//
// ---------------------------------------------------------------
// CONTRATO DE LAYOUT
// ---------------------------------------------------------------
// Cada layout do catálogo (js/catalogo.js) é um objeto plano com
// exatamente este formato:
//
//   {
//     id: string,                        // único no catálogo, kebab-case,
//                                         // igual ao nome do arquivo do módulo
//                                         // (ex.: 'mouse-tracker')
//     nome: string,                      // rótulo legível, vira o texto do
//                                         // botão no menu (ex.: 'Mouse Tracker')
//     mount(container: HTMLElement): void,
//     unmount(): void,
//   }
//
// mount(container)
//   - `container` é sempre o mesmo nó: #layout-root, já presente no DOM.
//   - O layout cria e anexa seu próprio DOM dentro de `container`
//     (container.appendChild / innerHTML / etc.) — o motor não injeta
//     nada nele antes de chamar mount.
//   - Se o layout precisa de listeners em window/document, rAF,
//     setInterval, ResizeObserver etc., ele os cria aqui e guarda as
//     referências (closure ou variável de módulo) para poder desfazê-los
//     em unmount().
//   - mount() é chamado no máximo uma vez por unmount() — o motor nunca
//     chama mount() duas vezes seguidas sem unmount() entre elas.
//
// unmount()
//   - Chamado antes de qualquer outro layout ser montado no mesmo
//     container, e sempre no mesmo layout que recebeu o mount()
//     correspondente (o motor mantém no máximo um layout montado
//     por vez).
//   - Responsabilidade do layout: deixar `container` vazio (remover
//     tudo que ele mesmo anexou) e remover qualquer listener/timer/
//     rAF/observer criado em mount(). O motor NÃO limpa o container
//     como rede de segurança — ele só chama unmount() e mount() em
//     sequência. Um layout que não limpa a si mesmo vaza estado para
//     o próximo.
//   - unmount() não recebe argumentos e não tem retorno usado pelo
//     motor.
//
// Módulo de layout (ex.: js/layouts/mouse-tracker.js)
//   - Exporta esse objeto como `export default { id, nome, mount, unmount }`.
//   - Nenhum outro export é lido pelo motor ou pelo catálogo.
//
// js/catalogo.js
//   - `export const catalogo = [ layoutA, layoutB, ... ]` (também
//     reexportado como default), onde cada item é o objeto de
//     contrato acima, importado do respectivo módulo em ./layouts/.
// ---------------------------------------------------------------

import { catalogo } from './catalogo.js';

const menuEl = document.getElementById('menu-layouts');
const rootEl = document.getElementById('layout-root');
const randomizeBtn = document.getElementById('btn-randomize');

// Ciclo de shapes puramente CSS aplicado aos botões do menu, na ordem
// do catálogo — não carrega nenhum ícone externo.
const SHAPES = ['shape-quadrado', 'shape-losango', 'shape-triangulo'];

let layoutAtual = null; // objeto de contrato atualmente montado, ou null

function porId(id) {
  return catalogo.find((layout) => layout.id === id) ?? null;
}

function trocarLayout(id) {
  if (layoutAtual && layoutAtual.id === id) return; // já é o atual, nada a fazer

  const proximo = porId(id);
  if (!proximo) {
    console.error(`motor.js: layout "${id}" não existe no catálogo.`);
    return;
  }

  if (layoutAtual) {
    layoutAtual.unmount();
  }

  proximo.mount(rootEl);
  layoutAtual = proximo;

  atualizarEstadoMenu();
}

function atualizarEstadoMenu() {
  for (const btn of menuEl.children) {
    const ativo = layoutAtual !== null && btn.dataset.id === layoutAtual.id;
    btn.setAttribute('aria-pressed', String(ativo));
  }
}

function montarMenu() {
  menuEl.replaceChildren();

  catalogo.forEach((layout, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'layout-btn';
    btn.dataset.id = layout.id;
    btn.setAttribute('aria-pressed', 'false');

    const shape = document.createElement('span');
    shape.className = `shape ${SHAPES[i % SHAPES.length]}`;
    shape.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.textContent = layout.nome;

    btn.append(shape, label);
    btn.addEventListener('click', () => trocarLayout(layout.id));

    menuEl.appendChild(btn);
  });
}

function randomize() {
  if (catalogo.length === 0) return;

  // Nunca repete o layout já montado — mesmo com só 2 itens no catálogo.
  // Se por acaso o catálogo tiver 1 único item já montado, não há
  // candidato distinto possível e o próprio item é mantido.
  const candidatos = layoutAtual
    ? catalogo.filter((layout) => layout.id !== layoutAtual.id)
    : catalogo;

  const sorteado = candidatos[Math.floor(Math.random() * candidatos.length)];
  trocarLayout(sorteado.id);
}

randomizeBtn.addEventListener('click', randomize);

montarMenu();

// Monta o primeiro layout do catálogo como estado inicial.
if (catalogo.length > 0) {
  trocarLayout(catalogo[0].id);
}

// ---------------------------------------------------------------------
// Mariana Indica — interação da página.
// Vanilla, sem dependência nenhuma, type="module". Dois comportamentos:
//
//   1) filtro de categoria do catálogo, com estado guardado na URL
//      (URLSearchParams + history.replaceState) — recarregar a página
//      com ?categoria=... já abre filtrada.
//   2) abertura do <dialog> nativo de detalhe da oferta (quick view),
//      populado a partir dos data-* do cartão clicado.
//
// Nenhuma das outras peças do conjunto (clinica-vitalis, jessica-felipe)
// usa esses dois recursos — é o diferencial técnico desta peça.
// ---------------------------------------------------------------------

// -----------------------------------------------------------------------
// 1) Filtro de categoria com estado na URL
// -----------------------------------------------------------------------

const botoesFiltro = document.querySelectorAll('.filtro-botao');
const cartoesOferta = document.querySelectorAll('.cartao-oferta');
const elementoContagem = document.getElementById('contagem-ofertas');

const categoriasValidas = Array.from(botoesFiltro).map((botao) => botao.dataset.categoria);

/**
 * Mostra só os cartões da categoria escolhida, atualiza o estado visual
 * dos botões e, por padrão, reescreve a URL — sem navegar, sem recarregar
 * a página (history.replaceState no lugar de pushState: filtrar categoria
 * não é uma "página nova" para o botão voltar do navegador).
 */
function aplicarFiltro(categoria, { atualizarUrl = true } = {}) {
  cartoesOferta.forEach((cartao) => {
    const mostra = categoria === 'todas' || cartao.dataset.categoria === categoria;
    cartao.hidden = !mostra;
  });

  botoesFiltro.forEach((botao) => {
    botao.setAttribute('aria-pressed', String(botao.dataset.categoria === categoria));
  });

  if (elementoContagem) {
    const visiveis = Array.from(cartoesOferta).filter((cartao) => !cartao.hidden).length;
    elementoContagem.textContent = `${visiveis} ${visiveis === 1 ? 'oferta encontrada' : 'ofertas encontradas'}`;
  }

  if (atualizarUrl) {
    const url = new URL(window.location.href);
    if (categoria === 'todas') {
      url.searchParams.delete('categoria');
    } else {
      url.searchParams.set('categoria', categoria);
    }
    // replaceState, não pushState: cada clique no filtro não deveria
    // empilhar uma entrada própria no histórico do navegador.
    history.replaceState(null, '', url);
  }
}

botoesFiltro.forEach((botao) => {
  botao.addEventListener('click', () => aplicarFiltro(botao.dataset.categoria));
});

// Estado inicial: lê ?categoria= da URL ao carregar a página. Se o valor
// não for uma categoria conhecida (link quebrado, digitação errada),
// cai em "todas" em vez de mostrar uma grade vazia.
const parametrosIniciais = new URLSearchParams(window.location.search);
const categoriaDaUrl = parametrosIniciais.get('categoria');
const categoriaInicial = categoriasValidas.includes(categoriaDaUrl) ? categoriaDaUrl : 'todas';

aplicarFiltro(categoriaInicial, { atualizarUrl: false });

// -----------------------------------------------------------------------
// 2) Diálogo de detalhe da oferta (<dialog> nativo)
// -----------------------------------------------------------------------

const dialogoOferta = document.getElementById('dialogo-oferta');
const dialogoTitulo = document.getElementById('dialogo-titulo');
const dialogoCategoria = document.getElementById('dialogo-categoria');
const dialogoPreco = document.getElementById('dialogo-preco');
const dialogoDescricao = document.getElementById('dialogo-descricao');
const dialogoNota = document.getElementById('dialogo-nota');
const botaoFecharDialogo = document.getElementById('dialogo-fechar');

document.querySelectorAll('.cartao-oferta-abrir').forEach((botao) => {
  botao.addEventListener('click', () => {
    const cartao = botao.closest('.cartao-oferta');
    if (!cartao || !dialogoOferta) return;

    dialogoTitulo.textContent = cartao.dataset.nome;
    dialogoCategoria.textContent = cartao.dataset.categoriaLabel;
    dialogoPreco.textContent = cartao.dataset.preco;
    dialogoDescricao.textContent = cartao.dataset.descricao;
    dialogoNota.textContent = cartao.dataset.nota;

    // showModal(): o navegador cuida de Esc, de prender o foco dentro do
    // diálogo e de bloquear interação com o resto da página. Nada disso
    // é reimplementado à mão.
    dialogoOferta.showModal();
  });
});

botaoFecharDialogo?.addEventListener('click', () => dialogoOferta.close());

// Clique fora do miolo do diálogo (ou seja, no ::backdrop) também fecha.
// O alvo do clique nesse caso é o próprio <dialog>, porque o backdrop
// não é um elemento filho selecionável.
dialogoOferta?.addEventListener('click', (evento) => {
  const cliqueDentroDoMiolo = evento.target.closest('.dialogo-miolo');
  if (!cliqueDentroDoMiolo) {
    dialogoOferta.close();
  }
});

// -----------------------------------------------------------------------
// Formulário de novidades — impede o envio até o canal de destino real
// ser definido no briefing (ver comentário no topo do index.html).
// -----------------------------------------------------------------------

const formularioNovidades = document.getElementById('form-novidades');

formularioNovidades?.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const aviso = document.getElementById('aviso-form');
  if (aviso) {
    aviso.textContent = 'Formulário ainda não conectado: falta definir o canal de destino com a Mariana.';
    aviso.classList.add('aviso-form-ativo');
  }
});

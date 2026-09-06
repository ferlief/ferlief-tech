/* ---------------------------------------------------------------
   Régua — interação do cadastro em quatro etapas.

   Sem framework, sem biblioteca de formulário. A decisão central
   desta peça: o cadastro inteiro cabe num único <form>, com um
   <fieldset> por etapa. `inert` nas etapas que não são a atual
   impede foco e leitor de tela de entrar nelas — não é só CSS
   escondendo visualmente, é o navegador removendo a etapa da árvore
   de interação. Ao trocar de etapa, o foco vai para a <legend> da
   etapa nova (tabindex="-1" + .focus()) e o progresso é anunciado
   por uma região aria-live — sem isso, quem navega por teclado ou
   leitor de tela perde a orientação a cada avanço.
   --------------------------------------------------------------- */

const form = document.getElementById('form-cadastro');
const etapas = Array.from(form.querySelectorAll('.etapa'));
const progressoItens = Array.from(document.querySelectorAll('#progresso-lista li'));
const progressoStatus = document.getElementById('progresso-status');
const btnVoltar = document.getElementById('btn-voltar');
const btnAvancar = document.getElementById('btn-avancar');

const NOMES_ETAPA = ['Empresa', 'Responsável', 'Recebimento', 'Senha e revisão'];

let indiceAtual = 0;

/* ---------------------------------------------------------------
   1. Navegação entre etapas
   --------------------------------------------------------------- */

function irParaEtapa(indiceAlvo) {
  const etapaAnterior = etapas[indiceAtual];
  const etapaNova = etapas[indiceAlvo];

  // A etapa anterior recebe inert: sai do fluxo de Tab e de leitor
  // de tela. A etapa nova perde o inert e vira a única navegável.
  etapaAnterior.setAttribute('inert', '');
  etapaNova.removeAttribute('inert');

  indiceAtual = indiceAlvo;

  atualizarProgresso();
  atualizarBotoesNavegacao();

  // Foco vai para o título da etapa, não para o primeiro campo:
  // assim quem usa leitor de tela ouve "Etapa 2 de 4 — Responsável"
  // antes de cair num input, em vez de ser jogado direto no formulário
  // sem contexto de onde está.
  const legenda = etapaNova.querySelector('legend');
  legenda.focus();

  if (indiceAtual === 3) {
    montarResumo();
  }
}

function atualizarProgresso() {
  progressoItens.forEach((item, indice) => {
    item.removeAttribute('aria-current');
    item.removeAttribute('data-concluida');
    if (indice < indiceAtual) {
      item.setAttribute('data-concluida', '');
    } else if (indice === indiceAtual) {
      item.setAttribute('aria-current', 'step');
    }
  });

  // Região aria-live: uma frase curta e sempre no mesmo formato, para
  // não sobrecarregar quem depende de leitor de tela a cada troca.
  progressoStatus.textContent = `Etapa ${indiceAtual + 1} de 4 — ${NOMES_ETAPA[indiceAtual]}`;
}

function atualizarBotoesNavegacao() {
  btnVoltar.hidden = indiceAtual === 0;
  // Na última etapa o avanço vira o botão de envio (type="submit"),
  // que já está dentro do próprio fieldset da etapa 4.
  btnAvancar.hidden = indiceAtual === etapas.length - 1;
}

btnAvancar.addEventListener('click', () => {
  if (!validarEtapaAtual()) return;
  irParaEtapa(indiceAtual + 1);
});

// Voltar nunca valida e nunca limpa: o que foi preenchido continua
// no DOM, porque os campos das outras etapas nunca saem da página —
// só ganham `inert`. É a razão de o formulário inteiro caber num
// <form> só, em vez de um por etapa.
btnVoltar.addEventListener('click', () => {
  irParaEtapa(indiceAtual - 1);
});

/* ---------------------------------------------------------------
   2. Validação de CNPJ — algoritmo real dos dois dígitos
      verificadores (módulo 11), não uma regex de formato.
   --------------------------------------------------------------- */

const PESOS_PRIMEIRO_DIGITO = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const PESOS_SEGUNDO_DIGITO = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function calcularDigitoVerificador(base, pesos) {
  const soma = base
    .split('')
    .reduce((total, digito, indice) => total + Number(digito) * pesos[indice], 0);
  const resto = soma % 11;
  return resto < 2 ? 0 : 11 - resto;
}

function validarCNPJ(valor) {
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length !== 14) return false;
  // Sequências como 11.111.111/1111-11 têm 14 dígitos idênticos e
  // passariam pelo cálculo abaixo com dígitos verificadores
  // coincidentemente válidos em alguns casos — a Receita já trata
  // isso como formato inválido, e replicamos a regra aqui.
  if (/^(\d)\1{13}$/.test(numeros)) return false;

  const base = numeros.slice(0, 12);
  const primeiroDigito = calcularDigitoVerificador(base, PESOS_PRIMEIRO_DIGITO);
  const segundoDigito = calcularDigitoVerificador(base + primeiroDigito, PESOS_SEGUNDO_DIGITO);

  return numeros.slice(12) === `${primeiroDigito}${segundoDigito}`;
}

function formatarCNPJ(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 14);
  let resultado = numeros;
  if (numeros.length > 2) resultado = `${numeros.slice(0, 2)}.${numeros.slice(2)}`;
  if (numeros.length > 5) resultado = `${resultado.slice(0, 6)}.${resultado.slice(6)}`;
  if (numeros.length > 8) resultado = `${resultado.slice(0, 10)}/${resultado.slice(10)}`;
  if (numeros.length > 12) resultado = `${resultado.slice(0, 15)}-${resultado.slice(15)}`;
  return resultado;
}

const campoCNPJ = document.getElementById('cnpj');
const statusCNPJ = document.getElementById('cnpj-status');

campoCNPJ.addEventListener('input', () => {
  const posicaoCursorNoFinal = campoCNPJ.selectionEnd === campoCNPJ.value.length;
  campoCNPJ.value = formatarCNPJ(campoCNPJ.value);
  if (posicaoCursorNoFinal) {
    campoCNPJ.setSelectionRange(campoCNPJ.value.length, campoCNPJ.value.length);
  }

  const numeros = campoCNPJ.value.replace(/\D/g, '');
  if (numeros.length < 14) {
    // Ainda digitando: nem confirma nem reprova, só limpa o aviso
    // anterior para não marcar erro num CNPJ incompleto.
    statusCNPJ.textContent = '';
    statusCNPJ.removeAttribute('data-estado');
    campoCNPJ.removeAttribute('aria-invalid');
    return;
  }

  if (validarCNPJ(campoCNPJ.value)) {
    statusCNPJ.textContent = 'CNPJ válido.';
    statusCNPJ.setAttribute('data-estado', 'valido');
    campoCNPJ.removeAttribute('aria-invalid');
  } else {
    statusCNPJ.textContent = 'Os dígitos verificadores não conferem — confira o CNPJ.';
    statusCNPJ.setAttribute('data-estado', 'invalido');
    campoCNPJ.setAttribute('aria-invalid', 'true');
  }
});

/* ---------------------------------------------------------------
   3. Máscara de celular
   --------------------------------------------------------------- */

function formatarCelular(valor) {
  const numeros = valor.replace(/\D/g, '').slice(0, 11);
  let resultado = numeros;
  if (numeros.length > 0) resultado = `(${numeros.slice(0, 2)}`;
  if (numeros.length > 2) resultado = `${resultado}) ${numeros.slice(2, 7)}`;
  if (numeros.length > 7) resultado = `${resultado}-${numeros.slice(7)}`;
  return resultado;
}

const campoCelular = document.getElementById('celular-responsavel');

campoCelular.addEventListener('input', () => {
  campoCelular.value = formatarCelular(campoCelular.value);
});

/* ---------------------------------------------------------------
   4. Força de senha por estimativa de entropia

   Aproximação simples e documentada, não uma checagem de regras
   ("tem maiúscula? tem número?"): o tamanho do alfabeto usado
   (minúscula, maiúscula, dígito, símbolo) elevado ao comprimento
   da senha dá o espaço de busca; log2 desse espaço é a entropia em
   bits. "Senh4" e "senha" têm o mesmo comprimento, mas alfabetos
   diferentes — a estimativa reflete isso, o que uma regra de regex
   do tipo "tem número?" não captura direito (ela aprovaria "1aaaa"
   e reprovaria "cavalo-azul-portao", que é a senha mais forte).
   --------------------------------------------------------------- */

function calcularEntropiaSenha(senha) {
  if (!senha) return 0;

  let tamanhoAlfabeto = 0;
  if (/[a-z]/.test(senha)) tamanhoAlfabeto += 26;
  if (/[A-Z]/.test(senha)) tamanhoAlfabeto += 26;
  if (/[0-9]/.test(senha)) tamanhoAlfabeto += 10;
  if (/[^A-Za-z0-9]/.test(senha)) tamanhoAlfabeto += 33;

  if (tamanhoAlfabeto === 0) return 0;
  return senha.length * Math.log2(tamanhoAlfabeto);
}

function classificarForcaSenha(bits) {
  if (bits === 0) return { nivel: 'vazio', rotulo: 'Digite uma senha para ver a força estimada.' };
  if (bits < 30) return { nivel: 'muito-fraca', rotulo: `Muito fraca (~${Math.round(bits)} bits de entropia). Tente aumentar o comprimento.` };
  if (bits < 50) return { nivel: 'fraca', rotulo: `Fraca (~${Math.round(bits)} bits). Misture letras, números e símbolos, ou aumente o tamanho.` };
  if (bits < 70) return { nivel: 'razoavel', rotulo: `Razoável (~${Math.round(bits)} bits de entropia).` };
  return { nivel: 'forte', rotulo: `Forte (~${Math.round(bits)} bits de entropia).` };
}

const campoSenha = document.getElementById('senha');
const barraForcaSenha = document.getElementById('forca-senha-preenchimento');
const textoForcaSenha = document.getElementById('senha-forca-texto');

// A barra preenche proporcionalmente até um teto de 90 bits — acima
// disso já é "forte" o suficiente para não precisar de mais espaço
// visual; o texto ao lado continua mostrando o valor calculado.
const TETO_VISUAL_BITS = 90;

campoSenha.addEventListener('input', () => {
  const bits = calcularEntropiaSenha(campoSenha.value);
  const { nivel, rotulo } = classificarForcaSenha(bits);

  barraForcaSenha.style.width = `${Math.min(100, (bits / TETO_VISUAL_BITS) * 100)}%`;
  barraForcaSenha.setAttribute('data-nivel', nivel);
  textoForcaSenha.textContent = rotulo;
});

/* ---------------------------------------------------------------
   5. Validação por etapa
   --------------------------------------------------------------- */

function marcarErro(campo, mensagem) {
  campo.setAttribute('aria-invalid', 'true');
  campo.focus();
  if (mensagem) window.alert(mensagem);
}

function validarEtapaAtual() {
  if (indiceAtual === 0) return validarEtapaEmpresa();
  if (indiceAtual === 1) return validarEtapaResponsavel();
  if (indiceAtual === 2) return validarEtapaRecebimento();
  return true;
}

function validarEtapaEmpresa() {
  const razaoSocial = document.getElementById('razao-social');
  const porte = document.getElementById('porte');

  if (!validarCNPJ(campoCNPJ.value)) {
    marcarErro(campoCNPJ, 'Confira o CNPJ: os dígitos verificadores não conferem.');
    return false;
  }
  if (!razaoSocial.value.trim()) {
    marcarErro(razaoSocial, 'Informe a razão social.');
    return false;
  }
  if (!porte.value) {
    marcarErro(porte, 'Selecione o porte da empresa.');
    return false;
  }
  return true;
}

function validarEtapaResponsavel() {
  const nome = document.getElementById('nome-responsavel');
  const email = document.getElementById('email-responsavel');

  if (!nome.value.trim()) {
    marcarErro(nome, 'Informe o nome do responsável.');
    return false;
  }
  if (!email.value.trim() || !email.checkValidity()) {
    marcarErro(email, 'Informe um e-mail válido.');
    return false;
  }
  const numerosCelular = campoCelular.value.replace(/\D/g, '');
  if (numerosCelular.length !== 11) {
    marcarErro(campoCelular, 'Informe um celular com DDD e 9 dígitos.');
    return false;
  }
  return true;
}

function validarEtapaRecebimento() {
  const checkboxes = form.querySelectorAll('input[name="recebimento"]');
  const statusRecebimento = document.getElementById('recebimento-status');
  const algumMarcado = Array.from(checkboxes).some((c) => c.checked);

  if (!algumMarcado) {
    statusRecebimento.textContent = 'Marque ao menos uma forma de recebimento.';
    statusRecebimento.setAttribute('data-estado', 'invalido');
    checkboxes[0].focus();
    return false;
  }
  statusRecebimento.textContent = '';
  statusRecebimento.removeAttribute('data-estado');
  return true;
}

/* ---------------------------------------------------------------
   6. Resumo editável — montado ao entrar na etapa 4, lido
      diretamente dos campos das etapas anteriores.
   --------------------------------------------------------------- */

const PORTE_ROTULO = {
  mei: 'MEI',
  micro: 'Microempresa',
  pequena: 'Pequena empresa',
  media: 'Média empresa',
};

const RECEBIMENTO_ROTULO = {
  pix: 'Pix',
  boleto: 'Boleto',
  cartao: 'Cartão de crédito',
};

function montarResumo() {
  const lista = document.getElementById('resumo-lista');
  lista.innerHTML = '';

  const formasMarcadas = Array.from(form.querySelectorAll('input[name="recebimento"]:checked'))
    .map((c) => RECEBIMENTO_ROTULO[c.value]);

  const linhas = [
    { rotulo: 'CNPJ', valor: campoCNPJ.value || '—', etapa: 0 },
    { rotulo: 'Razão social', valor: document.getElementById('razao-social').value || '—', etapa: 0 },
    { rotulo: 'Porte', valor: PORTE_ROTULO[document.getElementById('porte').value] || '—', etapa: 0 },
    { rotulo: 'Responsável', valor: document.getElementById('nome-responsavel').value || '—', etapa: 1 },
    { rotulo: 'E-mail', valor: document.getElementById('email-responsavel').value || '—', etapa: 1 },
    { rotulo: 'Celular', valor: campoCelular.value || '—', etapa: 1 },
    { rotulo: 'Recebimento', valor: formasMarcadas.length ? formasMarcadas.join(', ') : '—', etapa: 2 },
  ];

  linhas.forEach(({ rotulo, valor, etapa }) => {
    const linha = document.createElement('div');
    linha.className = 'resumo-linha';

    const dt = document.createElement('dt');
    dt.textContent = rotulo;

    const dd = document.createElement('dd');
    dd.textContent = valor;

    const botaoEditar = document.createElement('button');
    botaoEditar.type = 'button';
    botaoEditar.className = 'botao-editar';
    botaoEditar.textContent = 'Editar';
    botaoEditar.setAttribute('aria-label', `Editar ${rotulo.toLowerCase()}`);
    // Editar volta para a etapa de origem do campo sem apagar nada —
    // é a mesma função de navegação usada em Voltar/Avançar.
    botaoEditar.addEventListener('click', () => irParaEtapa(etapa));

    linha.append(dt, dd, botaoEditar);
    lista.appendChild(linha);
  });
}

/* ---------------------------------------------------------------
   7. Envio — formulário de demonstração, sem endpoint. O padrão é
      o mesmo das outras peças do conjunto: intercepta o submit e
      avisa em vez de simular sucesso.
   --------------------------------------------------------------- */

form.addEventListener('submit', (evento) => {
  evento.preventDefault();

  const senhaBits = calcularEntropiaSenha(campoSenha.value);
  if (!campoSenha.value || senhaBits < 28) {
    marcarErro(campoSenha, 'Escolha uma senha um pouco mais longa antes de continuar.');
    return;
  }

  const aviso = document.getElementById('aviso-form');
  aviso.textContent = 'Formulário de demonstração: numa entrega real, isto criaria a conta e redirecionaria para o painel.';
  aviso.classList.add('aviso-form-ativo');
});

/* Estado inicial: garante que o progresso e os botões refletem a
   etapa 1 mesmo se o script rodar depois de algum preenchimento
   automático do navegador. */
atualizarProgresso();
atualizarBotoesNavegacao();

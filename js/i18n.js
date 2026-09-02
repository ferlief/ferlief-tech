// i18n.js — dicionário PT/EN e helpers de tradução. Vanilla, sem
// build step: um objeto por idioma, chave string → texto.
//
// Estado: data-lang em <html> ('pt' | 'en' | ausente). Ausente
// significa "segue o idioma do navegador" (navigator.language),
// mesma lógica que tema.js aplica a prefers-color-scheme quando não
// há escolha explícita.
//
// Quem muda de idioma (js/idioma.js) chama definirIdioma() e isso
// dispara EVENTO_MUDANCA em window — qualquer módulo com texto na
// tela (atividade.js, tema.js, projetos.js) escuta esse evento para
// re-renderizar sem precisar de reload.
//
// Escopo: cobre as páginas do site. As peças de demonstração em
// /sites/*/ e /design/*/ são monolíngues em português de propósito —
// são artefatos de portfólio, não interface do site, e traduzir uma
// campanha publicitária mudaria a peça, não só o texto.

export const EVENTO_MUDANCA = 'idioma:mudou';

const STORAGE_KEY = 'idioma';

const DICIONARIO = {
  pt: {
    'nav.site': 'Navegação do site',
    'nav.inicio': 'Início',
    'nav.sites': 'Sites',
    'nav.design': 'Design',
    'nav.projetos': 'Projetos',
    'nav.experiencia': 'Experiência',
    'nav.blog': 'Blog',
    'tema.claro': 'Modo claro',
    'tema.escuro': 'Modo escuro',
    'atividade.rotulo': 'Última evidência publicada',

    'home.eyebrow': 'Desenvolvimento e design — Rio de Janeiro, atendimento remoto',
    'home.titulo': 'Sites que abrem rápido, funcionam no celular e explicam o que você vende.',
    'home.lead': 'Landing pages, sites institucionais e peças de campanha. Tudo escrito à mão em HTML, CSS e JavaScript — sem tema comprado, sem construtor visual, sem plugin que quebra na próxima atualização. No fim, o código é seu.',
    'home.ctaSites': 'Ver landing pages',
    'home.ctaDesign': 'Ver peças de design',
    'home.ctaContato': 'Pedir um orçamento',

    'fato1.valor': 'Zero',
    'fato1.rotulo': 'dependências externas: nada de tema, framework ou plugin de terceiro',
    'fato2.valor': '320 px',
    'fato2.rotulo': 'largura mínima verificada — o layout não quebra em celular antigo',
    'fato3.valor': 'PT / EN',
    'fato3.rotulo': 'site bilíngue sem plugin de tradução automática',
    'fato4.valor': 'Código seu',
    'fato4.rotulo': 'entrega com repositório e sem mensalidade de plataforma',

    'serv.eyebrow': 'Serviços',
    'serv.titulo': 'Três frentes, uma pessoa só do começo ao fim',
    'serv.lead': 'Quem escreve o texto, desenha a página e publica o código é a mesma pessoa. Menos intermediário, menos ruído entre o que foi combinado e o que sai no ar.',
    'serv1.titulo': 'Site e landing page',
    'serv1.texto': 'Da página única de conversão ao site institucional de poucas páginas.',
    'serv1.item1': 'Landing page de campanha ou de serviço',
    'serv1.item2': 'Site institucional de 3 a 8 páginas',
    'serv1.item3': 'Formulário, WhatsApp e agendamento',
    'serv1.item4': 'SEO técnico, metadados e performance',
    'serv2.titulo': 'Design aplicado',
    'serv2.texto': 'Identidade que sobrevive ao contato com a realidade: aplicada em peça, não só em manual.',
    'serv2.item1': 'Anúncio para feed, story e display',
    'serv2.item2': 'Cartaz, rótulo e material de ponto de venda',
    'serv2.item3': 'Kit de marca: cor, tipografia e regras de uso',
    'serv2.item4': 'Adaptação da mesma peça para todos os formatos',
    'serv3.titulo': 'Automação em Python',
    'serv3.texto': 'A parte de engenharia: o trabalho repetitivo que uma pessoa faz hoje na mão.',
    'serv3.item1': 'Planilha bagunçada virando relatório',
    'serv3.item2': 'Organização e deduplicação de arquivos',
    'serv3.item3': 'Visão computacional aplicada a imagem',
    'serv3.item4': 'Roda na máquina do cliente — sem enviar dado para nuvem',

    'trab.eyebrow': 'Trabalho',
    'trab.titulo': 'Duas peças para você ver antes de contratar',
    'trab.lead': 'As duas são projetos de demonstração com marca fictícia — sem cliente real por trás, e nenhum nome emprestado. O que se avalia aqui é execução: estrutura, ritmo de leitura, acabamento e comportamento no celular.',
    'trab.selo': 'Projeto-demonstração',
    'trab1.titulo': 'Clínica Vitalis',
    'trab1.tipo': 'Landing page de clínica médica',
    'trab1.texto': 'Página única de conversão para um consultório multiespecialidade: agendamento sempre à mão, especialidades, corpo clínico, convênios, horários e dúvidas frequentes.',
    'trab1.link': 'Abrir a página',
    'trab2.titulo': 'Serra Alta Café',
    'trab2.tipo': 'Publicidade de produto',
    'trab2.texto': 'Campanha de lançamento de um café especial: key visual, cartaz, anúncios para feed e story, rótulo do pacote, banner display e o kit de marca que mantém tudo coerente.',
    'trab2.link': 'Abrir o portfólio',

    'proc.eyebrow': 'Como trabalho',
    'proc.titulo': 'Quatro etapas, nenhuma surpresa no preço',
    'proc1.titulo': 'Conversa e escopo',
    'proc1.texto': 'Meia hora para entender o que a página precisa fazer. Saio dela com escopo escrito, prazo e preço fechado.',
    'proc2.titulo': 'Estrutura e texto',
    'proc2.texto': 'Antes do visual: o que a pessoa lê primeiro, o que ela clica e o que a faz voltar. Texto rascunhado junto com você.',
    'proc3.titulo': 'Implementação',
    'proc3.texto': 'Código à mão, verificado no celular e no desktop, com contraste de cor e navegação por teclado testados.',
    'proc4.titulo': 'Entrega',
    'proc4.texto': 'Publicação no seu domínio, repositório entregue no seu nome e uma explicação de como editar o conteúdo depois.',

    'contato.eyebrow': 'Contato',
    'contato.titulo': 'Me diga o que sua página precisa fazer',
    'contato.texto': 'Escopo, prazo e preço em até um dia útil. Se o seu projeto não for para mim, eu digo isso na primeira resposta em vez de aceitar e atrasar.',
    'contato.btnEmail': 'Escrever um e-mail',
    'contato.btnGithub': 'Ver o código no GitHub',

    'sites.titulo': 'Sites e landing pages',
    'sites.lead': 'Páginas escritas à mão, sem tema nem construtor visual. Cada peça abre aqui mesmo, no navegador, em tamanho real — não é captura de tela.',
    'sites.fichaObjetivo': 'Objetivo',
    'sites.fichaObjetivoTexto': 'Transformar visita em consulta agendada: o botão de agendamento acompanha a rolagem e reaparece ao fim de cada seção.',
    'sites.fichaDecisoes': 'Decisões',
    'sites.fichaDecisoesTexto': 'Nenhuma foto de banco de imagens. Corpo clínico com iniciais, especialidades em ícone desenhado à mão — a página carrega em qualquer conexão.',
    'sites.fichaEntrega': 'O que o cliente recebe',
    'sites.fichaEntregaTexto': 'HTML e CSS comentados, formulário pronto para conectar, texto revisado e instruções de publicação no domínio próprio.',

    'design.titulo': 'Design e publicidade',
    'design.lead': 'Peças de campanha desenhadas para um produto: mesma marca, formatos diferentes, coerência mantida por regra escrita e não por acaso.',
    'design.fichaObjetivo': 'Objetivo',
    'design.fichaObjetivoTexto': 'Lançar um café especial em pacote de 250 g com uma campanha que funciona do cartaz de vitrine ao anúncio de story.',
    'design.fichaDecisoes': 'Decisões',
    'design.fichaDecisoesTexto': 'Uma cor de destaque, duas de apoio e uma hierarquia tipográfica só — o suficiente para a peça se reconhecer de longe sem depender de logotipo grande.',
    'design.fichaEntrega': 'O que o cliente recebe',
    'design.fichaEntregaTexto': 'Peças em todos os formatos pedidos, kit de marca documentado e as regras de uso escritas para quem for aplicar depois.',

    'proj.titulo': 'Projetos de engenharia',
    'proj.lead': 'Repositórios abertos, um projeto por pasta, com histórico público. É a parte do trabalho que não cabe numa landing page: pipelines de dados, visão computacional e ferramentas que rodam na máquina de quem usa.',
    'proj.descricaoPendente': 'Descrição em construção.',
    'proj.linkRepo': 'Ver repositório',

    'exp.titulo': 'Experiência',
    'exp.lead': 'O que eu sei fazer, com o que dá para verificar.',
    'exp.focoTitulo': 'Foco atual',
    'exp.focoTexto': 'Desenvolvimento front-end sem framework, design aplicado a peça de campanha, e Python para visão computacional e ferramentas de dados. Rio de Janeiro — mercado local e remoto internacional.',
    'exp.percursoTitulo': 'Percurso',
    'exp.percursoTexto': 'De volta à tecnologia desde maio de 2026, depois de um período fora da área. O que está publicado aqui foi escrito nesse retorno e tem histórico de commit público — nenhum item deste site depende de você acreditar na minha palavra.',
    'exp.metodoTitulo': 'Método',
    'exp.metodoTexto': 'Sem dependência externa quando ela não se paga, código comentado no idioma de quem vai manter, e acessibilidade verificada em vez de assumida: contraste medido, navegação por teclado testada, marcação semântica.',
    'exp.historicoTitulo': 'Histórico profissional',
    'exp.historicoPendente': 'Em construção — o histórico detalhado entra aqui quando estiver escrito, não antes.',

    'blog.titulo': 'Blog',
    'blog.lead': 'Ensaios técnicos sobre arquitetura de dados, IA local e engenharia de front-end sem framework.',
    'blog.vazio': 'Nenhum ensaio publicado ainda.',

    'rodape.sobre': 'Site pessoal e portfólio. Escrito à mão, sem framework e sem etapa de build — o código-fonte deste site é público.',
    'rodape.navTitulo': 'Navegação',
    'rodape.contatoTitulo': 'Contato',
    'rodape.direitos': 'Conteúdo e código sob licença MIT.',
    'rodape.selo': 'Obsession Labs — método aberto.',
  },

  en: {
    'nav.site': 'Site navigation',
    'nav.inicio': 'Home',
    'nav.sites': 'Websites',
    'nav.design': 'Design',
    'nav.projetos': 'Projects',
    'nav.experiencia': 'Experience',
    'nav.blog': 'Blog',
    'tema.claro': 'Light mode',
    'tema.escuro': 'Dark mode',
    'atividade.rotulo': 'Latest published evidence',

    'home.eyebrow': 'Development and design — Rio de Janeiro, working remotely',
    'home.titulo': 'Websites that load fast, work on a phone, and explain what you sell.',
    'home.lead': 'Landing pages, small business websites, and campaign artwork. All hand-written in HTML, CSS, and JavaScript — no purchased theme, no page builder, no plugin that breaks on the next update. The code ends up yours.',
    'home.ctaSites': 'See landing pages',
    'home.ctaDesign': 'See design work',
    'home.ctaContato': 'Request a quote',

    'fato1.valor': 'Zero',
    'fato1.rotulo': 'external dependencies: no theme, no framework, no third-party plugin',
    'fato2.valor': '320 px',
    'fato2.rotulo': 'verified minimum width — the layout holds on an old phone',
    'fato3.valor': 'PT / EN',
    'fato3.rotulo': 'bilingual sites without an auto-translation plugin',
    'fato4.valor': 'Your code',
    'fato4.rotulo': 'delivered as a repository, with no platform subscription',

    'serv.eyebrow': 'Services',
    'serv.titulo': 'Three tracks, one person from start to finish',
    'serv.lead': 'The same person writes the copy, designs the page, and ships the code. Fewer middlemen, less drift between what was agreed and what goes live.',
    'serv1.titulo': 'Websites and landing pages',
    'serv1.texto': 'From a single conversion page to a small multi-page business site.',
    'serv1.item1': 'Campaign or service landing page',
    'serv1.item2': 'Business website, 3 to 8 pages',
    'serv1.item3': 'Forms, WhatsApp, and booking',
    'serv1.item4': 'Technical SEO, metadata, and performance',
    'serv2.titulo': 'Applied design',
    'serv2.texto': 'Identity that survives contact with reality: applied to real pieces, not just a manual.',
    'serv2.item1': 'Feed, story, and display ads',
    'serv2.item2': 'Posters, labels, and point-of-sale material',
    'serv2.item3': 'Brand kit: color, type, and usage rules',
    'serv2.item4': 'The same piece adapted to every format',
    'serv3.titulo': 'Python automation',
    'serv3.texto': 'The engineering side: the repetitive work someone still does by hand today.',
    'serv3.item1': 'Messy spreadsheets turned into reports',
    'serv3.item2': 'File organization and deduplication',
    'serv3.item3': 'Applied computer vision on images',
    'serv3.item4': 'Runs on the client machine — no data sent to a cloud',

    'trab.eyebrow': 'Work',
    'trab.titulo': 'Two pieces to look at before hiring me',
    'trab.lead': 'Both are demonstration projects with fictional brands — no real client behind them, and no borrowed names. What you can judge here is execution: structure, reading rhythm, finish, and behavior on a phone.',
    'trab.selo': 'Demonstration project',
    'trab1.titulo': 'Clínica Vitalis',
    'trab1.tipo': 'Medical clinic landing page',
    'trab1.texto': 'A single conversion page for a multi-specialty clinic: booking always within reach, specialties, medical staff, insurance, hours, and frequent questions.',
    'trab1.link': 'Open the page',
    'trab2.titulo': 'Serra Alta Café',
    'trab2.tipo': 'Product advertising',
    'trab2.texto': 'Launch campaign for a specialty coffee: key visual, poster, feed and story ads, bag label, display banner, and the brand kit that keeps it all coherent.',
    'trab2.link': 'Open the portfolio',

    'proc.eyebrow': 'How I work',
    'proc.titulo': 'Four steps, no surprises in the price',
    'proc1.titulo': 'Conversation and scope',
    'proc1.texto': 'Half an hour to understand what the page has to do. I leave it with written scope, a deadline, and a fixed price.',
    'proc2.titulo': 'Structure and copy',
    'proc2.texto': 'Before any visuals: what people read first, what they click, and what brings them back. Copy drafted together with you.',
    'proc3.titulo': 'Implementation',
    'proc3.texto': 'Hand-written code, checked on phone and desktop, with color contrast and keyboard navigation actually tested.',
    'proc4.titulo': 'Handover',
    'proc4.texto': 'Published on your domain, repository handed over in your name, and an explanation of how to edit the content later.',

    'contato.eyebrow': 'Contact',
    'contato.titulo': 'Tell me what your page has to do',
    'contato.texto': 'Scope, deadline, and price within one business day. If your project is not a fit for me, I say so in the first reply instead of accepting and running late.',
    'contato.btnEmail': 'Send an email',
    'contato.btnGithub': 'See the code on GitHub',

    'sites.titulo': 'Websites and landing pages',
    'sites.lead': 'Hand-written pages, no theme and no page builder. Each piece opens right here in the browser, at full size — these are not screenshots.',
    'sites.fichaObjetivo': 'Goal',
    'sites.fichaObjetivoTexto': 'Turn a visit into a booked appointment: the booking button follows the scroll and reappears at the end of every section.',
    'sites.fichaDecisoes': 'Decisions',
    'sites.fichaDecisoesTexto': 'No stock photography. Staff shown as initials, specialties as hand-drawn icons — the page loads on any connection.',
    'sites.fichaEntrega': 'What the client gets',
    'sites.fichaEntregaTexto': 'Commented HTML and CSS, a form ready to connect, reviewed copy, and instructions to publish on their own domain.',

    'design.titulo': 'Design and advertising',
    'design.lead': 'Campaign pieces designed around one product: same brand, different formats, coherence held by written rules rather than luck.',
    'design.fichaObjetivo': 'Goal',
    'design.fichaObjetivoTexto': 'Launch a 250 g specialty coffee with a campaign that works from a shop-window poster to a story ad.',
    'design.fichaDecisoes': 'Decisions',
    'design.fichaDecisoesTexto': 'One accent color, two supporting ones, and a single type hierarchy — enough for a piece to be recognized from across the room without a huge logo.',
    'design.fichaEntrega': 'What the client gets',
    'design.fichaEntregaTexto': 'Every requested format, a documented brand kit, and written usage rules for whoever applies it next.',

    'proj.titulo': 'Engineering projects',
    'proj.lead': 'Open repositories, one project per folder, with public history. This is the part of the work that does not fit on a landing page: data pipelines, computer vision, and tools that run on the user machine.',
    'proj.descricaoPendente': 'Description in progress.',
    'proj.linkRepo': 'View repository',

    'exp.titulo': 'Experience',
    'exp.lead': 'What I can do, with something you can check.',
    'exp.focoTitulo': 'Current focus',
    'exp.focoTexto': 'Framework-free front-end development, design applied to campaign pieces, and Python for computer vision and data tooling. Based in Rio de Janeiro — open to local and international remote work.',
    'exp.percursoTitulo': 'Background',
    'exp.percursoTexto': 'Back in tech since May 2026, after time away from the field. Everything published here was written during that return and has a public commit history — nothing on this site asks you to take my word for it.',
    'exp.metodoTitulo': 'Method',
    'exp.metodoTexto': 'No external dependency that does not pay for itself, code commented in the language of whoever will maintain it, and accessibility verified rather than assumed: contrast measured, keyboard navigation tested, semantic markup.',
    'exp.historicoTitulo': 'Professional history',
    'exp.historicoPendente': 'In progress — the detailed history goes here once it is written, not before.',

    'blog.titulo': 'Blog',
    'blog.lead': 'Technical essays on data architecture, local AI, and framework-free front-end engineering.',
    'blog.vazio': 'No essays published yet.',

    'rodape.sobre': 'Personal site and portfolio. Hand-written, no framework and no build step — the source of this site is public.',
    'rodape.navTitulo': 'Navigation',
    'rodape.contatoTitulo': 'Contact',
    'rodape.direitos': 'Content and code under the MIT license.',
    'rodape.selo': 'Obsession Labs — open method.',
  },
};

export function idiomaEfetivo() {
  const explicito = document.documentElement.dataset.lang;
  if (explicito === 'pt' || explicito === 'en') return explicito;
  return navigator.language?.toLowerCase().startsWith('pt') ? 'pt' : 'en';
}

export function t(chave) {
  return DICIONARIO[idiomaEfetivo()][chave] ?? DICIONARIO.pt[chave] ?? chave;
}

export function definirIdioma(idioma) {
  document.documentElement.dataset.lang = idioma;
  document.documentElement.lang = idioma === 'pt' ? 'pt-BR' : 'en';
  try {
    localStorage.setItem(STORAGE_KEY, idioma);
  } catch {}
  window.dispatchEvent(new CustomEvent(EVENTO_MUDANCA, { detail: { idioma } }));
}

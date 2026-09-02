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
// tela (atividade.js, tema.js, layouts montados) escuta esse evento
// para re-renderizar sem precisar de reload.

export const EVENTO_MUDANCA = 'idioma:mudou';

const STORAGE_KEY = 'idioma';

const DICIONARIO = {
  pt: {
    'nav.layouts': 'Layouts disponíveis',
    'nav.site': 'Navegação do site',
    'nav.inicio': 'Início',
    'nav.experiencia': 'Experiência',
    'nav.projetos': 'Projetos',
    'nav.blog': 'Blog',
    'tema.claro': 'Modo claro',
    'tema.escuro': 'Modo escuro',
    'atividade.rotulo': 'última evidência publicada',
    'exp.titulo': 'Experiência',
    'exp.focoTitulo': 'Foco atual',
    'exp.focoTexto': 'Python, visão computacional aplicada, ferramentas de dados e IA local e privada. Rio de Janeiro — mercado local e remoto internacional.',
    'exp.percursoTitulo': 'Percurso',
    'exp.percursoTexto': 'De volta à tecnologia desde maio de 2026, depois de um período fora da área.',
    'exp.historicoTitulo': 'Histórico profissional',
    'exp.historicoPendente': 'Em construção — histórico detalhado chega aqui em breve.',
    'proj.titulo': 'Projetos',
    'proj.introTexto': 'Repositórios abertos, um projeto por pasta.',
    'proj.descricaoPendente': 'Descrição em construção.',
    'proj.linkRepo': 'Ver repositório',
    'blog.titulo': 'Blog',
    'blog.introTexto': 'Ensaios técnicos sobre arquitetura de dados, edge AI e engenharia.',
    'blog.vazio': 'Nenhum ensaio publicado ainda.',
    'mdh.introTitulo': 'Million Dollar Homepage',
    'mdh.introTexto': ' — cada bloco da grade é uma tecnologia real do stack. Passe o mouse, navegue com Tab ou clique para explorar.',
    'mdh.painelVazio': 'Passe o mouse (ou navegue com Tab) sobre um bloco para ver a tecnologia. Clique para fixar.',
    'mdh.painelFixado': 'Fixado — clique de novo no bloco ou pressione Esc para soltar.',
    'categoria.linguagem': 'Linguagem',
    'categoria.dados': 'Dados',
    'categoria.ferramentas': 'Ferramentas',
    'categoria.visao': 'Visão computacional',
    'categoria.deeplearning': 'Deep learning',
    'categoria.frontend': 'Front-end',
    'categoria.infra': 'Infraestrutura',
    'tech.python': 'Linguagem principal do backend, dos scripts de dados e dos pipelines de visão computacional.',
    'tech.sqlite': 'Banco relacional embutido que conecta os produtos de acervo, com sha256 como chave — nunca o caminho do arquivo.',
    'tech.git': 'Controle de versão: um repositório por projeto, histórico auditável de decisões técnicas.',
    'tech.clip': 'Modelo multimodal usado para embeddings de imagem e texto no mesmo espaço vetorial.',
    'tech.pytorch': 'Framework de treino e inferência para os modelos de visão e de reconhecimento facial.',
    'tech.js-vanilla': 'Este próprio site: zero framework, zero dependência externa, DOM manipulado diretamente.',
    'tech.phash': 'Assinatura tolerante a pequenas variações de imagem, usada na deduplicação do acervo.',
    'tech.peft': 'Fine-tuning eficiente de modelos grandes, ajustando poucos parâmetros sem esquecimento catastrófico.',
    'tech.docker': 'Containerização para ambientes reprodutíveis, aprendida dentro de projetos que a justificam.',
    'tech.cli': 'Ambiente de desenvolvimento e automação via shell — base de todo o fluxo de trabalho.',
    'tech.html-css': 'Estrutura e estilo deste site, escritos à mão, sem framework nem CDN.',
    'tech.numpy': 'Manipulação vetorizada de dados tabulares e arrays, base de qualquer pipeline de dados em Python.',
  },
  en: {
    'nav.layouts': 'Available layouts',
    'nav.site': 'Site navigation',
    'nav.inicio': 'Home',
    'nav.experiencia': 'Experience',
    'nav.projetos': 'Projects',
    'nav.blog': 'Blog',
    'tema.claro': 'Light mode',
    'tema.escuro': 'Dark mode',
    'atividade.rotulo': 'latest published evidence',
    'exp.titulo': 'Experience',
    'exp.focoTitulo': 'Current focus',
    'exp.focoTexto': 'Python, applied computer vision, data tooling, and local/private AI. Based in Rio de Janeiro — open to local and international remote work.',
    'exp.percursoTitulo': 'Background',
    'exp.percursoTexto': 'Back in tech since May 2026, after time away from the field.',
    'exp.historicoTitulo': 'Professional history',
    'exp.historicoPendente': 'In progress — detailed history coming soon.',
    'proj.titulo': 'Projects',
    'proj.introTexto': 'Open repositories, one project per folder.',
    'proj.descricaoPendente': 'Description in progress.',
    'proj.linkRepo': 'View repository',
    'blog.titulo': 'Blog',
    'blog.introTexto': 'Technical essays on data architecture, edge AI, and engineering.',
    'blog.vazio': 'No essays published yet.',
    'mdh.introTitulo': 'Million Dollar Homepage',
    'mdh.introTexto': ' — each block in the grid is a real technology from the stack. Hover, tab through, or click to explore.',
    'mdh.painelVazio': 'Hover (or tab) over a block to see the technology. Click to pin it.',
    'mdh.painelFixado': 'Pinned — click the block again or press Esc to release.',
    'categoria.linguagem': 'Language',
    'categoria.dados': 'Data',
    'categoria.ferramentas': 'Tools',
    'categoria.visao': 'Computer vision',
    'categoria.deeplearning': 'Deep learning',
    'categoria.frontend': 'Front-end',
    'categoria.infra': 'Infrastructure',
    'tech.python': 'Main language for the backend, data scripts, and computer-vision pipelines.',
    'tech.sqlite': 'Embedded relational database connecting the acervo products, keyed by sha256 — never the file path.',
    'tech.git': 'Version control: one repository per project, an auditable history of technical decisions.',
    'tech.clip': 'Multimodal model used for image and text embeddings in the same vector space.',
    'tech.pytorch': 'Training and inference framework for the vision and facial-recognition models.',
    'tech.js-vanilla': 'This very site: zero framework, zero external dependency, DOM manipulated directly.',
    'tech.phash': 'Signature tolerant to small image variations, used to deduplicate the acervo.',
    'tech.peft': 'Efficient fine-tuning of large models, adjusting few parameters without catastrophic forgetting.',
    'tech.docker': 'Containerization for reproducible environments, learned inside projects that justify it.',
    'tech.cli': 'Development and automation environment via shell — the base of the whole workflow.',
    'tech.html-css': "This site's structure and style, hand-written, no framework or CDN.",
    'tech.numpy': 'Vectorized manipulation of tabular data and arrays, the base of any Python data pipeline.',
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

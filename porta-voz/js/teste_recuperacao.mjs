// Testes da busca. Rodar: node js/teste_recuperacao.mjs
//
// O primeiro bloco é o contrato com o indexador Python: se ele
// quebrar, a consulta digitada no navegador parou de casar com o
// índice gerado no build, e a busca devolve vazio silenciosamente.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizar, Indice, temBase, LIMIAR_NAO_CALIBRADO } from './recuperacao.js';

const AQUI = dirname(fileURLToPath(import.meta.url));
const ler = (p) => JSON.parse(readFileSync(join(AQUI, '..', p), 'utf-8'));

const fixture = ler('avaliacao/fixture-tokens.json');
const indice = new Indice(ler('dados/indice.json'));

test('normalizar bate com o fixture gerado pelo Python', () => {
  for (const caso of fixture.casos) {
    assert.deepEqual(
      normalizar(caso.entrada),
      caso.tokens,
      `divergência em ${JSON.stringify(caso.entrada)} — os gêmeos saíram de sincronia`,
    );
  }
});

test('separador de milhar colide com o número puro', () => {
  assert.deepEqual(normalizar('187.402'), normalizar('187402'));
  assert.deepEqual(normalizar('9.415'), ['9415']);
});

test('decimal não é colapsado', () => {
  assert.ok(!normalizar('3.14').includes('314'));
});

test('consulta vazia ou só de stopword devolve nada', () => {
  assert.deepEqual(indice.buscar(''), []);
  assert.deepEqual(indice.buscar('o a de que'), []);
  assert.deepEqual(indice.buscar('!!! ???'), []);
});

test('busca devolve resultados ordenados por score decrescente', () => {
  const r = indice.buscar('layout do site', 5);
  assert.ok(r.length > 0, 'nenhum resultado para um termo que está no corpus');
  for (let i = 1; i < r.length; i++) {
    assert.ok(r[i - 1].score >= r[i].score, 'ordenação quebrada');
  }
});

test('respeita o limite pedido', () => {
  assert.ok(indice.buscar('projeto corpus site', 2).length <= 2);
});

test('a explicação lista os termos que casaram e nenhum a mais', () => {
  const [topo] = indice.buscar('BM25 embeddings');
  assert.ok(topo, 'esperava casar com a passagem sobre BM25');
  for (const { termo, tf, parcela } of topo.explicacao.casaram) {
    assert.ok(topo.passagem.tf[termo] === tf, `tf inconsistente para ${termo}`);
    assert.ok(parcela > 0, `parcela não-positiva para ${termo}`);
  }
  const soma = topo.explicacao.casaram.reduce((a, c) => a + c.parcela, 0);
  assert.ok(Math.abs(soma - topo.score) < 1e-9, 'score não é a soma das parcelas');
});

test('cobertura é a fração dos termos da pergunta que casaram', () => {
  const [topo] = indice.buscar('BM25 embeddings jabuticaba');
  assert.ok(topo.explicacao.termosConsulta.includes('jabuticaba'));
  assert.ok(topo.explicacao.cobertura < 1, 'termo ausente deveria baixar a cobertura');
});

test('termo repetido na pergunta não conta duas vezes', () => {
  const uma = indice.buscar('corpus');
  const tres = indice.buscar('corpus corpus corpus');
  assert.equal(tres[0].score, uma[0].score);
});

test('IDF nunca é negativo — termo comum não pode punir a passagem', () => {
  // Sem o piso em zero, um termo presente em mais da metade das
  // passagens produz peso negativo e derruba quem o contém.
  for (const p of indice.passagens) {
    const r = indice.buscar(Object.keys(p.tf).slice(0, 8).join(' '), 20);
    for (const item of r) assert.ok(item.score >= 0, 'score negativo');
  }
});

test('pergunta fora do corpus não tem base', () => {
  const r = indice.buscar('qual a receita de brigadeiro de colher');
  assert.equal(temBase(r), false, 'deveria abster-se');
});

test('pergunta central do corpus tem base', () => {
  const r = indice.buscar('por que BM25 e não embeddings');
  assert.equal(temBase(r), true, 'deveria responder');
});

test('temBase é falso para lista vazia', () => {
  assert.equal(temBase([]), false);
});

test('o limiar está declarado como não calibrado', () => {
  // Guarda de honestidade: se alguém trocar o número, que seja
  // junto com a medição — ver avaliacao/README.md.
  assert.ok('score' in LIMIAR_NAO_CALIBRADO && 'cobertura' in LIMIAR_NAO_CALIBRADO);
});

test('nenhuma passagem do índice veio de arquivo não revisado', () => {
  // O portão roda no Python, mas o artefato publicado é este JSON.
  // Este teste é a segunda tranca, do lado de quem consome.
  const permitidos = new Set(['corpus/010-este-projeto.md', 'corpus/020-ferlief-tech.md']);
  for (const p of indice.passagens) {
    assert.ok(
      permitidos.has(p.origem.arquivo),
      `passagem de origem inesperada no índice público: ${p.origem.arquivo}`,
    );
  }
});

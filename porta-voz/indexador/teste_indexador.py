#!/usr/bin/env python3
"""Testes do indexador. Rodar: python3 indexador/teste_indexador.py"""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import construir_indice as ci


class TesteNormalizador(unittest.TestCase):
    def test_bate_com_o_fixture_compartilhado(self):
        """O fixture é o contrato com js/recuperacao.js.

        Se este teste quebra, ou o normalizador mudou de propósito
        (regenere o fixture E rode o teste do lado JS), ou mudou
        por acidente — nesse caso a busca do navegador já parou de
        casar com o índice.
        """
        caminho = Path(__file__).resolve().parent.parent / "avaliacao" / "fixture-tokens.json"
        fixture = json.loads(caminho.read_text(encoding="utf-8"))
        for caso in fixture["casos"]:
            with self.subTest(entrada=caso["entrada"]):
                self.assertEqual(ci.normalizar(caso["entrada"]), caso["tokens"])

    def test_separador_de_milhar_casa_com_numero_puro(self):
        # O defeito que motivou a regra: os números são a evidência
        # do corpus, e as duas grafias precisam colidir no mesmo token.
        self.assertEqual(ci.normalizar("187.402"), ci.normalizar("187402"))
        self.assertEqual(ci.normalizar("9.415"), ["9415"])

    def test_decimal_nao_e_afetado(self):
        self.assertIn("14", ci.normalizar("3.14"))
        self.assertNotIn("314", ci.normalizar("3.14"))

    def test_acento_e_caixa_colapsam(self):
        self.assertEqual(ci.normalizar("AÇÃO"), ci.normalizar("ação"))

    def test_stopword_e_token_curto_saem(self):
        self.assertEqual(ci.normalizar("o a de que para com um"), [])
        self.assertEqual(ci.normalizar("a b c"), [])


class TesteFrontMatter(unittest.TestCase):
    def test_extrai_campos_e_corpo(self):
        campos, corpo = ci.ler_front_matter("---\nrevisado: true\nfonte: x\n---\n## T\ncorpo\n")
        self.assertEqual(campos["revisado"], "true")
        self.assertEqual(campos["fonte"], "x")
        self.assertTrue(corpo.startswith("## T"))

    def test_sem_front_matter_devolve_vazio(self):
        campos, corpo = ci.ler_front_matter("## T\ncorpo\n")
        self.assertEqual(campos, {})
        self.assertTrue(corpo.startswith("## T"))

    def test_front_matter_nao_terminado_nao_engole_o_arquivo(self):
        campos, corpo = ci.ler_front_matter("---\nrevisado: true\n## T\ncorpo\n")
        self.assertEqual(campos, {})
        self.assertIn("## T", corpo)


class TestePortao(unittest.TestCase):
    """O portão é a peça de segurança do projeto: ele decide o que
    vira arquivo público. Cada forma de escrever 'quase true' tem
    que ser recusa."""

    def _indexa(self, conteudo: str):
        with tempfile.TemporaryDirectory() as tmp:
            dir_corpus = Path(tmp) / "corpus"
            dir_corpus.mkdir()
            (dir_corpus / "t.md").write_text(conteudo, encoding="utf-8")
            original = ci.DIR_CORPUS
            ci.DIR_CORPUS = dir_corpus
            try:
                return ci.coletar()
            finally:
                ci.DIR_CORPUS = original

    def test_revisado_true_passa(self):
        aceitas, recusas = self._indexa("---\nrevisado: true\n---\n## T\ncorpo real\n")
        self.assertEqual(len(aceitas), 1)
        self.assertEqual(recusas, [])

    def test_variantes_de_true_sao_recusadas(self):
        for valor in ["True", "TRUE", "sim", "yes", "1", "verdadeiro", " true x", ""]:
            with self.subTest(valor=valor):
                aceitas, recusas = self._indexa(f"---\nrevisado: {valor}\n---\n## T\ncorpo\n")
                self.assertEqual(aceitas, [], f"{valor!r} passou pelo portão")
                self.assertEqual(len(recusas), 1)

    def test_campo_ausente_e_recusa(self):
        aceitas, recusas = self._indexa("---\nfonte: x\n---\n## T\ncorpo\n")
        self.assertEqual(aceitas, [])
        self.assertEqual(len(recusas), 1)

    def test_sem_front_matter_e_recusa(self):
        aceitas, _ = self._indexa("## T\ncorpo sem front matter\n")
        self.assertEqual(aceitas, [])

    def test_arquivo_sublinhado_e_ignorado(self):
        with tempfile.TemporaryDirectory() as tmp:
            dir_corpus = Path(tmp) / "corpus"
            dir_corpus.mkdir()
            (dir_corpus / "_doc.md").write_text("---\nrevisado: true\n---\n## T\nx\n", encoding="utf-8")
            original = ci.DIR_CORPUS
            ci.DIR_CORPUS = dir_corpus
            try:
                aceitas, recusas = ci.coletar()
            finally:
                ci.DIR_CORPUS = original
        self.assertEqual(aceitas, [])
        self.assertEqual(recusas, [])  # ignorado, não recusado


class TestePassagens(unittest.TestCase):
    def test_divide_por_cabecalho_de_nivel_2(self):
        blocos = ci.dividir_em_passagens("## A\num\n## B\ndois\n")
        self.assertEqual([t for t, _ in blocos], ["A", "B"])

    def test_texto_antes_do_primeiro_cabecalho_e_descartado(self):
        blocos = ci.dividir_em_passagens("preambulo solto\n## A\num\n")
        self.assertEqual(len(blocos), 1)
        self.assertNotIn("preambulo", blocos[0][1])

    def test_secao_vazia_nao_vira_passagem(self):
        self.assertEqual(ci.dividir_em_passagens("## A\n\n## B\ntexto\n"), [("B", "texto")])


if __name__ == "__main__":
    unittest.main(verbosity=2)

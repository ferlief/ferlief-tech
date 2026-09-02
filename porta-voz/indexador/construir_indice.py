#!/usr/bin/env python3
"""Constrói dados/indice.json a partir de corpus/.

Portão que falha fechado: um arquivo só é indexado se declarar
`revisado: true` no front-matter. Ausência do campo, valor
inválido ou front-matter faltando = não indexa, e o motivo é
impresso. Nada entra no índice por omissão.

O índice resultante é público por construção — ele é servido a
qualquer visitante do site. Trate corpus/ como material já
publicado, nunca como rascunho.
"""

import json
import math
import re
import sys
import unicodedata
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DIR_CORPUS = RAIZ / "corpus"
SAIDA = RAIZ / "dados" / "indice.json"

# Parâmetros BM25. Os valores padrão da literatura; não são
# calibrados contra este corpus — ver avaliacao/README.md.
K1 = 1.5
B = 0.75

def _sem_acento(texto: str) -> str:
    return "".join(
        c for c in unicodedata.normalize("NFD", texto)
        if unicodedata.category(c) != "Mn"
    )


# Stopwords do português. Lista curta e explícita de propósito:
# uma lista grande derruba recall em corpus pequeno.
#
# A lista é escrita COM acento para ser legível, e comparada SEM,
# porque normalizar() já tirou o acento quando chega aqui. Sem o
# _sem_acento() abaixo, "são", "já", "é" e "também" nunca casavam
# e passavam direto pelo filtro — o teste de fixture contra o
# gêmeo em JS foi o que expôs isso.
STOPWORDS = {
    "a", "ao", "aos", "as", "com", "como", "da", "das", "de", "do",
    "dos", "e", "em", "ele", "ela", "eles", "elas", "essa", "esse",
    "esta", "este", "eu", "foi", "for", "há", "isso", "isto", "já",
    "la", "lhe", "mais", "mas", "me", "mesmo", "meu", "minha", "muito",
    "na", "nas", "no", "nos", "o", "os", "ou", "para", "pela", "pelo",
    "por", "que", "se", "sem", "ser", "seu", "sua", "são", "só",
    "também", "te", "tem", "um", "uma", "você", "à", "às", "é",
}
STOPWORDS = {_sem_acento(p) for p in STOPWORDS}


def normalizar(texto: str) -> list[str]:
    """Texto -> lista de tokens.

    ESTE ALGORITMO TEM UM GÊMEO em js/recuperacao.js. Os dois
    precisam produzir exatamente a mesma saída para a mesma
    entrada, senão a consulta do navegador não casa com o índice
    gerado aqui. indexador/teste_indexador.py trava esse contrato
    com um fixture compartilhado (avaliacao/fixture-tokens.json).
    """
    # NFD separa o acento do caractere base; Mn são as marcas
    # combinantes. "coração" -> "coracao", para que uma busca sem
    # acento (o caso comum em teclado de visitante) case.
    decomposto = unicodedata.normalize("NFD", texto.lower())
    sem_acento = "".join(c for c in decomposto if unicodedata.category(c) != "Mn")
    # Separador de milhar colapsa ANTES da limpeza geral, senão
    # "187.402" vira dois tokens ('187', '402') e deixa de casar
    # com "187402" digitado direto. Os números são a evidência
    # deste corpus, então essa diferença quebra justamente a
    # pergunta mais importante. O lookahead de 3 dígitos exatos
    # preserva o decimal: "3.14" não é afetado.
    sem_milhar = re.sub(r"(?<=\d)[.,](?=\d{3}(?!\d))", "", sem_acento)
    # Tudo que não é letra/dígito vira separador. Mantém dígitos
    # porque os números são evidência aqui (187402, 9415).
    bruto = re.sub(r"[^a-z0-9]+", " ", sem_milhar).split()
    return [t for t in bruto if len(t) >= 2 and t not in STOPWORDS]


def ler_front_matter(texto: str) -> tuple[dict, str]:
    """Extrai front-matter YAML simples (chave: valor) e o corpo.

    Não usa PyYAML de propósito: zero dependência, e o subconjunto
    que aceitamos é deliberadamente burro (uma linha, um par).
    """
    if not texto.startswith("---\n"):
        return {}, texto
    fim = texto.find("\n---\n", 4)
    if fim == -1:
        return {}, texto
    campos = {}
    for linha in texto[4:fim].splitlines():
        if not linha.strip() or ":" not in linha:
            continue
        chave, _, valor = linha.partition(":")
        campos[chave.strip()] = valor.strip().strip('"').strip("'")
    return campos, texto[fim + 5:]


def dividir_em_passagens(corpo: str) -> list[tuple[str, str]]:
    """Quebra o markdown por cabeçalho ## -> [(titulo, texto)].

    A passagem é a unidade de citação: é ela que o visitante vê e
    é dela que sai o link. Cabeçalho é a fronteira certa porque
    foi onde a autora já decidiu que um assunto termina.
    """
    passagens = []
    titulo_atual = None
    buffer: list[str] = []

    def fechar():
        texto = "\n".join(buffer).strip()
        if texto and titulo_atual:
            passagens.append((titulo_atual, texto))

    for linha in corpo.splitlines():
        if linha.startswith("## "):
            fechar()
            titulo_atual = linha[3:].strip()
            buffer = []
        elif titulo_atual is not None:
            buffer.append(linha)
    fechar()
    return passagens


def _data_do_corpus(passagens: list[dict]) -> str:
    """A `data:` mais recente declarada no front-matter das
    passagens indexadas.

    Não usa mtime de arquivo: `git checkout` reescreve mtime, então
    no CI o carimbo mudaria a cada execução e a trava que compara
    índice contra corpus acusaria diferença sempre. Derivado do
    conteúdo, o índice é byte a byte reprodutível em qualquer
    máquina — que é o que torna a trava confiável.
    """
    datas = [p["origem"]["data"] for p in passagens if p["origem"].get("data")]
    return max(datas) if datas else "sem-data"


def coletar() -> tuple[list[dict], list[str]]:
    """Lê corpus/ e devolve (passagens aceitas, motivos de recusa)."""
    aceitas: list[dict] = []
    recusas: list[str] = []

    for caminho in sorted(DIR_CORPUS.glob("*.md")):
        if caminho.name.startswith("_"):
            continue  # convenção: _nome.md é documentação do diretório

        campos, corpo = ler_front_matter(caminho.read_text(encoding="utf-8"))
        nome = caminho.name

        # O portão. Qualquer coisa diferente da string "true"
        # exata é recusa — incluindo campo ausente.
        if campos.get("revisado") != "true":
            recusas.append(
                f"{nome}: revisado={campos.get('revisado', '<ausente>')!r} — não indexado"
            )
            continue

        blocos = dividir_em_passagens(corpo)
        if not blocos:
            recusas.append(f"{nome}: revisado=true mas nenhuma seção '## ' encontrada")
            continue

        for i, (titulo, texto) in enumerate(blocos):
            tokens = normalizar(f"{titulo} {texto}")
            if not tokens:
                recusas.append(f"{nome} § {titulo}: sem tokens após normalização")
                continue
            tf: dict[str, int] = {}
            for t in tokens:
                tf[t] = tf.get(t, 0) + 1
            aceitas.append({
                "id": f"{caminho.stem}#{i}",
                "titulo": titulo,
                "texto": texto,
                "origem": {
                    "arquivo": f"corpus/{nome}",
                    "fonte": campos.get("fonte", ""),
                    "data": campos.get("data", ""),
                },
                "tf": tf,
                "dl": len(tokens),
            })

    return aceitas, recusas


def construir() -> int:
    if not DIR_CORPUS.is_dir():
        print(f"erro: {DIR_CORPUS} não existe", file=sys.stderr)
        return 1

    passagens, recusas = coletar()

    for motivo in recusas:
        print(f"  recusado  {motivo}")

    if not passagens:
        print(
            "\nerro: nenhuma passagem indexável. O índice NÃO foi escrito.\n"
            "Isso é o portão funcionando, não um bug: marque revisado: true\n"
            "nos arquivos de corpus/ que você conferiu e quer publicar.",
            file=sys.stderr,
        )
        return 1

    # df = em quantas passagens o termo aparece (não quantas vezes).
    df: dict[str, int] = {}
    for p in passagens:
        for termo in p["tf"]:
            df[termo] = df.get(termo, 0) + 1

    indice = {
        "versao": 1,
        # Carimbo do CORPUS, não do relógio. Com datetime.now() o
        # índice mudaria a cada execução e a trava de CI que compara
        # índice contra corpus acusaria diferença sempre — vira ruído
        # e alguém desliga a trava. Aqui, arquivo igual gera índice
        # byte a byte igual.
        "gerado_em": _data_do_corpus(passagens),
        "bm25": {"k1": K1, "b": B},
        "n": len(passagens),
        "avgdl": sum(p["dl"] for p in passagens) / len(passagens),
        "df": dict(sorted(df.items())),
        "passagens": passagens,
    }

    SAIDA.parent.mkdir(parents=True, exist_ok=True)
    SAIDA.write_text(
        json.dumps(indice, ensure_ascii=False, indent=1, sort_keys=False) + "\n",
        encoding="utf-8",
    )

    tamanho = SAIDA.stat().st_size
    print(
        f"\n  indexado  {len(passagens)} passagens, {len(df)} termos distintos"
        f"\n  escrito   {SAIDA.relative_to(RAIZ)} ({tamanho / 1024:.1f} KB)"
        f"\n  recusado  {len(recusas)} item(ns)"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(construir())

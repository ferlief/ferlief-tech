import json, sys
sys.path.insert(0, "indexador")
from construir_indice import normalizar

# Casos escolhidos para cobrir cada regra do normalizador, não
# para passar: acento, caixa, pontuação, dígito, stopword,
# token de 1 caractere, unicode fora do latim, string vazia.
CASOS = [
    "Coração de Fernanda",
    "AÇÃO, ação; Ação!",
    "187.402 arquivos e 9.415 linhas",
    "o a de que para com um",
    "C++ e C# não são o mesmo",
    "Math.atan2(dy, dx)",
    "e-mail   com    espaços",
    "ÍNDICE Único — travessão",
    "",
    "   ",
    "a",
    "ab",
    "São Paulo é PÃO",
    "BM25 vs. embeddings",
    "não sei / nao sei",
    "日本語 misturado com texto",
    "UPPERCASE_com_underscore",
    "3.14 e 42",
]

fixture = {
    "descricao": (
        "Contrato do normalizador. normalizar() em "
        "indexador/construir_indice.py e em js/recuperacao.js DEVEM "
        "produzir estas saídas exatas. Regenerar com "
        "indexador/gerar_fixture.py e rodar os dois testes."
    ),
    "casos": [{"entrada": c, "tokens": normalizar(c)} for c in CASOS],
}
print(json.dumps(fixture, ensure_ascii=False, indent=1))

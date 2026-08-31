#!/usr/bin/env python3
"""Regenera data/atividade.json a partir da API publica do GitHub.

Le, nunca escreve nos outros repositorios. Para cada repo em REPOS:
  - ultimo commit (sha curto, mensagem, data) via /commits.
  - resultados.json na raiz do repo, se existir (via /contents). Repo sem
    esse arquivo -> campo 'resultado' fica null. Ausencia de resultado
    publicado nao e' erro, e' o estado normal ate' o experimento fechar.

Convencao esperada de resultados.json num repo, quando existir:
    {"rotulo": "recall do portao: 98.5% (IC95% 97.1-99.4%)",
     "medido_em": "2026-09-10"}

Nao inventa numero: so' reflete o que o repositorio ja publicou.
"""

from __future__ import annotations

import base64
import json
import os
import urllib.error
import urllib.request
from datetime import datetime, timezone

USUARIO = "ferlief"
REPOS = ["anatomia", "protocolo-vies", "ferlief-tech"]
SAIDA = "data/atividade.json"

TOKEN = os.environ.get("GITHUB_TOKEN", "")


def _get(url: str):
    req = urllib.request.Request(url)
    req.add_header("Accept", "application/vnd.github+json")
    if TOKEN:
        req.add_header("Authorization", f"Bearer {TOKEN}")
    with urllib.request.urlopen(req, timeout=15) as resp:
        return json.loads(resp.read())


def ultimo_commit(repo: str) -> dict:
    dados = _get(f"https://api.github.com/repos/{USUARIO}/{repo}/commits?per_page=1")
    c = dados[0]
    return {
        "sha": c["sha"][:7],
        "mensagem": c["commit"]["message"].splitlines()[0],
        "data": c["commit"]["author"]["date"],
    }


def resultado_publicado(repo: str) -> dict | None:
    url = f"https://api.github.com/repos/{USUARIO}/{repo}/contents/resultados.json"
    try:
        meta = _get(url)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return None
        raise
    conteudo = base64.b64decode(meta["content"]).decode("utf-8")
    return json.loads(conteudo)


def main() -> None:
    projetos = []
    for repo in REPOS:
        try:
            commit = ultimo_commit(repo)
        except urllib.error.HTTPError:
            continue
        projetos.append(
            {
                "repo": repo,
                "url": f"https://github.com/{USUARIO}/{repo}",
                "ultimo_commit": commit,
                "resultado": resultado_publicado(repo),
            }
        )

    payload = {
        "atualizado_em": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "projetos": projetos,
    }

    os.makedirs(os.path.dirname(SAIDA), exist_ok=True)
    with open(SAIDA, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write("\n")


if __name__ == "__main__":
    main()

# Este diretório é temporário aqui

`porta-voz` é um projeto próprio. Ele está dentro de `ferlief-tech`
apenas porque a sessão que o escreveu não tinha permissão para criar
repositório novo, e o trabalho precisava ser preservado em algum
lugar versionado.

## Para movê-lo

1. Criar `ferlief/porta-voz` no GitHub — **privado**, sem README,
   sem .gitignore, sem licença (o projeto já traz os três).
2. Extrair preservando o histórico:

   ```bash
   git subtree split --prefix=porta-voz -b porta-voz-extraido
   git push git@github.com:ferlief/porta-voz.git porta-voz-extraido:main
   ```

3. Remover `porta-voz/` deste repositório.

## Por que privado

`corpus/` vai receber texto de identidade. Enquanto houver ali um
arquivo que você não publicaria hoje, o repositório fica privado —
o portão `revisado:` mantém o texto fora do **índice**, não fora do
**repositório**. Ver `AMEACAS.md`, A-7.

Dois arquivos de corpus foram redigidos e deixados de fora
justamente por isso; `corpus/_PENDENTES.md` diz quais são e de onde
reconstruí-los.

## Nota sobre o CI

`.github/workflows/testes.yml` só roda depois da extração — o
GitHub Actions lê workflows apenas na raiz do repositório.

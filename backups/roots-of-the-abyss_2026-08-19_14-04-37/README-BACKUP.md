# Backup — Roots of the Abyss

- Criado em: 19/08/2026 às 14:04:37 (America/Sao_Paulo)
- Branch no momento do backup: `main`
- Commit: `8d0d5df33b73611918c9e4e2b3054da12af3fc72`
- Estado antes da criação do diretório de backup: limpo, sincronizado com `origin/main`

## Arquivos

### `complete-repository.zip`

Snapshot completo da pasta do projeto antes da nova UI. Inclui a pasta `.git`, arquivos versionados e quaisquer arquivos locais presentes. O diretório `backups` foi excluído para evitar que o backup contivesse a si próprio.

SHA-256:

`AE4A29BFABD2E3AC71A4F99BD983133C4C67BF1CA7C5DDC5F7DB9E295E6AC339`

Para restaurar, extraia o ZIP em uma pasta vazia.

### `repository-history.bundle`

Pacote Git autônomo com o histórico completo e as referências existentes no momento do backup.

SHA-256:

`446A1C1351A90F10E560612BBF8B8D914CC4A68E072E5377168705113669FA93`

Exemplo de restauração em outra pasta:

```powershell
git clone .\repository-history.bundle ficha-sobrevivente-restaurada
```

## Validação realizada

- `git bundle verify` confirmou histórico completo.
- O ZIP foi aberto e teve sua listagem verificada.
- Presença confirmada de `.git/HEAD`, `index.html`, `style.css`, `script.js`, `rules-data.js`, `automation-engine.js`, `weapon-details.js` e `tests/rules-engine.test.js`.

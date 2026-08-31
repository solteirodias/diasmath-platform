# Correção 37 — Fazer o 5º Miniteste aparecer no SAP

O SAP estava mostrando apenas M1, M2, M3 e M4 porque o arquivo principal `index.html` possui uma base de dados embutida dentro dele.

A correção anterior atualizou apenas `dados.json`, mas o sistema continuou lendo os dados antigos embutidos no `index.html`.

## Esta correção substitui

```text
public/escolas/sap-avaliacoes-2026/index.html
public/escolas/sap-avaliacoes-2026/dados.json
public/escolas/sap-avaliacoes-2026/VERSAO_DADOS.txt
```

## Como subir

1. Baixe o ZIP.
2. Extraia.
3. No GitHub, clique em `Add file → Upload files`.
4. Envie a pasta extraída:

```text
public
```

5. Commit sugerido:

```text
Corrige SAP para exibir 5 Miniteste
```

6. Aguarde a Vercel ficar `Ready`.

## Teste

Abra com versão/cache limpo:

```text
https://www.diasmath.com.br/escolas/sap-avaliacoes-2026/index.html?v=37
```

Depois entre na aba `Minitestes`.

O gráfico precisa mostrar:

```text
M1, M2, M3, M4 e M5
```

Se ainda mostrar só até M4, faça na Vercel:

```text
Deployments → Redeploy → sem usar cache
```

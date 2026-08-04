# Correção 35 — Header, Footer e alias @

Esta correção resolve o erro da Vercel:

```text
Module not found: Can't resolve '@/components/Header'
Module not found: Can't resolve '@/components/Footer'
```

## O que ela restaura

```text
components/Header.tsx
components/Footer.tsx
tsconfig.json
next-env.d.ts
next.config.js
postcss.config.js
tailwind.config.js
```

O ponto mais importante é o `tsconfig.json`, porque ele faz o atalho `@/components/...` funcionar.

## Como subir no GitHub

1. Baixe o ZIP.
2. Extraia.
3. No GitHub, clique em `Add file` → `Upload files`.
4. Envie estes itens extraídos:

```text
components
tsconfig.json
next-env.d.ts
next.config.js
postcss.config.js
tailwind.config.js
```

5. Commit:

```text
Corrige Header Footer e alias do projeto
```

6. Aguarde a Vercel publicar.

## Depois

Se a Vercel mostrar novo erro, abra `Details → Logs` e envie o print.

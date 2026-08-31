# Correção 34B — SAP puxar imagem original das questões

Esta correção resolve o problema apresentado na aba **Questões e devolutiva**, onde aparecia:

```text
Visual original indisponível
```

## Causa

Algumas questões existiam no caderno comentado, mas estavam sem vínculo com:

```text
source_pdf
source_link
page
page_image
```

Por isso o sistema não puxava a imagem original da questão.

## O que foi corrigido

- Vinculação das questões ao caderno comentado correto.
- Mapeamento da página da questão pelo número do item quando a página não estava preenchida.
- Inclusão das imagens faltantes dos Minitestes de Matemática da 3ª Série.
- Correção direta para o caso mostrado: **Minitestes 4 • 3ª Série • Matemática • Questão 11**.
- Quando não houver imagem, o sistema passa a mostrar o botão para abrir o caderno comentado na página da questão.

## Imagens incluídas nesta correção

Total: 24 imagens WEBP.

## Como publicar

1. Baixe e extraia o ZIP.
2. No GitHub, clique em `Add file` → `Upload files`.
3. Envie a pasta extraída:

```text
public
```

4. Commit:

```text
Corrige imagens originais das questões do SAP
```

5. Aguarde a Vercel publicar.

## Teste

Abra:

```text
https://www.diasmath.com.br/escolas/sap-avaliacoes-2026/index.html
```

Depois vá em:

```text
Questões e devolutiva → Minitestes 4 → 3ª Série → Matemática → Questão 11
```

A área da esquerda deve mostrar a imagem original da questão.

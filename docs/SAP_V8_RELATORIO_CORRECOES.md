# SAP Avaliações 2026 — V8 Pedagógica

## Objetivo

Esta atualização corrige a inconsistência apontada nas abas de questões e devolutivas: o código do descritor exibido no sistema deve coincidir com o descritor que aparece no caderno/imagem original da questão.

## O que foi corrigido

- Correção automática dos descritores dos **Minitestes** com base no código D indicado no caderno comentado da questão.
- Atualização de `Questões mais críticas`, lista de questões e bloco `Habilidade e conhecimentos prévios`.
- Substituição dos conhecimentos prévios genéricos por orientações pedagógicas específicas.
- Substituição da devolutiva genérica por passos mais claros para o professor aplicar em sala.
- Remoção da aba `Áreas e disciplinas`.
- Ajuste do `Mapa de Dependências` para reduzir cruzamento indevido entre habilidades sem relação de conteúdo.

## Total de correções de descritor

**169 questões** tiveram o código da versão anterior ajustado para o descritor localizado no caderno/imagem original.

## Correções por disciplina

- Língua Portuguesa: 113 questões
- Matemática: 56 questões

## Regra pedagógica adotada

O SAP passa a seguir esta regra:

> Nos Minitestes, o descritor correto da questão é o código apresentado no caderno/imagem original da questão.

## Arquivos alterados

```text
public/escolas/sap-avaliacoes-2026/index.html
public/escolas/sap-avaliacoes-2026/dados.json
docs/SAP_V8_CORRECOES_DESCRITORES.csv
```

## Como publicar

1. Baixe e extraia o ZIP.
2. Envie as pastas extraídas `public` e `docs` para o GitHub.
3. Faça commit com a mensagem:

```text
Corrige descritores e devolutivas do SAP V8
```

4. Aguarde a Vercel publicar.
5. Teste:

```text
https://www.diasmath.com.br/escolas/sap-avaliacoes-2026
```

## Observação

Esta versão é uma correção de base e de interface. Ela não exige reenviar PDFs nem imagens, apenas substitui o `index.html` e o `dados.json`.

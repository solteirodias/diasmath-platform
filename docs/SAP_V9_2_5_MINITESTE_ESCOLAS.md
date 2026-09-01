# Correção 42 — 5º Miniteste com escolas no acesso regional

## Problema corrigido

No acesso regional, o 5º Miniteste aparecia com apenas uma linha de “Consolidado regional”. Isso impedia a aba Escolas de listar as unidades escolares corretamente e prejudicava as demais leituras vinculadas ao recorte.

## Correção aplicada

Os 8 grupos do 5º Miniteste foram atualizados com as escolas individuais extraídas dos PDFs consolidados por escola.

| Grupo | Escolas | Estudantes | Média geral de acerto | Descritores |
|---|---:|---:|---:|---|
| Minitestes|5|9º Ano|Matemática | 3 | 27 | 65.1% | D36, D37, D27, D29, D03 |
| Minitestes|5|1ª Série|Matemática | 21 | 850 | 43.7% | D17, D15, D26, D14 |
| Minitestes|5|2ª Série|Matemática | 21 | 914 | 46.4% | D11, D05, D12, D30 |
| Minitestes|5|3ª Série|Matemática | 21 | 830 | 58.0% | D12, D13, D25, D8 |
| Minitestes|5|9º Ano|Língua Portuguesa | 3 | 25 | 54.3% | D21, D13, D14, D03, D08, D02 |
| Minitestes|5|1ª Série|Língua Portuguesa | 21 | 845 | 63.2% | D14, D20, D15, D13, D02, D06, D04, D01, D08, D03, D07, D18 |
| Minitestes|5|2ª Série|Língua Portuguesa | 21 | 933 | 62.9% | D12, D20, D16, D13, D03, D04 |
| Minitestes|5|3ª Série|Língua Portuguesa | 21 | 827 | 70.4% | D21, D14, D13, D08, D02, D03 |

## Arquivos alterados

```text
public/escolas/sap-avaliacoes-2026/index.html
public/escolas/sap-avaliacoes-2026/dados.json
public/escolas/sap-avaliacoes-2026/VERSAO_DADOS.txt
docs/SAP_V9_2_5_MINITESTE_ESCOLAS.md
```
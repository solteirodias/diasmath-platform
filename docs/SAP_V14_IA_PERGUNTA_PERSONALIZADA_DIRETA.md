# SAP V14 — IA com pergunta personalizada direta

## Correção feita

Quando o usuário usa o campo de pergunta personalizada, a IA deve responder diretamente à pergunta feita.

## Regra nova

A primeira linha da resposta deve começar respondendo à pergunta.

A IA não deve começar com:

```text
Pergunta personalizada
Diagnóstico pedagógico
Recorte selecionado
Simula+ • série • disciplina
```

## Comportamento esperado

Pergunta:

```text
Como melhorar o desempenho dos estudantes em Matemática?
```

Resposta deve começar assim:

```text
Para melhorar o desempenho dos estudantes em Matemática, a escola deve priorizar...
```

## Uso dos dados

A IA usa os dados do SAP como apoio, principalmente:

- habilidades com menor percentual;
- descritores prioritários;
- série;
- disciplina;
- instrumento;
- percentual geral;
- quantidade de habilidades críticas.

Mas não deve transformar toda pergunta em diagnóstico geral.

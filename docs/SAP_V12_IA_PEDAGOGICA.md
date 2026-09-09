# SAP V12 — IA Pedagógica

## O que foi adicionado

Nova aba no SAP:

```text
IA Pedagógica
```

A IA pode gerar:

- diagnóstico pedagógico;
- plano de intervenção;
- devolutiva para professor;
- resumo para reunião da GRE;
- mensagem para escola;
- resposta a pergunta personalizada.

## Privacidade

A IA recebe apenas dados consolidados do recorte selecionado:

- instrumento;
- aplicação;
- série;
- disciplina;
- escola/recorte;
- percentuais consolidados;
- habilidades prioritárias;
- ranking consolidado quando o acesso for GRE;
- questões críticas vinculadas ao recorte.

Não envia nome de estudante, CPF, telefone, turma individual ou dado pessoal.

## Perfil de acesso

- GRE: pode analisar toda a regional e todas as escolas.
- Escola: recebe e analisa somente a escola logada pelo INEP.

## Rota de IA

```text
/api/sap/ia
```

## Variáveis de ambiente

Obrigatória para IA online:

```text
OPENAI_API_KEY
```

Opcional:

```text
OPENAI_MODEL
```

Se `OPENAI_MODEL` não for configurada, usa `gpt-5`.

## Modo local

Se `OPENAI_API_KEY` não estiver configurada, o SAP gera uma análise local básica com os dados do recorte.

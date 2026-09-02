# SAP V11 — Controle de acesso por perfil

## Correção realizada

- O SAP não entra mais automaticamente como GRE.
- A GRE acessa com login regional.
- Cada escola acessa com login e senha iguais ao INEP.
- No perfil escola, o campo `Escola` fica oculto e a visualização é limitada à unidade logada.
- No perfil GRE, todas as escolas ficam disponíveis.

## Acesso regional

```text
Login: 8gre
Senha: SAP8GRE2026
```

## Regra das escolas

```text
Login: INEP da escola
Senha: INEP da escola
```

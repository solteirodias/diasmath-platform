# Correção — Os Guardiões da Divisão

## Erro encontrado

Na tela do **Bloco da Divisão**, quando apareciam cálculos como:

```text
63 ÷ 9
72 ÷ 9
```

o texto informava corretamente que eram 9 grupos, porém a visualização mostrava apenas **8 grupos**.

## Causa técnica

Na função `previewDivision`, havia este limite:

```javascript
const shownGroups = Math.min(divisor, 8);
```

Isso limitava a visualização a no máximo 8 grupos.

## Correção aplicada

O trecho foi substituído por:

```javascript
const shownGroups = divisor;
```

## Resultado esperado

- `63 ÷ 9`: aparecem 9 grupos, com 7 objetos em cada grupo.
- `72 ÷ 9`: aparecem 9 grupos, com 8 objetos em cada grupo.

# QuadraLab™

## Laboratório Virtual de Equações Quadráticas

Aplicação educacional para investigar, fatorar e resolver equações quadráticas por meio de peças manipuláveis, sem recorrer à fórmula de Bhaskara.

## Esta entrega

`QuadraLab_Pack_01_Parte03` já funciona como aplicação independente.

### Recursos implementados

- tabuleiro em Canvas;
- peças algébricas positivas e negativas;
- arrastar, encaixar, selecionar, girar, duplicar e excluir;
- geração de peças a partir de equações;
- equações com `a = 1` e `a ≠ 1`;
- histórico de ações;
- salvamento local;
- interface responsiva;
- tutorial e documentação.

## Uso

```bash
npm install
npm run dev
```

## Testes

```bash
npm test
```

## Build

```bash
npm run build
```

## Autoria

Elaborado por Francisco Vieira Dias.

© 2026 Francisco Vieira Dias — DIASMATH. Todos os direitos reservados.


## Parte 04

Foi adicionada a camada de fatoração visual:

- decomposição do termo central;
- retângulo dos fatores;
- suporte a `a ≠ 1`;
- casos com uma, duas ou nenhuma raiz real;
- completamento de quadrado quando a fatoração inteira não fecha;
- novos testes e documentação.

O laboratório continua sem usar a fórmula de Bhaskara.

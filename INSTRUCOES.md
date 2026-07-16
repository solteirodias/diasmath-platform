# Atualização 13B — Corrige grupos do Bloco da Divisão

Este pacote corrige o erro visual do game **Os Guardiões da Divisão**.

## O que foi corrigido

Antes, em questões como:

```text
63 ÷ 9
72 ÷ 9
```

o jogo dizia que eram 9 grupos, mas mostrava somente 8.

Agora o jogo mostra todos os grupos corretamente.

## Arquivo incluído

```text
public/games/guardioes-divisao/index.html
```

## Como corrigir no GitHub

1. Baixe e extraia este ZIP.
2. Abra o repositório `diasmath-platform`.
3. Vá para a página inicial do repositório.
4. Clique em `Add file`.
5. Clique em `Upload files`.
6. Arraste a pasta extraída:

```text
public
```

7. Em `Commit message`, escreva:

```text
Corrige visualização dos grupos na divisão
```

8. Clique em `Commit changes`.
9. Aguarde a Vercel publicar.

## Depois teste

Abra:

```text
https://www.diasmath.com.br/games/guardioes-divisao/index.html
```

Depois procure uma questão como:

```text
63 ÷ 9
72 ÷ 9
```

Agora devem aparecer **9 grupos**.

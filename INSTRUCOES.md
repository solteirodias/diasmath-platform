# Atualização 11 — DIASMATH™ Arena da Revisão

Este pacote publica o game DIASMATH™ Arena da Revisão no site.

## Arquivos incluídos

```text
public/games/arena-revisao/index.html
app/play/arena-revisao/page.tsx
app/play/page.tsx
ANALISE_TECNICA.md
```

## Por que colocar em outra aba?

O game é grande, usa tela cheia, som, ranking e várias telas. Por isso o pacote oferece duas formas de abrir:

```text
/play/arena-revisao
```

Abre dentro do site com uma barra superior.

```text
/games/arena-revisao/index.html
```

Abre o game diretamente em outra aba.

Na página `/play`, o card terá dois botões:

```text
Abrir no site
Outra aba
```

## Como postar no GitHub

1. Baixe o ZIP.
2. Extraia o ZIP.
3. Abra o repositório `diasmath-platform`.
4. Clique em `Add file`.
5. Clique em `Upload files`.
6. Arraste estas duas pastas extraídas:

```text
app
public
```

7. Em `Commit message`, escreva:

```text
Publica DIASMATH Arena da Revisão
```

8. Clique em `Commit changes`.
9. Aguarde a Vercel publicar.

## Testar depois

Depois da Vercel concluir, teste:

```text
https://www.diasmath.com.br/play
https://www.diasmath.com.br/play/arena-revisao
https://www.diasmath.com.br/games/arena-revisao/index.html
```

## Importante

Não envie o ZIP fechado para o GitHub. Extraia e envie as pastas `app` e `public`.

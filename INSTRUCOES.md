# Atualização 17 — Comentários + WhatsApp DIASMATH™

Esta atualização adiciona o WhatsApp oficial e uma caixa flutuante de comentários nos jogos e laboratórios.

```text
WhatsApp oficial: (89) 99987-7193
Número internacional: 5589999877193
E-mail oficial: contato@diasmath.com.br
```

## Arquivos principais

```text
components/FeedbackBox.tsx
components/Header.tsx
components/Footer.tsx
app/contato/page.tsx
app/labs/page.tsx
app/play/page.tsx
```

## Rotas com caixa de comentário

```text
/labs/subtracao
/labs/divisao
/labs/geotessela
/labs/prancha-trigonometrica
/labs/xadrez
/labs/integraz
/play/guardioes-multiplicacao
/play/guardioes-divisao
/play/arena-revisao
```

## Como publicar no GitHub

1. Baixe o ZIP.
2. Extraia o ZIP.
3. Abra o repositório `diasmath-platform`.
4. Clique em `Add file`.
5. Clique em `Upload files`.
6. Envie as pastas extraídas:

```text
components
app
```

7. Em `Commit message`, escreva:

```text
Adiciona comentários e WhatsApp
```

8. Clique em `Commit changes`.
9. Aguarde a Vercel publicar.

## Testar depois

```text
https://www.diasmath.com.br/contato
https://www.diasmath.com.br/labs/subtracao
https://www.diasmath.com.br/play/arena-revisao
```

Ao clicar em `Comentar este app`, o visitante poderá escrever um comentário e enviar pelo WhatsApp ou por e-mail.

## Observação

Nesta versão, os comentários não ficam salvos no site. Eles são enviados diretamente para você por WhatsApp ou e-mail.

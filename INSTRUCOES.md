# Atualização 18 — Confirmação da caixa de comentários

Esta atualização corrige a caixa de comentários da DIASMATH™.

## Problema anterior

O botão `Enviar e-mail` usava `mailto:`. Esse tipo de link depende do navegador e do aplicativo de e-mail do visitante. Em muitos computadores ele apenas abre uma aba ou não envia nada.

## Correção feita

Agora o botão `Enviar e-mail` usa um formulário direto para:

```text
contato@diasmath.com.br
```

Depois de clicar em enviar, aparece uma mensagem de agradecimento:

```text
Comentário enviado com sucesso.
A DIASMATH™ agradece sua contribuição.
```

O botão de WhatsApp continua funcionando e também mostra mensagem de agradecimento.

## Arquivo incluído

```text
components/FeedbackBox.tsx
```

## Como publicar no GitHub

1. Baixe o ZIP.
2. Extraia o ZIP.
3. Abra o repositório `diasmath-platform`.
4. Clique em `Add file`.
5. Clique em `Upload files`.
6. Envie a pasta extraída:

```text
components
```

7. Em `Commit message`, escreva:

```text
Corrige envio e confirmação de comentários
```

8. Clique em `Commit changes`.
9. Aguarde a Vercel publicar.

## Testar depois

Abra um app, por exemplo:

```text
https://www.diasmath.com.br/play/guardioes-divisao
```

Clique em:

```text
Comentar este app
```

Escreva um comentário e clique em:

```text
Enviar e-mail
```

Deve aparecer uma caixa agradecendo o comentário.

## Atenção

Na primeira vez, o serviço de formulário pode enviar uma confirmação para o e-mail:

```text
contato@diasmath.com.br
```

Se chegar algum e-mail de confirmação, confirme para liberar os próximos envios.

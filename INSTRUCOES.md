# Atualização 22 — Comentários persistentes no site

Esta atualização faz duas coisas:

1. Remove da página `/contato` os cards grandes de WhatsApp/e-mail e a seção escura "O que você pode enviar?".
2. Coloca uma área de comentários em cada app, com comentários salvos no banco e visíveis no site.

## Importante

Para os comentários ficarem salvos no site e aparecerem para todos os acessantes, é necessário usar um banco de dados.

Este pacote usa Supabase, que é um banco Postgres com API REST.

## Arquivos incluídos

```text
app/api/comments/route.ts
components/CommentBox.tsx
app/contato/page.tsx
app/labs/subtracao/page.tsx
app/labs/divisao/page.tsx
app/labs/geotessela/page.tsx
app/labs/prancha-trigonometrica/page.tsx
app/labs/xadrez/page.tsx
app/labs/integraz/page.tsx
app/play/guardioes-multiplicacao/page.tsx
app/play/guardioes-divisao/page.tsx
app/play/arena-revisao/page.tsx
SUPABASE_SQL_COMENTARIOS.sql
```

## Como publicar no GitHub

1. Baixe o ZIP.
2. Extraia o ZIP.
3. Abra o repositório `diasmath-platform`.
4. Clique em `Add file`.
5. Clique em `Upload files`.
6. Envie as pastas extraídas:

```text
app
components
```

7. Em `Commit message`, escreva:

```text
Adiciona comentários persistentes nos apps
```

8. Clique em `Commit changes`.

## Configurar Supabase

1. Acesse o Supabase e crie um projeto.
2. Vá em `SQL Editor`.
3. Cole o conteúdo do arquivo:

```text
SUPABASE_SQL_COMENTARIOS.sql
```

4. Clique em `Run`.

## Configurar variáveis na Vercel

Na Vercel, vá em:

```text
diasmath-platform → Settings → Environment Variables
```

Adicione estas duas variáveis:

```text
SUPABASE_URL
```

Valor: a URL do projeto Supabase. Exemplo:

```text
https://xxxxxxxx.supabase.co
```

```text
SUPABASE_SERVICE_ROLE_KEY
```

Valor: a chave `service_role` do Supabase.

Deixe as duas em:

```text
Production and Preview
```

Depois faça:

```text
Deployments → Redeploy
```

## Testar depois

Abra:

```text
https://www.diasmath.com.br/play/guardioes-divisao
```

Role abaixo do app. Deve aparecer:

```text
Comentários
Deixe sua sugestão sobre este app
```

Publique um comentário. Ele deve aparecer na lista da própria página e continuar lá depois de atualizar.

## Observação

O e-mail do usuário é coletado apenas para contato, mas não aparece publicamente na lista de comentários.

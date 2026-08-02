# Atualização 24 — SEO e indexação da DIASMATH™

Esta atualização ajuda o site a aparecer em ferramentas de busca como Google e Bing.

## Arquivos incluídos

```text
app/robots.ts
app/sitemap.ts
```

## O que esses arquivos fazem

### robots.txt

Depois da publicação, será gerado:

```text
https://www.diasmath.com.br/robots.txt
```

Ele informa aos buscadores que o site pode ser rastreado e mostra onde fica o sitemap.

### sitemap.xml

Depois da publicação, será gerado:

```text
https://www.diasmath.com.br/sitemap.xml
```

Ele lista as principais páginas do site para facilitar a descoberta pelos buscadores.

## Como publicar no GitHub

1. Baixe o ZIP.
2. Extraia o ZIP.
3. Abra o repositório `diasmath-platform`.
4. Clique em `Add file`.
5. Clique em `Upload files`.
6. Envie a pasta extraída:

```text
app
```

7. Em `Commit message`, escreva:

```text
Adiciona sitemap e robots para indexação
```

8. Clique em `Commit changes`.
9. Aguarde a Vercel publicar.

## Testar depois

Abra:

```text
https://www.diasmath.com.br/robots.txt
```

Depois abra:

```text
https://www.diasmath.com.br/sitemap.xml
```

Se os dois abrirem, a parte técnica do site está pronta.

## Próximo passo — Google Search Console

1. Acesse `https://search.google.com/search-console`.
2. Clique em `Adicionar propriedade`.
3. Escolha `Domínio`.
4. Digite:

```text
diasmath.com.br
```

5. O Google vai fornecer um registro TXT parecido com:

```text
google-site-verification=xxxxxxxxxxxxxxxx
```

6. Vá na Vercel:
   `diasmath-platform → Settings → Domains → View DNS Records & More`.

7. Adicione um registro DNS:

```text
Type: TXT
Name: @
Value: google-site-verification=xxxxxxxxxxxxxxxx
```

8. Volte no Google Search Console e clique em `Verificar`.
9. Depois vá em `Sitemaps`.
10. Envie:

```text
https://www.diasmath.com.br/sitemap.xml
```

## Próximo passo — Bing Webmaster Tools

1. Acesse `https://www.bing.com/webmasters`.
2. Adicione o site:

```text
https://www.diasmath.com.br
```

3. Verifique a propriedade seguindo as instruções do Bing.
4. Vá em `Sitemaps`.
5. Envie:

```text
https://www.diasmath.com.br/sitemap.xml
```

## Observação importante

Aparecer no Google/Bing não é instantâneo. Após enviar o sitemap, o buscador ainda precisa rastrear e indexar as páginas.

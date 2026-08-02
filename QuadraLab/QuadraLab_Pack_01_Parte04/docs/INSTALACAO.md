# Instalação

## Requisitos

- Node.js 20 ou superior
- npm 10 ou superior

## Executar localmente

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite.

## Gerar versão de produção

```bash
npm run build
```

O conteúdo final ficará na pasta `dist/`.

## Publicar no GitHub Pages

1. Envie o conteúdo do projeto ao repositório.
2. Execute `npm install`.
3. Execute `npm run build`.
4. Publique a pasta `dist/`.

O `vite.config.ts` utiliza `base: "./"`, facilitando a publicação em subpastas.

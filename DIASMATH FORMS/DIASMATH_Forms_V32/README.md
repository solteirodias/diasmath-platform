# DIASMATH Forms V32

Versão integrada e funcional para publicação em hospedagem estática.

## Recursos

- Cadastro e login local de professores;
- Perfis separados por professor;
- Criação e gerenciamento de múltiplos formulários;
- Seções e nove tipos de perguntas;
- Perguntas obrigatórias;
- Banco de questões reutilizável;
- Modelos prontos;
- Publicação e link público;
- Página de resposta responsiva;
- Armazenamento de respostas;
- Indicadores e análises automáticas;
- Exportação CSV e JSON;
- Backup e restauração completa;
- Temas visuais;
- Dados de demonstração.

## Como testar

Os arquivos precisam ser servidos pelo mesmo domínio/pasta para compartilhar o LocalStorage.

### Opção 1 — publicar no site

Envie todo o conteúdo para uma pasta, por exemplo:

`/professor/forms/`

Depois acesse:

`https://seudominio.com/professor/forms/index.html`

### Opção 2 — servidor local

Dentro da pasta extraída:

```bash
python -m http.server 8080
```

Abra:

`http://localhost:8080`

## Limitação desta versão

A V32 usa LocalStorage. Isso significa que os dados ficam no navegador e não são sincronizados entre dispositivos.

Para uso real com vários professores e participantes em aparelhos diferentes, substitua a camada `js/storage.js` por Firebase, Supabase ou outro backend.

## Estrutura

- `index.html` — login e cadastro;
- `app.html` — área do professor;
- `respond.html` — página pública do participante;
- `css/styles.css` — identidade visual;
- `js/storage.js` — camada de armazenamento;
- `js/auth.js` — autenticação local;
- `js/app.js` — painel, editor e resultados;
- `js/respond.js` — coleta das respostas;
- `js/templates.js` — modelos prontos.

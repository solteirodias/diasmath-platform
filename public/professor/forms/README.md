# DIASMATH Forms

Ferramenta para professores criarem atividades, publicarem formulários e acompanharem respostas.

## Segurança e armazenamento

- Login e cadastro validam contas existentes no backend Supabase.
- Uma conta existente não pode ser recadastrada para alterar sua senha.
- A sessão do professor usa cookie HttpOnly, SameSite=Lax e assinatura no servidor.
- Consultas, edição e exclusão dos formulários exigem sessão válida e verificação de propriedade.
- Somente o professor autenticado pode visualizar as respostas de seus formulários.
- Participantes acessam apenas formulários publicados usando `respond.html?id=form_...`.
- Respostas de participantes são gravadas no servidor e **não** guardadas no navegador do aluno.
- Arquivos no navegador usados como cache do professor não substituem autorização no servidor.
- O mecanismo legado de SHA-256 das senhas foi mantido para não invalidar contas já existentes. É recomendável migrar futuramente para um provedor de autenticação com hashing adaptativo e verificação de e-mail.

## Configuração necessária na Vercel

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` — segredo exclusivo do servidor, nunca no frontend.
- `FORMS_SESSION_SECRET` — segredo aleatório forte para assinar sessões (recomendado). Enquanto não configurado, o sistema usa a chave de serviço no servidor como fallback, sem expô-la.
- `RESEND_API_KEY` e `FORMS_RECOVERY_FROM` (ou `FEEDBACK_FROM`) — necessários para os e-mails de redefinição de senha.

O processo de recuperação envia código aleatório de oito dígitos, válido por 15 minutos.

## Verificação antes de publicar

Execute `npm run test:forms` para testar autenticação, segregação de professores e dados, links publicados e fluxo de respostas. A integração contínua executa esse teste junto aos testes de games/laboratórios e ao build Next.js.

## Privacidade

Os formulários podem coletar dados de estudantes. É necessário publicar política de privacidade, informar a finalidade da coleta, limitar o tempo de retenção e definir os controles para exclusão e acesso aos dados conforme a LGPD.

## Componentes

- `index.html` — acesso e recuperação;
- `app.html` — painel do professor;
- `respond.html` — atividade pública;
- `js/auth.js` — interface de sessão;
- `js/storage.js` — cache/backup no navegador;
- `app/api/forms/*` — API de autenticação, formulários e respostas;
- `lib/formsSecurity.ts` — política de acesso do servidor.

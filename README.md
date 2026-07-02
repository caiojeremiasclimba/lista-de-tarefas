# Lista de Tarefas

Aplicação web para organizar tarefas com autenticação, categorias, subtarefas, anexos e dashboard de produtividade.

Stack: React 19, Vite 8, TypeScript, Tailwind CSS 4 e Supabase.

- Demo: https://lista-de-tarefas-taupe-six.vercel.app/
- Repositório: https://github.com/caiojeremiasclimba/lista-de-tarefas

## O que o app faz

- Login com e-mail/senha ou Google, recuperação de senha e opção "Lembrar-me"
- Tarefas com status, data prevista, busca, anexos e subtarefas
- Categorias com filtros na sidebar
- Dashboard com indicadores de produtividade
- Perfil com nome, avatar e troca de senha

## Rodar localmente

Pré-requisitos: Node.js 20+, npm e um projeto no Supabase.

```bash
git clone https://github.com/caiojeremiasclimba/lista-de-tarefas.git
cd lista-de-tarefas
npm install
cp .env.example .env
```

No Windows (PowerShell): `Copy-Item .env.example .env`

Preencha o `.env` com as credenciais do Supabase (Dashboard → Project Settings → API):

```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
```

Não commite o arquivo `.env`.

```bash
npm run dev
```

Outros comandos: `npm run build` (build de produção), `npm run preview` (preview local), `npm run lint`, `npm run format` e `npm run test:run`.

## Deploy

Produção: https://lista-de-tarefas-taupe-six.vercel.app/

Na Vercel, configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

No Supabase (Authentication → URL Configuration), cadastre:

- Site URL: `https://lista-de-tarefas-taupe-six.vercel.app`
- Redirect URLs: `http://localhost:5173` e `https://lista-de-tarefas-taupe-six.vercel.app`

## Supabase

O schema do banco está versionado em `supabase/migrations/`. A migration inicial cria:

- Tabelas `categorias`, `tarefas` e `subtarefas`
- RLS para que cada usuário acesse apenas os próprios dados
- Buckets `task-attachments` (privado) e `avatars` (público) com políticas de Storage

### Projeto Supabase novo

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Aplique a migration:
   - **SQL Editor:** copie e execute o conteúdo de `supabase/migrations/20260702120000_initial_schema.sql`
   - **CLI (opcional):** instale o [Supabase CLI](https://supabase.com/docs/guides/cli), execute `supabase link` e depois `supabase db push`
3. Habilite autenticação por e-mail. Google OAuth é opcional.

### Projeto já existente (ex.: produção)

Se as tabelas e buckets já foram criados manualmente, **não reaplique** a migration inteira. Use o arquivo SQL como referência do schema esperado e aplique apenas o que estiver faltando.

### Storage

- `task-attachments` — anexos das tarefas (privado, até 5 MB, JPEG/PNG/WebP/PDF)
- `avatars` — fotos de perfil (público, até 2 MB, JPEG/PNG/WebP)

Caminhos usados pelo app:

- Anexos: `{user_id}/{tarefa_id}/{uuid}.{ext}`
- Avatar: `{user_id}/avatar.{ext}`

## Estrutura

```
src/
├── components/   UI
├── hooks/        estado e orquestração
├── services/     integração com Supabase
├── utils/        filtros, validação, estatísticas
├── types/        tipos TypeScript
├── constants/    status das tarefas
└── lib/          cliente Supabase e auth

supabase/
└── migrations/   schema SQL versionado (tabelas, RLS, Storage)
```

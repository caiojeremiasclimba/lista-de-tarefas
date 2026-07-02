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

Outros comandos: `npm run build` (build de produção) e `npm run preview` (preview local).

## Deploy

Produção: https://lista-de-tarefas-taupe-six.vercel.app/

Na Vercel, configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

No Supabase (Authentication → URL Configuration), cadastre:

- Site URL: `https://lista-de-tarefas-taupe-six.vercel.app`
- Redirect URLs: `http://localhost:5173` e `https://lista-de-tarefas-taupe-six.vercel.app`

## Supabase

O backend precisa das tabelas `categorias`, `tarefas` e `subtarefas`, com RLS habilitado para que cada usuário acesse apenas os próprios dados.

Buckets de Storage:

- `task-attachments` — anexos das tarefas (privado)
- `avatars` — fotos de perfil (público)

Habilite autenticação por e-mail. Google OAuth é opcional.

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
```

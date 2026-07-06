# Lista de Tarefas

Aplicação web para organizar tarefas com autenticação, categorias, prioridade, recorrência, subtarefas, anexos e dashboard de produtividade.

Stack: React 19, Vite 8, TypeScript, Tailwind CSS 4 e Supabase.

- Demo: https://lista-de-tarefas-taupe-six.vercel.app/
- Repositório: https://github.com/caiojeremiasclimba/lista-de-tarefas

## O que o app faz

- Login com e-mail/senha ou Google, recuperação de senha e opção "Lembrar-me"
- Tarefas com status, prioridade, data prevista, busca, anexos e subtarefas
- Ordenação da lista (inteligente, data prevista, prioridade, mais recentes ou título)
- Recorrência (diária, semanal ou mensal) — ao concluir, cria automaticamente a próxima ocorrência
- Categorias com cores personalizáveis e filtros na sidebar (por status, categoria e prioridade)
- Filtro "Vence hoje" e "Vencidas" na visão geral
- Dashboard com indicadores de produtividade
- Perfil com nome, avatar e troca de senha
- Sincronização em tempo real entre abas (Supabase Realtime)

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

## Scripts

| Comando                 | Descrição                                  |
| ----------------------- | ------------------------------------------ |
| `npm run dev`           | Servidor de desenvolvimento (Vite)         |
| `npm run build`         | Build de produção                          |
| `npm run preview`       | Preview local do build                     |
| `npm run lint`          | ESLint                                     |
| `npm run lint:fix`      | ESLint com correção automática             |
| `npm run format`        | Prettier (formata arquivos)                |
| `npm run format:check`  | Verifica formatação sem alterar arquivos   |
| `npm run test`          | Vitest em modo watch                       |
| `npm run test:run`      | Testes unitários/integração (uma execução) |
| `npm run test:coverage` | Testes com relatório de cobertura          |
| `npm run test:e2e`      | Testes E2E com Playwright                  |
| `npm run test:e2e:ui`   | Playwright com interface visual            |

## Testes

### Unitários e integração (Vitest)

```bash
npm run test:run
```

Cobertura de código:

```bash
npm run test:coverage
```

O relatório é gerado em `coverage/`.

### E2E (Playwright)

Os testes E2E mockam o Supabase no navegador — não é necessário `.env` real nem banco configurado. Na primeira execução, instale os browsers:

```bash
npx playwright install chromium
npm run test:e2e
```

Para depurar com a UI do Playwright:

```bash
npm run test:e2e:ui
```

### CI

Em pull requests e pushes na `main`, o GitHub Actions (`.github/workflows/ci.yml`) executa lint, `format:check`, testes unitários, build e E2E.

## Deploy

Produção: https://lista-de-tarefas-taupe-six.vercel.app/

Na Vercel, configure as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

No Supabase (Authentication → URL Configuration), cadastre:

- Site URL: `https://lista-de-tarefas-taupe-six.vercel.app`
- Redirect URLs: `http://localhost:5173` e `https://lista-de-tarefas-taupe-six.vercel.app`

## Supabase

O schema do banco está versionado em `supabase/migrations/`:

| Migration                                    | Conteúdo                                                                                                         |
| -------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `20260702120000_initial_schema.sql`          | Tabelas, RLS e buckets de Storage                                                                                |
| `20260702130000_delete_categoria_atomic.sql` | RPC `delete_categoria_com_tarefas` (exclusão atômica de categoria)                                               |
| `20260702140000_enable_realtime.sql`         | Realtime nas tabelas `categorias`, `tarefas` e `subtarefas`                                                      |
| `20260703100000_add_prioridade.sql`          | Coluna `prioridade` (`baixa`, `media`, `alta`) na tabela `tarefas`                                               |
| `20260703110000_add_recorrencia.sql`         | Colunas de recorrência (`recorrencia_tipo`, `recorrencia_intervalo`, `recorrencia_fim`, `recorrencia_origem_id`) |
| `20260706120000_add_cor_categoria.sql`       | Coluna `cor` na tabela `categorias` (paleta fixa de cores)                                                       |

A migration inicial cria:

- Tabelas `categorias`, `tarefas` e `subtarefas`
- RLS para que cada usuário acesse apenas os próprios dados
- Buckets `task-attachments` (privado) e `avatars` (público) com políticas de Storage

`20260702130000_delete_categoria_atomic.sql` adiciona a função usada pelo app para excluir categorias: desvincula as tarefas e remove a categoria numa única transação.

`20260703100000_add_prioridade.sql` adiciona prioridade às tarefas, com default `media` para registros existentes.

`20260703110000_add_recorrencia.sql` adiciona suporte a tarefas recorrentes (`nenhuma`, `diaria`, `semanal`, `mensal`), intervalo, data limite e referência à ocorrência de origem.

`20260706120000_add_cor_categoria.sql` adiciona a coluna `cor` em `categorias` para personalizar a cor dos badges nas tarefas.

### Projeto Supabase novo

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Aplique as migrations **na ordem**:
   - **SQL Editor:** execute o conteúdo de cada arquivo em `supabase/migrations/`
   - **CLI (opcional):** instale o [Supabase CLI](https://supabase.com/docs/guides/cli), execute `supabase link` e depois `supabase db push`
3. Habilite autenticação por e-mail. Google OAuth é opcional.

### Projeto já existente (ex.: produção)

Se as tabelas e buckets já foram criados manualmente, **não reaplique** a migration inicial inteira. Use os arquivos SQL como referência e aplique apenas o que estiver faltando.

Exemplos de migrations incrementais (aplique somente as que ainda não foram aplicadas):

| Se faltar no banco…            | Arquivo a aplicar                            |
| ------------------------------ | -------------------------------------------- |
| Exclusão atômica de categorias | `20260702130000_delete_categoria_atomic.sql` |
| Realtime entre abas            | `20260702140000_enable_realtime.sql`         |
| Prioridade nas tarefas         | `20260703100000_add_prioridade.sql`          |
| Recorrência nas tarefas        | `20260703110000_add_recorrencia.sql`         |
| Cor nas categorias             | `20260706120000_add_cor_categoria.sql`       |

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
├── constants/    status, prioridade e recorrência das tarefas
├── lib/          cliente Supabase e auth
└── test/         fixtures e mocks para testes

e2e/              testes Playwright (auth, tarefas, filtros, categorias, subtarefas, mobile)

supabase/
└── migrations/   schema SQL versionado (tabelas, RLS, Storage, RPCs)
```

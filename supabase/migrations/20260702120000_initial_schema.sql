-- Schema inicial do app Lista de Tarefas.
-- Projeto novo: aplique via SQL Editor do Supabase ou `supabase db push` (com CLI linkado).
-- Projeto já existente em produção: use como referência; não reaplique se as tabelas já existirem.

-- ---------------------------------------------------------------------------
-- Tabelas
-- ---------------------------------------------------------------------------

create table if not exists public.categorias (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nome text not null check (char_length(trim(nome)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists categorias_user_id_idx on public.categorias (user_id);

create table if not exists public.tarefas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null check (char_length(trim(titulo)) > 0),
  descricao text,
  data_prevista date,
  status text not null default 'pendente' check (
    status in ('pendente', 'em_andamento', 'concluida', 'cancelada')
  ),
  categoria_id uuid references public.categorias (id) on delete set null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  anexo_path text,
  anexo_nome text,
  anexo_mime text
);

create index if not exists tarefas_user_id_idx on public.tarefas (user_id);
create index if not exists tarefas_categoria_id_idx on public.tarefas (categoria_id);
create index if not exists tarefas_user_id_created_at_idx on public.tarefas (user_id, created_at desc);

create table if not exists public.subtarefas (
  id uuid primary key default gen_random_uuid(),
  tarefa_id uuid not null references public.tarefas (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  titulo text not null check (char_length(trim(titulo)) > 0),
  concluida boolean not null default false,
  ordem integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists subtarefas_tarefa_id_idx on public.subtarefas (tarefa_id);
create index if not exists subtarefas_user_id_idx on public.subtarefas (user_id);
create index if not exists subtarefas_tarefa_id_ordem_idx on public.subtarefas (tarefa_id, ordem);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.categorias enable row level security;
alter table public.tarefas enable row level security;
alter table public.subtarefas enable row level security;

-- categorias
drop policy if exists "categorias_select_own" on public.categorias;
create policy "categorias_select_own"
  on public.categorias
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "categorias_insert_own" on public.categorias;
create policy "categorias_insert_own"
  on public.categorias
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "categorias_update_own" on public.categorias;
create policy "categorias_update_own"
  on public.categorias
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "categorias_delete_own" on public.categorias;
create policy "categorias_delete_own"
  on public.categorias
  for delete
  to authenticated
  using (user_id = auth.uid());

-- tarefas
drop policy if exists "tarefas_select_own" on public.tarefas;
create policy "tarefas_select_own"
  on public.tarefas
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "tarefas_insert_own" on public.tarefas;
create policy "tarefas_insert_own"
  on public.tarefas
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and (
      categoria_id is null
      or exists (
        select 1
        from public.categorias c
        where c.id = categoria_id
          and c.user_id = auth.uid()
      )
    )
  );

drop policy if exists "tarefas_update_own" on public.tarefas;
create policy "tarefas_update_own"
  on public.tarefas
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and (
      categoria_id is null
      or exists (
        select 1
        from public.categorias c
        where c.id = categoria_id
          and c.user_id = auth.uid()
      )
    )
  );

drop policy if exists "tarefas_delete_own" on public.tarefas;
create policy "tarefas_delete_own"
  on public.tarefas
  for delete
  to authenticated
  using (user_id = auth.uid());

-- subtarefas
drop policy if exists "subtarefas_select_own" on public.subtarefas;
create policy "subtarefas_select_own"
  on public.subtarefas
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "subtarefas_insert_own" on public.subtarefas;
create policy "subtarefas_insert_own"
  on public.subtarefas
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.tarefas t
      where t.id = tarefa_id
        and t.user_id = auth.uid()
    )
  );

drop policy if exists "subtarefas_update_own" on public.subtarefas;
create policy "subtarefas_update_own"
  on public.subtarefas
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (
    user_id = auth.uid()
    and exists (
      select 1
      from public.tarefas t
      where t.id = tarefa_id
        and t.user_id = auth.uid()
    )
  );

drop policy if exists "subtarefas_delete_own" on public.subtarefas;
create policy "subtarefas_delete_own"
  on public.subtarefas
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Storage
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'task-attachments',
  'task-attachments',
  false,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- task-attachments: caminho {user_id}/{tarefa_id}/{arquivo}
drop policy if exists "task_attachments_select_own" on storage.objects;
create policy "task_attachments_select_own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "task_attachments_insert_own" on storage.objects;
create policy "task_attachments_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "task_attachments_update_own" on storage.objects;
create policy "task_attachments_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "task_attachments_delete_own" on storage.objects;
create policy "task_attachments_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'task-attachments'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- avatars: caminho {user_id}/avatar.{ext}
drop policy if exists "avatars_select_public" on storage.objects;
create policy "avatars_select_public"
  on storage.objects
  for select
  to public
  using (bucket_id = 'avatars');

drop policy if exists "avatars_insert_own" on storage.objects;
create policy "avatars_insert_own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_update_own" on storage.objects;
create policy "avatars_update_own"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "avatars_delete_own" on storage.objects;
create policy "avatars_delete_own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Lembretes por e-mail: campos na tarefa, preferências do usuário e log de envios.

alter table public.tarefas
  add column if not exists lembrete_email boolean not null default false,
  add column if not exists lembrete_tipo text not null default 'no_dia' check (
    lembrete_tipo in ('no_dia', 'um_dia_antes', 'ambos')
  );

create table if not exists public.preferencias_lembrete (
  user_id uuid primary key references auth.users (id) on delete cascade,
  horario_local time not null default '08:00',
  timezone text not null default 'America/Sao_Paulo',
  updated_at timestamptz not null default now()
);

alter table public.preferencias_lembrete enable row level security;

drop policy if exists "preferencias_lembrete_select_own" on public.preferencias_lembrete;
create policy "preferencias_lembrete_select_own"
  on public.preferencias_lembrete
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "preferencias_lembrete_insert_own" on public.preferencias_lembrete;
create policy "preferencias_lembrete_insert_own"
  on public.preferencias_lembrete
  for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "preferencias_lembrete_update_own" on public.preferencias_lembrete;
create policy "preferencias_lembrete_update_own"
  on public.preferencias_lembrete
  for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create table if not exists public.lembretes_enviados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  tarefa_id uuid not null references public.tarefas (id) on delete cascade,
  tipo text not null check (tipo in ('no_dia', 'um_dia_antes', 'vencida')),
  data_referencia date not null,
  enviado_em timestamptz not null default now(),
  unique (tarefa_id, tipo, data_referencia)
);

create index if not exists lembretes_enviados_user_id_idx on public.lembretes_enviados (user_id);

alter table public.lembretes_enviados enable row level security;

drop policy if exists "lembretes_enviados_select_own" on public.lembretes_enviados;
create policy "lembretes_enviados_select_own"
  on public.lembretes_enviados
  for select
  to authenticated
  using (user_id = auth.uid());

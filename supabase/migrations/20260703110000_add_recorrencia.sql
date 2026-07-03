-- Recorrencia das tarefas: nenhuma, diaria, semanal ou mensal.

alter table public.tarefas
  add column if not exists recorrencia_tipo text not null default 'nenhuma'
  check (recorrencia_tipo in ('nenhuma', 'diaria', 'semanal', 'mensal'));

alter table public.tarefas
  add column if not exists recorrencia_intervalo integer not null default 1
  check (recorrencia_intervalo >= 1);

alter table public.tarefas
  add column if not exists recorrencia_fim date;

alter table public.tarefas
  add column if not exists recorrencia_origem_id uuid references public.tarefas (id) on delete set null;

create index if not exists tarefas_user_id_recorrencia_tipo_idx
  on public.tarefas (user_id, recorrencia_tipo);

create index if not exists tarefas_recorrencia_origem_id_idx
  on public.tarefas (recorrencia_origem_id);

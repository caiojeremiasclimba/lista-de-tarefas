-- Prioridade das tarefas: baixa, media ou alta (default media para registros existentes).

alter table public.tarefas
  add column if not exists prioridade text not null default 'media'
  check (prioridade in ('baixa', 'media', 'alta'));

create index if not exists tarefas_user_id_prioridade_idx
  on public.tarefas (user_id, prioridade);

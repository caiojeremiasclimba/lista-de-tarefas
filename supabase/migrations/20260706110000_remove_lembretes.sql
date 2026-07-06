-- Remove lembretes por e-mail (tabelas e colunas).

drop table if exists public.lembretes_enviados;

drop table if exists public.preferencias_lembrete;

alter table public.tarefas
  drop column if exists lembrete_email,
  drop column if exists lembrete_tipo;

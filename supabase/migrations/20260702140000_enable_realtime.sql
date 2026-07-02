-- Habilita Realtime nas tabelas do app (sincronização entre abas/dispositivos).
-- Projeto já existente: aplique somente este arquivo no SQL Editor se as tabelas já existirem.

do $migration$
begin
  alter publication supabase_realtime add table public.categorias;
exception
  when duplicate_object then null;
end $migration$;

do $migration$
begin
  alter publication supabase_realtime add table public.tarefas;
exception
  when duplicate_object then null;
end $migration$;

do $migration$
begin
  alter publication supabase_realtime add table public.subtarefas;
exception
  when duplicate_object then null;
end $migration$;

alter table public.subtarefas replica identity full;

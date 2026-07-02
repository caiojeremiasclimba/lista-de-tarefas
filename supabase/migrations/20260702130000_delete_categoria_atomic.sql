-- Exclusão atômica de categoria: desvincula tarefas e remove a categoria numa transação.

create or replace function public.delete_categoria_com_tarefas(p_categoria_id uuid)
returns void
language plpgsql
security invoker
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Usuário não autenticado';
  end if;

  if not exists (
    select 1
    from public.categorias
    where id = p_categoria_id
      and user_id = auth.uid()
  ) then
    raise exception 'Categoria não encontrada';
  end if;

  update public.tarefas
  set categoria_id = null
  where categoria_id = p_categoria_id
    and user_id = auth.uid();

  delete from public.categorias
  where id = p_categoria_id
    and user_id = auth.uid();
end;
$$;

grant execute on function public.delete_categoria_com_tarefas(uuid) to authenticated;

import { supabase } from '../lib/supabase'
import type { Categoria } from '../types/categoria'

export async function fetchCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase.from('categorias').select('*').order('nome')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createCategoria(nome: string): Promise<Categoria> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { data: created, error: insertError } = await supabase
    .from('categorias')
    .insert({ nome, user_id: user.id })
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)
  if (!created) throw new Error('Categoria criada, mas não foi possível carregá-la.')

  return created
}

export async function updateCategoria(id: string, nome: string): Promise<Categoria> {
  const { data: updated, error: updateError } = await supabase
    .from('categorias')
    .update({ nome })
    .eq('id', id)
    .select()
    .single()

  if (updateError) throw new Error(updateError.message)
  if (!updated) throw new Error('Categoria atualizada, mas não foi possível carregá-la.')

  return updated
}

export async function deleteCategoria(id: string): Promise<void> {
  const { error: deleteError } = await supabase.from('categorias').delete().eq('id', id)

  if (deleteError) throw new Error(deleteError.message)
}

export async function unlinkTodosFromCategoria(categoriaId: string): Promise<void> {
  const { error } = await supabase
    .from('tarefas')
    .update({ categoria_id: null })
    .eq('categoria_id', categoriaId)

  if (error) throw new Error(error.message)
}

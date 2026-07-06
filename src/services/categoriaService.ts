import { DEFAULT_CATEGORIA_COR } from '../constants/categoriaCor'
import { supabase } from '../lib/supabase'
import type { Categoria, CategoriaFormData } from '../types/categoria'

export async function fetchCategorias(): Promise<Categoria[]> {
  const { data, error } = await supabase.from('categorias').select('*').order('nome')

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createCategoria({
  nome,
  cor = DEFAULT_CATEGORIA_COR,
}: CategoriaFormData): Promise<Categoria> {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const nomeNormalizado = nome.trim()
  if (!nomeNormalizado) throw new Error('Informe o nome da categoria.')

  const { data: created, error: insertError } = await supabase
    .from('categorias')
    .insert({ nome: nomeNormalizado, cor, user_id: user.id })
    .select()
    .single()

  if (insertError) throw new Error(insertError.message)
  if (!created) throw new Error('Categoria criada, mas não foi possível carregá-la.')

  return created
}

export async function updateCategoria(
  id: string,
  { nome, cor }: CategoriaFormData
): Promise<Categoria> {
  const nomeNormalizado = nome.trim()
  if (!nomeNormalizado) throw new Error('Informe o nome da categoria.')

  const { data: updated, error: updateError } = await supabase
    .from('categorias')
    .update({ nome: nomeNormalizado, cor })
    .eq('id', id)
    .select()
    .single()

  if (updateError) throw new Error(updateError.message)
  if (!updated) throw new Error('Categoria atualizada, mas não foi possível carregá-la.')

  return updated
}

/** Desvincula tarefas e exclui a categoria numa única transação no banco (RPC). */
export async function deleteCategoriaComTarefas(categoriaId: string): Promise<void> {
  const { error } = await supabase.rpc('delete_categoria_com_tarefas', {
    p_categoria_id: categoriaId,
  })

  if (error) throw new Error(error.message)
}

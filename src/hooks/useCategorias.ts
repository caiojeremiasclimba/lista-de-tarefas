import { useCallback, useEffect, useState } from 'react'
import type { Categoria } from '../types/categoria'
import type { Todo } from '../types/todo'
import {
  createCategoria,
  deleteCategoria,
  fetchCategorias,
  unlinkTodosFromCategoria,
  updateCategoria,
} from '../services/categoriaService'

interface UseCategoriasOptions {
  todos: Todo[]
  onError: (message: string | null) => void
  unlinkCategoriaFromTodos: (categoriaId: string) => void
  filtroCategoria: string | null
  setFiltroCategoria: (id: string | null) => void
  reloadTodos?: () => Promise<void>
}

export function useCategorias({
  todos,
  onError,
  unlinkCategoriaFromTodos,
  filtroCategoria,
  setFiltroCategoria,
  reloadTodos,
}: UseCategoriasOptions) {
  const [categorias, setCategorias] = useState<Categoria[]>([])

  const loadCategorias = useCallback(async () => {
    try {
      const data = await fetchCategorias()
      setCategorias(data)
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Erro ao carregar categorias.')
    }
  }, [onError])

  useEffect(() => {
    void loadCategorias()
  }, [loadCategorias])

  const handleCreateCategoria = useCallback(
    async (nome: string) => {
      const created = await createCategoria(nome)
      setCategorias((prev) => [...prev, created].sort((a, b) => a.nome.localeCompare(b.nome)))
      setFiltroCategoria(created.id)
      return created
    },
    [setFiltroCategoria]
  )

  const handleUpdateCategoria = useCallback(async (id: string, nome: string) => {
    const updated = await updateCategoria(id, nome)
    setCategorias((prev) =>
      prev.map((c) => (c.id === id ? updated : c)).sort((a, b) => a.nome.localeCompare(b.nome))
    )
    return updated
  }, [])

  const handleDeleteCategoria = useCallback(
    async (id: string) => {
      const qtd = todos.filter((t) => t.categoria_id === id).length

      const mensagem =
        qtd > 0
          ? `Excluir esta categoria? ${qtd} tarefa(s) ficarão sem categoria.`
          : 'Deseja excluir esta categoria?'

      if (!window.confirm(mensagem)) return

      try {
        if (qtd > 0) {
          await unlinkTodosFromCategoria(id)
        }

        await deleteCategoria(id)

        setCategorias((prev) => prev.filter((c) => c.id !== id))
        if (filtroCategoria === id) setFiltroCategoria(null)
        unlinkCategoriaFromTodos(id)
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Erro ao excluir categoria.')
        await loadCategorias()
        await reloadTodos?.()
      }
    },
    [
      todos,
      filtroCategoria,
      setFiltroCategoria,
      unlinkCategoriaFromTodos,
      onError,
      reloadTodos,
      loadCategorias,
    ]
  )

  return {
    categorias,
    handleCreateCategoria,
    handleUpdateCategoria,
    handleDeleteCategoria,
  }
}

import { useCallback, useEffect, useState } from 'react'
import { toast } from '../lib/toast'
import type { Categoria } from '../types/categoria'
import {
  createCategoria,
  deleteCategoriaComTarefas,
  fetchCategorias,
  updateCategoria,
} from '../services/categoriaService'

interface UseCategoriasOptions {
  unlinkCategoriaFromTodos: (categoriaId: string) => void
  filtroCategoria: string | null
  setFiltroCategoria: (id: string | null) => void
  reloadTodos?: () => Promise<void>
}

export function useCategorias({
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
      toast.error(err instanceof Error ? err.message : 'Erro ao carregar categorias.')
    }
  }, [])

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

  const executeDeleteCategoria = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteCategoriaComTarefas(id)

        setCategorias((prev) => prev.filter((c) => c.id !== id))
        if (filtroCategoria === id) setFiltroCategoria(null)
        unlinkCategoriaFromTodos(id)
        return true
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Erro ao excluir categoria.')
        await loadCategorias()
        await reloadTodos?.()
        return false
      }
    },
    [filtroCategoria, setFiltroCategoria, unlinkCategoriaFromTodos, reloadTodos, loadCategorias]
  )

  return {
    categorias,
    handleCreateCategoria,
    handleUpdateCategoria,
    executeDeleteCategoria,
  }
}

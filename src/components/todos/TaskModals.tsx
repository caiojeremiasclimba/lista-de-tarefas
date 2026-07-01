import type { Categoria } from '../../types/categoria'
import type { Todo, TodoFormData } from '../../types/todo'
import CategoriaForm from '../CategoriaForm'
import TodoForm from '../TodoForm'

interface TaskModalsProps {
  showForm: boolean
  showCategoriaForm: boolean
  editingTodo: Todo | null
  editingCategoria: Categoria | null
  newTaskCategoriaId: string | null
  categorias: Categoria[]
  onCloseForm: () => void
  onCloseCategoriaForm: () => void
  onSubmitTodo: (data: TodoFormData) => Promise<void>
  onSubmitCategoria: (nome: string) => Promise<void>
}

export default function TaskModals({
  showForm,
  showCategoriaForm,
  editingTodo,
  editingCategoria,
  newTaskCategoriaId,
  categorias,
  onCloseForm,
  onCloseCategoriaForm,
  onSubmitTodo,
  onSubmitCategoria,
}: TaskModalsProps) {
  return (
    <>
      {showCategoriaForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center md:inset-y-0 md:left-56 md:right-0"
          onClick={onCloseCategoriaForm}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <CategoriaForm
              editingCategoria={editingCategoria}
              onSubmit={onSubmitCategoria}
              onClose={onCloseCategoriaForm}
            />
          </div>
        </div>
      )}

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center md:inset-y-0 md:left-56 md:right-0"
          onClick={onCloseForm}
        >
          <div
            className="w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <TodoForm
              editingTodo={editingTodo}
              categorias={categorias}
              defaultCategoriaId={newTaskCategoriaId}
              onSubmit={onSubmitTodo}
              onClose={onCloseForm}
            />
          </div>
        </div>
      )}
    </>
  )
}

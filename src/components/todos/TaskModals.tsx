import type { Categoria, CategoriaFormData } from '../../types/categoria'
import type { Todo, TodoFormData } from '../../types/todo'
import CategoriaForm from '../CategoriaForm'
import Modal from '../Modal'
import TodoForm from '../TodoForm'

const TODO_FORM_TITLE_ID = 'todo-form-title'
const CATEGORIA_FORM_TITLE_ID = 'categoria-form-title'

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
  onSubmitCategoria: (data: CategoriaFormData) => Promise<void>
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
      <Modal
        open={showCategoriaForm}
        onClose={onCloseCategoriaForm}
        ariaLabelledBy={CATEGORIA_FORM_TITLE_ID}
        panelClassName="w-full max-w-sm"
      >
        <CategoriaForm
          editingCategoria={editingCategoria}
          titleId={CATEGORIA_FORM_TITLE_ID}
          onSubmit={onSubmitCategoria}
          onClose={onCloseCategoriaForm}
        />
      </Modal>

      <Modal
        open={showForm}
        onClose={onCloseForm}
        ariaLabelledBy={TODO_FORM_TITLE_ID}
        panelClassName="w-full max-w-lg max-h-[calc(100dvh-2rem)] overflow-y-auto overscroll-contain"
      >
        <TodoForm
          editingTodo={editingTodo}
          categorias={categorias}
          defaultCategoriaId={newTaskCategoriaId}
          titleId={TODO_FORM_TITLE_ID}
          onSubmit={onSubmitTodo}
          onClose={onCloseForm}
        />
      </Modal>
    </>
  )
}

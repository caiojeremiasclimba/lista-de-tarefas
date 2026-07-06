import type { TodoStatus } from '../types/todo'
import { TODO_STATUS_CONFIG } from '../constants/todoStatus'
import type { Todo } from '../types/todo'
import type { Subtarefa } from '../types/subtarefa'
import TodoItem from './TodoItem'
import { CheckCircleIcon, ChevronIcon, ClockIcon, PlayCircleIcon, XCircleIcon, CalendarIcon } from './TodosUi'

interface TaskSectionProps {
  title: string
  variant: TodoStatus | 'vencidas' | 'vence_hoje'
  todos: Todo[]
  isOpen: boolean
  onToggle: () => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onToggleStatus: (todo: Todo) => void
  onToggleSubtarefa: (sub: Subtarefa) => void
  categoriasPorId: Record<string, string>
}

const SECTION_ICONS = {
  pendente: ClockIcon,
  em_andamento: PlayCircleIcon,
  concluida: CheckCircleIcon,
  cancelada: XCircleIcon,
  vencidas: ClockIcon,
  vence_hoje: CalendarIcon,
} as const

export default function TaskSection({
  title,
  variant,
  todos,
  isOpen,
  onToggle,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleSubtarefa,
  categoriasPorId,
}: TaskSectionProps) {
  const Icon = SECTION_ICONS[variant]
  const headerColor =
    variant === 'vencidas'
      ? 'text-red-600'
      : variant === 'vence_hoje'
        ? 'text-amber-600'
        : TODO_STATUS_CONFIG[variant as TodoStatus].headerClass

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center gap-2.5 text-left text-base font-bold tracking-wide ${headerColor}`}
      >
        <Icon className="h-4 w-4" />
        <span>{title}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500">
          {todos.length}
        </span>
        <span className="ml-auto">
          <ChevronIcon up={isOpen} className="h-4 w-4 text-slate-400" />
        </span>
      </button>

      {isOpen && (
        <ul className="space-y-3">
          {todos.length === 0 ? (
            <li className="rounded-2xl border border-dashed border-slate-200 py-8 text-center text-sm text-slate-400">
              Nenhuma tarefa nesta seção.
            </li>
          ) : (
            todos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                categoriaNome={todo.categoria_id ? categoriasPorId[todo.categoria_id] : undefined}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                onToggleSubtarefa={onToggleSubtarefa}
              />
            ))
          )}
        </ul>
      )}
    </section>
  )
}

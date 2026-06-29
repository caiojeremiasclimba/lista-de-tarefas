import { useEffect, useRef, useState } from 'react'
import { TODO_STATUS_CONFIG } from '../constants/todoStatus'
import type { Todo } from '../types/todo'
import { formatTodoDate } from '../utils/formatTodoDate'
import { isTodoOverdue } from '../utils/todoDue'
import { CalendarIcon, DotsVerticalIcon } from './TodosUi'

interface TodoItemProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onToggleStatus: (todo: Todo) => void
}

export default function TodoItem({ todo, onEdit, onDelete, onToggleStatus }: TodoItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const isConcluida = todo.status === 'concluida'
  const isCancelada = todo.status === 'cancelada'
  const overdue = isTodoOverdue(todo)
  const dateLabel = formatTodoDate(todo.data_prevista)
  const statusConfig = TODO_STATUS_CONFIG[todo.status]

  useEffect(() => {
    if (!menuOpen) return

    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  function handleEdit() {
    setMenuOpen(false)
    onEdit(todo)
  }

  function handleDelete() {
    setMenuOpen(false)
    if (window.confirm('Deseja excluir esta tarefa?')) {
      onDelete(todo.id)
    }
  }

  return (
    <li
      className={`min-w-0 rounded-2xl border bg-white px-3 py-3 shadow-sm sm:px-5 sm:py-4 ${
        overdue ? 'border-red-300 bg-red-50/50' : 'border-slate-200'
      }`}
    >
      <div className="flex min-w-0 items-start gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => !isCancelada && onToggleStatus(todo)}
          disabled={isCancelada}
          aria-label={isConcluida ? 'Marcar como pendente' : 'Marcar como concluída'}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors ${
            isCancelada
              ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-50'
              : isConcluida
                ? 'border-green-500 bg-green-500 text-white'
                : 'border-slate-300 bg-white hover:border-blue-400'
          }`}
        >
          {isConcluida && (
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1 text-left">
          <h3
            className={`truncate text-sm font-medium sm:text-base ${
              isConcluida
                ? 'line-through text-slate-400'
                : isCancelada
                  ? 'text-slate-400'
                  : 'text-slate-800'
            }`}
          >
            {todo.titulo}
          </h3>

          <div className="mt-1 flex flex-wrap gap-1">
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-xs ${statusConfig.badgeClass}`}
            >
              {statusConfig.label}
            </span>
            {overdue && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 sm:px-2 sm:text-xs">
                Vencida
              </span>
            )}
          </div>

          {dateLabel && (
            <p
              className={`mt-1.5 flex min-w-0 items-center gap-1 text-xs sm:gap-1.5 sm:text-sm ${
                overdue ? 'font-medium text-red-600' : 'text-slate-500'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="truncate">
                {overdue ? `Vencida · ${dateLabel}` : dateLabel}
              </span>
            </p>
          )}
        </div>

        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Ações da tarefa"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <DotsVerticalIcon />
          </button>

          {menuOpen && (
            <div className="absolute right-0 z-10 mt-1 w-36 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
              <button
                type="button"
                onClick={handleEdit}
                className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              >
                Editar
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Excluir
              </button>
            </div>
          )}
        </div>
      </div>
    </li>
  )
}

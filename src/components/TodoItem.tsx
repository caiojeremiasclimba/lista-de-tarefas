import { useEffect, useRef, useState } from 'react'
import type { Todo } from '../types/todo'
import { formatTodoDate } from '../utils/formatTodoDate'
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
  const dateLabel = formatTodoDate(todo.data_prevista)

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
    <li className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={() => onToggleStatus(todo)}
          aria-label={isConcluida ? 'Marcar como pendente' : 'Marcar como concluída'}
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors ${
            isConcluida
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
            className={`text-base font-medium text-slate-800 ${
              isConcluida ? 'line-through text-slate-400' : ''
            }`}
          >
            {todo.titulo}
          </h3>

          {dateLabel && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm text-slate-500">
              <CalendarIcon className="h-4 w-4" />
              {dateLabel}
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

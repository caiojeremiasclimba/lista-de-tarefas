import { useEffect, useRef, useState } from 'react'
import { TODO_STATUS_CONFIG } from '../constants/todoStatus'
import { TODO_PRIORIDADE_CONFIG } from '../constants/todoPrioridade'
import { TODO_RECORRENCIA_CONFIG } from '../constants/todoRecorrencia'
import { getLembreteShortLabel } from '../utils/reminderEligibility'
import type { Subtarefa } from '../types/subtarefa'
import type { Todo } from '../types/todo'
import { useAttachmentSignedUrl } from '../hooks/useAttachmentSignedUrl'
import { formatTodoDate } from '../utils/formatTodoDate'
import { getSubtarefaProgress } from '../utils/subtarefaProgress'
import { isTodoDueToday, isTodoOverdue } from '../utils/todoDue'
import SubtarefaList from './SubtarefaList'
import { CalendarIcon, ChevronIcon, DocumentIcon, DotsVerticalIcon } from './TodosUi'

interface TodoItemProps {
  todo: Todo
  categoriaNome?: string
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onToggleStatus: (todo: Todo) => void
  onToggleSubtarefa: (sub: Subtarefa) => void
}

export default function TodoItem({
  todo,
  categoriaNome,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleSubtarefa,
}: TodoItemProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [checklistOpen, setChecklistOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const {
    url: anexoUrl,
    loading: anexoLoading,
    error: anexoError,
    retry: retryAnexo,
    openInNewTab: openAnexoInNewTab,
  } = useAttachmentSignedUrl(todo.anexo_path)
  const isConcluida = todo.status === 'concluida'
  const isEmAndamento = todo.status === 'em_andamento'
  const isCancelada = todo.status === 'cancelada'
  const overdue = isTodoOverdue(todo)
  const dueToday = isTodoDueToday(todo)
  const dateLabel = formatTodoDate(todo.data_prevista)
  const statusConfig = TODO_STATUS_CONFIG[todo.status]
  const prioridadeConfig = TODO_PRIORIDADE_CONFIG[todo.prioridade]
  const recorrente = todo.recorrencia_tipo !== 'nenhuma'
  const recorrenciaLabel = TODO_RECORRENCIA_CONFIG[todo.recorrencia_tipo].label
  const temLembrete = todo.lembrete_email && Boolean(todo.data_prevista)
  const lembreteLabel = getLembreteShortLabel(todo.lembrete_tipo)
  const subtarefas = todo.subtarefas ?? []
  const { concluidas, total } = getSubtarefaProgress(subtarefas)
  const progressPercent = total > 0 ? Math.round((concluidas / total) * 100) : 0
  const isImageAnexo = todo.anexo_mime?.startsWith('image/') ?? false
  const descricao = todo.descricao?.trim()

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
    onDelete(todo.id)
  }

  return (
    <li
      className={`min-w-0 rounded-2xl border bg-white px-3 py-3 shadow-sm sm:px-5 sm:py-4 ${
        overdue
          ? 'border-red-300 bg-red-50/50'
          : dueToday
            ? 'border-amber-300 bg-amber-50/40'
            : 'border-slate-200'
      }`}
    >
      <div className="flex min-w-0 items-start gap-2 sm:gap-4">
        <button
          type="button"
          onClick={() => !isCancelada && onToggleStatus(todo)}
          disabled={isCancelada}
          aria-label={
            isConcluida
              ? 'Marcar como pendente'
              : isEmAndamento
                ? 'Marcar como concluída'
                : 'Marcar como em andamento'
          }
          className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded border-2 transition-colors ${
            isCancelada
              ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-50'
              : isConcluida
                ? 'border-green-500 bg-green-500 text-white'
                : isEmAndamento
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-slate-300 bg-white hover:border-blue-400'
          }`}
        >
          {isConcluida && (
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {isEmAndamento && (
            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
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

          {descricao && (
            <p
              className={`mt-0.5 line-clamp-2 text-xs sm:text-sm ${
                isConcluida
                  ? 'line-through text-slate-400'
                  : isCancelada
                    ? 'text-slate-400'
                    : 'text-slate-600'
              }`}
            >
              {descricao}
            </p>
          )}

          <div className="mt-1 flex flex-wrap gap-1">
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-xs ${statusConfig.badgeClass}`}
            >
              {statusConfig.label}
            </span>
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-medium sm:px-2 sm:text-xs ${prioridadeConfig.badgeClass}`}
            >
              {prioridadeConfig.label}
            </span>
            {recorrente && (
              <span className="rounded-full bg-cyan-100 px-1.5 py-0.5 text-[10px] font-medium text-cyan-700 sm:px-2 sm:text-xs">
                Recorrente · {recorrenciaLabel}
              </span>
            )}
            {temLembrete && (
              <span className="rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 sm:px-2 sm:text-xs">
                {lembreteLabel}
              </span>
            )}
            {categoriaNome && (
              <span className="rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 sm:px-2 sm:text-xs">
                {categoriaNome}
              </span>
            )}
            {overdue && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-medium text-red-700 sm:px-2 sm:text-xs">
                Vencida
              </span>
            )}
            {dueToday && (
              <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 sm:px-2 sm:text-xs">
                Vence hoje
              </span>
            )}
          </div>

          {total > 0 && (
            <div className="mt-2 space-y-1.5">
              <p className="text-xs text-slate-500">
                {concluidas} de {total} subtarefas concluídas
              </p>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {dateLabel && (
            <p
              className={`mt-1.5 flex min-w-0 items-center gap-1 text-xs sm:gap-1.5 sm:text-sm ${
                overdue
                  ? 'font-medium text-red-600'
                  : dueToday
                    ? 'font-medium text-amber-700'
                    : 'text-slate-500'
              }`}
            >
              <CalendarIcon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="truncate">
                {overdue
                  ? `Vencida · ${dateLabel}`
                  : dueToday
                    ? `Vence hoje · ${dateLabel}`
                    : dateLabel}
              </span>
            </p>
          )}

          {todo.anexo_path && (
            <div className="mt-2">
              {anexoLoading && <p className="text-xs text-slate-500">Carregando anexo...</p>}
              {anexoError && <p className="text-xs text-slate-500">Anexo indisponível</p>}
              {!anexoLoading && !anexoError && anexoUrl && isImageAnexo && (
                <button
                  type="button"
                  onClick={() => void openAnexoInNewTab()}
                  aria-label={`Abrir anexo ${todo.anexo_nome ?? 'da tarefa'} em nova aba`}
                  className="inline-block cursor-pointer"
                >
                  <img
                    src={anexoUrl}
                    alt={todo.anexo_nome ?? 'Anexo da tarefa'}
                    onError={retryAnexo}
                    className="max-h-24 rounded-lg border border-slate-200 object-contain"
                  />
                </button>
              )}
              {!anexoLoading && !anexoError && anexoUrl && !isImageAnexo && (
                <button
                  type="button"
                  onClick={() => void openAnexoInNewTab()}
                  className="inline-flex min-w-0 items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 sm:text-sm"
                >
                  <DocumentIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{todo.anexo_nome ?? 'Abrir PDF'}</span>
                </button>
              )}
            </div>
          )}

          {total > 0 && (
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setChecklistOpen((prev) => !prev)}
                className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-800"
              >
                <ChevronIcon up={checklistOpen} className="h-3.5 w-3.5" />
                Checklist
              </button>
              {checklistOpen && (
                <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
                  <SubtarefaList
                    mode="readonly"
                    subtarefas={subtarefas}
                    disabled={isCancelada}
                    onToggle={onToggleSubtarefa}
                  />
                </div>
              )}
            </div>
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

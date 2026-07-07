import { useMemo } from 'react'
import { TODO_PRIORIDADE_CONFIG, TODO_PRIORIDADES } from '../constants/todoPrioridade'
import { TODO_STATUSES, TODO_STATUS_CONFIG } from '../constants/todoStatus'
import type { Todo } from '../types/todo'
import { formatTodayHeader } from '../utils/formatTodoDate'
import {
  buildStatusChartData,
  calcConcluidasNaSemana,
  calcPercentConcluido,
  calcTotaisPorPrioridade,
  calcTotaisPorStatus,
  todosElegiveisParaConclusao,
  type StatusChartSlice,
} from '../utils/productivityStats'

interface ProductivityDashboardProps {
  todos: Todo[]
  loading?: boolean
}

const SIZE = 160
const STROKE = 28
const RADIUS = (SIZE - STROKE) / 2
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

function StatusDonutChart({ slices }: { slices: StatusChartSlice[] }) {
  const total = slices.reduce((sum, s) => sum + s.value, 0)

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div
          className="flex h-40 w-40 items-center justify-center rounded-full border-8 border-slate-100 dark:border-slate-700"
          aria-hidden
        >
          <span className="text-sm text-slate-400 dark:text-slate-500">Sem dados</span>
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">Nenhuma tarefa ainda</p>
      </div>
    )
  }

  let offset = 0

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-center">
      <div className="relative shrink-0">
        <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="-rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke="var(--app-chart-track)"
            strokeWidth={STROKE}
          />
          {slices.map((slice) => {
            if (slice.value === 0) return null
            const fraction = slice.value / total
            const dash = fraction * CIRCUMFERENCE
            const gap = CIRCUMFERENCE - dash
            const element = (
              <circle
                key={slice.status}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                fill="none"
                stroke={slice.color}
                strokeWidth={STROKE}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
              />
            )
            offset += dash
            return element
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-slate-800 dark:text-slate-100">{total}</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">tarefas</span>
        </div>
      </div>

      <ul className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-1">
        {slices.map((slice) => (
          <li key={slice.status} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
              aria-hidden
            />
            <span className="text-slate-600 dark:text-slate-300">{slice.label}</span>
            <span className="ml-auto font-medium text-slate-800 dark:text-slate-100">{slice.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function ProductivityDashboard({ todos, loading }: ProductivityDashboardProps) {
  const { subtitle } = formatTodayHeader()

  const percentConcluido = useMemo(() => calcPercentConcluido(todos), [todos])
  const totalElegivel = useMemo(() => todosElegiveisParaConclusao(todos).length, [todos])
  const totaisPorStatus = useMemo(() => calcTotaisPorStatus(todos), [todos])
  const totaisPorPrioridade = useMemo(() => calcTotaisPorPrioridade(todos), [todos])
  const concluidasNaSemana = useMemo(() => calcConcluidasNaSemana(todos), [todos])
  const chartData = useMemo(() => buildStatusChartData(todos), [todos])

  if (loading) {
    return <p className="text-center text-slate-500 dark:text-slate-400">Carregando indicadores...</p>
  }

  return (
    <div className="space-y-6">
      <header className="text-left">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 sm:text-3xl">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 sm:text-base">{subtitle}</p>
        <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
          Indicadores derivados das suas tarefas em tempo real — sem tabela separada.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            % concluído
          </p>
          <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">{percentConcluido}%</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {totaisPorStatus.concluida} de {totalElegivel} tarefas
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-green-500 transition-all"
              style={{ width: `${percentConcluido}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Por status</p>
          <ul className="mt-3 space-y-2">
            {TODO_STATUSES.map((status) => (
              <li key={status} className="flex items-center justify-between text-sm">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${TODO_STATUS_CONFIG[status].badgeClass}`}
                >
                  {TODO_STATUS_CONFIG[status].label}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">{totaisPorStatus[status]}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Por prioridade
          </p>
          <ul className="mt-3 space-y-2">
            {TODO_PRIORIDADES.map((prioridade) => (
              <li key={prioridade} className="flex items-center justify-between text-sm">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${TODO_PRIORIDADE_CONFIG[prioridade].badgeClass}`}
                >
                  {TODO_PRIORIDADE_CONFIG[prioridade].label}
                </span>
                <span className="font-semibold text-slate-800 dark:text-slate-100">
                  {totaisPorPrioridade[prioridade]}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700/60">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Concluídas na semana
          </p>
          <p className="mt-2 text-3xl font-bold text-blue-600 dark:text-blue-400">{concluidasNaSemana}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Marcadas como concluídas nesta semana</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 dark:bg-slate-800 dark:ring-slate-700/60">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
          Distribuição por status
        </h2>
        <div className="mt-6">
          <StatusDonutChart slices={chartData} />
        </div>
      </div>
    </div>
  )
}

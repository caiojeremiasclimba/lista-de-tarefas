import { TODO_STATUS_CONFIG } from '../../constants/todoStatus'
import type { FiltroTarefas } from '../FilterSidebar'
import type { Subtarefa } from '../../types/subtarefa'
import type { Todo, TodoStatus } from '../../types/todo'
import type { SecoesAbertas } from '../../utils/todoFilters'
import { formatTodayHeader } from '../../utils/formatTodoDate'
import SearchBar from '../SearchBar'
import TaskSection from '../TaskSection'

interface TasksViewProps {
  busca: string
  onBuscaChange: (value: string) => void
  error: string | null
  loading: boolean
  filtroAtivo: FiltroTarefas
  filtradosPorBusca: Todo[]
  listaVaziaMensagem: string
  porStatus: Record<TodoStatus, Todo[]>
  vencidas: Todo[]
  secoesVisiveis: TodoStatus[]
  secoesAbertas: SecoesAbertas
  onToggleSecao: (key: TodoStatus | 'vencidas') => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onToggleStatus: (todo: Todo) => void
  onToggleSubtarefa: (sub: Subtarefa) => void
  categoriasPorId: Record<string, string>
}

export default function TasksView({
  busca,
  onBuscaChange,
  error,
  loading,
  filtroAtivo,
  filtradosPorBusca,
  listaVaziaMensagem,
  porStatus,
  vencidas,
  secoesVisiveis,
  secoesAbertas,
  onToggleSecao,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleSubtarefa,
  categoriasPorId,
}: TasksViewProps) {
  const { title, subtitle } = formatTodayHeader()

  return (
    <>
      <header className="text-left">
        <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-slate-500 sm:text-base">{subtitle}</p>
      </header>

      <SearchBar value={busca} onChange={onBuscaChange} />

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
      )}

      {loading ? (
        <p className="text-center text-slate-500">Carregando tarefas...</p>
      ) : filtradosPorBusca.length === 0 ? (
        <p className="text-center text-slate-500">{listaVaziaMensagem}</p>
      ) : (
        <div className="space-y-10">
          {filtroAtivo === 'vencidas' ? (
            <TaskSection
              title="VENCIDAS"
              variant="vencidas"
              todos={vencidas}
              isOpen={secoesAbertas.vencidas}
              onToggle={() => onToggleSecao('vencidas')}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              onToggleSubtarefa={onToggleSubtarefa}
              categoriasPorId={categoriasPorId}
            />
          ) : (
            secoesVisiveis.map((status) => (
              <TaskSection
                key={status}
                title={TODO_STATUS_CONFIG[status].sectionTitle}
                variant={status}
                todos={porStatus[status]}
                isOpen={secoesAbertas[status]}
                onToggle={() => onToggleSecao(status)}
                onEdit={onEdit}
                onDelete={onDelete}
                onToggleStatus={onToggleStatus}
                onToggleSubtarefa={onToggleSubtarefa}
                categoriasPorId={categoriasPorId}
              />
            ))
          )}
        </div>
      )}
    </>
  )
}

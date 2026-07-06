import { TODO_STATUS_CONFIG } from '../../constants/todoStatus'
import type { TodoOrdenacao } from '../../constants/todoOrdenacao'
import type { FiltroTarefas } from '../FilterSidebar'
import type { CategoriaDisplay } from '../../types/categoria'
import type { Subtarefa } from '../../types/subtarefa'
import type { Todo, TodoStatus } from '../../types/todo'
import type { SecoesAbertas } from '../../utils/todoFilters'
import { formatTodayHeader } from '../../utils/formatTodoDate'
import SearchBar from '../SearchBar'
import SortSelect from '../SortSelect'
import TaskSection from '../TaskSection'

interface TasksViewProps {
  busca: string
  onBuscaChange: (value: string) => void
  ordenacao: TodoOrdenacao
  onOrdenacaoChange: (value: TodoOrdenacao) => void
  loading: boolean
  filtroAtivo: FiltroTarefas
  tarefasVisiveis: Todo[]
  listaVaziaMensagem: string
  porStatus: Record<TodoStatus, Todo[]>
  vencidas: Todo[]
  venceHoje: Todo[]
  secoesVisiveis: TodoStatus[]
  secoesAbertas: SecoesAbertas
  onToggleSecao: (key: TodoStatus | 'vencidas' | 'vence_hoje') => void
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onToggleStatus: (todo: Todo) => void
  onToggleSubtarefa: (sub: Subtarefa) => void
  categoriasPorId: Record<string, CategoriaDisplay>
}

export default function TasksView({
  busca,
  onBuscaChange,
  ordenacao,
  onOrdenacaoChange,
  loading,
  filtroAtivo,
  tarefasVisiveis,
  listaVaziaMensagem,
  porStatus,
  vencidas,
  venceHoje,
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

      <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <SearchBar value={busca} onChange={onBuscaChange} />
        <SortSelect value={ordenacao} onChange={onOrdenacaoChange} />
      </div>

      {loading ? (
        <p className="text-center text-slate-500">Carregando tarefas...</p>
      ) : tarefasVisiveis.length === 0 ? (
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
          ) : filtroAtivo === 'vence_hoje' ? (
            <TaskSection
              title="VENCE HOJE"
              variant="vence_hoje"
              todos={venceHoje}
              isOpen={secoesAbertas.vence_hoje}
              onToggle={() => onToggleSecao('vence_hoje')}
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

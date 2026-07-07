import { makeSubtarefa, makeTodo } from '../test/fixtures/todos'
import { applySubtarefaChange, applyTarefaDelete, applyTarefaUpsert } from './realtimeTodoMerge'

describe('realtimeTodoMerge', () => {
  it('remove tarefa por id', () => {
    const todos = [makeTodo({ id: 'a' }), makeTodo({ id: 'b' })]
    expect(applyTarefaDelete(todos, 'a').map((t) => t.id)).toEqual(['b'])
  })

  it('insere tarefa nova no início', () => {
    const todos = [makeTodo({ id: 'a' })]
    const created = makeTodo({ id: 'b', titulo: 'Nova' })
    expect(applyTarefaUpsert(todos, created).map((t) => t.id)).toEqual(['b', 'a'])
  })

  it('atualiza tarefa existente', () => {
    const todos = [makeTodo({ id: 'a', titulo: 'Antiga' })]
    const updated = makeTodo({ id: 'a', titulo: 'Nova' })
    expect(applyTarefaUpsert(todos, updated)[0].titulo).toBe('Nova')
  })

  it('insere, atualiza e remove subtarefa no pai', () => {
    const sub = makeSubtarefa({ id: 'sub-1', tarefa_id: 'todo-1', titulo: 'Item' })
    const todos = [makeTodo({ id: 'todo-1', subtarefas: [] })]

    const inserted = applySubtarefaChange(todos, sub, 'INSERT')
    expect(inserted[0].subtarefas).toHaveLength(1)

    const updatedSub = { ...sub, titulo: 'Item atualizado' }
    const updated = applySubtarefaChange(inserted, updatedSub, 'UPDATE')
    expect(updated[0].subtarefas?.[0].titulo).toBe('Item atualizado')

    const deleted = applySubtarefaChange(updated, sub, 'DELETE')
    expect(deleted[0].subtarefas).toHaveLength(0)
  })
})

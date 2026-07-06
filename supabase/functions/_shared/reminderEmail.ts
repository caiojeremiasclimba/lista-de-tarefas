import type { LembreteEnvioTipo } from './reminderEligibility.ts'

export interface ReminderEmailTask {
  titulo: string
  data_prevista: string
  tipo: LembreteEnvioTipo
  prioridade: string
}

export function formatReminderDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function tipoLabel(tipo: LembreteEnvioTipo): string {
  if (tipo === 'no_dia') return 'Vence hoje'
  if (tipo === 'um_dia_antes') return 'Vence amanhã'
  return 'Vencida'
}

export function renderReminderEmailHtml(params: {
  nome: string
  tasks: ReminderEmailTask[]
  appUrl: string
}): string {
  const items = params.tasks
    .map(
      (task) => `
      <li style="margin-bottom:12px;">
        <strong>${escapeHtml(task.titulo)}</strong><br />
        <span style="color:#64748b;font-size:14px;">
          ${tipoLabel(task.tipo)} · ${formatReminderDate(task.data_prevista)} · Prioridade ${escapeHtml(task.prioridade)}
        </span>
      </li>`
    )
    .join('')

  return `
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;color:#0f172a;">
      <h1 style="font-size:20px;">Olá, ${escapeHtml(params.nome)}!</h1>
      <p style="color:#475569;">Você tem ${params.tasks.length} lembrete(s) de tarefa:</p>
      <ul style="padding-left:20px;">${items}</ul>
      <p style="margin-top:24px;">
        <a href="${escapeHtml(params.appUrl)}" style="background:#2563eb;color:#fff;padding:10px 16px;border-radius:8px;text-decoration:none;display:inline-block;">
          Abrir lista de tarefas
        </a>
      </p>
      <p style="margin-top:24px;font-size:12px;color:#94a3b8;">
        Configure o horário em Meu perfil ou desative o lembrete em cada tarefa.
      </p>
    </div>
  `
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

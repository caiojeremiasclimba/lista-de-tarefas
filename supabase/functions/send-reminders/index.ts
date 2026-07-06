import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1'
import {
  addDaysToDateOnly,
  getDateInTimezone,
  getReminderSendTypesForTask,
  isPastReminderHorario,
} from '../_shared/reminderEligibility.ts'
import { renderReminderEmailHtml, type ReminderEmailTask } from '../_shared/reminderEmail.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-cron-secret',
}

interface TaskRow {
  id: string
  user_id: string
  titulo: string
  data_prevista: string
  status: string
  prioridade: string
  lembrete_email: boolean
  lembrete_tipo: 'no_dia' | 'um_dia_antes' | 'ambos'
}

interface PrefsRow {
  user_id: string
  horario_local: string
  timezone: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const cronSecret = Deno.env.get('CRON_SECRET')
  const requestSecret = req.headers.get('x-cron-secret')
  if (!cronSecret || requestSecret !== cronSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const resendFrom = Deno.env.get('RESEND_FROM_EMAIL')
  const appUrl = Deno.env.get('APP_URL') ?? 'https://lista-de-tarefas-taupe-six.vercel.app'

  if (!supabaseUrl || !serviceRoleKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env vars' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  if (!resendApiKey || !resendFrom) {
    return new Response(
      JSON.stringify({
        ok: true,
        skipped: true,
        reason: 'RESEND_API_KEY or RESEND_FROM_EMAIL not configured',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const now = new Date()

  const { data: tasks, error: tasksError } = await supabase
    .from('tarefas')
    .select('id, user_id, titulo, data_prevista, status, prioridade, lembrete_email, lembrete_tipo')
    .eq('lembrete_email', true)
    .in('status', ['pendente', 'em_andamento'])
    .not('data_prevista', 'is', null)

  if (tasksError) {
    return new Response(JSON.stringify({ error: tasksError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const taskRows = (tasks ?? []) as TaskRow[]
  if (taskRows.length === 0) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const userIds = [...new Set(taskRows.map((t) => t.user_id))]
  const { data: prefsRows } = await supabase
    .from('preferencias_lembrete')
    .select('user_id, horario_local, timezone')
    .in('user_id', userIds)

  const prefsByUser = new Map(((prefsRows ?? []) as PrefsRow[]).map((row) => [row.user_id, row]))

  const { data: sentRows } = await supabase
    .from('lembretes_enviados')
    .select('tarefa_id, tipo, data_referencia')
    .in(
      'tarefa_id',
      taskRows.map((t) => t.id)
    )

  const sentKeys = new Set(
    (sentRows ?? []).map((row) => `${row.tarefa_id}:${row.tipo}:${row.data_referencia}`)
  )

  const pendingByUser = new Map<
    string,
    { task: TaskRow; tipo: ReminderEmailTask['tipo']; dataReferencia: string }[]
  >()

  for (const task of taskRows) {
    const prefs = prefsByUser.get(task.user_id)
    const timezone = prefs?.timezone ?? 'America/Sao_Paulo'
    const horario = (prefs?.horario_local ?? '08:00:00').slice(0, 5)

    if (!isPastReminderHorario(now, timezone, horario)) continue

    const today = getDateInTimezone(now, timezone)
    const tomorrow = addDaysToDateOnly(today, 1)
    const sendTypes = getReminderSendTypesForTask(task, { today, tomorrow })

    for (const tipo of sendTypes) {
      const dataReferencia = today
      const key = `${task.id}:${tipo}:${dataReferencia}`
      if (sentKeys.has(key)) continue

      const list = pendingByUser.get(task.user_id) ?? []
      list.push({ task, tipo, dataReferencia })
      pendingByUser.set(task.user_id, list)
    }
  }

  let sentCount = 0

  for (const [userId, items] of pendingByUser.entries()) {
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(userId)
    if (userError || !userData.user?.email) continue

    const nome =
      typeof userData.user.user_metadata?.full_name === 'string'
        ? userData.user.user_metadata.full_name
        : userData.user.email.split('@')[0]

    const emailTasks: ReminderEmailTask[] = items.map(({ task, tipo }) => ({
      titulo: task.titulo,
      data_prevista: task.data_prevista,
      tipo,
      prioridade: task.prioridade,
    }))

    const subject =
      emailTasks.length === 1
        ? `Lembrete: ${emailTasks[0].titulo}`
        : `Você tem ${emailTasks.length} lembretes de tarefas`

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: resendFrom,
        to: userData.user.email,
        subject,
        html: renderReminderEmailHtml({ nome, tasks: emailTasks, appUrl }),
      }),
    })

    if (!resendResponse.ok) continue

    const inserts = items.map(({ task, tipo, dataReferencia }) => ({
      user_id: userId,
      tarefa_id: task.id,
      tipo,
      data_referencia: dataReferencia,
    }))

    const { error: insertError } = await supabase.from('lembretes_enviados').insert(inserts)
    if (!insertError) {
      sentCount += 1
      for (const item of items) {
        sentKeys.add(`${item.task.id}:${item.tipo}:${item.dataReferencia}`)
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, sent: sentCount }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})

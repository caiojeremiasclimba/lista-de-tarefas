export function toDateOnly(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day)
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function formatTodoDate(dateStr: string | null): string | null {
  if (!dateStr) return null

  const date = toDateOnly(dateStr)
  const today = new Date()
  const tomorrow = new Date()
  tomorrow.setDate(today.getDate() + 1)

  if (isSameDay(date, today)) return 'Hoje'
  if (isSameDay(date, tomorrow)) return 'Amanhã'

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatTodayHeader(): { title: string; subtitle: string } {
  const now = new Date()
  const title = 'Hoje'
  const subtitle = now.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
  return {
    title,
    subtitle: subtitle.charAt(0).toUpperCase() + subtitle.slice(1),
  }
}

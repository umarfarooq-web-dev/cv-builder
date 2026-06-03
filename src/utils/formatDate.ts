export function formatMonthYear(value: string | undefined): string {
  if (!value || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) return ''
  const [year, month] = value.split('-')
  const date = new Date(Number(year), Number(month) - 1, 1)
  return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
}

export function formatDateRange(
  start: string,
  end: string | undefined,
  current: boolean,
): string {
  const startLabel = formatMonthYear(start)
  if (!startLabel) return ''
  if (current) return `${startLabel} – Present`
  const endLabel = formatMonthYear(end)
  return endLabel ? `${startLabel} – ${endLabel}` : startLabel
}

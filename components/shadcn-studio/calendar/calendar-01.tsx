'use client'

import { useEffect, useMemo, useState } from 'react'

import { Calendar } from '@/components/ui/calendar'

type CalendarWithTimeProps = {
  value?: string
  onChange?: (value: string) => void
}

const parseSnapshot = (value?: string) => {
  if (!value) return null
  const match = value.trim().match(/^(\d{2})(\d{2})(\d{4})[\sT]?(\d{2})(\d{2})(\d{2})$/)
  if (!match) return null

  const [, dd, mm, yyyy, HH, MM, SS] = match
  const year = Number(yyyy)
  const month = Number(mm) - 1
  const day = Number(dd)
  const hours = Number(HH)
  const minutes = Number(MM)
  const seconds = Number(SS)
  const date = new Date(year, month, day, hours, minutes, seconds)

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month ||
    date.getDate() !== day ||
    date.getHours() !== hours ||
    date.getMinutes() !== minutes ||
    date.getSeconds() !== seconds
  ) {
    return null
  }

  return date
}

const pad2 = (value: number): string => String(value).padStart(2, '0')

const formatSnapshot = (date: Date): string => {
  return `${pad2(date.getDate())}${pad2(date.getMonth() + 1)}${date.getFullYear()} ${pad2(date.getHours())}${pad2(date.getMinutes())}${pad2(date.getSeconds())}`
}

const clamp = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min
  return Math.min(max, Math.max(min, value))
}

const CalendarDemo = ({ value, onChange }: CalendarWithTimeProps) => {
  const parsedValue = useMemo(() => parseSnapshot(value), [value])
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(parsedValue ?? new Date())

  useEffect(() => {
    if (parsedValue) setSelectedDate(parsedValue)
  }, [parsedValue])

  const emit = (nextDate: Date) => onChange?.(formatSnapshot(nextDate))

  const onSelectDate = (next?: Date) => {
    if (!next) return
    const base = selectedDate ?? new Date()
    const merged = new Date(next)
    merged.setHours(base.getHours(), base.getMinutes(), base.getSeconds(), 0)
    setSelectedDate(merged)
    emit(merged)
  }

  const onTimeChange = (field: 'hours' | 'minutes' | 'seconds', raw: string) => {
    const base = selectedDate ?? new Date()
    const valueNumber = clamp(Number(raw), 0, field === 'hours' ? 23 : 59)
    const next = new Date(base)

    if (field === 'hours') next.setHours(valueNumber)
    if (field === 'minutes') next.setMinutes(valueNumber)
    if (field === 'seconds') next.setSeconds(valueNumber)

    setSelectedDate(next)
    emit(next)
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-zinc-900/70 p-4">
      <Calendar
        mode="single"
        defaultMonth={selectedDate}
        selected={selectedDate}
        onSelect={onSelectDate}
        className="mx-auto rounded-lg border border-white/10 bg-zinc-950"
      />
      <div className="mt-3 grid grid-cols-3 gap-2">
        <label className="text-xs text-zinc-400">
          HH
          <input
            type="number"
            min={0}
            max={23}
            value={selectedDate ? pad2(selectedDate.getHours()) : '00'}
            onChange={(event) => onTimeChange('hours', event.target.value)}
            className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-zinc-950/80 px-2 text-sm text-zinc-100 outline-none focus:border-teal-400/60"
          />
        </label>
        <label className="text-xs text-zinc-400">
          MM
          <input
            type="number"
            min={0}
            max={59}
            value={selectedDate ? pad2(selectedDate.getMinutes()) : '00'}
            onChange={(event) => onTimeChange('minutes', event.target.value)}
            className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-zinc-950/80 px-2 text-sm text-zinc-100 outline-none focus:border-teal-400/60"
          />
        </label>
        <label className="text-xs text-zinc-400">
          SS
          <input
            type="number"
            min={0}
            max={59}
            value={selectedDate ? pad2(selectedDate.getSeconds()) : '00'}
            onChange={(event) => onTimeChange('seconds', event.target.value)}
            className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-zinc-950/80 px-2 text-sm text-zinc-100 outline-none focus:border-teal-400/60"
          />
        </label>
      </div>
      <p className="mt-3 text-center text-xs text-zinc-500" role="region">
        {selectedDate ? formatSnapshot(selectedDate) : 'Selecciona fecha/hora'}
      </p>
    </div>
  )
}

export default CalendarDemo

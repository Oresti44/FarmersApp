import { useState } from 'react'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const TIME_SLOTS = Array.from({ length: 33 }, (_, index) => {
  const minutes = 4 * 60 + index * 30
  return {
    key: `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`,
    label: new Date(2000, 0, 1, Math.floor(minutes / 60), minutes % 60).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    }),
  }
})

function addDays(date, amount) {
  const next = new Date(date)
  next.setDate(next.getDate() + amount)
  return next
}

function addMonths(date, amount) {
  const next = new Date(date)
  next.setMonth(next.getMonth() + amount)
  return next
}

function startOfDay(date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function startOfWeek(date) {
  const next = startOfDay(date)
  const day = (next.getDay() + 6) % 7
  next.setDate(next.getDate() - day)
  return next
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function parseDate(value) {
  return value ? new Date(value) : new Date()
}

function formatMonth(date) {
  return date.toLocaleDateString([], { month: 'long', year: 'numeric' })
}

function formatDay(date) {
  return date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

function statusShort(status) {
  if (status === 'completed') {
    return 'comp.'
  }
  if (status === 'completed_pending_confirmation') {
    return 'waiting'
  }
  if (status === 'in_progress') {
    return 'doing'
  }
  if (status === 'scheduled') {
    return 'sched.'
  }
  return String(status || '').replaceAll('_', ' ')
}

function statusClass(status) {
  if (status === 'completed') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  }
  if (status === 'completed_pending_confirmation') {
    return 'bg-amber-50 text-amber-700 ring-amber-200'
  }
  if (status === 'cancelled') {
    return 'bg-rose-50 text-rose-700 ring-rose-200'
  }
  return 'bg-stone-100 text-stone-700 ring-stone-200'
}

function slotKeyForTask(task) {
  const date = parseDate(task.scheduled_start_at)
  let hour = date.getHours()
  let minute = date.getMinutes() < 30 ? 0 : 30

  if (hour < 4) {
    hour = 4
    minute = 0
  }
  if (hour > 20 || (hour === 20 && minute > 0)) {
    hour = 20
    minute = 0
  }

  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

function groupTasksByDay(tasks) {
  return tasks.reduce((map, task) => {
    const key = dateKey(parseDate(task.scheduled_start_at))
    map.set(key, [...(map.get(key) || []), task])
    return map
  }, new Map())
}

function monthGridDays(viewDate) {
  const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0)
  const gridStart = startOfWeek(monthStart)
  const gridEnd = addDays(startOfWeek(monthEnd), 6)
  const days = []

  for (let day = gridStart; day <= gridEnd; day = addDays(day, 1)) {
    days.push(new Date(day))
  }

  return days
}

function CalendarTaskChip({ horizontal = false, onSelectTask, task }) {
  return (
    <button
      type="button"
      title={task.title}
      onClick={() => onSelectTask(task)}
      className={`min-w-0 rounded-md border border-stone-200 bg-white px-2 py-1 text-left shadow-sm transition hover:border-[#6d9143] ${
        horizontal ? 'max-w-[12rem] flex-1 basis-[10rem]' : 'w-full'
      }`}
    >
      <span className="block truncate text-xs font-semibold text-stone-950">{task.title}</span>
      <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase ring-1 ${statusClass(task.status)}`}>
        {statusShort(task.status)}
      </span>
    </button>
  )
}

function MonthView({ onCreateSlot, onSelectDay, onSelectTask, tasksByDay, viewDate }) {
  const days = monthGridDays(viewDate)
  const currentMonth = viewDate.getMonth()

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[52rem] grid-cols-7 gap-px overflow-hidden rounded-lg border border-stone-200 bg-stone-200">
        {DAY_LABELS.map((day) => (
          <div key={day} className="bg-stone-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
            {day}
          </div>
        ))}
        {days.map((day) => {
          const key = dateKey(day)
          const entries = tasksByDay.get(key) || []
          const muted = day.getMonth() !== currentMonth
          return (
            <div key={key} className={`min-h-[8.5rem] bg-white p-2 ${muted ? 'opacity-55' : ''}`}>
              <div className="flex items-center justify-between gap-2">
                <button type="button" onClick={() => onSelectDay(day)} className="text-sm font-semibold text-stone-900">
                  {day.getDate()}
                </button>
                <button type="button" onClick={() => onCreateSlot(key)} className="rounded-md bg-stone-100 px-2 py-1 text-xs font-semibold text-stone-600">
                  Add
                </button>
              </div>
              <button
                type="button"
                onClick={() => onSelectDay(day)}
                className="mt-2 w-full rounded-md bg-[#b7d387]/20 px-2 py-2 text-left text-xs font-semibold text-[#22331f]"
              >
                {entries.length} task{entries.length === 1 ? '' : 's'}
              </button>
              <div className="mt-2 space-y-1">
                {entries.slice(0, 2).map((task) => (
                  <CalendarTaskChip key={task.id} onSelectTask={onSelectTask} task={task} />
                ))}
                {entries.length > 2 ? <p className="text-xs font-semibold text-stone-500">+{entries.length - 2} more</p> : null}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function WeekView({ onCreateSlot, onSelectDay, onSelectTask, tasksByDay, viewDate }) {
  const weekStart = startOfWeek(viewDate)
  const days = DAY_LABELS.map((_, index) => addDays(weekStart, index))

  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[72rem] grid-cols-[5rem_repeat(7,minmax(8rem,1fr))] overflow-hidden rounded-lg border border-stone-200">
        <div className="sticky left-0 z-10 border-b border-r border-stone-200 bg-stone-50 px-3 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
          Time
        </div>
        {days.map((day) => (
          <button
            key={dateKey(day)}
            type="button"
            onClick={() => onSelectDay(day)}
            className="border-b border-r border-stone-200 bg-stone-50 px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.12em] text-stone-600 last:border-r-0"
          >
            <span className="block text-stone-950">{formatDay(day)}</span>
            <span className="mt-1 block text-stone-500">{(tasksByDay.get(dateKey(day)) || []).length} tasks</span>
          </button>
        ))}
        {TIME_SLOTS.map((slot) => (
          <div key={slot.key} className="contents">
            <div className="sticky left-0 z-10 border-r border-t border-stone-200 bg-white px-3 py-3 text-xs font-semibold text-stone-500">
              {slot.label}
            </div>
            {days.map((day) => {
              const entries = (tasksByDay.get(dateKey(day)) || []).filter((task) => slotKeyForTask(task) === slot.key)
              return (
                <div key={`${dateKey(day)}-${slot.key}`} className="min-h-[4.25rem] border-r border-t border-stone-200 bg-white p-1.5 last:border-r-0">
                  <div className="space-y-1">
                    {entries.map((task) => (
                      <CalendarTaskChip key={task.id} onSelectTask={onSelectTask} task={task} />
                    ))}
                  </div>
                  {!entries.length ? (
                    <button type="button" onClick={() => onCreateSlot(dateKey(day))} className="h-full min-h-[2rem] w-full rounded-md text-xs text-transparent hover:bg-stone-50 hover:text-stone-400">
                      Add
                    </button>
                  ) : null}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

function DayView({ onCreateSlot, onSelectTask, tasksByDay, viewDate }) {
  const key = dateKey(viewDate)
  const entriesForDay = tasksByDay.get(key) || []

  return (
    <div className="overflow-x-auto">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold tracking-tight text-stone-950">{formatDay(viewDate)}</h3>
        <button type="button" onClick={() => onCreateSlot(key)} className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-stone-100">
          Add task
        </button>
      </div>
      <div className="grid min-w-[40rem] grid-cols-[5rem_minmax(0,1fr)] overflow-hidden rounded-lg border border-stone-200">
        {TIME_SLOTS.map((slot) => {
          const entries = entriesForDay.filter((task) => slotKeyForTask(task) === slot.key)
          return (
            <div key={slot.key} className="contents">
              <div className="border-r border-t border-stone-200 bg-white px-3 py-3 text-xs font-semibold text-stone-500 first:border-t-0">
                {slot.label}
              </div>
              <div className="min-h-[4.25rem] border-t border-stone-200 bg-white p-2 first:border-t-0">
                <div className="flex flex-wrap gap-2">
                  {entries.map((task) => (
                    <CalendarTaskChip key={task.id} horizontal onSelectTask={onSelectTask} task={task} />
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TasksCalendar({ mode, onCreateSlot, onModeChange, onSelectTask, tasks }) {
  const [viewDate, setViewDate] = useState(new Date())
  const tasksByDay = groupTasksByDay(tasks)

  function move(direction) {
    if (mode === 'month') {
      setViewDate((current) => addMonths(current, direction))
      return
    }
    setViewDate((current) => addDays(current, direction * (mode === 'week' ? 7 : 1)))
  }

  function selectDay(day) {
    setViewDate(day)
    onModeChange('day')
  }

  return (
    <section className="rounded-lg border border-white/80 bg-white/86 p-5 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Calendar</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
            {mode === 'month' ? formatMonth(viewDate) : mode === 'week' ? `${formatDay(startOfWeek(viewDate))} - ${formatDay(addDays(startOfWeek(viewDate), 6))}` : formatDay(viewDate)}
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => move(-1)} className="rounded-md bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700">
            Prev
          </button>
          <button type="button" onClick={() => setViewDate(new Date())} className="rounded-md bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700">
            Today
          </button>
          <button type="button" onClick={() => move(1)} className="rounded-md bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-700">
            Next
          </button>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-stone-100 p-1">
            {['day', 'week', 'month'].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onModeChange(item)}
                className={`rounded-md px-3 py-2 text-sm font-semibold capitalize transition ${
                  mode === item ? 'bg-stone-950 text-stone-100' : 'text-stone-600 hover:bg-stone-200'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5">
        {mode === 'month' ? <MonthView onCreateSlot={onCreateSlot} onSelectDay={selectDay} onSelectTask={onSelectTask} tasksByDay={tasksByDay} viewDate={viewDate} /> : null}
        {mode === 'week' ? <WeekView onCreateSlot={onCreateSlot} onSelectDay={selectDay} onSelectTask={onSelectTask} tasksByDay={tasksByDay} viewDate={viewDate} /> : null}
        {mode === 'day' ? <DayView onCreateSlot={onCreateSlot} onSelectTask={onSelectTask} tasksByDay={tasksByDay} viewDate={viewDate} /> : null}
      </div>
    </section>
  )
}

export default TasksCalendar


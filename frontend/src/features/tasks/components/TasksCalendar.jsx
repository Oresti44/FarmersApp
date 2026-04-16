import PriorityBadge from '../../../components/common/PriorityBadge.jsx'
import StatusBadge from '../../../components/common/StatusBadge.jsx'

function formatDateLabel(value) {
  return new Date(value).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(value) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function groupTasks(tasks, mode) {
  const groups = {}

  tasks.forEach((task) => {
    const date = new Date(task.scheduled_start_at)
    let key = date.toISOString().slice(0, 10)

    if (mode === 'month') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    }

    groups[key] = groups[key] || []
    groups[key].push(task)
  })

  return Object.entries(groups).sort(([left], [right]) => left.localeCompare(right))
}

function TasksCalendar({ mode, onCreateSlot, onModeChange, onSelectTask, tasks }) {
  const grouped = groupTasks(tasks, mode)

  return (
    <section className="rounded-[32px] border border-white/80 bg-white/86 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Calendar</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Day, week, and month task grouping</h2>
        </div>
        <div className="flex gap-2">
          {['day', 'week', 'month'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => onModeChange(item)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                mode === item ? 'bg-stone-950 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {grouped.length ? (
          grouped.map(([group, entries]) => (
            <article key={group} className="rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-900">
                  {mode === 'month' ? group : formatDateLabel(group)}
                </h3>
                <button
                  type="button"
                  onClick={() => onCreateSlot(group)}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-700 ring-1 ring-stone-200"
                >
                  Add here
                </button>
              </div>
              <div className="space-y-3">
                {entries.map((task) => (
                  <button
                    key={task.id}
                    type="button"
                    onClick={() => onSelectTask(task)}
                    className="w-full rounded-[20px] bg-white px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-base font-semibold text-stone-950">{task.title}</span>
                      <PriorityBadge value={task.priority} />
                      <StatusBadge value={task.status} />
                    </div>
                    <p className="mt-2 text-sm text-stone-600">
                      {formatTime(task.scheduled_start_at)} - {formatTime(task.scheduled_end_at)} ·{' '}
                      {task.plant_summary?.name || 'No plant'}
                    </p>
                    <p className="mt-2 text-sm text-stone-500">{task.area_summary?.name || 'No location'}</p>
                  </button>
                ))}
              </div>
            </article>
          ))
        ) : (
          <div className="xl:col-span-2">
            <button
              type="button"
              onClick={() => onCreateSlot(new Date().toISOString().slice(0, 10))}
              className="w-full rounded-[24px] border border-dashed border-stone-300 px-6 py-12 text-center text-stone-600 transition hover:bg-stone-50"
            >
              No calendar items match the filters. Click to open a prefilled create drawer.
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

export default TasksCalendar

import EmptyState from '../../../components/common/EmptyState.jsx'

function Card({ label, value }) {
  return (
    <div className="border-b border-[#b7d387]/45 pb-4">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#22331f]/55">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-[#22331f]">{value}</p>
    </div>
  )
}

function Section({ title, items, onOpen }) {
  return (
    <article className="rounded-lg border border-white/80 bg-white/86 p-5 shadow-[0_18px_50px_rgba(23,12,121,0.08)]">
      <h3 className="text-xl font-semibold tracking-tight text-[#22331f]">{title}</h3>
      <div className="mt-4 divide-y divide-[#b7d387]/35">
        {items?.length ? (
          items.map((item) => (
            <button
              key={`${title}-${item.id}-${item.title || item.label || item.plant__name || item.assignments__worker__username}`}
              type="button"
              onClick={() => onOpen(item)}
              className="flex w-full items-center justify-between py-3 text-left transition hover:bg-[#b7d387]/10"
            >
              <span className="text-sm text-[#22331f]/75">
                {item.title || item.label || item.plant__name || item.assignments__worker__username || 'Item'}
              </span>
              <span className="text-sm font-semibold text-[#22331f]">
                {item.count ?? item.status ?? item.scheduled_start_at ?? item.updated_at ?? ''}
              </span>
            </button>
          ))
        ) : (
          <EmptyState title="No items" description="Nothing matches the current task filters." />
        )}
      </div>
    </article>
  )
}

function TasksOverview({ dashboard, onOpenItem }) {
  if (!dashboard) {
    return null
  }

  const cards = [
    ['Tasks today', dashboard.summary.tasks_today],
    ['Overdue tasks', dashboard.summary.overdue_tasks],
    ['In progress', dashboard.summary.in_progress],
    ['Waiting confirmation', dashboard.summary.waiting_confirmation],
    ['Completed this week', dashboard.summary.completed_this_week],
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map(([label, value]) => (
          <Card key={label} label={label} value={value} />
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <Section title="Needs attention" items={dashboard.needs_attention} onOpen={onOpenItem} />
        <Section title="Overdue" items={dashboard.overdue} onOpen={onOpenItem} />
        <Section title="Unassigned" items={dashboard.unassigned} onOpen={onOpenItem} />
        <Section
          title="Completed pending confirmation"
          items={dashboard.completed_pending_confirmation}
          onOpen={onOpenItem}
        />
        <Section
          title="Tasks with issue or delay comments"
          items={dashboard.tasks_with_issue_or_delay_comments}
          onOpen={onOpenItem}
        />
        <Section title="Upcoming tasks" items={dashboard.upcoming_tasks} onOpen={onOpenItem} />
        <Section title="Recently updated tasks" items={dashboard.recently_updated_tasks} onOpen={onOpenItem} />
      </section>
    </div>
  )
}

export default TasksOverview


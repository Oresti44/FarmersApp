import EmptyState from '../../../components/common/EmptyState.jsx'

function Card({ label, value }) {
  return (
    <article className="rounded-[24px] border border-white/80 bg-white/86 p-5 shadow-[0_20px_55px_rgba(82,97,69,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">{value}</p>
    </article>
  )
}

function Section({ title, items, onOpen }) {
  return (
    <article className="rounded-[28px] border border-white/80 bg-white/86 p-5 shadow-[0_18px_50px_rgba(82,97,69,0.08)]">
      <h3 className="text-xl font-semibold tracking-tight text-stone-950">{title}</h3>
      <div className="mt-4 space-y-3">
        {items?.length ? (
          items.map((item) => (
            <button
              key={`${title}-${item.id}-${item.title || item.label || item.plant__name || item.assignments__worker__username}`}
              type="button"
              onClick={() => onOpen(item)}
              className="flex w-full items-center justify-between rounded-[20px] bg-stone-50 px-4 py-3 text-left transition hover:bg-stone-100"
            >
              <span className="text-sm text-stone-700">
                {item.title || item.label || item.plant__name || item.assignments__worker__username || 'Item'}
              </span>
              <span className="text-sm font-semibold text-stone-950">
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
    ['Postponed', dashboard.summary.postponed],
    ['Cancelled', dashboard.summary.cancelled],
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
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

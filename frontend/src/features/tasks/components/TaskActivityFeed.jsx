import EmptyState from '../../../components/common/EmptyState.jsx'

function TaskActivityFeed({ activity, filters, onChange }) {
  return (
    <section className="rounded-[32px] border border-white/80 bg-white/86 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
      <div className="grid gap-4 md:grid-cols-4">
        <input
          value={filters.task}
          onChange={(event) => onChange({ task: event.target.value })}
          placeholder="Filter by task id"
          className="rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm"
        />
        <input
          value={filters.actor}
          onChange={(event) => onChange({ actor: event.target.value })}
          placeholder="Filter by actor id"
          className="rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm"
        />
        <select
          value={filters.comment_type}
          onChange={(event) => onChange({ comment_type: event.target.value })}
          className="rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm"
        >
          <option value="">All types</option>
          <option value="note">Note</option>
          <option value="issue">Issue</option>
          <option value="delay">Delay</option>
          <option value="completion">Completion</option>
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            value={filters.date_from}
            onChange={(event) => onChange({ date_from: event.target.value })}
            className="rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm"
          />
          <input
            type="date"
            value={filters.date_to}
            onChange={(event) => onChange({ date_to: event.target.value })}
            className="rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-sm"
          />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        {activity.length ? (
          activity.map((item) => (
            <article key={item.id} className="rounded-[22px] bg-stone-50 px-4 py-4 ring-1 ring-stone-200">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                <span>{item.type}</span>
                <span>{new Date(item.created_at).toLocaleString()}</span>
              </div>
              <h3 className="mt-2 text-lg font-semibold text-stone-950">{item.task_title}</h3>
              <p className="mt-2 text-sm text-stone-600">{item.message || item.action_type || 'Activity item'}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-stone-400">{item.actor || 'System'}</p>
            </article>
          ))
        ) : (
          <EmptyState title="No activity" description="Comments and history will appear here once tasks start moving." />
        )}
      </div>
    </section>
  )
}

export default TaskActivityFeed

import EmptyState from '../../../components/common/EmptyState.jsx'

function TaskActivityFeed({ activity, filters, onChange }) {
  return (
    <section className="rounded-[32px] border border-white/80 bg-white/86 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
      <div>
        <input
          value={filters.author_search}
          onChange={(event) => onChange({ author_search: event.target.value })}
          placeholder="Search by writer name"
          className="w-full rounded-md border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-400"
        />
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

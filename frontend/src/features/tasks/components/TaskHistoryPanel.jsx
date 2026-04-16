function TaskHistoryPanel({ history }) {
  return (
    <section className="rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">History timeline</h3>
      <div className="mt-3 space-y-3">
        {history?.length ? (
          history.map((entry) => (
            <article key={entry.id} className="rounded-[18px] bg-white px-4 py-3 ring-1 ring-stone-200">
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                <span>{entry.action_type}</span>
                <span>{entry.actor?.full_name || 'System'}</span>
                <span>{new Date(entry.created_at).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-sm text-stone-700">
                {entry.action_note ||
                  `${entry.field_name || 'task'} changed from ${entry.old_value || 'empty'} to ${entry.new_value || 'empty'}`}
              </p>
            </article>
          ))
        ) : (
          <p className="text-sm text-stone-500">No history yet.</p>
        )}
      </div>
    </section>
  )
}

export default TaskHistoryPanel

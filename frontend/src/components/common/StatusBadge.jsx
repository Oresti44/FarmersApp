const toneByStatus = {
  active: 'bg-emerald-100 text-emerald-700',
  harvested: 'bg-sky-100 text-sky-700',
  failed: 'bg-rose-100 text-rose-700',
  removed: 'bg-stone-200 text-stone-700',
  scheduled: 'bg-sky-100 text-sky-700',
  in_progress: 'bg-amber-100 text-amber-700',
  completed_pending_confirmation: 'bg-fuchsia-100 text-fuchsia-700',
  completed: 'bg-emerald-100 text-emerald-700',
  postponed: 'bg-orange-100 text-orange-700',
  cancelled: 'bg-rose-100 text-rose-700',
  inactive: 'bg-stone-200 text-stone-700',
  archived: 'bg-stone-300 text-stone-700',
}

function formatStatus(value) {
  return value.replaceAll('_', ' ')
}

function StatusBadge({ value }) {
  if (!value) {
    return null
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
        toneByStatus[value] || 'bg-stone-100 text-stone-700'
      }`}
    >
      {formatStatus(value)}
    </span>
  )
}

export default StatusBadge

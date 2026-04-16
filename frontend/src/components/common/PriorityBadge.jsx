const toneByPriority = {
  low: 'bg-stone-100 text-stone-600',
  medium: 'bg-sky-100 text-sky-700',
  high: 'bg-amber-100 text-amber-700',
  urgent: 'bg-rose-100 text-rose-700',
}

function PriorityBadge({ value }) {
  if (!value) {
    return null
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
        toneByPriority[value] || 'bg-stone-100 text-stone-700'
      }`}
    >
      {value}
    </span>
  )
}

export default PriorityBadge

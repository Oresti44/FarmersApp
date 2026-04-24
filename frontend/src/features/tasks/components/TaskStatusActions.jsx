import { useMemo, useState } from 'react'

function blankDraft() {
  return { note: '', reason: '', new_start_at: '', new_end_at: '' }
}

function formatLabel(value) {
  return String(value || '').replaceAll('_', ' ')
}

function buildActions(actingRole, status) {
  if (actingRole === 'manager') {
    const actions = []

    if (status === 'completed_pending_confirmation') {
      actions.push(['confirm', 'Verify completion'])
    }

    if (!['completed', 'cancelled'].includes(status)) {
      actions.push(['postpone', 'Postpone'])
      actions.push(['cancel', 'Cancel'])
    }

    return actions
  }

  const actions = []

  if (['scheduled', 'postponed'].includes(status)) {
    actions.push(['start', 'Start task'])
  }

  if (['scheduled', 'in_progress', 'postponed'].includes(status)) {
    actions.push(['complete', 'Mark completed'])
    actions.push(['postpone', 'Request reschedule'])
  }

  return actions
}

function TaskStatusActions({ actingRole, onAction, task }) {
  const [mode, setMode] = useState('')
  const [draft, setDraft] = useState(blankDraft)
  const actions = useMemo(() => buildActions(actingRole, task.status), [actingRole, task.status])

  async function submit(event) {
    event.preventDefault()
    const succeeded = await onAction(mode, draft)

    if (!succeeded) {
      return
    }

    setMode('')
    setDraft(blankDraft())
  }

  const modeSummary =
    mode === 'confirm'
      ? 'Manager verification moves this task from waiting confirmation to completed.'
      : mode === 'complete'
        ? 'This marks the task as finished and sends it to the manager for verification.'
        : mode === 'start'
          ? 'Use this when work has actually started in the field.'
          : mode === 'postpone'
            ? 'Capture the reason and optional new schedule.'
            : mode === 'cancel'
              ? 'Explain why the task cannot continue.'
              : ''

  const submitLabel =
    mode === 'confirm'
      ? 'Verify task'
      : mode === 'complete'
        ? 'Send for verification'
        : mode === 'start'
          ? 'Start task'
          : mode === 'postpone'
            ? 'Save postponement'
            : mode === 'cancel'
              ? 'Cancel task'
              : 'Save action'

  return (
    <section className="rounded-[24px] bg-[#eef4e5] p-4 ring-1 ring-[#d6e2c0]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5b6f43]">
            Status actions
          </p>
          <p className="mt-2 text-sm text-[#22331f]/70">
            Current status: {formatLabel(task.status)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {actions.map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 transition ${
                mode === value
                  ? 'bg-[#6d9143] text-white ring-[#6d9143]'
                  : 'bg-white text-stone-700 ring-stone-200 hover:bg-[#f7faf1]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      {!actions.length ? (
        <p className="mt-4 rounded-[18px] bg-white/80 px-4 py-3 text-sm text-[#22331f]/70 ring-1 ring-[#d6e2c0]">
          No further status changes are available for this task in its current state.
        </p>
      ) : null}
      {mode ? (
        <form onSubmit={submit} className="mt-4 grid gap-3">
          <p className="text-sm text-[#22331f]/70">{modeSummary}</p>
          {(mode === 'complete' || mode === 'confirm' || mode === 'start') && (
            <textarea
              value={draft.note}
              onChange={(event) => setDraft({ ...draft, note: event.target.value })}
              rows={3}
              placeholder={mode === 'confirm' ? 'Verification note' : 'Optional note'}
              className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm"
            />
          )}
          {(mode === 'postpone' || mode === 'cancel') && (
            <textarea
              value={draft.reason}
              onChange={(event) => setDraft({ ...draft, reason: event.target.value })}
              rows={3}
              placeholder={mode === 'postpone' ? 'Postponement reason' : 'Cancellation reason'}
              className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm"
            />
          )}
          {mode === 'postpone' ? (
            <div className="grid gap-3 md:grid-cols-2">
              <input
                type="datetime-local"
                value={draft.new_start_at}
                onChange={(event) => setDraft({ ...draft, new_start_at: event.target.value })}
                className="rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm"
              />
              <input
                type="datetime-local"
                value={draft.new_end_at}
                onChange={(event) => setDraft({ ...draft, new_end_at: event.target.value })}
                className="rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm"
              />
            </div>
          ) : null}
          <div className="flex items-center justify-between text-sm text-stone-500">
            <span>Action: {formatLabel(mode)}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setMode('')} className="rounded-full bg-stone-100 px-4 py-2">
                Close
              </button>
              <button type="submit" className="rounded-full bg-[#22331f] px-4 py-2 font-semibold text-white">
                {submitLabel}
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </section>
  )
}

export default TaskStatusActions

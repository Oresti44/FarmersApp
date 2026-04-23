import { useState } from 'react'

function TaskStatusActions({ actingRole, onAction, task }) {
  const [mode, setMode] = useState('')
  const [draft, setDraft] = useState({ note: '', reason: '', new_start_at: '', new_end_at: '' })

  async function submit(event) {
    event.preventDefault()
    await onAction(mode, draft)
    setMode('')
    setDraft({ note: '', reason: '', new_start_at: '', new_end_at: '' })
  }

  const actions =
    actingRole === 'manager'
      ? [
          ['postpone', 'Postpone'],
          ['cancel', 'Cancel'],
          ['confirm', 'Confirm completion'],
        ]
      : [
          ['start', 'Start task'],
          ['complete', 'Mark completed'],
          ['postpone', 'Request reschedule'],
        ]

  return (
    <section className="rounded-[24px] bg-[#f4efe3] p-4 ring-1 ring-[#e6dcc6]">
      <div className="flex flex-wrap gap-2">
        {actions.map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setMode(value)}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700 ring-1 ring-stone-200"
          >
            {label}
          </button>
        ))}
      </div>
      {mode ? (
        <form onSubmit={submit} className="mt-4 grid gap-3">
          {(mode === 'complete' || mode === 'confirm' || mode === 'start') && (
            <textarea
              value={draft.note}
              onChange={(event) => setDraft({ ...draft, note: event.target.value })}
              rows={3}
              placeholder={mode === 'confirm' ? 'Manager confirmation note' : 'Optional note'}
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
            <span>Current status: {task.status}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setMode('')} className="rounded-full bg-stone-100 px-4 py-2">
                Close
              </button>
          <button type="submit" className="rounded-full bg-stone-950 px-4 py-2 font-semibold text-stone-100">
                Save action
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </section>
  )
}

export default TaskStatusActions

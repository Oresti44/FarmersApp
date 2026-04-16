import { useState } from 'react'

import ConfirmDialog from '../../../components/common/ConfirmDialog.jsx'

function DeleteTaskDialog({ impact, open, onCancel, onConfirm, task }) {
  const [scope, setScope] = useState('task_only')

  return (
    <ConfirmDialog
      open={open}
      title={`Delete ${task?.title || 'task'}?`}
      description="Delete always goes through confirmation so related assignments, comments, and history are visible first."
      confirmLabel="Delete task"
      onCancel={onCancel}
      onConfirm={() => onConfirm(scope)}
    >
      {task?.flags?.is_repeating_instance ? (
        <div className="mb-4 grid gap-3">
          <label className="rounded-[18px] bg-stone-50 px-4 py-3 text-sm text-stone-700 ring-1 ring-stone-200">
            <input
              type="radio"
              name="delete-scope"
              checked={scope === 'task_only'}
              onChange={() => setScope('task_only')}
            />{' '}
            Delete this task only
          </label>
          <label className="rounded-[18px] bg-stone-50 px-4 py-3 text-sm text-stone-700 ring-1 ring-stone-200">
            <input
              type="radio"
              name="delete-scope"
              checked={scope === 'future'}
              onChange={() => setScope('future')}
            />{' '}
            Delete this and future generated tasks
          </label>
          <label className="rounded-[18px] bg-stone-50 px-4 py-3 text-sm text-stone-700 ring-1 ring-stone-200">
            <input
              type="radio"
              name="delete-scope"
              checked={scope === 'full_setup'}
              onChange={() => setScope('full_setup')}
            />{' '}
            Delete the full repeating setup
          </label>
        </div>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {Object.entries(impact || {}).map(([key, value]) => (
          <div key={key} className="rounded-[18px] bg-stone-50 px-4 py-3 ring-1 ring-stone-200">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{key}</p>
            <p className="mt-2 text-2xl font-semibold text-stone-950">{value}</p>
          </div>
        ))}
      </div>
    </ConfirmDialog>
  )
}

export default DeleteTaskDialog

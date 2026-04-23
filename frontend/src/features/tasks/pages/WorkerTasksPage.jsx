import { useCallback, useEffect, useState } from 'react'

import EmptyState from '../../../components/common/EmptyState.jsx'
import StatusBadge from '../../../components/common/StatusBadge.jsx'
import tasksApi from '../api/tasksApi.js'
import { TASK_STATUS_OPTIONS } from '../types/tasks.js'

function statusLabel(status) {
  return String(status || '').replaceAll('_', ' ')
}

function WorkerTasksPage({ session }) {
  const [tasks, setTasks] = useState([])
  const [selectedTask, setSelectedTask] = useState(null)
  const [note, setNote] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async function refreshWorkerTasks() {
    setLoading(true)
    setError('')
    try {
      const data = await tasksApi.list({ worker: session.user.id, status: statusFilter })
      setTasks(data)
    } catch (caughtError) {
      setError(caughtError.message || 'Unable to load assigned tasks.')
    } finally {
      setLoading(false)
    }
  }, [session.user.id, statusFilter])

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  async function openTask(task) {
    const detail = await tasksApi.get(task.id)
    setSelectedTask(detail)
    setNote('')
  }

  async function startTask(task) {
    await tasksApi.start(task.id, { actor_id: session.user.id, note })
    await refresh()
    await openTask(task)
  }

  async function addNote(task) {
    if (!note.trim()) {
      return
    }
    await tasksApi.addComment(task.id, { author_id: session.user.id, comment_type: 'note', message: note })
    setNote('')
    await refresh()
    await openTask(task)
  }

  async function completeTask(task) {
    await tasksApi.complete(task.id, { actor_id: session.user.id, note })
    setNote('')
    await refresh()
    await openTask(task)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 border-b border-[#8ACBD0]/45 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-[#170C79]">Assigned tasks</h1>
        <div className="mt-4 max-w-xs">
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full rounded-md border border-[#8ACBD0]/70 bg-white px-3 py-3 text-sm text-[#170C79] outline-none focus:border-[#56B6C6]"
          >
            <option value="">All statuses</option>
            {TASK_STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {statusLabel(status)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <EmptyState title="Tasks unavailable" description={error} /> : null}
      {loading ? <EmptyState title="Loading tasks" description="Loading your assigned work." /> : null}

      {!loading && !error ? (
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
          <section className="space-y-3">
            {tasks.map((task) => (
              <button
                key={task.id}
                type="button"
                onClick={() => openTask(task)}
                className="w-full rounded-lg border border-white/80 bg-white/86 p-4 text-left shadow-sm transition hover:border-[#56B6C6]"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-[#170C79]">{task.title}</p>
                    <p className="mt-1 text-sm text-[#170C79]/65">{task.plant_summary?.name || 'No plant'}</p>
                  </div>
                  <StatusBadge value={task.status} />
                </div>
                <p className="mt-3 text-sm text-[#170C79]/70">
                  {new Date(task.scheduled_start_at).toLocaleString()} - {new Date(task.scheduled_end_at).toLocaleString()}
                </p>
              </button>
            ))}
            {!tasks.length ? <EmptyState title="No assigned tasks" description="You do not have assigned tasks right now." /> : null}
          </section>

          <section className="rounded-lg border border-white/80 bg-white/88 p-5 shadow-[0_24px_80px_rgba(23,12,121,0.1)]">
            {selectedTask ? (
              <div className="space-y-5">
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight text-[#170C79]">{selectedTask.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-[#170C79]/70">{selectedTask.description || 'No description.'}</p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="border-b border-[#8ACBD0]/45 pb-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#170C79]/55">Plant</p>
                    <p className="mt-1 font-semibold text-[#170C79]">{selectedTask.plant_summary?.name || 'No plant'}</p>
                  </div>
                  <div className="border-b border-[#8ACBD0]/45 pb-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#170C79]/55">Status</p>
                    <div className="mt-1">
                      <StatusBadge value={selectedTask.status} />
                    </div>
                  </div>
                </div>
                <textarea
                  rows="5"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add a note before saving an action"
                  className="w-full rounded-md border border-[#8ACBD0]/70 bg-white px-4 py-3 text-sm text-[#170C79] outline-none focus:border-[#56B6C6]"
                />
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => startTask(selectedTask)} className="rounded-md bg-[#8ACBD0] px-4 py-2 text-sm font-semibold text-[#170C79]">
                    Start
                  </button>
                  <button type="button" onClick={() => addNote(selectedTask)} className="rounded-md border border-[#56B6C6] bg-white px-4 py-2 text-sm font-semibold text-[#170C79]">
                    Add note
                  </button>
                  <button type="button" onClick={() => completeTask(selectedTask)} className="rounded-md bg-[#56B6C6] px-4 py-2 text-sm font-semibold text-[#170C79]">
                    Pending completion
                  </button>
                </div>
              </div>
            ) : (
              <EmptyState title="Select a task" description="Choose an assigned task to view details and record progress." />
            )}
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default WorkerTasksPage

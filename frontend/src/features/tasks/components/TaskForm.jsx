import { useState } from 'react'

import DrawerShell from '../../../components/common/DrawerShell.jsx'
import SearchSelect from '../../../components/common/SearchSelect.jsx'
import { TASK_CATEGORY_OPTIONS, TASK_PRIORITY_OPTIONS } from '../types/tasks.js'

function formatForInput(value) {
  if (!value) {
    return ''
  }

  const date = new Date(value)
  const offset = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offset).toISOString().slice(0, 16)
}

function defaultDraft(base = {}) {
  const start = base.scheduled_start_at ? new Date(base.scheduled_start_at) : new Date()
  start.setSeconds(0, 0)
  const end = base.scheduled_end_at ? new Date(base.scheduled_end_at) : new Date(start.getTime() + 60 * 60 * 1000)

  return {
    title: base.title || '',
    description: base.description || '',
    category: base.category || 'general',
    priority: base.priority || 'medium',
    plant_id: base.plant_summary?.id || null,
    scheduled_start_at: formatForInput(start.toISOString()),
    scheduled_end_at: formatForInput(end.toISOString()),
    required_items_text: base.required_items_text || '',
    notes: base.notes || '',
    assigned_worker_ids: base.assignments?.map((assignment) => assignment.worker.id) || [],
    recurrence_enabled: base.flags?.is_repeating_instance || false,
    recurrence: {
      frequency: base.recurring_series_summary?.frequency || 'weekly',
      interval_value: base.recurring_series_summary?.interval_value || 1,
      weekdays: base.recurring_series_summary?.weekdays_text?.split(',').filter(Boolean) || [],
      start_date: base.recurring_series_summary?.start_date || start.toISOString().slice(0, 10),
      end_date: base.recurring_series_summary?.end_date || '',
      time_of_day: base.recurring_series_summary?.time_of_day?.slice(0, 5) || start.toTimeString().slice(0, 5),
      default_duration_minutes: base.recurring_series_summary?.default_duration_minutes || 60,
      is_active: base.recurring_series_summary?.is_active ?? true,
    },
  }
}

function TaskForm({ actingUserId, open, onClose, onSubmit, plants, task, workers }) {
  const [draft, setDraft] = useState(defaultDraft(task || {}))
  const [workerSearch, setWorkerSearch] = useState('')

  const plantOptions = plants.map((plant) => ({
    id: plant.id,
    label: `${plant.name}${plant.variety ? ` / ${plant.variety}` : ''}`,
    subtitle: `${plant.area_summary?.type || 'area'} / ${plant.area_summary?.name || 'No location'}`,
  }))
  const selectedPlant = plants.find((plant) => String(plant.id) === String(draft.plant_id))
  const visibleWorkers = workers.filter((worker) =>
    worker.full_name.toLowerCase().includes(workerSearch.toLowerCase()),
  )

  async function handleSubmit(event) {
    event.preventDefault()
    const payload = {
      title: draft.title,
      description: draft.description,
      category: draft.category,
      priority: draft.priority,
      plant_id: draft.plant_id,
      scheduled_start_at: draft.scheduled_start_at,
      scheduled_end_at: draft.scheduled_end_at,
      required_items_text: draft.required_items_text,
      notes: draft.notes,
      assigned_worker_ids: draft.assigned_worker_ids,
      ...(task ? { last_updated_by: actingUserId || null } : { created_by: actingUserId || null }),
    }

    if (draft.recurrence_enabled) {
      payload.recurrence = {
        ...draft.recurrence,
        end_date: draft.recurrence.end_date || null,
      }
      if (task?.flags?.is_repeating_instance) {
        payload.recurring_update_scope = 'future'
      }
    }

    await onSubmit(payload)
  }

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      title={task?.id ? 'Edit task' : 'Create task'}
      description="Use the same drawer for one-time and repeating tasks. The location stays derived from the plant."
    >
      <form onSubmit={handleSubmit} className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Title
            </span>
            <input
              value={draft.title}
              onChange={(event) => setDraft({ ...draft, title: event.target.value })}
              required
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
            />
          </label>
          <SearchSelect
            label="Plant"
            value={draft.plant_id}
            options={plantOptions}
            onChange={(value) => setDraft({ ...draft, plant_id: value })}
            placeholder="Choose plant"
          />
        </div>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Description
          </span>
          <textarea
            value={draft.description}
            onChange={(event) => setDraft({ ...draft, description: event.target.value })}
            rows={4}
            className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
          />
        </label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Category
            </span>
            <select
              value={draft.category}
              onChange={(event) => setDraft({ ...draft, category: event.target.value })}
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
            >
              {TASK_CATEGORY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Priority
            </span>
            <select
              value={draft.priority}
              onChange={(event) => setDraft({ ...draft, priority: event.target.value })}
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
            >
              {TASK_PRIORITY_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Scheduled start
            </span>
            <input
              type="datetime-local"
              value={draft.scheduled_start_at}
              onChange={(event) => setDraft({ ...draft, scheduled_start_at: event.target.value })}
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Scheduled end
            </span>
            <input
              type="datetime-local"
              value={draft.scheduled_end_at}
              onChange={(event) => setDraft({ ...draft, scheduled_end_at: event.target.value })}
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
            />
          </label>
        </div>
        <div className="rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Derived location</p>
          <p className="mt-2 text-sm text-stone-700">
            {selectedPlant?.area_summary?.type || 'area'} / {selectedPlant?.area_summary?.name || 'Select a plant'}
          </p>
        </div>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Required items
          </span>
          <textarea
            value={draft.required_items_text}
            onChange={(event) => setDraft({ ...draft, required_items_text: event.target.value })}
            rows={3}
            className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
          />
        </label>
        <div className="rounded-[24px] bg-[#eef5ea] p-4 ring-1 ring-[#d7e2d0]">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Assigned workers</p>
            <input
              value={workerSearch}
              onChange={(event) => setWorkerSearch(event.target.value)}
              placeholder="Search workers"
              className="rounded-full border border-stone-200 bg-white px-3 py-2 text-sm"
            />
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {visibleWorkers.map((worker) => {
              const active = draft.assigned_worker_ids.includes(worker.id)
              return (
                <button
                  key={worker.id}
                  type="button"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      assigned_worker_ids: active
                        ? draft.assigned_worker_ids.filter((id) => id !== worker.id)
                        : [...draft.assigned_worker_ids, worker.id],
                    })
                  }
                  className={`rounded-[18px] px-4 py-3 text-left transition ${
                    active ? 'bg-stone-900 text-stone-100' : 'bg-white text-stone-700 ring-1 ring-stone-200'
                  }`}
                >
                  <span className="block font-semibold">{worker.full_name}</span>
                  <span className="block text-xs uppercase tracking-[0.18em] opacity-70">{worker.role}</span>
                </button>
              )
            })}
          </div>
        </div>
        <label className="inline-flex items-center gap-3 rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm">
          <input
            type="checkbox"
            checked={draft.recurrence_enabled}
            onChange={(event) => setDraft({ ...draft, recurrence_enabled: event.target.checked })}
          />
          Repeating task
        </label>
        {draft.recurrence_enabled ? (
          <div className="grid gap-4 rounded-[24px] bg-[#f4efe3] p-4 ring-1 ring-[#e6dcc6] md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Frequency
              </span>
              <select
                value={draft.recurrence.frequency}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    recurrence: { ...draft.recurrence, frequency: event.target.value },
                  })
                }
                className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Interval
              </span>
              <input
                type="number"
                min="1"
                value={draft.recurrence.interval_value}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    recurrence: { ...draft.recurrence, interval_value: Number(event.target.value) || 1 },
                  })
                }
                className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Start date
              </span>
              <input
                type="date"
                value={draft.recurrence.start_date}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    recurrence: { ...draft.recurrence, start_date: event.target.value },
                  })
                }
                className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                End date
              </span>
              <input
                type="date"
                value={draft.recurrence.end_date}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    recurrence: { ...draft.recurrence, end_date: event.target.value },
                  })
                }
                className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Time of day
              </span>
              <input
                type="time"
                value={draft.recurrence.time_of_day}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    recurrence: { ...draft.recurrence, time_of_day: event.target.value },
                  })
                }
                className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Default duration minutes
              </span>
              <input
                type="number"
                min="1"
                value={draft.recurrence.default_duration_minutes}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    recurrence: {
                      ...draft.recurrence,
                      default_duration_minutes: Number(event.target.value) || 60,
                    },
                  })
                }
                className="w-full rounded-[18px] border border-stone-200 bg-white px-4 py-3 text-sm"
              />
            </label>
          </div>
        ) : null}
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Notes
          </span>
          <textarea
            value={draft.notes}
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            rows={3}
            className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
          />
        </label>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button type="submit" className="rounded-full bg-stone-950 px-5 py-2 text-sm font-semibold text-stone-100">
            {task?.id ? 'Save changes' : 'Create task'}
          </button>
        </div>
      </form>
    </DrawerShell>
  )
}

export default TaskForm


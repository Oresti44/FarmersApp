import { useEffect, useState } from 'react'

import DrawerShell from '../../../components/common/DrawerShell.jsx'
import SearchSelect from '../../../components/common/SearchSelect.jsx'

function defaultDraft(entry, plantId) {
  return {
    plant: entry?.plant || plantId || null,
    task: entry?.task || null,
    resource_name: entry?.resource_name || '',
    resource_type: entry?.resource_type || '',
    quantity: entry?.quantity || '',
    quantity_unit: entry?.quantity_unit || '',
    used_at: entry?.used_at ? entry.used_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
    notes: entry?.notes || '',
  }
}

function ResourceUsageForm({ entry, onClose, onSubmit, open, plantId, plants, tasks }) {
  const [draft, setDraft] = useState(defaultDraft(entry, plantId))

  useEffect(() => {
    setDraft(defaultDraft(entry, plantId))
  }, [entry, plantId])

  const plantOptions = plants.map((plant) => ({ id: plant.id, label: plant.name, subtitle: plant.variety }))
  const taskOptions = tasks.map((task) => ({ id: task.id, label: task.title, subtitle: task.plant_summary?.name }))

  async function submit(event) {
    event.preventDefault()
    await onSubmit({
      plant: draft.plant,
      task: draft.task || null,
      resource_name: draft.resource_name,
      resource_type: draft.resource_type,
      quantity: draft.quantity,
      quantity_unit: draft.quantity_unit,
      used_at: new Date(draft.used_at).toISOString(),
      notes: draft.notes,
    })
  }

  return (
    <DrawerShell open={open} onClose={onClose} title={entry?.id ? 'Edit resource usage' : 'Add resource usage'}>
      <form onSubmit={submit} className="grid gap-5">
        <SearchSelect label="Plant" value={draft.plant} options={plantOptions} onChange={(value) => setDraft({ ...draft, plant: value })} placeholder="Choose plant" />
        <SearchSelect label="Linked task" value={draft.task} options={taskOptions} onChange={(value) => setDraft({ ...draft, task: value })} placeholder="Optional task link" />
        <div className="grid gap-5 md:grid-cols-2">
          <input value={draft.resource_name} onChange={(event) => setDraft({ ...draft, resource_name: event.target.value })} placeholder="Resource name" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
          <input value={draft.resource_type} onChange={(event) => setDraft({ ...draft, resource_type: event.target.value })} placeholder="Resource type" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <input value={draft.quantity} onChange={(event) => setDraft({ ...draft, quantity: event.target.value })} placeholder="Quantity" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
          <input value={draft.quantity_unit} onChange={(event) => setDraft({ ...draft, quantity_unit: event.target.value })} placeholder="Unit" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
          <input type="datetime-local" value={draft.used_at} onChange={(event) => setDraft({ ...draft, used_at: event.target.value })} className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        </div>
        <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={3} placeholder="Notes" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold">Cancel</button>
          <button type="submit" className="rounded-full bg-stone-950 px-5 py-2 text-sm font-semibold text-white">{entry?.id ? 'Save usage' : 'Create usage'}</button>
        </div>
      </form>
    </DrawerShell>
  )
}

export default ResourceUsageForm

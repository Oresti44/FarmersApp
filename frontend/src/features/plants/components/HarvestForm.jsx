import { useEffect, useState } from 'react'

import DrawerShell from '../../../components/common/DrawerShell.jsx'
import SearchSelect from '../../../components/common/SearchSelect.jsx'

function defaultDraft(entry, plantId) {
  return {
    plant: entry?.plant || plantId || null,
    harvested_at: entry?.harvested_at ? entry.harvested_at.slice(0, 16) : new Date().toISOString().slice(0, 16),
    quantity: entry?.quantity || '',
    quantity_unit: entry?.quantity_unit || 'kg',
    quality_grade: entry?.quality_grade || '',
    notes: entry?.notes || '',
  }
}

function HarvestForm({ entry, onClose, onSubmit, open, plantId, plants }) {
  const [draft, setDraft] = useState(defaultDraft(entry, plantId))

  useEffect(() => {
    setDraft(defaultDraft(entry, plantId))
  }, [entry, plantId])

  const plantOptions = plants.map((plant) => ({ id: plant.id, label: plant.name, subtitle: plant.variety }))

  async function submit(event) {
    event.preventDefault()
    await onSubmit({
      plant: draft.plant,
      harvested_at: new Date(draft.harvested_at).toISOString(),
      quantity: draft.quantity,
      quantity_unit: draft.quantity_unit,
      quality_grade: draft.quality_grade,
      notes: draft.notes,
    })
  }

  return (
    <DrawerShell open={open} onClose={onClose} title={entry?.id ? 'Edit harvest' : 'Add harvest entry'}>
      <form onSubmit={submit} className="grid gap-5">
        <SearchSelect label="Plant" value={draft.plant} options={plantOptions} onChange={(value) => setDraft({ ...draft, plant: value })} placeholder="Choose plant" />
        <input type="datetime-local" value={draft.harvested_at} onChange={(event) => setDraft({ ...draft, harvested_at: event.target.value })} className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        <div className="grid gap-5 md:grid-cols-2">
          <input value={draft.quantity} onChange={(event) => setDraft({ ...draft, quantity: event.target.value })} placeholder="Quantity" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
          <input value={draft.quantity_unit} onChange={(event) => setDraft({ ...draft, quantity_unit: event.target.value })} placeholder="Unit" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        </div>
        <input value={draft.quality_grade} onChange={(event) => setDraft({ ...draft, quality_grade: event.target.value })} placeholder="Quality grade" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={3} placeholder="Notes" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold">Cancel</button>
      <button type="submit" className="rounded-full bg-stone-950 px-5 py-2 text-sm font-semibold text-stone-100">{entry?.id ? 'Save harvest' : 'Create harvest'}</button>
        </div>
      </form>
    </DrawerShell>
  )
}

export default HarvestForm

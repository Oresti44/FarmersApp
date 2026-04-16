import { useEffect, useState } from 'react'

import DrawerShell from '../../../components/common/DrawerShell.jsx'
import SearchSelect from '../../../components/common/SearchSelect.jsx'

function defaultDraft(plot) {
  return {
    farm: plot?.farm?.id || null,
    name: plot?.name || '',
    code: plot?.code || '',
    size_value: plot?.size_value || '',
    size_unit: plot?.size_unit || 'm2',
    soil_type: plot?.soil_type || '',
    irrigation_type: plot?.irrigation_type || '',
    status: plot?.status || 'active',
    notes: plot?.notes || '',
  }
}

function PlotForm({ farms, onClose, onSubmit, open, plot }) {
  const [draft, setDraft] = useState(defaultDraft(plot))

  useEffect(() => {
    setDraft(defaultDraft(plot))
  }, [plot])

  const farmOptions = farms.map((farm) => ({ id: farm.id, label: farm.name, subtitle: farm.location_text }))

  async function submit(event) {
    event.preventDefault()
    await onSubmit(draft)
  }

  return (
    <DrawerShell open={open} onClose={onClose} title={plot?.id ? 'Edit plot' : 'Add plot'}>
      <form onSubmit={submit} className="grid gap-5">
        <SearchSelect label="Farm" value={draft.farm} options={farmOptions} onChange={(value) => setDraft({ ...draft, farm: value })} placeholder="Choose farm" />
        <div className="grid gap-5 md:grid-cols-2">
          <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Name" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
          <input value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} placeholder="Code" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <input value={draft.size_value} onChange={(event) => setDraft({ ...draft, size_value: event.target.value })} placeholder="Size value" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
          <input value={draft.size_unit} onChange={(event) => setDraft({ ...draft, size_unit: event.target.value })} placeholder="Size unit" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        </div>
        <input value={draft.soil_type} onChange={(event) => setDraft({ ...draft, soil_type: event.target.value })} placeholder="Soil type" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        <input value={draft.irrigation_type} onChange={(event) => setDraft({ ...draft, irrigation_type: event.target.value })} placeholder="Irrigation type" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={3} placeholder="Notes" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold">Cancel</button>
          <button type="submit" className="rounded-full bg-stone-950 px-5 py-2 text-sm font-semibold text-white">{plot?.id ? 'Save plot' : 'Create plot'}</button>
        </div>
      </form>
    </DrawerShell>
  )
}

export default PlotForm

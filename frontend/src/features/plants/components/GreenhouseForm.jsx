import { useEffect, useState } from 'react'

import DrawerShell from '../../../components/common/DrawerShell.jsx'

function defaultDraft(greenhouse, farmId) {
  return {
    farm: greenhouse?.farm?.id || farmId || null,
    name: greenhouse?.name || '',
    code: greenhouse?.code || '',
    size_value: greenhouse?.size_value || '',
    size_unit: greenhouse?.size_unit || 'm2',
    greenhouse_type: greenhouse?.greenhouse_type || '',
    temperature_min_c: greenhouse?.temperature_min_c || '',
    temperature_max_c: greenhouse?.temperature_max_c || '',
    humidity_target_percent: greenhouse?.humidity_target_percent || '',
    status: greenhouse?.status || 'active',
    notes: greenhouse?.notes || '',
  }
}

function GreenhouseForm({ farmId, greenhouse, onClose, onSubmit, open }) {
  const [draft, setDraft] = useState(defaultDraft(greenhouse, farmId))

  useEffect(() => {
    setDraft(defaultDraft(greenhouse, farmId))
  }, [farmId, greenhouse])

  async function submit(event) {
    event.preventDefault()
    await onSubmit(draft)
  }

  return (
    <DrawerShell open={open} onClose={onClose} title={greenhouse?.id ? 'Edit greenhouse' : 'Add greenhouse'}>
      <form onSubmit={submit} className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Name" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
          <input value={draft.code} onChange={(event) => setDraft({ ...draft, code: event.target.value })} placeholder="Code" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <input value={draft.size_value} onChange={(event) => setDraft({ ...draft, size_value: event.target.value })} placeholder="Size value" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
          <input value={draft.size_unit} onChange={(event) => setDraft({ ...draft, size_unit: event.target.value })} placeholder="Size unit" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        </div>
        <input value={draft.greenhouse_type} onChange={(event) => setDraft({ ...draft, greenhouse_type: event.target.value })} placeholder="Greenhouse type" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        <div className="grid gap-5 md:grid-cols-3">
          <input value={draft.temperature_min_c} onChange={(event) => setDraft({ ...draft, temperature_min_c: event.target.value })} placeholder="Min temp" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
          <input value={draft.temperature_max_c} onChange={(event) => setDraft({ ...draft, temperature_max_c: event.target.value })} placeholder="Max temp" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
          <input value={draft.humidity_target_percent} onChange={(event) => setDraft({ ...draft, humidity_target_percent: event.target.value })} placeholder="Humidity %" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        </div>
        <textarea value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} rows={3} placeholder="Notes" className="rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm" />
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button type="submit" className="rounded-full bg-stone-950 px-5 py-2 text-sm font-semibold text-stone-100">
            {greenhouse?.id ? 'Save greenhouse' : 'Create greenhouse'}
          </button>
        </div>
      </form>
    </DrawerShell>
  )
}

export default GreenhouseForm

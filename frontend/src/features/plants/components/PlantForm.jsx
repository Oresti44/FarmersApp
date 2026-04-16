import { useEffect, useState } from 'react'

import DrawerShell from '../../../components/common/DrawerShell.jsx'
import SearchSelect from '../../../components/common/SearchSelect.jsx'

function defaultDraft(plant) {
  return {
    name: plant?.name || '',
    variety: plant?.variety || '',
    stage_id: plant?.stage?.id || null,
    quantity: plant?.quantity || '',
    quantity_unit: plant?.quantity_unit || 'plants',
    planted_date: plant?.planted_date || new Date().toISOString().slice(0, 10),
    expected_harvest_date: plant?.expected_harvest_date || '',
    status: plant?.status || 'active',
    notes: plant?.notes || '',
    area_type: plant?.area_summary?.type || 'plot',
    plot_id: plant?.area_summary?.type === 'plot' ? plant.area_summary.id : null,
    greenhouse_id: plant?.area_summary?.type === 'greenhouse' ? plant.area_summary.id : null,
  }
}

function PlantForm({ greenhouses, onClose, onSubmit, open, plant, plots, stages }) {
  const [draft, setDraft] = useState(defaultDraft(plant))

  useEffect(() => {
    setDraft(defaultDraft(plant))
  }, [plant])

  const stageOptions = stages.map((stage) => ({ id: stage.id, label: stage.name }))
  const plotOptions = plots.map((plot) => ({
    id: plot.id,
    label: plot.name,
    subtitle: plot.current_plant ? `Occupied by ${plot.current_plant.name}` : 'Available',
  }))
  const greenhouseOptions = greenhouses.map((greenhouse) => ({
    id: greenhouse.id,
    label: greenhouse.name,
    subtitle: `${greenhouse.plant_count} plants`,
  }))
  const selectedPlot = plots.find((plot) => String(plot.id) === String(draft.plot_id))
  const plotBlocked = draft.area_type === 'plot' && selectedPlot?.current_plant && selectedPlot.current_plant.id !== plant?.id

  async function submit(event) {
    event.preventDefault()
    await onSubmit({
      name: draft.name,
      variety: draft.variety,
      stage_id: draft.stage_id,
      quantity: draft.quantity || null,
      quantity_unit: draft.quantity_unit,
      planted_date: draft.planted_date || null,
      expected_harvest_date: draft.expected_harvest_date || null,
      status: draft.status,
      notes: draft.notes,
      plot_id: draft.area_type === 'plot' ? draft.plot_id : null,
      greenhouse_id: draft.area_type === 'greenhouse' ? draft.greenhouse_id : null,
    })
  }

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      title={plant?.id ? 'Edit plant' : 'Create plant'}
      description="Plants must belong to exactly one area. Plot assignment is blocked when another plant is already using it."
    >
      <form onSubmit={submit} className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Name
            </span>
            <input
              value={draft.name}
              onChange={(event) => setDraft({ ...draft, name: event.target.value })}
              required
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Variety
            </span>
            <input
              value={draft.variety}
              onChange={(event) => setDraft({ ...draft, variety: event.target.value })}
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
            />
          </label>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <SearchSelect
            label="Stage"
            value={draft.stage_id}
            options={stageOptions}
            onChange={(value) => setDraft({ ...draft, stage_id: value })}
            placeholder="Choose stage"
          />
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Status
            </span>
            <select
              value={draft.status}
              onChange={(event) => setDraft({ ...draft, status: event.target.value })}
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
            >
              <option value="active">Active</option>
              <option value="harvested">Harvested</option>
              <option value="failed">Failed</option>
              <option value="removed">Removed</option>
            </select>
          </label>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Quantity
            </span>
            <input
              type="number"
              value={draft.quantity}
              onChange={(event) => setDraft({ ...draft, quantity: event.target.value })}
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Quantity unit
            </span>
            <input
              value={draft.quantity_unit}
              onChange={(event) => setDraft({ ...draft, quantity_unit: event.target.value })}
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
            />
          </label>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Planted date
            </span>
            <input
              type="date"
              value={draft.planted_date}
              onChange={(event) => setDraft({ ...draft, planted_date: event.target.value })}
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Expected harvest date
            </span>
            <input
              type="date"
              value={draft.expected_harvest_date}
              onChange={(event) => setDraft({ ...draft, expected_harvest_date: event.target.value })}
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
            />
          </label>
        </div>
        <div className="rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Area assignment</p>
          <div className="mt-3 flex gap-3">
            {['plot', 'greenhouse'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  setDraft({
                    ...draft,
                    area_type: type,
                    plot_id: type === 'plot' ? draft.plot_id : null,
                    greenhouse_id: type === 'greenhouse' ? draft.greenhouse_id : null,
                  })
                }
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  draft.area_type === type
                    ? 'bg-stone-950 text-white'
                    : 'bg-white text-stone-700 ring-1 ring-stone-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          <div className="mt-4">
            {draft.area_type === 'plot' ? (
              <SearchSelect
                label="Plot"
                value={draft.plot_id}
                options={plotOptions}
                onChange={(value) => setDraft({ ...draft, plot_id: value })}
                placeholder="Choose plot"
              />
            ) : (
              <SearchSelect
                label="Greenhouse"
                value={draft.greenhouse_id}
                options={greenhouseOptions}
                onChange={(value) => setDraft({ ...draft, greenhouse_id: value })}
                placeholder="Choose greenhouse"
              />
            )}
          </div>
          {plotBlocked ? (
            <p className="mt-3 rounded-[18px] bg-rose-50 px-4 py-3 text-sm text-rose-700">
              This plot already has a plant. Choose another plot or move the existing plant first.
            </p>
          ) : null}
        </div>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Notes
          </span>
          <textarea
            value={draft.notes}
            onChange={(event) => setDraft({ ...draft, notes: event.target.value })}
            rows={4}
            className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
          />
        </label>
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold">
            Cancel
          </button>
          <button
            type="submit"
            disabled={plotBlocked}
            className="rounded-full bg-stone-950 px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {plant?.id ? 'Save plant' : 'Create plant'}
          </button>
        </div>
      </form>
    </DrawerShell>
  )
}

export default PlantForm

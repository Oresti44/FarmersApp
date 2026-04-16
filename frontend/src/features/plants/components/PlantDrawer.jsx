import DrawerShell from '../../../components/common/DrawerShell.jsx'
import StatusBadge from '../../../components/common/StatusBadge.jsx'

function PlantDrawer({ onClose, onEdit, onNewHarvest, onNewResource, open, plant }) {
  if (!plant) {
    return null
  }

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      title={`${plant.name}${plant.variety ? ` · ${plant.variety}` : ''}`}
      description={`${plant.stage?.name || 'No stage'} · ${plant.area_summary?.name || 'No area'}`}
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={() => onEdit(plant)} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold">Edit</button>
          <button type="button" onClick={() => onNewHarvest(plant)} className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">Record harvest</button>
          <button type="button" onClick={() => onNewResource(plant)} className="rounded-full bg-sky-100 px-4 py-2 text-sm font-semibold text-sky-700">Add resource usage</button>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="rounded-[28px] border border-stone-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge value={plant.status} />
            <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">
              {plant.area_type}
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Farm</p>
              <p className="mt-2 text-sm text-stone-700">{plant.farm?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Area</p>
              <p className="mt-2 text-sm text-stone-700">{plant.area_summary?.name || '—'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Quantity</p>
              <p className="mt-2 text-sm text-stone-700">{plant.quantity || 0} {plant.quantity_unit}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Expected harvest</p>
              <p className="mt-2 text-sm text-stone-700">{plant.expected_harvest_date || '—'}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-stone-600">{plant.notes || 'No notes yet.'}</p>
        </section>
        <section className="rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Tasks linked to this plant</h3>
          <div className="mt-3 space-y-2">
            {(plant.tasks || []).map((task) => (
              <div key={task.id} className="rounded-[18px] bg-white px-4 py-3 ring-1 ring-stone-200">
                <p className="font-semibold text-stone-900">{task.title}</p>
                <p className="text-sm text-stone-500">{task.status} · {new Date(task.scheduled_start_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Harvest history</h3>
          <div className="mt-3 space-y-2">
            {(plant.harvest_history || []).map((entry) => (
              <div key={entry.id} className="rounded-[18px] bg-white px-4 py-3 ring-1 ring-stone-200">
                <p className="font-semibold text-stone-900">{entry.quantity} {entry.quantity_unit}</p>
                <p className="text-sm text-stone-500">{new Date(entry.harvested_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
          <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Resource usage</h3>
          <div className="mt-3 space-y-2">
            {(plant.resource_usage || []).map((entry) => (
              <div key={entry.id} className="rounded-[18px] bg-white px-4 py-3 ring-1 ring-stone-200">
                <p className="font-semibold text-stone-900">{entry.resource_name}</p>
                <p className="text-sm text-stone-500">{entry.quantity} {entry.quantity_unit} · {new Date(entry.used_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </DrawerShell>
  )
}

export default PlantDrawer

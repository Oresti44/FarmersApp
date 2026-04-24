import StatusBadge from '../../../components/common/StatusBadge.jsx'

function PlantsTable({ onAction, onOpen, plants }) {
  return (
    <section className="rounded-[32px] border border-white/80 bg-white/86 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-[#fbfaf6] text-left text-xs uppercase tracking-[0.18em] text-stone-500">
            <tr>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Variety</th>
              <th className="px-4 py-4">Stage</th>
              <th className="px-4 py-4">Quantity</th>
              <th className="px-4 py-4">Planted</th>
              <th className="px-4 py-4">Expected harvest</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Area</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plants.map((plant) => (
              <tr key={plant.id} className="text-sm text-stone-700">
                <td className="px-4 py-4 align-top">
                  <button type="button" onClick={() => onOpen(plant)} className="text-left">
                    <span className="block font-semibold text-stone-950">{plant.name}</span>
                    <span className="text-stone-500">{plant.area_summary?.name || 'No area'}</span>
                  </button>
                </td>
                <td className="px-4 py-4 align-top">{plant.variety || '-'}</td>
                <td className="px-4 py-4 align-top">{plant.stage?.name || '-'}</td>
                <td className="px-4 py-4 align-top">
                  {plant.quantity || 0} {plant.quantity_unit}
                </td>
                <td className="px-4 py-4 align-top">{plant.planted_date || '-'}</td>
                <td className="px-4 py-4 align-top">{plant.expected_harvest_date || '-'}</td>
                <td className="px-4 py-4 align-top">
                  <StatusBadge value={plant.status} />
                </td>
                <td className="px-4 py-4 align-top">{plant.area_summary?.name || '-'}</td>
                <td className="px-4 py-4 align-top">
                  <details className="relative">
                    <summary className="cursor-pointer list-none rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
                      Actions
                    </summary>
                    <div className="absolute right-0 z-20 mt-2 w-56 rounded-[20px] border border-stone-200 bg-white p-2 shadow-[0_18px_50px_rgba(33,41,24,0.16)]">
                      {['view', 'edit', 'change stage', 'record harvest', 'add resource usage', 'mark failed', 'delete'].map(
                        (actionName) => (
                          <button
                            key={actionName}
                            type="button"
                            onClick={() => onAction(actionName, plant)}
                            className="w-full rounded-[14px] px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-50"
                          >
                            {actionName}
                          </button>
                        ),
                      )}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default PlantsTable


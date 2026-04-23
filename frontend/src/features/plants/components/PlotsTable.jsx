import StatusBadge from '../../../components/common/StatusBadge.jsx'

function PlotsTable({ onAction, plots }) {
  return (
    <section className="rounded-[32px] border border-white/80 bg-white/86 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-[#fbfaf6] text-left text-xs uppercase tracking-[0.18em] text-stone-500">
            <tr>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Code</th>
              <th className="px-4 py-4">Size</th>
              <th className="px-4 py-4">Soil</th>
              <th className="px-4 py-4">Irrigation</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Current plant</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {plots.map((plot) => (
              <tr key={plot.id} className="text-sm text-stone-700">
                <td className="px-4 py-4 align-top font-semibold text-stone-950">{plot.name}</td>
                <td className="px-4 py-4 align-top">{plot.code || '-'}</td>
                <td className="px-4 py-4 align-top">
                  {plot.size_value || '-'} {plot.size_unit || ''}
                </td>
                <td className="px-4 py-4 align-top">{plot.soil_type || '-'}</td>
                <td className="px-4 py-4 align-top">{plot.irrigation_type || '-'}</td>
                <td className="px-4 py-4 align-top">
                  <StatusBadge value={plot.status} />
                </td>
                <td className="px-4 py-4 align-top">{plot.current_plant?.name || 'Empty'}</td>
                <td className="px-4 py-4 align-top">
                  <details className="relative">
                    <summary className="cursor-pointer list-none rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
                      Actions
                    </summary>
                    <div className="absolute right-0 z-20 mt-2 w-56 rounded-[20px] border border-stone-200 bg-white p-2 shadow-[0_18px_50px_rgba(33,41,24,0.16)]">
                      {['edit', 'archive', 'delete', 'create plant'].map((actionName) => (
                        <button
                          key={actionName}
                          type="button"
                          onClick={() => onAction(actionName, plot)}
                          className="w-full rounded-[14px] px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-50"
                        >
                          {actionName}
                        </button>
                      ))}
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

export default PlotsTable

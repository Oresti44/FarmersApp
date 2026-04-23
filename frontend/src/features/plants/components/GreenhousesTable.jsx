import StatusBadge from '../../../components/common/StatusBadge.jsx'

function GreenhousesTable({ onAction, greenhouses }) {
  return (
    <section className="rounded-[32px] border border-white/80 bg-white/86 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-[#fbfaf6] text-left text-xs uppercase tracking-[0.18em] text-stone-500">
            <tr>
              <th className="px-4 py-4">Name</th>
              <th className="px-4 py-4">Code</th>
              <th className="px-4 py-4">Size</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">Temp range</th>
              <th className="px-4 py-4">Humidity</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Plant count</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {greenhouses.map((greenhouse) => (
              <tr key={greenhouse.id} className="text-sm text-stone-700">
                <td className="px-4 py-4 align-top font-semibold text-stone-950">{greenhouse.name}</td>
                <td className="px-4 py-4 align-top">{greenhouse.code || '-'}</td>
                <td className="px-4 py-4 align-top">
                  {greenhouse.size_value || '-'} {greenhouse.size_unit || ''}
                </td>
                <td className="px-4 py-4 align-top">{greenhouse.greenhouse_type || '-'}</td>
                <td className="px-4 py-4 align-top">
                  {greenhouse.temperature_min_c || '-'} / {greenhouse.temperature_max_c || '-'}
                </td>
                <td className="px-4 py-4 align-top">{greenhouse.humidity_target_percent || '-'}</td>
                <td className="px-4 py-4 align-top">
                  <StatusBadge value={greenhouse.status} />
                </td>
                <td className="px-4 py-4 align-top">{greenhouse.plant_count}</td>
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
                          onClick={() => onAction(actionName, greenhouse)}
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

export default GreenhousesTable

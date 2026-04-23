function PlantsFiltersBar({ action, filters, mode = 'plants', onChange, stages = [] }) {
  const isPlantMode = mode === 'plants'
  const title = isPlantMode ? 'Plant filters' : 'Area filters'

  return (
    <section className="rounded-lg border border-stone-200/80 bg-white/82 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Filters</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">{title}</h2>
        </div>
        {action}
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Search
          </span>
          <input
            type="search"
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder={isPlantMode ? 'Search plant, variety, stage, or notes' : 'Search name, code, crop, or notes'}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-400"
          />
        </label>

        {isPlantMode ? (
          <>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Status
              </span>
              <select
                value={filters.status}
                onChange={(event) => onChange({ status: event.target.value })}
                className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none"
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="harvested">Harvested</option>
                <option value="failed">Failed</option>
                <option value="removed">Removed</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Stage
              </span>
              <select
                value={filters.stage}
                onChange={(event) => onChange({ stage: event.target.value })}
                className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none"
              >
                <option value="">All stages</option>
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Area
              </span>
              <input
                type="search"
                value={filters.area_search}
                onChange={(event) => onChange({ area_search: event.target.value })}
                placeholder="Plot or greenhouse name"
                className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Harvest from
              </span>
              <input
                type="date"
                value={filters.expected_from}
                onChange={(event) => onChange({ expected_from: event.target.value })}
                className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Harvest to
              </span>
              <input
                type="date"
                value={filters.expected_to}
                onChange={(event) => onChange({ expected_to: event.target.value })}
                className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none"
              />
            </label>
          </>
        ) : null}

        {!isPlantMode ? (
          <label className="flex min-h-[3.25rem] items-center gap-3 rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-700">
            <input
              type="checkbox"
              checked={filters.show_archived}
              onChange={(event) => onChange({ show_archived: event.target.checked })}
            />
            Show inactive and archived areas
          </label>
        ) : null}
      </div>
    </section>
  )
}

export default PlantsFiltersBar

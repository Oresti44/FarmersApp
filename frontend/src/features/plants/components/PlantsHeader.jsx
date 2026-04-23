import SearchSelect from '../../../components/common/SearchSelect.jsx'

function PlantsHeader({ farms, filters, onChange, onNewPlant }) {
  const farmOptions = farms.map((farm) => ({
    id: farm.id,
    label: farm.name,
    subtitle: farm.location_text || 'Farm',
  }))

  return (
    <section className="rounded-[32px] border border-white/80 bg-[linear-gradient(135deg,rgba(244,239,228,0.96),rgba(233,244,234,0.96))] p-6 shadow-[0_28px_90px_rgba(82,97,69,0.12)] sm:p-8">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">Plants Page</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            Keep plants, areas, harvest history, and resource usage in one organized workspace.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-stone-600">
            Plants stay linked to exactly one area, plots stay single-occupancy, and the backend already returns
            nested farm, stage, area, and latest history summaries so the UI can stay compact.
          </p>
        </div>
        <div className="grid gap-4 rounded-[28px] border border-white/70 bg-white/86 p-5 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
            <SearchSelect
              label="Farm"
              value={filters.farm}
              options={farmOptions}
              onChange={(value) => onChange({ farm: value })}
              placeholder="All farms"
            />
            <button
              type="button"
              onClick={onNewPlant}
            className="self-end rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-stone-100 transition hover:bg-stone-800 hover:text-stone-200"
            >
              Add Plant
            </button>
          </div>
          <label className="block">
            <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
              Search
            </span>
            <input
              value={filters.search}
              onChange={(event) => onChange({ search: event.target.value })}
              placeholder="Plant, variety, or area"
              className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
            />
          </label>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Expected harvest from
              </span>
              <input
                type="date"
                value={filters.expected_from}
                onChange={(event) => onChange({ expected_from: event.target.value })}
                className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Expected harvest to
              </span>
              <input
                type="date"
                value={filters.expected_to}
                onChange={(event) => onChange({ expected_to: event.target.value })}
                className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm"
              />
            </label>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PlantsHeader

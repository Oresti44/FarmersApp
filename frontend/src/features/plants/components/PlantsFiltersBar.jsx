function PlantsFiltersBar({ filters, onChange, stages }) {
  return (
    <section className="sticky top-[5.5rem] z-20 rounded-[28px] border border-white/80 bg-white/88 p-4 shadow-[0_20px_60px_rgba(82,97,69,0.1)] backdrop-blur">
      <div className="flex min-w-0 flex-nowrap gap-3 overflow-x-auto pb-1">
        <select
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
          className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="harvested">Harvested</option>
          <option value="failed">Failed</option>
          <option value="removed">Removed</option>
        </select>
        <select
          value={filters.stage}
          onChange={(event) => onChange({ stage: event.target.value })}
          className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm"
        >
          <option value="">All stages</option>
          {stages.map((stage) => (
            <option key={stage.id} value={stage.id}>
              {stage.name}
            </option>
          ))}
        </select>
        <select
          value={filters.area_type}
          onChange={(event) => onChange({ area_type: event.target.value })}
          className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm"
        >
          <option value="">All areas</option>
          <option value="plot">Plots</option>
          <option value="greenhouse">Greenhouses</option>
        </select>
        <label className="inline-flex items-center gap-3 rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={filters.show_archived}
            onChange={(event) => onChange({ show_archived: event.target.checked })}
          />
          Show inactive and archived areas
        </label>
      </div>
    </section>
  )
}

export default PlantsFiltersBar

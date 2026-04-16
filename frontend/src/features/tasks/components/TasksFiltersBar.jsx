function TasksFiltersBar({ filters, onChange, workerOptions }) {
  return (
    <section className="sticky top-[5.5rem] z-20 rounded-[28px] border border-white/80 bg-white/88 p-4 shadow-[0_20px_60px_rgba(82,97,69,0.1)] backdrop-blur">
      <div className="flex min-w-0 flex-nowrap gap-3 overflow-x-auto pb-1">
        <select
          value={filters.status}
          onChange={(event) => onChange({ status: event.target.value })}
          className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-700 outline-none"
        >
          <option value="">All statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In progress</option>
          <option value="completed_pending_confirmation">Waiting confirmation</option>
          <option value="completed">Completed</option>
          <option value="postponed">Postponed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select
          value={filters.priority}
          onChange={(event) => onChange({ priority: event.target.value })}
          className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-700 outline-none"
        >
          <option value="">All priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="urgent">Urgent</option>
        </select>
        <select
          value={filters.category}
          onChange={(event) => onChange({ category: event.target.value })}
          className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-700 outline-none"
        >
          <option value="">All categories</option>
          <option value="general">General</option>
          <option value="irrigation">Irrigation</option>
          <option value="fertilizing">Fertilizing</option>
          <option value="spraying">Spraying</option>
          <option value="harvesting">Harvesting</option>
          <option value="inspection">Inspection</option>
          <option value="maintenance">Maintenance</option>
        </select>
        <select
          value={filters.worker}
          onChange={(event) => onChange({ worker: event.target.value })}
          className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-700 outline-none"
        >
          <option value="">All workers</option>
          {workerOptions.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.full_name}
            </option>
          ))}
        </select>
        <select
          value={filters.area_type}
          onChange={(event) => onChange({ area_type: event.target.value })}
          className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-700 outline-none"
        >
          <option value="">All areas</option>
          <option value="plot">Plots</option>
          <option value="greenhouse">Greenhouses</option>
        </select>
        <label className="inline-flex items-center gap-3 rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-700">
          <input
            type="checkbox"
            checked={filters.overdue}
            onChange={(event) => onChange({ overdue: event.target.checked })}
          />
          Overdue only
        </label>
      </div>
    </section>
  )
}

export default TasksFiltersBar

import SearchSelect from '../../../components/common/SearchSelect.jsx'

function TasksFiltersBar({
  actingRole,
  actingUserId,
  farms = [],
  filters,
  onChange,
  onNewTask,
  onRoleChange,
  onUserChange,
  plants = [],
  users = [],
  workerOptions,
}) {
  const userOptions = users.map((user) => ({
    id: user.id,
    label: user.full_name,
    subtitle: `${user.role} - ${user.email || user.username}`,
  }))
  const farmOptions = farms.map((farm) => ({
    id: farm.id,
    label: farm.name,
    subtitle: farm.location_text || 'Farm',
  }))
  const plantOptions = plants.map((plant) => ({
    id: plant.id,
    label: plant.name,
    subtitle: `${plant.variety || 'No variety'} - ${plant.area_summary?.name || 'No area'}`,
  }))

  return (
    <section className="rounded-lg border border-stone-200/80 bg-white/82 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Filters</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">Task filters</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {['manager', 'worker'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => onRoleChange(role)}
              className={`rounded-md px-3 py-2 text-sm font-semibold capitalize transition ${
                actingRole === role
                  ? 'bg-stone-950 text-white hover:bg-stone-900'
                  : 'bg-white text-stone-700 ring-1 ring-stone-200 hover:bg-stone-50'
              }`}
            >
              {role}
            </button>
          ))}
          <button
            type="button"
            onClick={onNewTask}
            className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-stone-900"
          >
            New Task
          </button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <SearchSelect
          label="Actor"
          value={actingUserId}
          options={userOptions}
          onChange={onUserChange}
          placeholder="Choose acting user"
        />
        <SearchSelect
          label="Farm"
          value={filters.farm}
          options={farmOptions}
          onChange={(value) => onChange({ farm: value })}
          placeholder="All farms"
        />
        <SearchSelect
          label="Plant"
          value={filters.plant}
          options={plantOptions}
          onChange={(value) => onChange({ plant: value })}
          placeholder="All plants"
        />
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Search
          </span>
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder="Title, plant, or note"
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-400"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Date from
          </span>
          <input
            type="date"
            value={filters.date_from}
            onChange={(event) => onChange({ date_from: event.target.value })}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Date to
          </span>
          <input
            type="date"
            value={filters.date_to}
            onChange={(event) => onChange({ date_to: event.target.value })}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none"
          />
        </label>
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
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In progress</option>
            <option value="completed_pending_confirmation">Waiting confirmation</option>
            <option value="completed">Completed</option>
            <option value="postponed">Postponed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Priority
          </span>
          <select
            value={filters.priority}
            onChange={(event) => onChange({ priority: event.target.value })}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none"
          >
            <option value="">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Category
          </span>
          <select
            value={filters.category}
            onChange={(event) => onChange({ category: event.target.value })}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none"
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
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Worker
          </span>
          <select
            value={filters.worker}
            onChange={(event) => onChange({ worker: event.target.value })}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none"
          >
            <option value="">All workers</option>
            {workerOptions.map((worker) => (
              <option key={worker.id} value={worker.id}>
                {worker.full_name}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Area
          </span>
          <select
            value={filters.area_type}
            onChange={(event) => onChange({ area_type: event.target.value })}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none"
          >
            <option value="">All areas</option>
            <option value="plot">Plots</option>
            <option value="greenhouse">Greenhouses</option>
          </select>
        </label>
        <label className="flex min-h-[3.25rem] items-center gap-3 rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-700">
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

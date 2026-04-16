import SearchSelect from '../../../components/common/SearchSelect.jsx'

function TasksHeader({
  actingRole,
  actingUserId,
  farms,
  filters,
  onFarmChange,
  onFiltersChange,
  onNewTask,
  onRoleChange,
  onUserChange,
  plants,
  users,
}) {
  const userOptions = users.map((user) => ({
    id: user.id,
    label: user.full_name,
    subtitle: `${user.role} · ${user.email || user.username}`,
  }))
  const farmOptions = farms.map((farm) => ({
    id: farm.id,
    label: farm.name,
    subtitle: farm.location_text || 'Farm',
  }))
  const plantOptions = plants.map((plant) => ({
    id: plant.id,
    label: plant.name,
    subtitle: `${plant.variety || 'No variety'} · ${plant.area_summary?.name || 'No area'}`,
  }))

  return (
    <section className="rounded-[32px] border border-white/80 bg-[linear-gradient(135deg,rgba(247,243,232,0.96),rgba(235,245,236,0.96))] p-6 shadow-[0_28px_90px_rgba(82,97,69,0.12)] sm:p-8">
      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">Tasks Page</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
            Schedule work, keep assignments clear, and close the task loop from one drawer-driven screen.
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-stone-600">
            Filters stay pinned, selectors stay searchable, and task responses already include plant, area,
            assignment, comment, and history context so the page remains fast and predictable.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {['manager', 'worker'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => onRoleChange(role)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  actingRole === role
                    ? 'bg-stone-950 text-white'
                    : 'bg-white/85 text-stone-700 ring-1 ring-stone-200 hover:bg-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 rounded-[28px] border border-white/70 bg-white/86 p-5 backdrop-blur">
          <div className="grid gap-4 md:grid-cols-2">
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
              onChange={onFarmChange}
              placeholder="All farms"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Search
              </span>
              <input
                value={filters.search}
                onChange={(event) => onFiltersChange({ search: event.target.value })}
                placeholder="Title, plant, or note"
                className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Date From
              </span>
              <input
                type="date"
                value={filters.date_from}
                onChange={(event) => onFiltersChange({ date_from: event.target.value })}
                className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
                Date To
              </span>
              <input
                type="date"
                value={filters.date_to}
                onChange={(event) => onFiltersChange({ date_to: event.target.value })}
                className="w-full rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-sm text-stone-800 outline-none"
              />
            </label>
          </div>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <SearchSelect
              label="Plant"
              value={filters.plant}
              options={plantOptions}
              onChange={(value) => onFiltersChange({ plant: value })}
              placeholder="All plants"
            />
            <button
              type="button"
              onClick={onNewTask}
              className="self-end rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              New Task
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TasksHeader

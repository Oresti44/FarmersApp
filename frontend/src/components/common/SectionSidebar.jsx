function formatLabel(value) {
  return value.replaceAll('_', ' ')
}

function SectionSidebar({ activeTab, collapsed, onChange, onToggle, tabs, title }) {
  return (
    <aside className="min-h-[calc(100vh-4.75rem)] border-r border-stone-200/80 bg-white/82 p-3 backdrop-blur lg:sticky lg:top-[4.75rem]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className={collapsed ? 'lg:hidden' : ''}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{title}</p>
          <p className="mt-1 text-sm text-stone-500">Sections</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md border border-stone-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-stone-700 transition hover:bg-stone-50"
        >
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>

      <nav className="grid gap-1">
        {tabs.map((tab) => {
          const label = formatLabel(tab)
          const isActive = activeTab === tab

          return (
            <button
              key={tab}
              type="button"
              title={label}
              onClick={() => onChange(tab)}
              className={`flex min-h-11 w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm font-semibold capitalize transition ${
                isActive
                  ? 'bg-stone-950 text-white hover:bg-stone-900'
                  : 'text-stone-600 hover:bg-stone-50 hover:text-stone-950'
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-current/20 text-xs uppercase">
                {label.slice(0, 1)}
              </span>
              <span className={collapsed ? 'lg:hidden' : ''}>{label}</span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

export default SectionSidebar

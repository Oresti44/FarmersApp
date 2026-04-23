function formatLabel(value) {
  return value.replaceAll('_', ' ')
}

function SectionSidebar({ activeTab, collapsed, onChange, onToggle, tabs, title }) {
  return (
    <aside className="border-r border-[#8ACBD0]/45 bg-white/82 p-3 backdrop-blur lg:sticky lg:top-[4.75rem] lg:h-[calc(100vh-4.75rem)] lg:self-start lg:overflow-y-auto">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className={collapsed ? 'lg:hidden' : ''}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#170C79]/65">{title}</p>
        </div>
        <button
          type="button"
          onClick={onToggle}
          className="rounded-md border border-[#8ACBD0]/70 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#170C79] transition hover:bg-[#8ACBD0]/20"
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
                  ? 'bg-[#8ACBD0] text-[#170C79] hover:bg-[#56B6C6]'
                  : 'text-[#170C79]/70 hover:bg-[#EFE3CA]/70 hover:text-[#170C79]'
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

function TasksTabs({ activeTab, onChange, tabs }) {
  return (
    <section className="overflow-x-auto">
      <div className="inline-flex min-w-full gap-2 rounded-[28px] border border-white/80 bg-white/84 p-2 shadow-[0_16px_50px_rgba(82,97,69,0.08)]">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`rounded-full px-4 py-2.5 text-sm font-semibold capitalize transition ${
              activeTab === tab
                ? 'bg-stone-950 text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-stone-900'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
    </section>
  )
}

export default TasksTabs

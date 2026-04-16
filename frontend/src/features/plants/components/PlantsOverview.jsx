function Card({ label, value }) {
  return (
    <article className="rounded-[24px] border border-white/80 bg-white/86 p-5 shadow-[0_20px_55px_rgba(82,97,69,0.08)]">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">{value}</p>
    </article>
  )
}

function ListSection({ items, title }) {
  return (
    <article className="rounded-[28px] border border-white/80 bg-white/86 p-5 shadow-[0_18px_50px_rgba(82,97,69,0.08)]">
      <h3 className="text-xl font-semibold tracking-tight text-stone-950">{title}</h3>
      <div className="mt-4 space-y-3">
        {(items || []).map((item, index) => (
          <div
            key={`${title}-${item.id || item.label || index}`}
            className="flex items-center justify-between rounded-[20px] bg-stone-50 px-4 py-3"
          >
            <span className="text-sm text-stone-700">
              {item.name || item.label || item.plant_name || item.resource_name}
            </span>
            <span className="text-sm font-semibold text-stone-950">
              {item.count || item.expected_harvest_date || item.harvested_at || item.used_at || item.quantity}
            </span>
          </div>
        ))}
      </div>
    </article>
  )
}

function PlantsOverview({ dashboard }) {
  if (!dashboard) {
    return null
  }

  const cards = [
    ['Active plants', dashboard.summary.active_plants],
    ['Plants near harvest', dashboard.summary.plants_near_harvest],
    ['Harvested plants', dashboard.summary.harvested_plants],
    ['Failed plants', dashboard.summary.failed_plants],
    ['Plots in use', dashboard.summary.plots_in_use],
    ['Greenhouses in use', dashboard.summary.greenhouses_in_use],
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {cards.map(([label, value]) => (
          <Card key={label} label={label} value={value} />
        ))}
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <ListSection title="By stage" items={dashboard.by_stage} />
        <ListSection title="By area" items={dashboard.by_area} />
        <ListSection title="Expected harvest soon" items={dashboard.expected_harvest_soon} />
        <ListSection title="Recent harvest records" items={dashboard.recent_harvest_records} />
        <ListSection title="Recent resource usage" items={dashboard.recent_resource_usage} />
      </section>
    </div>
  )
}

export default PlantsOverview

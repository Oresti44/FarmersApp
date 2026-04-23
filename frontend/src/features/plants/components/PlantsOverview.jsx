function Card({ label, value }) {
  return (
    <div className="border-b border-[#8ACBD0]/45 pb-4">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#170C79]/55">{label}</p>
      <p className="mt-2 text-4xl font-semibold tracking-tight text-[#170C79]">{value}</p>
    </div>
  )
}

function ListSection({ items, title }) {
  return (
    <article className="rounded-lg border border-white/80 bg-white/86 p-5 shadow-[0_18px_50px_rgba(23,12,121,0.08)]">
      <h3 className="text-xl font-semibold tracking-tight text-[#170C79]">{title}</h3>
      <div className="mt-4 divide-y divide-[#8ACBD0]/35">
        {(items || []).map((item, index) => (
          <div
            key={`${title}-${item.id || item.label || index}`}
            className="flex items-center justify-between py-3"
          >
            <span className="text-sm text-[#170C79]/75">
              {item.name || item.label || item.plant_name || item.resource_name}
            </span>
            <span className="text-sm font-semibold text-[#170C79]">
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
    ['Failed plants', dashboard.summary.failed_plants],
    ['Plots in use', dashboard.summary.plots_in_use],
    ['Greenhouses in use', dashboard.summary.greenhouses_in_use],
  ]

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
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

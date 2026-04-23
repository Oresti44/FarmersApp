const highlights = [
  {
    title: 'All core areas in one system',
    text: 'Finance, inventory, daily work, and plant management can live in one place so the team does not lose time switching between disconnected notes and spreadsheets.',
  },
  {
    title: 'Better day-to-day decisions',
    text: 'A simple dashboard helps farmers see what needs attention first, from stock levels to field activities, with less manual follow-up.',
  },
  {
    title: 'Clear team collaboration',
    text: 'Shared modules make responsibilities easier to divide between group members while still keeping the product consistent and easier to extend later.',
  },
]

const systemItems = [
  'Dashboard overview with farm status and quick navigation',
  'Finance tracking for income, expenses, and planning',
  'Inventory monitoring for supplies, tools, and stock visibility',
  'Work and task coordination for farm team activities',
  'Plant management for growth stages, care routines, and records',
]

const reasons = [
  'Reduce paperwork and keep operational information in one interface',
  'Support faster decisions with organized and visible data',
  'Help teams coordinate roles without confusion',
  'Make the platform easier to scale into a real working product',
]

function PlaceholderCard({ label, className = '' }) {
  return (
    <div
      className={`relative overflow-hidden rounded-[28px] border border-stone-300/70 bg-[linear-gradient(135deg,#d9ddd8_0%,#cfd4ce_100%)] ${className}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.32),transparent_38%)]" />
      <div className="relative flex h-full min-h-[220px] items-end p-6">
        <span className="rounded-full bg-white/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-600">
          {label}
        </span>
      </div>
    </div>
  )
}

function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.95fr]">
        <div className="rounded-[36px] border border-white/80 bg-white/82 p-8 shadow-[0_28px_90px_rgba(82,97,69,0.12)] backdrop-blur sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
            Dashboard
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-6xl">
            A clean control center for modern farm operations.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">
            FarmersApp brings farm planning, work coordination, inventory visibility, and
            plant-related information into one structured system. The goal is simple:
            reduce friction, improve clarity, and help farmers manage daily decisions with
            less manual effort.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href="#finance"
              className="rounded-full bg-stone-900 px-5 py-3 text-sm font-medium text-stone-100 transition hover:bg-stone-800 hover:text-stone-200"
            >
              Explore pages
            </a>
            <a
              href="#work"
              className="rounded-full border border-stone-300 bg-stone-50 px-5 py-3 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-100"
            >
              View team areas
            </a>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-[24px] bg-stone-50 p-5 ring-1 ring-stone-200/80"
              >
                <h2 className="text-lg font-semibold text-stone-900">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-stone-600">{item.text}</p>
              </article>
            ))}
          </div>
        </div>

        <PlaceholderCard label="Main visual placeholder" className="min-h-[420px]" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] border border-white/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(82,97,69,0.1)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
            What the system includes
          </p>
          <div className="mt-6 grid gap-3">
            {systemItems.map((item) => (
              <div
                key={item}
                className="rounded-[20px] bg-stone-50 px-4 py-4 text-stone-700 ring-1 ring-stone-200/80"
              >
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <PlaceholderCard label="Analytics placeholder" />
          <PlaceholderCard label="Farmer image placeholder" />
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[32px] border border-white/80 bg-[#f4f0e7] p-8 shadow-[0_24px_80px_rgba(82,97,69,0.08)]">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
            Why it matters
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950">
            Farmers need fast access to organized information.
          </h2>
          <p className="mt-5 text-base leading-8 text-stone-700">
            Farm work depends on timing, coordination, and accurate records. A structured
            digital system helps reduce missed tasks, improves planning, and gives teams a
            better foundation for smarter decisions over time.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/80 bg-white/82 p-8 shadow-[0_24px_80px_rgba(82,97,69,0.1)] backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
            Why farmers should use this
          </p>
          <div className="mt-6 grid gap-3">
            {reasons.map((item) => (
              <article
                key={item}
                className="rounded-[22px] bg-stone-50 px-5 py-4 ring-1 ring-stone-200/80"
              >
                <p className="text-stone-700">{item}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="grid gap-6 rounded-[32px] border border-white/80 bg-white/78 p-8 shadow-[0_24px_80px_rgba(82,97,69,0.08)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">
            Footer
          </p>
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-stone-950">
            FarmersApp platform placeholder
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-stone-600">
            This footer can later hold branding, partner information, contact details,
            social links, and legal content.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
            Quick links
          </h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-full bg-stone-100 px-4 py-3 text-sm text-stone-500">
              Placeholder link
            </div>
            <div className="rounded-full bg-stone-100 px-4 py-3 text-sm text-stone-500">
              Placeholder link
            </div>
            <div className="rounded-full bg-stone-100 px-4 py-3 text-sm text-stone-500">
              Placeholder link
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">
            Contact area
          </h3>
          <div className="mt-4 space-y-3">
            <div className="rounded-[20px] bg-stone-100 px-4 py-4 text-sm text-stone-500">
              Email placeholder
            </div>
            <div className="rounded-[20px] bg-stone-100 px-4 py-4 text-sm text-stone-500">
              Address placeholder
            </div>
            <div className="rounded-[20px] bg-stone-100 px-4 py-4 text-sm text-stone-500">
              Phone placeholder
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default DashboardPage

import { useEffect, useState } from 'react'

import heroImage from '../assets/home/hero.jpg'
import lastSectionImage from '../assets/home/last-section.jpg'
import operationsImage from '../assets/home/operations.jpg'
import productionImage from '../assets/home/production.jpg'
import EmptyState from '../components/common/EmptyState.jsx'
import financeApi from '../features/finance/api/financeApi.js'
import inventoryApi from '../features/inventory/api/inventoryApi.js'
import plantsApi from '../features/plants/api/plantsApi.js'
import tasksApi from '../features/tasks/api/tasksApi.js'

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(Number(value || 0))
}

function Metric({ label, value }) {
  return (
    <div className="border-b border-[#b7d387]/45 pb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#22331f]/55">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[#22331f]">{value}</p>
    </div>
  )
}

function ListPanel({ items, title }) {
  return (
    <section className="rounded-[28px] border border-[#dfe6ca] bg-white/92 p-5 shadow-[0_24px_70px_rgba(34,51,31,0.08)]">
      <h2 className="text-xl font-semibold tracking-tight text-[#22331f]">{title}</h2>
      <div className="mt-4 divide-y divide-[#b7d387]/35">
        {items?.length ? (
          items.slice(0, 5).map((item, index) => (
            <div
              key={`${title}-${item.id || item.title || item.name || index}`}
              className="flex items-center justify-between gap-3 py-3"
            >
              <span className="text-sm font-medium text-[#22331f]">
                {item.title || item.name || item.item_name || item.plant_name}
              </span>
              <span className="text-sm text-[#22331f]/65">
                {item.status || item.movement_type || item.expected_harvest_date || item.scheduled_start_at || ''}
              </span>
            </div>
          ))
        ) : (
          <p className="py-3 text-sm text-[#22331f]/65">No items to show.</p>
        )}
      </div>
    </section>
  )
}

function HomeFeatureCard({ summary, title }) {
  return (
    <article className="rounded-[28px] border border-[#dfe6ca] bg-white/90 p-5 shadow-[0_16px_45px_rgba(34,51,31,0.06)]">
      <h2 className="text-xl font-semibold tracking-tight text-[#22331f]">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-[#22331f]/72">{summary}</p>
    </article>
  )
}

function StepCard({ description, number, title }) {
  return (
    <div className="rounded-[24px] border border-[#dfe6ca] bg-white/88 p-5 shadow-sm">
      <span className="inline-flex rounded-full bg-[#eef4e5] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#5b6f43]">
        Step {number}
      </span>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-[#22331f]">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-[#22331f]/72">{description}</p>
    </div>
  )
}

function PhotoTile({ alt, className = '', src }) {
  return (
    <figure
      className={`group relative block h-full w-full overflow-hidden border border-[#dfe6ca] bg-[#f7f3e8] shadow-[0_20px_60px_rgba(34,51,31,0.12)] ${className}`}
    >
      <img
        src={src}
        alt={alt}
        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
      />
    </figure>
  )
}

function PublicDashboard() {
  const features = [
    {
      title: 'Tasks',
      summary: 'Plan the day, assign work clearly, and verify completion without losing track of what matters in the field.',
    },
    {
      title: 'Plants',
      summary: 'Keep crop stages, harvest timing, and plant history organized in one place the team can actually use.',
    },
    {
      title: 'Inventory',
      summary: 'See stock levels, material usage, and movement history before shortages slow down the operation.',
    },
    {
      title: 'Finance',
      summary: 'Keep costs, sales, and daily decisions tied to real farm activity instead of scattered across separate tools.',
    },
  ]

  return (
    <div className="space-y-8">
      <section className="relative left-1/2 right-1/2 -mt-6 w-screen -translate-x-1/2 border-b border-[#dfe6ca] bg-[linear-gradient(180deg,rgba(249,246,237,0.98),rgba(239,244,228,0.98))]">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.02fr_0.98fr] lg:px-8 lg:py-14">
          <div className="relative flex min-h-[24rem] items-end overflow-hidden pb-2 pr-6 lg:pr-10">
            <div className="pointer-events-none absolute bottom-[-3rem] right-[-2rem] h-52 w-52 rounded-full bg-[#d6e7b4]/80 blur-3xl" />
            <div className="pointer-events-none absolute right-0 top-[10%] hidden h-[78%] w-px bg-[#22331f]/12 lg:block" />
            <div className="relative z-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-[#6d9143]">
                Farm Insight
              </p>
              <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-[#22331f] sm:text-6xl">
                Run farm operations from one clear, practical control room.
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-[#22331f]/74">
                Farm Insight gives managers and workers one place to coordinate tasks, follow crop
                progress, track stock, and confirm completed work without jumping between disconnected
                sheets and chat threads.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {['Task verification', 'Crop tracking', 'Inventory visibility', 'Financial overview'].map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/78 px-4 py-2 text-sm font-semibold text-[#22331f] ring-1 ring-[#dfe6ca]"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#signup"
                  className="rounded-md bg-[#6d9143] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#5d7d38]"
                >
                  Create workspace
                </a>
                <a
                  href="#login"
                  className="rounded-md border border-[#6d9143] bg-white/82 px-5 py-3 text-sm font-semibold text-[#22331f] transition hover:bg-white"
                >
                  Log in
                </a>
              </div>
            </div>
          </div>

          <div className="grid min-h-[26rem] gap-4 lg:grid-cols-[0.95fr_0.85fr]">
            <PhotoTile
              alt="Aerial farm overview"
              className="min-h-[26rem] rounded-[34px]"
              src={heroImage}
            />
            <div className="grid min-h-[26rem] gap-4">
              <PhotoTile
                alt="Tractor working in field"
                className="min-h-[12rem] rounded-[34px]"
                src={operationsImage}
              />
              <PhotoTile
                alt="Fresh produce basket"
                className="min-h-[12rem] rounded-[34px]"
                src={productionImage}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-0">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <HomeFeatureCard
              key={feature.title}
              summary={feature.summary}
              title={feature.title}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[32px] border border-[#dfe6ca] bg-white/90 p-6 shadow-[0_20px_60px_rgba(34,51,31,0.07)]">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6d9143]">How it works</p>
          <div className="mt-5 grid gap-4">
            <StepCard
              number="1"
              title="Plan the day"
              description="Create tasks around the real crop area, assign the right people, and keep the plan visible to the whole team."
            />
            <StepCard
              number="2"
              title="Track the work"
              description="Update plant records, resource usage, harvests, and comments while work is happening so the data stays useful."
            />
            <StepCard
              number="3"
              title="Verify completion"
              description="Managers can review completed tasks, confirm the result, and keep the daily schedule accurate without guesswork."
            />
          </div>
        </div>

        <article className="rounded-[32px] border border-[#dfe6ca] bg-white/90 p-6 shadow-[0_20px_60px_rgba(34,51,31,0.09)] sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#6d9143]">
            Field visibility
          </p>
          <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-[#22331f] sm:text-4xl">
            See the full day from assigned work to confirmed completion.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#22331f]/74">
            Farm Insight connects worker execution, crop activity, and manager verification in one
            workflow, so the team always knows what has started, what is waiting, and what is
            actually done.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {['Manager review', 'Worker updates', 'Real task status'].map((item) => (
              <span
                key={item}
                className="rounded-full bg-[#eef4e5] px-4 py-2 text-sm font-semibold text-[#22331f] ring-1 ring-[#dfe6ca]"
              >
                {item}
              </span>
            ))}
          </div>
          <div className="mt-6 overflow-hidden rounded-[28px] border border-[#dfe6ca]">
            <img
              src={lastSectionImage}
              alt="Farm team working in the field"
              className="h-[18rem] w-full object-cover sm:h-[20rem]"
            />
          </div>
        </article>
      </section>
    </div>
  )
}

function DashboardPage({ session }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(session))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) {
      return
    }

    let active = true
    const farm = session.farm?.id || ''

    async function load() {
      setLoading(true)
      setError('')
      try {
        const [finance, inventory, tasks, plants] = await Promise.all([
          financeApi.dashboard({ farm }),
          inventoryApi.dashboard({ farm }),
          tasksApi.dashboard({ farm }),
          plantsApi.dashboard({ farm }),
        ])
        if (active) {
          setData({ finance, inventory, tasks, plants })
        }
      } catch (caughtError) {
        if (active) {
          setError(caughtError.message || 'Unable to load dashboard.')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()
    return () => {
      active = false
    }
  }, [session])

  if (!session) {
    return <PublicDashboard />
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-[#b7d387]/45 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-[#22331f]">Dashboard</h1>
      </div>

      {error ? <EmptyState title="Dashboard unavailable" description={error} /> : null}
      {loading ? (
        <EmptyState
          title="Loading dashboard"
          description="Collecting finance, inventory, task, and plant signals."
        />
      ) : null}

      {!loading && !error && data ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric label="Net balance" value={formatMoney(data.finance.summary.net_balance)} />
            <Metric label="Low stock items" value={data.inventory.summary.low_stock_items} />
            <Metric label="Tasks today" value={data.tasks.summary.tasks_today} />
            <Metric label="Active plants" value={data.plants.summary.active_plants} />
          </section>

          <section className="grid gap-5 xl:grid-cols-2">
            <ListPanel title="Needs attention" items={data.tasks.needs_attention} />
            <ListPanel title="Low stock watchlist" items={data.inventory.low_stock_items} />
            <ListPanel title="Upcoming tasks" items={data.tasks.upcoming_tasks} />
            <ListPanel title="Expected harvest soon" items={data.plants.expected_harvest_soon} />
          </section>
        </>
      ) : null}
    </div>
  )
}

export default DashboardPage

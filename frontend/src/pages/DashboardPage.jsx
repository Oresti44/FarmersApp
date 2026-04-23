import { useEffect, useState } from 'react'

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
    <div className="border-b border-[#8ACBD0]/45 pb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#170C79]/55">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[#170C79]">{value}</p>
    </div>
  )
}

function ListPanel({ items, title }) {
  return (
    <section className="rounded-lg border border-white/80 bg-white/86 p-5 shadow-[0_20px_60px_rgba(23,12,121,0.08)]">
      <h2 className="text-xl font-semibold tracking-tight text-[#170C79]">{title}</h2>
      <div className="mt-4 divide-y divide-[#8ACBD0]/35">
        {items?.length ? (
          items.slice(0, 5).map((item, index) => (
            <div key={`${title}-${item.id || item.title || item.name || index}`} className="flex items-center justify-between gap-3 py-3">
              <span className="text-sm font-medium text-[#170C79]">{item.title || item.name || item.item_name || item.plant_name}</span>
              <span className="text-sm text-[#170C79]/65">{item.status || item.movement_type || item.expected_harvest_date || item.scheduled_start_at || ''}</span>
            </div>
          ))
        ) : (
          <p className="py-3 text-sm text-[#170C79]/65">No items to show.</p>
        )}
      </div>
    </section>
  )
}

function PublicDashboard() {
  return (
    <section className="rounded-lg border border-white/80 bg-white/86 p-8 shadow-[0_24px_80px_rgba(23,12,121,0.12)]">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#56B6C6]">Dashboard</p>
      <h1 className="mt-4 max-w-3xl text-5xl font-semibold tracking-tight text-[#170C79]">
        Farm operations in one connected workspace.
      </h1>
      <p className="mt-5 max-w-2xl text-base leading-8 text-[#170C79]/70">
        Log in to manage finance, inventory, tasks, and plant records from the working dashboard.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <a href="#login" className="rounded-md bg-[#56B6C6] px-5 py-3 text-sm font-semibold text-[#170C79] transition hover:bg-[#8ACBD0]">
          Login
        </a>
        <a href="#signup" className="rounded-md border border-[#56B6C6] bg-white/70 px-5 py-3 text-sm font-semibold text-[#170C79] transition hover:bg-white">
          Sign up
        </a>
      </div>
    </section>
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
      <div className="border-b border-[#8ACBD0]/45 pb-4">
        <h1 className="text-3xl font-semibold tracking-tight text-[#170C79]">Dashboard</h1>
      </div>

      {error ? <EmptyState title="Dashboard unavailable" description={error} /> : null}
      {loading ? <EmptyState title="Loading dashboard" description="Collecting finance, inventory, task, and plant signals." /> : null}

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

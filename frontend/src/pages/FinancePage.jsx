import { useMemo, useState } from 'react'

import DrawerShell from '../components/common/DrawerShell.jsx'
import EmptyState from '../components/common/EmptyState.jsx'
import SectionSidebar from '../components/common/SectionSidebar.jsx'
import financeApi from '../features/finance/api/financeApi.js'
import useFinance from '../features/finance/hooks/useFinance.js'

const FINANCE_TABS = ['overview', 'transactions', 'expenses', 'sales', 'partners', 'statistics']

function statusClasses(status) {
  const normalized = String(status || '').toLowerCase()
  if (['paid', 'active', 'completed'].includes(normalized)) {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  }
  if (['pending', 'draft', 'paused'].includes(normalized)) {
    return 'bg-amber-50 text-amber-700 ring-amber-200'
  }
  if (['overdue', 'cancelled', 'ended'].includes(normalized)) {
    return 'bg-rose-50 text-rose-700 ring-rose-200'
  }
  return 'bg-[#8ACBD0]/25 text-[#170C79] ring-[#8ACBD0]'
}

function formatLabel(value) {
  return String(value || '').replaceAll('_', ' ')
}

function formatMoney(value) {
  return new Intl.NumberFormat('en-US', { currency: 'USD', style: 'currency' }).format(Number(value || 0))
}

function formatDate(value) {
  if (!value) {
    return 'Not set'
  }
  const dateValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value
  return new Date(dateValue).toLocaleDateString()
}

function inputClassName() {
  return 'w-full rounded-md border border-[#8ACBD0]/70 bg-white px-3 py-3 text-sm text-[#170C79] outline-none transition focus:border-[#56B6C6]'
}

function SectionHeading({ action, title }) {
  return (
    <div className="flex flex-col gap-3 border-b border-[#8ACBD0]/45 pb-4 md:flex-row md:items-end md:justify-between">
      <h2 className="text-2xl font-semibold tracking-tight text-[#170C79]">{title}</h2>
      {action}
    </div>
  )
}

function ActionButton({ children, disabled = false, onClick, tone = 'primary' }) {
  const className =
    tone === 'soft'
      ? 'rounded-md border border-[#56B6C6]/60 bg-white px-4 py-2 text-sm font-semibold text-[#170C79] transition hover:bg-[#8ACBD0]/20 disabled:cursor-not-allowed disabled:opacity-55'
      : 'rounded-md bg-[#56B6C6] px-4 py-2 text-sm font-semibold text-[#170C79] transition hover:bg-[#8ACBD0] disabled:cursor-not-allowed disabled:opacity-55'
  return (
    <button type="button" disabled={disabled} onClick={onClick} className={className}>
      {children}
    </button>
  )
}

function StatusPill({ value }) {
  return (
    <span className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ring-1 ${statusClasses(value)}`}>
      {formatLabel(value)}
    </span>
  )
}

function Metric({ label, value, tone }) {
  return (
    <div className="border-b border-[#8ACBD0]/45 pb-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#170C79]/55">{label}</p>
        {tone ? (
          <span className="shrink-0 rounded-full bg-[#8ACBD0]/25 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-[#170C79]">
            {tone}
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight text-[#170C79]">{value}</p>
    </div>
  )
}

function Field({ children, label }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#170C79]/55">{label}</span>
      {children}
    </label>
  )
}

function OverviewSection({ dashboard, onNewTransaction }) {
  const summary = dashboard?.summary || {}
  const netBalance = Number(summary.net_balance || 0)

  return (
    <div className="space-y-6">
      <SectionHeading action={<ActionButton onClick={onNewTransaction}>New transaction</ActionButton>} title="Overview" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Net balance" value={formatMoney(summary.net_balance)} tone={netBalance >= 0 ? 'positive' : 'warning'} />
        <Metric label="Outstanding receivables" value={formatMoney(summary.outstanding_receivables)} tone="warning" />
        <Metric label="Upcoming recurring costs" value={formatMoney(summary.upcoming_recurring_costs)} tone="planned" />
        <Metric label="Expense records this month" value={summary.expense_records_this_month || 0} />
      </section>
    </div>
  )
}

function matchesFilters(transaction, filters) {
  const haystack = [
    transaction.source_summary?.title,
    transaction.source_summary?.partner_name,
    transaction.source_summary?.category_name,
    transaction.note,
    transaction.payment_method,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (filters.search && !haystack.includes(filters.search.toLowerCase())) {
    return false
  }
  if (filters.transaction_type && transaction.transaction_type !== filters.transaction_type) {
    return false
  }
  if (filters.payment_method && transaction.payment_method !== filters.payment_method) {
    return false
  }
  if (filters.date_from && transaction.transaction_date < filters.date_from) {
    return false
  }
  if (filters.date_to && transaction.transaction_date > filters.date_to) {
    return false
  }
  return true
}

function TransactionFilters({ filters, onChange, onNewTransaction }) {
  return (
    <section className="rounded-lg border border-white/80 bg-white/86 p-4 shadow-sm">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h3 className="text-lg font-semibold tracking-tight text-[#170C79]">Filters</h3>
        <ActionButton onClick={onNewTransaction}>New transaction</ActionButton>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Field label="Search">
          <input className={inputClassName()} value={filters.search} onChange={(event) => onChange({ search: event.target.value })} />
        </Field>
        <Field label="Type">
          <select className={inputClassName()} value={filters.transaction_type} onChange={(event) => onChange({ transaction_type: event.target.value })}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </Field>
        <Field label="Method">
          <select className={inputClassName()} value={filters.payment_method} onChange={(event) => onChange({ payment_method: event.target.value })}>
            <option value="">All</option>
            <option value="cash">Cash</option>
            <option value="bank_transfer">Bank transfer</option>
            <option value="card">Card</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="From">
          <input className={inputClassName()} type="date" value={filters.date_from} onChange={(event) => onChange({ date_from: event.target.value })} />
        </Field>
        <Field label="To">
          <input className={inputClassName()} type="date" value={filters.date_to} onChange={(event) => onChange({ date_to: event.target.value })} />
        </Field>
      </div>
    </section>
  )
}

function TransactionsSection({ filters, onChangeFilters, onNewTransaction, onView, transactions }) {
  const visibleTransactions = transactions.filter((transaction) => matchesFilters(transaction, filters))

  return (
    <div className="space-y-6">
      <SectionHeading title="Transactions" />
      <TransactionFilters filters={filters} onChange={onChangeFilters} onNewTransaction={onNewTransaction} />
      <section className="rounded-lg border border-white/80 bg-white/86 shadow-[0_20px_60px_rgba(23,12,121,0.08)]">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-[#8ACBD0]/35 text-sm">
            <thead className="bg-[#EFE3CA]/70 text-left text-xs font-semibold uppercase tracking-[0.14em] text-[#170C79]/60">
              <tr>
                <th className="px-4 py-3">Reference</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#8ACBD0]/25 bg-white">
              {visibleTransactions.map((transaction) => (
                <tr key={transaction.id} className="align-top text-[#170C79]/75">
                  <td className="px-4 py-4">
                    <button type="button" onClick={() => onView(transaction)} className="text-left">
                      <span className="block font-semibold text-[#170C79]">{transaction.source_summary?.title || 'Finance transaction'}</span>
                      <span className="mt-1 block text-xs uppercase tracking-[0.12em] text-[#170C79]/50">{formatLabel(transaction.payment_method || 'no method')}</span>
                    </button>
                  </td>
                  <td className="px-4 py-4">{formatDate(transaction.transaction_date)}</td>
                  <td className={transaction.transaction_type === 'income' ? 'px-4 py-4 font-semibold text-emerald-700' : 'px-4 py-4 font-semibold text-[#170C79]'}>
                    {transaction.transaction_type === 'income' ? '+' : '-'}
                    {formatMoney(transaction.amount)}
                  </td>
                  <td className="px-4 py-4 capitalize">{formatLabel(transaction.transaction_type)}</td>
                  <td className="px-4 py-4 capitalize">{formatLabel(transaction.source_type)}</td>
                  <td className="px-4 py-4">
                    <StatusPill value={transaction.source_summary?.status || 'recorded'} />
                  </td>
                  <td className="px-4 py-4">
                    <ActionButton onClick={() => onView(transaction)} tone="soft">View</ActionButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!visibleTransactions.length ? <div className="p-5"><EmptyState title="No transactions found" description="Adjust filters or create a transaction." /></div> : null}
        </div>
      </section>
    </div>
  )
}

function ExpensesSection({ categoryBreakdown, expenseRecords, recurringExpenses }) {
  const recurringTotal = recurringExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)

  return (
    <div className="space-y-6">
      <SectionHeading title="Expenses" />
      <section className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-[0_20px_60px_rgba(23,12,121,0.08)]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#170C79]/55">Recurring expenses</p>
              <h3 className="mt-2 text-xl font-semibold text-[#170C79]">{formatMoney(recurringTotal)}</h3>
            </div>
            <StatusPill value={`${recurringExpenses.length} plans`} />
          </div>
          <div className="mt-4 divide-y divide-[#8ACBD0]/35">
            {recurringExpenses.slice(0, 8).map((expense) => (
              <div key={expense.id} className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-[#170C79]">{expense.title}</p>
                  <p className="mt-1 text-sm text-[#170C79]/60">
                    {expense.category?.name || 'Uncategorized'} / {formatLabel(expense.frequency)} / due {formatDate(expense.next_due_date)}
                  </p>
                </div>
                <div className="flex items-center gap-3 md:justify-end">
                  <p className="font-semibold text-[#170C79]">{formatMoney(expense.amount)}</p>
                  <StatusPill value={expense.status} />
                </div>
              </div>
            ))}
            {!recurringExpenses.length ? <p className="py-3 text-sm text-[#170C79]/65">No recurring expenses recorded.</p> : null}
          </div>
        </div>
        <div className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-[0_20px_60px_rgba(23,12,121,0.08)]">
          <h3 className="text-xl font-semibold tracking-tight text-[#170C79]">Latest expense categories</h3>
          <div className="mt-4 divide-y divide-[#8ACBD0]/35">
            {categoryBreakdown.map((category) => (
              <div key={category.name} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="font-semibold text-[#170C79]">{category.name}</p>
                  <p className="mt-1 text-sm text-[#170C79]/60">{category.count} records</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#170C79]">{formatMoney(category.amount)}</p>
                  <p className="mt-1 text-sm text-[#170C79]/60">{Number(category.share || 0)}%</p>
                </div>
              </div>
            ))}
            {!categoryBreakdown.length ? <p className="py-3 text-sm text-[#170C79]/65">No category totals yet.</p> : null}
          </div>
        </div>
      </section>
      <section className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-[0_20px_60px_rgba(23,12,121,0.08)]">
        <h3 className="text-xl font-semibold tracking-tight text-[#170C79]">Latest expenses</h3>
        <div className="mt-4 divide-y divide-[#8ACBD0]/35">
          {expenseRecords.slice(0, 8).map((expense) => (
            <div key={expense.id} className="flex flex-col gap-3 py-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-semibold text-[#170C79]">{expense.title}</p>
                <p className="mt-1 text-sm text-[#170C79]/60">{expense.category?.name || 'Uncategorized'} / {formatDate(expense.expense_date)}</p>
              </div>
              <div className="flex items-center gap-3 md:justify-end">
                <p className="font-semibold text-[#170C79]">{formatMoney(expense.amount)}</p>
                <StatusPill value={expense.payment_status} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

function SalesSection({ salesDeals, salesDeliveries }) {
  const deliveriesByDeal = salesDeliveries.reduce((map, delivery) => {
    const dealId = delivery.deal_summary?.id || delivery.deal
    if (!dealId) {
      return map
    }
    map.set(dealId, [...(map.get(dealId) || []), delivery])
    return map
  }, new Map())
  const uniqueDeals = [...new Map(salesDeals.map((deal) => [deal.id, deal])).values()]

  return (
    <div className="space-y-6">
      <SectionHeading title="Sales" />
      <section className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-[0_20px_60px_rgba(23,12,121,0.08)]">
        <h3 className="text-xl font-semibold tracking-tight text-[#170C79]">Sales records</h3>
        <div className="mt-4 divide-y divide-[#8ACBD0]/35">
          {uniqueDeals.map((deal) => {
            const deliveries = deliveriesByDeal.get(deal.id) || []
            const total = deliveries.reduce((sum, delivery) => sum + Number(delivery.total_amount || 0), 0)
            const latestDelivery = deliveries[0]
            return (
              <div key={deal.id} className="flex flex-col gap-3 py-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-[#170C79]">{deal.title}</p>
                  <p className="mt-1 text-sm text-[#170C79]/60">
                    {deal.product_name} for {deal.buyer?.name || 'No buyer'} / {deliveries.length || deal.delivery_count || 0} delivery
                    {(deliveries.length || deal.delivery_count || 0) === 1 ? '' : 'ies'}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2 md:items-end">
                  <p className="font-semibold text-[#170C79]">{formatMoney(total || Number(deal.agreed_quantity || 0) * Number(deal.unit_price || 0))}</p>
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <StatusPill value={latestDelivery?.payment_status || deal.status} />
                    <span className="text-sm text-[#170C79]/60">{latestDelivery ? formatDate(latestDelivery.scheduled_date) : formatDate(deal.start_date)}</span>
                  </div>
                </div>
              </div>
            )
          })}
          {!uniqueDeals.length ? <p className="py-3 text-sm text-[#170C79]/65">No sales records yet.</p> : null}
        </div>
      </section>
    </div>
  )
}

function PartnersSection({ onNewPartner, partners }) {
  return (
    <div className="space-y-6">
      <SectionHeading action={<ActionButton onClick={onNewPartner}>Add partner</ActionButton>} title="Partners" />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {partners.map((partner) => (
          <article key={partner.id} className="rounded-lg border border-white/80 bg-white/86 p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-lg font-semibold text-[#170C79]">{partner.name}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#170C79]/55">{formatLabel(partner.partner_type)}</p>
              </div>
              <StatusPill value="active" />
            </div>
            <p className="mt-4 text-sm leading-6 text-[#170C79]/70">{partner.notes || 'No notes recorded.'}</p>
            <div className="mt-4 space-y-1 text-sm text-[#170C79]/65">
              <p>{partner.contact_person || 'No contact person'}</p>
              <p>{partner.email || 'No email'}</p>
              <p>{partner.phone || 'No phone'}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}

function periodStart(period) {
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() - (period === 'week' ? 7 : 30))
  return date
}

function formatPercent(value) {
  return `${Number(value || 0).toFixed(1)}%`
}

const PIE_COLORS = ['#56B6C6', '#170C79', '#C17C74', '#6F9E75', '#D6A94A', '#8ACBD0']

function buildPieGradient(rows) {
  if (!rows.length) {
    return '#EFE3CA'
  }
  let cursor = 0
  const stops = rows.map((row, index) => {
    const start = cursor
    cursor += row.share
    return `${PIE_COLORS[index % PIE_COLORS.length]} ${start}% ${cursor}%`
  })
  return `conic-gradient(${stops.join(', ')})`
}

function groupMoney(rows, getKey, getLabel) {
  const grouped = rows.reduce((map, row) => {
    const key = getKey(row)
    const current = map.get(key) || { amount: 0, count: 0, label: getLabel(row) }
    current.amount += Number(row.amount || row.total_amount || 0)
    current.count += 1
    map.set(key, current)
    return map
  }, new Map())
  const total = [...grouped.values()].reduce((sum, row) => sum + row.amount, 0)
  return [...grouped.values()]
    .map((row) => ({ ...row, share: total ? (row.amount / total) * 100 : 0 }))
    .sort((left, right) => right.amount - left.amount)
}

function DistributionPanel({ emptyLabel, rows, title }) {
  return (
    <section className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-sm">
      <h3 className="text-xl font-semibold tracking-tight text-[#170C79]">{title}</h3>
      <div className="mt-5 grid gap-5 lg:grid-cols-[11rem_minmax(0,1fr)]">
        <div className="aspect-square rounded-full ring-1 ring-[#8ACBD0]/50" style={{ background: buildPieGradient(rows) }} />
        <div className="divide-y divide-[#8ACBD0]/35">
          {rows.map((row, index) => (
            <div key={row.label} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#170C79]">
                  <span className="mr-2 inline-block h-3 w-3 rounded-sm" style={{ background: PIE_COLORS[index % PIE_COLORS.length] }} />
                  {row.label}
                </p>
                <p className="mt-1 text-sm text-[#170C79]/60">{row.count} record{row.count === 1 ? '' : 's'}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-semibold text-[#170C79]">{formatMoney(row.amount)}</p>
                <p className="mt-1 text-sm text-[#170C79]/60">{formatPercent(row.share)}</p>
              </div>
            </div>
          ))}
          {!rows.length ? <p className="py-3 text-sm text-[#170C79]/65">{emptyLabel}</p> : null}
        </div>
      </div>
    </section>
  )
}

function StatisticsSection({ expenseRecords, recurringExpenses, salesDeliveries }) {
  const [period, setPeriod] = useState('week')
  const start = periodStart(period)
  const expenses = expenseRecords.filter((expense) => new Date(`${expense.expense_date}T00:00:00`) >= start)
  const recurringDue = recurringExpenses.filter((expense) => new Date(`${expense.next_due_date}T00:00:00`) >= start)
  const sales = salesDeliveries.filter((delivery) => new Date(`${delivery.scheduled_date}T00:00:00`) >= start)
  const expenseTotal = expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  const recurringTotal = recurringDue.reduce((sum, expense) => sum + Number(expense.amount || 0), 0)
  const salesTotal = sales.reduce((sum, delivery) => sum + Number(delivery.total_amount || 0), 0)
  const expenseRows = groupMoney(expenses, (expense) => expense.category?.id || expense.category?.name || 'uncategorized', (expense) => expense.category?.name || 'Uncategorized')
  const buyerRows = groupMoney(sales, (delivery) => delivery.deal_summary?.buyer_name || 'No buyer', (delivery) => delivery.deal_summary?.buyer_name || 'No buyer')

  return (
    <div className="space-y-6">
      <SectionHeading
        action={
          <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#EFE3CA]/70 p-1">
            {[
              ['week', 'Week'],
              ['month', 'Month'],
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setPeriod(value)}
                className={`rounded-md px-4 py-2 text-sm font-semibold ${period === value ? 'bg-[#8ACBD0] text-[#170C79]' : 'text-[#170C79]/70'}`}
              >
                {label}
              </button>
            ))}
          </div>
        }
        title="Statistics"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Expense total" value={formatMoney(expenseTotal)} />
        <Metric label="Expense records" value={expenses.length} />
        <Metric label="Sales total" value={formatMoney(salesTotal)} />
        <Metric label="Recurring due" value={formatMoney(recurringTotal)} />
      </section>
      <section className="rounded-lg border border-white/80 bg-white/86 p-6 shadow-sm">
        <h3 className="text-xl font-semibold tracking-tight text-[#170C79]">Expense vs sales</h3>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="border-b border-[#8ACBD0]/45 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#170C79]/55">Expense share</p>
            <div className="mt-3 h-3 rounded-full bg-[#EFE3CA]">
              <div className="h-3 rounded-full bg-[#170C79]" style={{ width: `${Math.min(100, (expenseTotal / Math.max(expenseTotal + salesTotal, 1)) * 100)}%` }} />
            </div>
            <p className="mt-2 text-sm text-[#170C79]/60">{formatPercent((expenseTotal / Math.max(expenseTotal + salesTotal, 1)) * 100)} of recorded flow</p>
          </div>
          <div className="border-b border-[#8ACBD0]/45 pb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#170C79]/55">Sales share</p>
            <div className="mt-3 h-3 rounded-full bg-[#EFE3CA]">
              <div className="h-3 rounded-full bg-[#56B6C6]" style={{ width: `${Math.min(100, (salesTotal / Math.max(expenseTotal + salesTotal, 1)) * 100)}%` }} />
            </div>
            <p className="mt-2 text-sm text-[#170C79]/60">{formatPercent((salesTotal / Math.max(expenseTotal + salesTotal, 1)) * 100)} of recorded flow</p>
          </div>
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-2">
        <DistributionPanel emptyLabel="No expenses in this period." rows={expenseRows} title="Expense distribution" />
        <DistributionPanel emptyLabel="No sales in this period." rows={buyerRows} title="Sales by buyer" />
      </div>
    </div>
  )
}

function NewTransactionDrawer({ categories, farmId, onClose, onSaved, open, partners, userId }) {
  const [kind, setKind] = useState('sale')
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState({
    amount: '',
    category_id: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
    partner_id: '',
    payment_method: 'bank_transfer',
    product_name: '',
    quantity: '',
    quantity_unit: 'kg',
    title: '',
    unit_price: '',
  })
  const [error, setError] = useState('')

  if (!open) {
    return null
  }

  async function submit() {
    if (saving) {
      return
    }
    setError('')
    setSaving(true)
    try {
      if (kind === 'expense') {
        const expense = await financeApi.createExpenseRecord({
          farm_id: farmId,
          category_id: draft.category_id,
          partner_id: draft.partner_id || null,
          title: draft.title,
          description: draft.description,
          expense_kind: 'manual',
          amount: draft.amount,
          expense_date: draft.date,
          due_date: draft.date,
          payment_status: 'paid',
          recorded_by_id: userId,
        })
        await financeApi.createTransaction({
          farm_id: farmId,
          transaction_type: 'expense',
          source_type: 'expense_record',
          expense_record: expense.id,
          sales_delivery: null,
          transaction_date: draft.date,
          amount: draft.amount,
          payment_method: draft.payment_method,
          note: draft.description,
          created_by_id: userId,
        })
      } else {
        const quantity = Number(draft.quantity || 0)
        const unitPrice = Number(draft.unit_price || 0)
        const total = quantity * unitPrice
        const deal = await financeApi.createSalesDeal({
          farm_id: farmId,
          buyer_id: draft.partner_id,
          plant: null,
          title: draft.title,
          description: draft.description,
          product_name: draft.product_name,
          agreed_quantity: draft.quantity,
          quantity_unit: draft.quantity_unit,
          frequency: 'weekly',
          interval_value: 1,
          unit_price: draft.unit_price,
          start_date: draft.date,
          end_date: draft.date,
          status: 'completed',
          created_by_id: userId,
          last_updated_by_id: userId,
        })
        const delivery = await financeApi.createSalesDelivery({
          deal: deal.id,
          harvest_history: null,
          scheduled_date: draft.date,
          delivered_date: draft.date,
          quantity_delivered: draft.quantity,
          quantity_unit: draft.quantity_unit,
          unit_price: draft.unit_price,
          total_amount: total,
          payment_status: 'paid',
          due_date: draft.date,
          notes: draft.description,
          recorded_by_id: userId,
        })
        await financeApi.createTransaction({
          farm_id: farmId,
          transaction_type: 'income',
          source_type: 'sale_delivery',
          expense_record: null,
          sales_delivery: delivery.id,
          transaction_date: draft.date,
          amount: total,
          payment_method: draft.payment_method,
          note: draft.description,
          created_by_id: userId,
        })
      }
      await onSaved()
      onClose()
    } catch (caughtError) {
      setError(caughtError.message || 'Unable to save transaction.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <DrawerShell open={open} onClose={onClose} title="New transaction">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-[#EFE3CA]/70 p-1">
          {['sale', 'expense'].map((value) => (
            <button key={value} type="button" onClick={() => setKind(value)} className={`rounded-md px-4 py-2 text-sm font-semibold capitalize ${kind === value ? 'bg-[#8ACBD0] text-[#170C79]' : 'text-[#170C79]/70'}`}>
              {value}
            </button>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <input className={inputClassName()} value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} />
          </Field>
          <Field label="Date">
            <input className={inputClassName()} type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} />
          </Field>
          <Field label={kind === 'sale' ? 'Buyer' : 'Partner'}>
            <select className={inputClassName()} value={draft.partner_id} onChange={(event) => setDraft((current) => ({ ...current, partner_id: event.target.value }))}>
              <option value="">Select partner</option>
              {partners.map((partner) => (
                <option key={partner.id} value={partner.id}>{partner.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Payment method">
            <select className={inputClassName()} value={draft.payment_method} onChange={(event) => setDraft((current) => ({ ...current, payment_method: event.target.value }))}>
              <option value="bank_transfer">Bank transfer</option>
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="other">Other</option>
            </select>
          </Field>
          {kind === 'expense' ? (
            <>
              <Field label="Expense category">
                <select className={inputClassName()} value={draft.category_id} onChange={(event) => setDraft((current) => ({ ...current, category_id: event.target.value }))}>
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Amount">
                <input className={inputClassName()} min="0" step="0.01" type="number" value={draft.amount} onChange={(event) => setDraft((current) => ({ ...current, amount: event.target.value }))} />
              </Field>
            </>
          ) : (
            <>
              <Field label="Product">
                <input className={inputClassName()} value={draft.product_name} onChange={(event) => setDraft((current) => ({ ...current, product_name: event.target.value }))} />
              </Field>
              <Field label="Quantity">
                <input className={inputClassName()} min="0" step="0.01" type="number" value={draft.quantity} onChange={(event) => setDraft((current) => ({ ...current, quantity: event.target.value }))} />
              </Field>
              <Field label="Unit">
                <input className={inputClassName()} value={draft.quantity_unit} onChange={(event) => setDraft((current) => ({ ...current, quantity_unit: event.target.value }))} />
              </Field>
              <Field label="Unit price">
                <input className={inputClassName()} min="0" step="0.01" type="number" value={draft.unit_price} onChange={(event) => setDraft((current) => ({ ...current, unit_price: event.target.value }))} />
              </Field>
            </>
          )}
        </div>
        <Field label="Note">
          <textarea className={inputClassName()} rows="4" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} />
        </Field>
        {error ? <p className="rounded-md bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
        <div className="flex justify-end gap-3">
          <ActionButton onClick={onClose} tone="soft">Cancel</ActionButton>
          <ActionButton disabled={saving} onClick={submit}>{saving ? 'Saving...' : 'Save transaction'}</ActionButton>
        </div>
      </div>
    </DrawerShell>
  )
}

function PartnerDrawer({ onClose, onSaved, open }) {
  const [draft, setDraft] = useState({ name: '', partner_type: 'buyer', contact_person: '', phone: '', email: '', address_text: '', notes: '' })
  const [error, setError] = useState('')

  if (!open) {
    return null
  }

  async function submit() {
    setError('')
    try {
      await financeApi.createPartner(draft)
      await onSaved()
      onClose()
    } catch (caughtError) {
      setError(caughtError.message || 'Unable to save partner.')
    }
  }

  return (
    <DrawerShell open={open} onClose={onClose} title="Add partner">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Name">
          <input className={inputClassName()} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
        </Field>
        <Field label="Type">
          <select className={inputClassName()} value={draft.partner_type} onChange={(event) => setDraft((current) => ({ ...current, partner_type: event.target.value }))}>
            <option value="buyer">Buyer</option>
            <option value="supplier">Supplier</option>
            <option value="utility_provider">Utility provider</option>
            <option value="other">Other</option>
          </select>
        </Field>
        <Field label="Contact">
          <input className={inputClassName()} value={draft.contact_person} onChange={(event) => setDraft((current) => ({ ...current, contact_person: event.target.value }))} />
        </Field>
        <Field label="Phone">
          <input className={inputClassName()} value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} />
        </Field>
        <Field label="Email">
          <input className={inputClassName()} type="email" value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} />
        </Field>
        <Field label="Address">
          <input className={inputClassName()} value={draft.address_text} onChange={(event) => setDraft((current) => ({ ...current, address_text: event.target.value }))} />
        </Field>
      </div>
      <div className="mt-4">
        <Field label="Notes">
          <textarea className={inputClassName()} rows="4" value={draft.notes} onChange={(event) => setDraft((current) => ({ ...current, notes: event.target.value }))} />
        </Field>
      </div>
      {error ? <p className="mt-4 rounded-md bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      <div className="mt-5 flex justify-end gap-3">
        <ActionButton onClick={onClose} tone="soft">Cancel</ActionButton>
        <ActionButton onClick={submit}>Save partner</ActionButton>
      </div>
    </DrawerShell>
  )
}

function TransactionDrawer({ onClose, open, transaction }) {
  return (
    <DrawerShell open={open} onClose={onClose} title={transaction?.source_summary?.title || 'Transaction'}>
      {transaction ? (
        <div className="space-y-4">
          <Metric label="Amount" value={formatMoney(transaction.amount)} tone={transaction.transaction_type} />
          <div className="grid gap-4 md:grid-cols-2">
            <Metric label="Date" value={formatDate(transaction.transaction_date)} />
            <Metric label="Payment method" value={formatLabel(transaction.payment_method || 'Not set')} />
            <Metric label="Source" value={formatLabel(transaction.source_type)} />
            <Metric label="Partner" value={transaction.source_summary?.partner_name || 'Not set'} />
          </div>
          <p className="rounded-lg bg-white/80 p-4 text-sm leading-6 text-[#170C79]/70">{transaction.note || 'No note recorded.'}</p>
        </div>
      ) : null}
    </DrawerShell>
  )
}

function FinancePage({ session }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [sectionNavCollapsed, setSectionNavCollapsed] = useState(false)
  const [transactionFilters, setTransactionFilters] = useState({ search: '', transaction_type: '', payment_method: '', date_from: '', date_to: '' })
  const [newTransactionOpen, setNewTransactionOpen] = useState(false)
  const [partnerOpen, setPartnerOpen] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const baseFilters = useMemo(() => ({ farm: session?.farm?.id || '' }), [session?.farm?.id])
  const {
    dashboard,
    error,
    expenseCategories,
    expenseRecords,
    loading,
    partners,
    recurringExpenses,
    refresh,
    salesDeals,
    salesDeliveries,
    transactions,
  } = useFinance(baseFilters)

  function patchTransactionFilters(next) {
    setTransactionFilters((current) => ({ ...current, ...next }))
  }

  return (
    <div className={`grid min-h-[calc(100vh-4.75rem)] ${sectionNavCollapsed ? 'lg:grid-cols-[4.5rem_minmax(0,1fr)]' : 'lg:grid-cols-[16rem_minmax(0,1fr)]'}`}>
      <SectionSidebar
        activeTab={activeTab}
        collapsed={sectionNavCollapsed}
        onChange={setActiveTab}
        onToggle={() => setSectionNavCollapsed((current) => !current)}
        tabs={FINANCE_TABS}
        title="Finance"
      />

      <div className="min-w-0 space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {error ? <EmptyState title="Finance API unavailable" description={error} /> : null}
        {loading ? <EmptyState title="Loading finance" description="Pulling finance records from the API." /> : null}

        {!loading && !error ? (
          <>
            {activeTab === 'overview' ? <OverviewSection dashboard={dashboard} onNewTransaction={() => setNewTransactionOpen(true)} /> : null}
            {activeTab === 'transactions' ? (
              <TransactionsSection
                filters={transactionFilters}
                onChangeFilters={patchTransactionFilters}
                onNewTransaction={() => setNewTransactionOpen(true)}
                onView={setSelectedTransaction}
                transactions={transactions}
              />
            ) : null}
            {activeTab === 'expenses' ? (
              <ExpensesSection categoryBreakdown={dashboard?.category_breakdown || []} expenseRecords={expenseRecords} recurringExpenses={recurringExpenses} />
            ) : null}
            {activeTab === 'sales' ? <SalesSection salesDeals={salesDeals} salesDeliveries={salesDeliveries} /> : null}
            {activeTab === 'partners' ? <PartnersSection onNewPartner={() => setPartnerOpen(true)} partners={partners} /> : null}
            {activeTab === 'statistics' ? <StatisticsSection expenseRecords={expenseRecords} recurringExpenses={recurringExpenses} salesDeliveries={salesDeliveries} /> : null}
          </>
        ) : null}
      </div>

      <NewTransactionDrawer
        categories={expenseCategories}
        farmId={session?.farm?.id}
        onClose={() => setNewTransactionOpen(false)}
        onSaved={refresh}
        open={newTransactionOpen}
        partners={partners}
        userId={session?.user?.id}
      />
      <PartnerDrawer onClose={() => setPartnerOpen(false)} onSaved={refresh} open={partnerOpen} />
      <TransactionDrawer onClose={() => setSelectedTransaction(null)} open={Boolean(selectedTransaction)} transaction={selectedTransaction} />
    </div>
  )
}

export default FinancePage

import { useState } from 'react'

import EmptyState from '../components/common/EmptyState.jsx'
import SectionSidebar from '../components/common/SectionSidebar.jsx'

const FINANCE_TABS = [
  'overview',
  'transactions',
  'expenses',
  'sales',
  'partners',
]

const financeSummary = [
  {
    label: 'Net balance',
    value: '$18,420',
    detail: 'Income minus expenses across all finance transactions.',
    tone: 'positive',
  },
  {
    label: 'Outstanding receivables',
    value: '$6,860',
    detail: 'Pending and overdue sales deliveries still open.',
    tone: 'neutral',
  },
  {
    label: 'Upcoming recurring costs',
    value: '$3,240',
    detail: 'Active recurring expenses due within the next 14 days.',
    tone: 'warning',
  },
  {
    label: 'Expense records this month',
    value: '27',
    detail: 'Manual, recurring instance, and wage entries logged.',
    tone: 'neutral',
  },
]

const transactionRows = [
  {
    title: 'Tomato delivery to Green Basket Market',
    date: '2026-04-20',
    amount: '$4,200',
    transactionType: 'income',
    sourceType: 'sale_delivery',
    paymentMethod: 'bank transfer',
    status: 'Paid',
  },
  {
    title: 'Fertilizer supply restock',
    date: '2026-04-18',
    amount: '$1,180',
    transactionType: 'expense',
    sourceType: 'expense_record',
    paymentMethod: 'card',
    status: 'Paid',
  },
  {
    title: 'Weekly lettuce delivery',
    date: '2026-04-16',
    amount: '$2,640',
    transactionType: 'income',
    sourceType: 'sale_delivery',
    paymentMethod: 'cash',
    status: 'Pending',
  },
  {
    title: 'March irrigation utility bill',
    date: '2026-04-14',
    amount: '$860',
    transactionType: 'expense',
    sourceType: 'expense_record',
    paymentMethod: 'bank transfer',
    status: 'Overdue',
  },
]

const recurringExpenses = [
  {
    title: 'Irrigation service plan',
    category: 'Recurring / utility_provider',
    frequency: 'monthly',
    amount: '$620',
    nextDueDate: '2026-04-28',
    status: 'active',
  },
  {
    title: 'Cold storage electricity',
    category: 'Operational / utility_provider',
    frequency: 'monthly',
    amount: '$1,140',
    nextDueDate: '2026-05-01',
    status: 'active',
  },
  {
    title: 'Field crew wages',
    category: 'Wages / other',
    frequency: 'weekly',
    amount: '$940',
    nextDueDate: '2026-04-25',
    status: 'active',
  },
]

const categoryBreakdown = [
  { name: 'Operational', share: '38%', amount: '$5,720' },
  { name: 'Recurring', share: '24%', amount: '$3,620' },
  { name: 'Wages', share: '21%', amount: '$3,180' },
  { name: 'Tools', share: '11%', amount: '$1,650' },
  { name: 'Other', share: '6%', amount: '$910' },
]

const salesPipeline = [
  {
    title: 'Hotel kitchen produce contract',
    product: 'Mixed greens',
    buyer: 'Sunridge Hotel',
    quantity: '120 kg',
    unitPrice: '$9.80',
    schedule: 'weekly / every 1 week',
    status: 'active',
  },
  {
    title: 'Neighborhood grocery standing order',
    product: 'Roma tomatoes',
    buyer: 'Fresh Corner',
    quantity: '180 kg',
    unitPrice: '$6.40',
    schedule: 'weekly / every 1 week',
    status: 'active',
  },
  {
    title: 'Spring herb trial shipment',
    product: 'Basil',
    buyer: 'North Market',
    quantity: '45 kg',
    unitPrice: '$11.20',
    schedule: 'monthly / every 1 month',
    status: 'draft',
  },
]

const deliveryQueue = [
  {
    title: 'Tomato shipment batch A',
    scheduledDate: '2026-04-24',
    quantity: '90 kg',
    total: '$576',
    paymentStatus: 'pending',
    dueDate: '2026-04-30',
  },
  {
    title: 'Mixed greens for hotel kitchen',
    scheduledDate: '2026-04-25',
    quantity: '120 kg',
    total: '$1,176',
    paymentStatus: 'paid',
    dueDate: '2026-04-27',
  },
  {
    title: 'Basil restaurant pack',
    scheduledDate: '2026-04-27',
    quantity: '30 kg',
    total: '$336',
    paymentStatus: 'overdue',
    dueDate: '2026-04-22',
  },
]

const partnerCards = [
  {
    name: 'Green Basket Market',
    type: 'buyer',
    contact: 'Marta Ruiz',
    email: 'orders@greenbasket.example',
    note: 'Receives two deliveries per week tied to sales deals and sales deliveries.',
  },
  {
    name: 'AquaFlow Utilities',
    type: 'utility_provider',
    contact: 'Samir Holt',
    email: 'service@aquaflow.example',
    note: 'Linked to recurring expenses for irrigation and cooling systems.',
  },
  {
    name: 'Harvest Supply Co.',
    type: 'supplier',
    contact: 'Leah Morgan',
    email: 'accounts@harvestsupply.example',
    note: 'Main supplier for tools, inputs, and manual expense records.',
  },
]

function toneClasses(tone) {
  if (tone === 'positive') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  }

  if (tone === 'warning') {
    return 'bg-amber-50 text-amber-700 ring-amber-200'
  }

  return 'bg-stone-100 text-stone-700 ring-stone-200'
}

function statusClasses(status) {
  const normalized = String(status).toLowerCase()

  if (normalized === 'paid' || normalized === 'active') {
    return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  }

  if (normalized === 'pending' || normalized === 'draft') {
    return 'bg-amber-50 text-amber-700 ring-amber-200'
  }

  if (normalized === 'overdue') {
    return 'bg-rose-50 text-rose-700 ring-rose-200'
  }

  return 'bg-stone-100 text-stone-700 ring-stone-200'
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="border-b border-stone-200 pb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{description}</p> : null}
    </div>
  )
}

function SummaryCard({ detail, label, tone, value }) {
  return (
    <article className="rounded-[24px] border border-white/70 bg-white/82 p-5 shadow-[0_18px_55px_rgba(82,97,69,0.09)] backdrop-blur">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">{value}</p>
        </div>
        <span
          className={`inline-flex w-fit self-start rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ring-1 ${toneClasses(tone)}`}
        >
          {tone}
        </span>
      </div>
      <p className="mt-4 text-sm leading-7 text-stone-600">{detail}</p>
    </article>
  )
}

function OverviewSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Finance"
        title="Overview"
        description="A finance workspace shaped around your schema so income, expenses, recurring bills, partners, and sales stay organized in one place."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {financeSummary.map((item) => (
          <SummaryCard key={item.label} {...item} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[32px] border border-white/80 bg-white/82 p-8 shadow-[0_24px_80px_rgba(82,97,69,0.1)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Schema flow</p>
          <div className="mt-6 grid gap-4">
            <div className="rounded-[24px] bg-stone-50 p-5 ring-1 ring-stone-200/80">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Income path</p>
              <p className="mt-2 text-xl font-semibold text-stone-900">
                Sales deals to sales deliveries to finance transactions
              </p>
            </div>
            <div className="rounded-[24px] bg-stone-50 p-5 ring-1 ring-stone-200/80">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Expense path</p>
              <p className="mt-2 text-xl font-semibold text-stone-900">
                Expense categories to expense records to finance transactions
              </p>
            </div>
            <div className="rounded-[24px] bg-stone-50 p-5 ring-1 ring-stone-200/80">
              <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Recurring layer</p>
              <p className="mt-2 text-sm leading-7 text-stone-700">
                Recurring expenses schedule future obligations before individual expense
                records are logged and paid.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/80 bg-[#f4f0e7] p-8 shadow-[0_24px_80px_rgba(82,97,69,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Core tables</p>
          <div className="mt-6 grid gap-3">
            <div className="rounded-[20px] bg-white/70 px-4 py-4 ring-1 ring-stone-200/80">
              <p className="font-semibold text-stone-900">Finance transactions</p>
              <p className="mt-1 text-sm text-stone-600">Unified ledger for income and expense history.</p>
            </div>
            <div className="rounded-[20px] bg-white/70 px-4 py-4 ring-1 ring-stone-200/80">
              <p className="font-semibold text-stone-900">Expense records</p>
              <p className="mt-1 text-sm text-stone-600">Manual, wage, and recurring-instance expense entries.</p>
            </div>
            <div className="rounded-[20px] bg-white/70 px-4 py-4 ring-1 ring-stone-200/80">
              <p className="font-semibold text-stone-900">Sales deals and sales deliveries</p>
              <p className="mt-1 text-sm text-stone-600">Contract planning and actual farm deliveries tied to payment status.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function TransactionsSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Finance"
        title="Transactions"
        description="A unified ledger view based on finance_transactions with linked source and payment details."
      />

      <section className="rounded-[32px] border border-white/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(82,97,69,0.1)] backdrop-blur">
        <div className="overflow-hidden rounded-[24px] border border-stone-200/80">
          <div className="grid grid-cols-[1.8fr_0.8fr_0.8fr_1fr_1fr_0.8fr] gap-3 bg-stone-100/90 px-5 py-4 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
            <span>Reference</span>
            <span>Date</span>
            <span>Amount</span>
            <span>Type</span>
            <span>Source</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-stone-200/80 bg-white">
            {transactionRows.map((row) => (
              <article
                key={`${row.title}-${row.date}`}
                className="grid grid-cols-[1.8fr_0.8fr_0.8fr_1fr_1fr_0.8fr] gap-3 px-5 py-4 text-sm text-stone-700"
              >
                <div>
                  <p className="font-semibold text-stone-900">{row.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-stone-500">
                    {row.paymentMethod}
                  </p>
                </div>
                <span>{row.date}</span>
                <span className={row.transactionType === 'income' ? 'font-semibold text-emerald-700' : 'font-semibold text-stone-900'}>
                  {row.transactionType === 'income' ? '+' : '-'}
                  {row.amount}
                </span>
                <span className="capitalize">{row.transactionType}</span>
                <span className="capitalize">{row.sourceType.replace('_', ' ')}</span>
                <span className={`inline-flex h-fit rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ring-1 ${statusClasses(row.status)}`}>
                  {row.status}
                </span>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ExpensesSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Finance"
        title="Expenses"
        description="Recurring bills, category distribution, and expense-record structure based on your finance schema."
      />

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[32px] border border-white/80 bg-white/82 p-8 shadow-[0_24px_80px_rgba(82,97,69,0.1)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Recurring expenses</p>
          <div className="mt-6 space-y-4">
            {recurringExpenses.map((expense) => (
              <article
                key={expense.title}
                className="rounded-[24px] bg-stone-50 p-5 ring-1 ring-stone-200/80"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">{expense.title}</h3>
                    <p className="mt-2 text-sm text-stone-600">{expense.category}</p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ring-1 ${statusClasses(expense.status)}`}>
                    {expense.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Amount</p>
                    <p className="mt-1 font-semibold text-stone-900">{expense.amount}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Frequency</p>
                    <p className="mt-1 font-semibold capitalize text-stone-900">{expense.frequency}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Next due date</p>
                    <p className="mt-1 font-semibold text-stone-900">{expense.nextDueDate}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="rounded-[32px] border border-white/80 bg-[#f4f0e7] p-8 shadow-[0_24px_80px_rgba(82,97,69,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Expense categories</p>
            <div className="mt-6 space-y-3">
              {categoryBreakdown.map((category) => (
                <div
                  key={category.name}
                  className="rounded-[22px] bg-white/70 px-4 py-4 ring-1 ring-stone-200/80"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-stone-900">{category.name}</p>
                    <p className="text-sm font-semibold text-stone-600">{category.share}</p>
                  </div>
                  <p className="mt-2 text-sm text-stone-600">{category.amount}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(82,97,69,0.1)] backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Expense record structure</p>
            <div className="mt-5 grid gap-3">
              <div className="rounded-[20px] bg-stone-50 px-4 py-4 ring-1 ring-stone-200/80">
                <p className="text-sm font-semibold text-stone-900">expense kind</p>
                <p className="mt-1 text-sm text-stone-600">manual, recurring instance, wage</p>
              </div>
              <div className="rounded-[20px] bg-stone-50 px-4 py-4 ring-1 ring-stone-200/80">
                <p className="text-sm font-semibold text-stone-900">payment status</p>
                <p className="mt-1 text-sm text-stone-600">pending, paid, overdue, cancelled</p>
              </div>
              <div className="rounded-[20px] bg-stone-50 px-4 py-4 ring-1 ring-stone-200/80">
                <p className="text-sm font-semibold text-stone-900">payment method</p>
                <p className="mt-1 text-sm text-stone-600">cash, bank transfer, card, other</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

function SalesSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Finance"
        title="Sales"
        description="Sales deal planning and delivery payment tracking based on sales_deals and sales_deliveries."
      />

      <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[32px] border border-white/80 bg-white/82 p-8 shadow-[0_24px_80px_rgba(82,97,69,0.1)] backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Sales deals</p>
          <div className="mt-6 space-y-4">
            {salesPipeline.map((deal) => (
              <article
                key={deal.title}
                className="rounded-[24px] bg-stone-50 p-5 ring-1 ring-stone-200/80"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">{deal.title}</h3>
                    <p className="mt-2 text-sm text-stone-600">
                      {deal.product} for {deal.buyer}
                    </p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ring-1 ${statusClasses(deal.status)}`}>
                    {deal.status}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Agreed quantity</p>
                    <p className="mt-1 font-semibold text-stone-900">{deal.quantity}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Unit price</p>
                    <p className="mt-1 font-semibold text-stone-900">{deal.unitPrice}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-stone-500">Frequency</p>
                    <p className="mt-1 text-sm font-semibold text-stone-900">{deal.schedule}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,#f7f3e8_0%,#eef3e8_100%)] p-8 shadow-[0_24px_80px_rgba(82,97,69,0.08)]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Delivery queue</p>
          <div className="mt-6 space-y-4">
            {deliveryQueue.map((delivery) => (
              <article
                key={`${delivery.title}-${delivery.scheduledDate}`}
                className="rounded-[24px] border border-white/70 bg-white/75 p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-stone-900">{delivery.title}</h3>
                    <p className="mt-2 text-sm text-stone-600">
                      Scheduled {delivery.scheduledDate} • {delivery.quantity}
                    </p>
                  </div>
                  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] ring-1 ${statusClasses(delivery.paymentStatus)}`}>
                    {delivery.paymentStatus}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-700">
                  <span>Total {delivery.total}</span>
                  <span>Due {delivery.dueDate}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function PartnersSection() {
  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Finance"
        title="Partners"
        description="A relationship view for finance partners across buyers, suppliers, and utility providers."
      />

      <section className="rounded-[32px] border border-white/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(82,97,69,0.1)] backdrop-blur">
        <div className="grid gap-4">
          {partnerCards.map((partner) => (
            <article
              key={partner.name}
              className="rounded-[24px] border border-stone-200/80 bg-stone-50 p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-stone-900">{partner.name}</h3>
                  <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    {partner.type}
                  </p>
                </div>
                <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-stone-600 ring-1 ring-stone-200">
                  active
                </span>
              </div>
              <p className="mt-4 text-sm text-stone-700">{partner.note}</p>
              <div className="mt-4 flex flex-wrap gap-4 text-sm text-stone-600">
                <span>{partner.contact}</span>
                <span>{partner.email}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}

function FinancePage() {
  const [activeTab, setActiveTab] = useState('overview')
  const [sectionNavCollapsed, setSectionNavCollapsed] = useState(false)

  return (
    <div
      className={`grid min-h-[calc(100vh-4.75rem)] ${
        sectionNavCollapsed ? 'lg:grid-cols-[4.5rem_minmax(0,1fr)]' : 'lg:grid-cols-[16rem_minmax(0,1fr)]'
      }`}
    >
      <SectionSidebar
        activeTab={activeTab}
        collapsed={sectionNavCollapsed}
        onChange={setActiveTab}
        onToggle={() => setSectionNavCollapsed((current) => !current)}
        tabs={FINANCE_TABS}
        title="Finance"
      />

      <div className="min-w-0 space-y-5 px-4 py-6 sm:px-6 lg:px-8">
        {activeTab === 'overview' ? <OverviewSection /> : null}
        {activeTab === 'transactions' ? <TransactionsSection /> : null}
        {activeTab === 'expenses' ? <ExpensesSection /> : null}
        {activeTab === 'sales' ? <SalesSection /> : null}
        {activeTab === 'partners' ? <PartnersSection /> : null}

        {!FINANCE_TABS.includes(activeTab) ? (
          <EmptyState
            title="Finance section unavailable"
            description="Choose one of the finance sections from the left sidebar."
          />
        ) : null}
      </div>
    </div>
  )
}

export default FinancePage

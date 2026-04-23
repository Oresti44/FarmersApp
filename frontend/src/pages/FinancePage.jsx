const kpiCards = [
  {
    label: 'Monthly income',
    value: '$18,420',
    tone: 'text-emerald-700',
    note: 'From sales deliveries and direct buyers.',
  },
  {
    label: 'Monthly expenses',
    value: '$9,860',
    tone: 'text-rose-700',
    note: 'Operational, recurring, and wage costs.',
  },
  {
    label: 'Net balance',
    value: '$8,560',
    tone: 'text-stone-900',
    note: 'Income minus recorded expenses.',
  },
]

const upcomingItems = [
  {
    title: 'Greenhouse electricity bill',
    kind: 'Recurring expense',
    dueDate: 'Apr 28',
    amount: '$1,120',
  },
  {
    title: 'Fertilizer supplier invoice',
    kind: 'Expense record',
    dueDate: 'May 02',
    amount: '$740',
  },
  {
    title: 'Lettuce delivery payment',
    kind: 'Sales delivery',
    dueDate: 'May 05',
    amount: '$2,480',
  },
]

const recentTransactions = [
  {
    date: 'Apr 22, 2026',
    title: 'Tomato weekly delivery',
    type: 'Income',
    amount: '+$1,950',
  },
  {
    date: 'Apr 21, 2026',
    title: 'Worker wage payout',
    type: 'Expense',
    amount: '-$2,300',
  },
  {
    date: 'Apr 20, 2026',
    title: 'Irrigation repairs',
    type: 'Expense',
    amount: '-$480',
  },
]

function FinancePage() {
  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-white/80 bg-white/80 p-8 shadow-[0_24px_80px_rgba(82,97,69,0.1)] backdrop-blur sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-stone-500">Finance</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
          Farm finance snapshot
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-600 sm:text-base">
          A simple overview for expenses, sales, and transaction flow. This keeps managers aware of
          what is due soon and what has already been paid.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {kpiCards.map((card) => (
          <article
            key={card.label}
            className="rounded-[24px] border border-white/80 bg-white/78 p-6 shadow-[0_16px_60px_rgba(82,97,69,0.08)]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{card.label}</p>
            <p className={`mt-3 text-3xl font-semibold tracking-tight ${card.tone}`}>{card.value}</p>
            <p className="mt-3 text-sm leading-6 text-stone-600">{card.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-[28px] border border-white/80 bg-white/78 p-6 shadow-[0_18px_60px_rgba(82,97,69,0.08)] sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-stone-950">Recent transactions</h2>
            <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
              Latest
            </span>
          </div>

          <div className="mt-5 space-y-3">
            {recentTransactions.map((item) => (
              <div
                key={`${item.date}-${item.title}`}
                className="flex flex-col gap-2 rounded-[18px] bg-stone-50 px-4 py-4 ring-1 ring-stone-200/80 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm text-stone-500">{item.date}</p>
                  <p className="mt-1 font-medium text-stone-900">{item.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-stone-500">{item.type}</p>
                  <p className="mt-1 font-semibold text-stone-900">{item.amount}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[28px] border border-white/80 bg-[#f4f0e7] p-6 shadow-[0_18px_60px_rgba(82,97,69,0.08)] sm:p-8">
          <h2 className="text-xl font-semibold text-stone-950">Upcoming dues</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">
            Quick reminders for bills, invoices, and expected incoming payments.
          </p>

          <div className="mt-5 space-y-3">
            {upcomingItems.map((item) => (
              <div
                key={`${item.title}-${item.dueDate}`}
                className="rounded-[18px] bg-white/80 px-4 py-4 ring-1 ring-stone-200/80"
              >
                <p className="text-sm font-semibold text-stone-900">{item.title}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.15em] text-stone-500">{item.kind}</p>
                <div className="mt-3 flex items-center justify-between text-sm text-stone-700">
                  <span>Due: {item.dueDate}</span>
                  <span className="font-semibold text-stone-900">{item.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}

export default FinancePage

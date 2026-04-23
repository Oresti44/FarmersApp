import { useMemo, useState } from 'react'

function SearchSelect({
  label,
  placeholder = 'Search…',
  value,
  options,
  onChange,
  emptyLabel = 'No results found.',
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')

  const current = options.find((option) => String(option.id) === String(value))
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return options
    }
    return options.filter((option) =>
      `${option.label} ${option.subtitle || ''}`.toLowerCase().includes(normalized),
    )
  }, [options, query])

  return (
    <div className="relative">
      {label ? (
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
          {label}
        </label>
      ) : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((currentOpen) => !currentOpen)}
        className="flex w-full items-center justify-between rounded-[20px] border border-stone-200 bg-white px-4 py-3 text-left text-sm text-stone-800 outline-none transition hover:border-stone-300 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={current ? 'text-stone-800' : 'text-stone-400'}>
          {current ? current.label : placeholder}
        </span>
        <span className="text-xs uppercase tracking-[0.18em] text-stone-400">Select</span>
      </button>
      {open ? (
        <div className="absolute z-30 mt-2 w-full rounded-[24px] border border-stone-200 bg-white p-3 shadow-[0_18px_50px_rgba(33,41,24,0.14)]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-[16px] border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-stone-800 outline-none"
          />
          <div className="mt-3 max-h-64 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setOpen(false)
                setQuery('')
              }}
              className="w-full rounded-[16px] px-3 py-2 text-left text-sm text-stone-500 transition hover:bg-stone-50"
            >
              Clear selection
            </button>
            {filtered.length ? (
              filtered.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id)
                    setOpen(false)
                    setQuery('')
                  }}
                  className={`mt-1 flex w-full items-start justify-between rounded-[16px] px-3 py-2 text-left transition ${
                    String(option.id) === String(value) ? 'bg-stone-900 text-stone-100' : 'hover:bg-stone-50'
                  }`}
                >
                  <span>
                    <span className="block text-sm font-medium">{option.label}</span>
                    {option.subtitle ? <span className="block text-xs opacity-70">{option.subtitle}</span> : null}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-sm text-stone-500">{emptyLabel}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default SearchSelect

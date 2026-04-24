import { useEffect, useMemo, useRef, useState } from 'react'

function SearchSelect({
  label,
  placeholder = 'Search...',
  value,
  options,
  onChange,
  emptyLabel = 'No results found.',
  disabled = false,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)

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

  useEffect(() => {
    if (!open) {
      return
    }
    const frameId = window.requestAnimationFrame(() => {
      inputRef.current?.focus()
    })

    return () => {
      window.cancelAnimationFrame(frameId)
    }
  }, [open])

  return (
    <div className="relative">
      {label ? (
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-[#5b6f43]">
          {label}
        </label>
      ) : null}
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          setOpen((currentOpen) => {
            if (currentOpen) {
              setQuery('')
            }
            return !currentOpen
          })
        }
        className="flex w-full items-center justify-between rounded-[20px] border border-[#d6e2c0] bg-white px-4 py-3 text-left text-sm text-[#22331f] outline-none transition hover:border-[#9fbb70] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span className={current ? 'text-[#22331f]' : 'text-[#7f8d74]'}>
          {current ? current.label : placeholder}
        </span>
        <span className="text-xs uppercase tracking-[0.18em] text-[#7f8d74]">Select</span>
      </button>
      {open ? (
        <div className="absolute z-30 mt-2 w-full rounded-[24px] border border-[#d6e2c0] bg-[#fcfbf6] p-3 shadow-[0_18px_50px_rgba(33,41,24,0.14)]">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={placeholder}
            className="w-full rounded-[16px] border border-[#d6e2c0] bg-white px-3 py-2 text-sm text-[#22331f] outline-none"
          />
          <div className="mt-3 max-h-64 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange(null)
                setOpen(false)
                setQuery('')
              }}
              className="w-full rounded-[16px] px-3 py-2 text-left text-sm text-[#5b6f43] transition hover:bg-[#eef4e5]"
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
                    String(option.id) === String(value)
                      ? 'bg-[#22331f] text-white'
                      : 'text-[#22331f] hover:bg-[#eef4e5]'
                  }`}
                >
                  <span>
                    <span className="block text-sm font-medium">{option.label}</span>
                    {option.subtitle ? <span className="block text-xs opacity-70">{option.subtitle}</span> : null}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-4 text-sm text-[#5b6f43]">{emptyLabel}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default SearchSelect

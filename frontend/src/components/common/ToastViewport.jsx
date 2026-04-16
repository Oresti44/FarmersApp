function ToastViewport({ toasts, onDismiss }) {
  if (!toasts.length) {
    return null
  }

  return (
    <div className="fixed right-4 top-24 z-[60] flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => (
        <article
          key={toast.id}
          className={`rounded-[20px] border px-4 py-3 shadow-[0_18px_50px_rgba(33,41,24,0.16)] ${
            toast.tone === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-emerald-200 bg-white text-stone-800'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.message ? <p className="mt-1 text-sm leading-6">{toast.message}</p> : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
            >
              Close
            </button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default ToastViewport

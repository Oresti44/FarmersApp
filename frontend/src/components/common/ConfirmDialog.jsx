function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmTone = 'danger',
  onConfirm,
  onCancel,
  children,
}) {
  if (!open) {
    return null
  }

  const confirmClass =
    confirmTone === 'danger'
      ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-stone-900 text-stone-100 hover:bg-stone-800 hover:text-stone-200'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/45 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-[28px] border border-white/70 bg-white p-6 shadow-[0_24px_80px_rgba(33,41,24,0.22)]">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Confirmation</p>
        <h3 className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">{title}</h3>
        {description ? <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p> : null}
        {children ? <div className="mt-5">{children}</div> : null}
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${confirmClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog

function DrawerShell({ open, title, description, onClose, children, footer }) {
  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-stone-950/40 backdrop-blur-sm">
      <button
        type="button"
        aria-label="Close panel"
        className="hidden flex-1 sm:block"
        onClick={onClose}
      />
      <section className="flex h-full w-full flex-col border-l border-white/60 bg-[#fbfaf6] shadow-[0_28px_90px_rgba(33,41,24,0.18)] sm:max-w-3xl">
        <div className="sticky top-0 z-10 border-b border-stone-200 bg-[#fbfaf6]/95 px-5 py-4 backdrop-blur sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-stone-500">Side Drawer</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">{title}</h2>
              {description ? <p className="mt-2 text-sm leading-6 text-stone-600">{description}</p> : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-200"
            >
              Close
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">{children}</div>
        {footer ? <div className="border-t border-stone-200 bg-white/90 px-5 py-4 sm:px-6">{footer}</div> : null}
      </section>
    </div>
  )
}

export default DrawerShell

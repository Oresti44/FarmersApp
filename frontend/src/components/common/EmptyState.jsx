function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-[28px] border border-dashed border-stone-300 bg-stone-50/90 px-6 py-10 text-center">
      <h3 className="text-xl font-semibold text-stone-900">{title}</h3>
      <p className="mt-3 text-sm leading-6 text-stone-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}

export default EmptyState

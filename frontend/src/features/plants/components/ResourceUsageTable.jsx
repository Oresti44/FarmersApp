function ResourceUsageTable({ entries, onAction }) {
  return (
    <section className="rounded-[32px] border border-white/80 bg-white/86 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-[#fbfaf6] text-left text-xs uppercase tracking-[0.18em] text-stone-500">
            <tr>
              <th className="px-4 py-4">Plant</th>
              <th className="px-4 py-4">Linked task</th>
              <th className="px-4 py-4">Resource</th>
              <th className="px-4 py-4">Type</th>
              <th className="px-4 py-4">Quantity</th>
              <th className="px-4 py-4">Used at</th>
              <th className="px-4 py-4">Recorded by</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id} className="text-sm text-stone-700">
                <td className="px-4 py-4 align-top">{entry.plant}</td>
                <td className="px-4 py-4 align-top">{entry.linked_task?.title || '—'}</td>
                <td className="px-4 py-4 align-top">{entry.resource_name}</td>
                <td className="px-4 py-4 align-top">{entry.resource_type}</td>
                <td className="px-4 py-4 align-top">
                  {entry.quantity} {entry.quantity_unit}
                </td>
                <td className="px-4 py-4 align-top">{new Date(entry.used_at).toLocaleString()}</td>
                <td className="px-4 py-4 align-top">{entry.recorded_by?.full_name || '—'}</td>
                <td className="px-4 py-4 align-top">
                  <button type="button" onClick={() => onAction('edit', entry)} className="mr-2 rounded-full bg-stone-100 px-3 py-1.5 text-xs font-semibold">
                    Edit
                  </button>
                  <button type="button" onClick={() => onAction('delete', entry)} className="rounded-full bg-rose-100 px-3 py-1.5 text-xs font-semibold text-rose-700">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ResourceUsageTable

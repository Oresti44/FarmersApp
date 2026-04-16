function TaskAssignmentsPanel({ assignments }) {
  return (
    <section className="rounded-[24px] bg-stone-50 p-4 ring-1 ring-stone-200">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Assignments</h3>
      <div className="mt-3 space-y-2">
        {assignments?.length ? (
          assignments.map((assignment) => (
            <div key={assignment.id} className="rounded-[18px] bg-white px-4 py-3 ring-1 ring-stone-200">
              <p className="font-semibold text-stone-900">{assignment.worker.full_name}</p>
              <p className="text-sm text-stone-500">
                Assigned {new Date(assignment.assigned_at).toLocaleString()}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-stone-500">No workers assigned yet.</p>
        )}
      </div>
    </section>
  )
}

export default TaskAssignmentsPanel

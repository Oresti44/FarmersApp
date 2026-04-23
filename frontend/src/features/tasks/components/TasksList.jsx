import PriorityBadge from '../../../components/common/PriorityBadge.jsx'
import StatusBadge from '../../../components/common/StatusBadge.jsx'

function TasksList({
  onAction,
  onSelectTask,
  tasks,
}) {
  return (
    <section className="rounded-[32px] border border-white/80 bg-white/86 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="sticky top-0 z-10 bg-[#fbfaf6] text-left">
            <tr className="text-xs uppercase tracking-[0.18em] text-stone-500">
              <th className="px-4 py-4">Title</th>
              <th className="px-4 py-4">Plant</th>
              <th className="px-4 py-4">Location</th>
              <th className="px-4 py-4">Category</th>
              <th className="px-4 py-4">Priority</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Workers</th>
              <th className="px-4 py-4">Scheduled</th>
              <th className="px-4 py-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id} className="border-t border-stone-200 text-sm text-stone-700">
                <td className="px-4 py-4 align-top">
                  <button type="button" onClick={() => onSelectTask(task)} className="text-left">
                    <span className="block font-semibold text-stone-950">{task.title}</span>
                    <span className="mt-1 block max-w-sm text-stone-500">{task.description || 'No description'}</span>
                  </button>
                </td>
                <td className="px-4 py-4 align-top">{task.plant_summary?.name || 'No plant'}</td>
                <td className="px-4 py-4 align-top">{task.area_summary?.name || 'No area'}</td>
                <td className="px-4 py-4 align-top">{task.category}</td>
                <td className="px-4 py-4 align-top">
                  <PriorityBadge value={task.priority} />
                </td>
                <td className="px-4 py-4 align-top">
                  <StatusBadge value={task.status} />
                </td>
                <td className="px-4 py-4 align-top">{task.assigned_workers_summary?.length || 0}</td>
                <td className="px-4 py-4 align-top">
                  {new Date(task.scheduled_start_at).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </td>
                <td className="px-4 py-4 align-top">
                  <details className="relative">
                    <summary className="cursor-pointer list-none rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-700">
                      Actions
                    </summary>
                    <div className="absolute right-0 z-20 mt-2 w-52 rounded-[20px] border border-stone-200 bg-white p-2 shadow-[0_18px_50px_rgba(33,41,24,0.16)]">
                      {['view', 'edit', 'postpone', 'cancel', 'duplicate', 'delete'].map((actionName) => (
                        <button
                          key={actionName}
                          type="button"
                          onClick={() => onAction(actionName, task)}
                          className="w-full rounded-[14px] px-3 py-2 text-left text-sm text-stone-700 transition hover:bg-stone-50"
                        >
                          {actionName}
                        </button>
                      ))}
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default TasksList

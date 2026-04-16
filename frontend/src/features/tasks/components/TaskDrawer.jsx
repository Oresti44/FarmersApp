import DrawerShell from '../../../components/common/DrawerShell.jsx'
import PriorityBadge from '../../../components/common/PriorityBadge.jsx'
import StatusBadge from '../../../components/common/StatusBadge.jsx'
import TaskAssignmentsPanel from './TaskAssignmentsPanel.jsx'
import TaskCommentsPanel from './TaskCommentsPanel.jsx'
import TaskHistoryPanel from './TaskHistoryPanel.jsx'
import TaskStatusActions from './TaskStatusActions.jsx'

function TaskDrawer({
  actingRole,
  onAddComment,
  onClose,
  onDelete,
  onEdit,
  onStatusAction,
  open,
  task,
}) {
  if (!task) {
    return null
  }

  return (
    <DrawerShell
      open={open}
      onClose={onClose}
      title={task.title}
      description={`${task.plant_summary?.name || 'No plant'} · ${task.area_summary?.name || 'No location'}`}
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={() => onEdit(task)} className="rounded-full bg-stone-100 px-4 py-2 text-sm font-semibold">
            Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded-full bg-rose-100 px-4 py-2 text-sm font-semibold text-rose-700"
          >
            Delete
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <section className="rounded-[28px] border border-stone-200 bg-white p-5">
          <div className="flex flex-wrap items-center gap-3">
            <PriorityBadge value={task.priority} />
            <StatusBadge value={task.status} />
            {task.flags?.is_repeating_instance ? (
              <span className="rounded-full bg-fuchsia-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-700">
                Repeating
              </span>
            ) : null}
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Schedule</p>
              <p className="mt-2 text-sm text-stone-700">
                {new Date(task.scheduled_start_at).toLocaleString()} - {new Date(task.scheduled_end_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Created by</p>
              <p className="mt-2 text-sm text-stone-700">{task.created_by?.full_name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Required items</p>
              <p className="mt-2 text-sm text-stone-700">{task.required_items_text || 'None'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Notes</p>
              <p className="mt-2 text-sm text-stone-700">{task.notes || 'No notes'}</p>
            </div>
          </div>
          <p className="mt-5 text-sm leading-7 text-stone-600">{task.description || 'No description yet.'}</p>
        </section>
        <TaskStatusActions actingRole={actingRole} onAction={onStatusAction} task={task} />
        <TaskAssignmentsPanel assignments={task.assignments || []} />
        <TaskCommentsPanel comments={task.comments || []} onAddComment={onAddComment} />
        <TaskHistoryPanel history={task.history || []} />
      </div>
    </DrawerShell>
  )
}

export default TaskDrawer

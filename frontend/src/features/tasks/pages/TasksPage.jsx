import { useEffect, useState } from 'react'

import EmptyState from '../../../components/common/EmptyState.jsx'
import SectionSidebar from '../../../components/common/SectionSidebar.jsx'
import ToastViewport from '../../../components/common/ToastViewport.jsx'
import tasksApi from '../api/tasksApi.js'
import TaskActivityFeed from '../components/TaskActivityFeed.jsx'
import TaskDrawer from '../components/TaskDrawer.jsx'
import TaskForm from '../components/TaskForm.jsx'
import TasksCalendar from '../components/TasksCalendar.jsx'
import DeleteTaskDialog from '../components/DeleteTaskDialog.jsx'
import TasksFiltersBar from '../components/TasksFiltersBar.jsx'
import TasksList from '../components/TasksList.jsx'
import TasksOverview from '../components/TasksOverview.jsx'
import useTasks from '../hooks/useTasks.js'
import { TASK_TABS } from '../types/tasks.js'

function blankFilters() {
  return {
    farm: null,
    search: '',
    plant: null,
    worker: '',
    status: '',
    priority: '',
    category: '',
    area_type: '',
    overdue: false,
    date_from: '',
    date_to: '',
  }
}

function formatForApi(value) {
  return value ? new Date(value).toISOString() : null
}

function uniquePlants(tasks) {
  const byId = new Map()

  tasks.forEach((task) => {
    if (!task.plant_summary?.id || byId.has(task.plant_summary.id)) {
      return
    }
    byId.set(task.plant_summary.id, {
      id: task.plant_summary.id,
      name: task.plant_summary.name,
      variety: task.plant_summary.variety,
      area_summary: task.area_summary,
    })
  })

  return [...byId.values()]
}

function SectionHeading({ description, eyebrow, title }) {
  return (
    <div className="border-b border-stone-200 pb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{description}</p> : null}
    </div>
  )
}

function TasksPage() {
  const [filters, setFilters] = useState(blankFilters)
  const [activeTab, setActiveTab] = useState('overview')
  const [sectionNavCollapsed, setSectionNavCollapsed] = useState(false)
  const [calendarMode, setCalendarMode] = useState('week')
  const [selectedTask, setSelectedTask] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState(null)
  const [deleteState, setDeleteState] = useState({ open: false, task: null, impact: null })
  const [activityFilters, setActivityFilters] = useState({
    task: '',
    actor: '',
    comment_type: '',
    date_from: '',
    date_to: '',
  })
  const [actingRole, setActingRole] = useState('manager')
  const [actingUserId, setActingUserId] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [toasts, setToasts] = useState([])

  const { activity, dashboard, error, loading, meta, plantsCatalog, refresh, setActivity, tasks } = useTasks(filters)

  useEffect(() => {
    let active = true

    async function loadActivity() {
      try {
        const data = await tasksApi.activity(activityFilters)
        if (active) {
          setActivity(data)
        }
      } catch {
        // Keep previous activity state on request failure.
      }
    }

    loadActivity()

    return () => {
      active = false
    }
  }, [activityFilters, setActivity])

  function patchFilters(next) {
    setFilters((current) => ({ ...current, ...next }))
  }

  function pushToast(title, message, tone = 'success') {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((current) => [...current, { id, message, title, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4000)
  }

  async function loadTaskDetail(taskId) {
    const detail = await tasksApi.get(taskId)
    setSelectedTask(detail)
    return detail
  }

  async function handleSaveTask(payload) {
    try {
      const normalized = {
        ...payload,
        scheduled_start_at: formatForApi(payload.scheduled_start_at),
        scheduled_end_at: formatForApi(payload.scheduled_end_at),
        recurrence: payload.recurrence
          ? {
              ...payload.recurrence,
              end_date: payload.recurrence.end_date || null,
            }
          : undefined,
      }

      if (taskToEdit?.id) {
        await tasksApi.update(taskToEdit.id, normalized)
        pushToast('Task updated')
      } else {
        await tasksApi.create(normalized)
        pushToast('Task created')
      }
      setFormOpen(false)
      setTaskToEdit(null)
      await refresh()
    } catch (caughtError) {
      pushToast('Task request failed', caughtError.message, 'error')
    }
  }

  async function handleStatusAction(mode, draft) {
    if (!selectedTask) {
      return
    }

    const payload = {
      actor_id: currentActorId,
      note: draft.note,
      reason: draft.reason,
      new_start_at: formatForApi(draft.new_start_at),
      new_end_at: formatForApi(draft.new_end_at),
    }

    try {
      if (mode === 'start') {
        await tasksApi.start(selectedTask.id, payload)
      } else if (mode === 'complete') {
        await tasksApi.complete(selectedTask.id, payload)
      } else if (mode === 'confirm') {
        await tasksApi.confirmCompletion(selectedTask.id, payload)
      } else if (mode === 'postpone') {
        await tasksApi.postpone(selectedTask.id, payload)
      } else if (mode === 'cancel') {
        await tasksApi.cancel(selectedTask.id, payload)
      }
      pushToast('Task status updated')
      await refresh()
      await loadTaskDetail(selectedTask.id)
    } catch (caughtError) {
      pushToast('Status update failed', caughtError.message, 'error')
    }
  }

  async function handleAddComment(draft) {
    if (!selectedTask) {
      return
    }
    try {
      await tasksApi.addComment(selectedTask.id, { ...draft, author_id: currentActorId })
      await loadTaskDetail(selectedTask.id)
      await refresh()
      pushToast('Comment added')
    } catch (caughtError) {
      pushToast('Comment failed', caughtError.message, 'error')
    }
  }

  async function openDelete(task) {
    try {
      const impact = await tasksApi.deleteImpact(task.id)
      setDeleteState({ open: true, task, impact })
    } catch (caughtError) {
      pushToast('Delete preview failed', caughtError.message, 'error')
    }
  }

  async function confirmDelete(scope) {
    try {
      await tasksApi.delete(deleteState.task.id, scope)
      setDeleteState({ open: false, task: null, impact: null })
      setSelectedTask(null)
      pushToast('Task deleted')
      await refresh()
    } catch (caughtError) {
      pushToast('Delete failed', caughtError.message, 'error')
    }
  }

  async function handleBulkStatus() {
    const nextStatus = window.prompt('Enter status: scheduled, in_progress, completed, postponed, cancelled')
    if (!nextStatus) {
      return
    }

    await Promise.all(
      selectedIds.map((id) => tasksApi.update(id, { status: nextStatus, last_updated_by: currentActorId || null })),
    )
    setSelectedIds([])
    pushToast('Bulk status updated')
    await refresh()
  }

  async function handleBulkMove() {
    const newStart = window.prompt('Enter new start date-time (YYYY-MM-DDTHH:MM)')
    const newEnd = window.prompt('Enter new end date-time (YYYY-MM-DDTHH:MM)')
    if (!newStart || !newEnd) {
      return
    }

    await Promise.all(
      selectedIds.map((id) =>
        tasksApi.update(id, {
          scheduled_start_at: formatForApi(newStart),
          scheduled_end_at: formatForApi(newEnd),
          last_updated_by: currentActorId || null,
        }),
      ),
    )
    setSelectedIds([])
    pushToast('Bulk schedule updated')
    await refresh()
  }

  async function handleBulkPriority() {
    const nextPriority = window.prompt('Enter priority: low, medium, high, urgent')
    if (!nextPriority) {
      return
    }

    await Promise.all(
      selectedIds.map((id) =>
        tasksApi.update(id, { priority: nextPriority, last_updated_by: currentActorId || null }),
      ),
    )
    setSelectedIds([])
    pushToast('Bulk priority updated')
    await refresh()
  }

  async function handleBulkDelete() {
    await Promise.all(selectedIds.map((id) => tasksApi.delete(id)))
    setSelectedIds([])
    pushToast('Selected tasks deleted')
    await refresh()
  }

  async function handleRowAction(actionName, task) {
    if (actionName === 'view') {
      await loadTaskDetail(task.id)
      return
    }

    if (actionName === 'edit' || actionName === 'duplicate') {
      const detail = await tasksApi.get(task.id)
      setTaskToEdit(actionName === 'duplicate' ? { ...detail, id: null, title: `${detail.title} copy` } : detail)
      setFormOpen(true)
      return
    }

    if (actionName === 'delete') {
      openDelete(task)
      return
    }

    await loadTaskDetail(task.id)
  }

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  const plantOptions = plantsCatalog.length ? plantsCatalog : uniquePlants(tasks)
  const currentActorId =
    meta.users.find((user) => user.id === actingUserId && user.role === actingRole)?.id ||
    meta.users.find((user) => user.role === actingRole)?.id ||
    meta.users[0]?.id ||
    null

  return (
    <div className="space-y-6">
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      <div className="border-b border-stone-200 pb-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">Tasks</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Task workspace</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">
          Schedule work, review assignments, and track activity from focused task subsections.
        </p>
      </div>

      <div
        className={`grid gap-6 ${
          sectionNavCollapsed ? 'lg:grid-cols-[4.5rem_minmax(0,1fr)]' : 'lg:grid-cols-[16rem_minmax(0,1fr)]'
        }`}
      >
        <SectionSidebar
          activeTab={activeTab}
          collapsed={sectionNavCollapsed}
          onChange={setActiveTab}
          onToggle={() => setSectionNavCollapsed((current) => !current)}
          tabs={TASK_TABS}
          title="Tasks"
        />

        <div className="min-w-0 space-y-5">
          {error ? <EmptyState title="Task API unavailable" description={error} /> : null}
          {loading ? (
            <EmptyState
              title="Loading tasks"
              description="Pulling tasks, dashboard data, and activity feed from the API."
            />
          ) : null}

          {!loading && !error ? (
            <>
              {activeTab === 'overview' ? (
                <>
                  <SectionHeading
                    eyebrow="Tasks"
                    title="Overview"
                    description="Current task load, status totals, and upcoming work summary."
                  />
                  <TasksOverview dashboard={dashboard} onOpenItem={() => setActiveTab('list')} />
                </>
              ) : null}
              {activeTab === 'calendar' ? (
                <>
                  <TasksFiltersBar
                    actingRole={actingRole}
                    actingUserId={currentActorId}
                    farms={meta.farms}
                    filters={filters}
                    onChange={patchFilters}
                    onNewTask={() => {
                      setTaskToEdit(null)
                      setFormOpen(true)
                    }}
                    onRoleChange={setActingRole}
                    onUserChange={setActingUserId}
                    plants={plantOptions}
                    users={meta.users}
                    workerOptions={meta.workers}
                  />
                  <TasksCalendar
                    mode={calendarMode}
                    onCreateSlot={(day) => {
                      setTaskToEdit({
                        title: '',
                        description: '',
                        category: 'general',
                        priority: 'medium',
                        scheduled_start_at: `${day}T08:00:00Z`,
                        scheduled_end_at: `${day}T09:00:00Z`,
                      })
                      setFormOpen(true)
                    }}
                    onModeChange={setCalendarMode}
                    onSelectTask={(task) => loadTaskDetail(task.id)}
                    tasks={tasks}
                  />
                </>
              ) : null}
              {activeTab === 'list' ? (
                <>
                  <TasksFiltersBar
                    actingRole={actingRole}
                    actingUserId={currentActorId}
                    farms={meta.farms}
                    filters={filters}
                    onChange={patchFilters}
                    onNewTask={() => {
                      setTaskToEdit(null)
                      setFormOpen(true)
                    }}
                    onRoleChange={setActingRole}
                    onUserChange={setActingUserId}
                    plants={plantOptions}
                    users={meta.users}
                    workerOptions={meta.workers}
                  />
                  <TasksList
                    actingRole={actingRole}
                    onAction={handleRowAction}
                    onBulkDelete={handleBulkDelete}
                    onBulkMove={handleBulkMove}
                    onBulkPriority={handleBulkPriority}
                    onBulkStatus={handleBulkStatus}
                    onSelectTask={(task) => loadTaskDetail(task.id)}
                    selectedIds={selectedIds}
                    setSelectedIds={setSelectedIds}
                    tasks={tasks}
                  />
                </>
              ) : null}
              {activeTab === 'activity' ? (
                <>
                  <SectionHeading
                    eyebrow="Tasks"
                    title="Activity"
                    description="Task comments and status history with filters inside this section."
                  />
                  <TaskActivityFeed
                    activity={activity}
                    filters={activityFilters}
                    onChange={(next) => setActivityFilters((current) => ({ ...current, ...next }))}
                  />
                </>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <TaskDrawer
        actingRole={actingRole}
        onAddComment={handleAddComment}
        onClose={() => setSelectedTask(null)}
        onDelete={openDelete}
        onEdit={(task) => {
          setTaskToEdit(task)
          setFormOpen(true)
        }}
        onStatusAction={handleStatusAction}
        open={Boolean(selectedTask)}
        task={selectedTask}
      />
      <TaskForm
        key={taskToEdit?.id || taskToEdit?.scheduled_start_at || 'new-task'}
        actingUserId={currentActorId}
        open={formOpen}
        onClose={() => {
          setFormOpen(false)
          setTaskToEdit(null)
        }}
        onSubmit={handleSaveTask}
        plants={plantOptions}
        task={taskToEdit}
        workers={meta.workers}
      />
      <DeleteTaskDialog
        key={deleteState.task?.id || 'delete-task'}
        impact={deleteState.impact}
        open={deleteState.open}
        onCancel={() => setDeleteState({ open: false, task: null, impact: null })}
        onConfirm={confirmDelete}
        task={deleteState.task}
      />
    </div>
  )
}

export default TasksPage

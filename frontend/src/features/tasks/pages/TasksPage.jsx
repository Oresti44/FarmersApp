import { useEffect, useRef, useState } from 'react'

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

function blankFilters(farmId = null) {
  return {
    farm: farmId,
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

function SectionHeading({ title }) {
  return (
    <div className="border-b border-[#8ACBD0]/45 pb-4">
      <h2 className="text-2xl font-semibold tracking-tight text-[#170C79]">{title}</h2>
    </div>
  )
}

function TasksPage({ session }) {
  const [filters, setFilters] = useState(() => blankFilters(session?.farm?.id || null))
  const [activeTab, setActiveTab] = useState('overview')
  const [sectionNavCollapsed, setSectionNavCollapsed] = useState(false)
  const [calendarMode, setCalendarMode] = useState('week')
  const [selectedTask, setSelectedTask] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState(null)
  const [deleteState, setDeleteState] = useState({ open: false, task: null, impact: null })
  const [activityFilters, setActivityFilters] = useState({ author_search: '' })
  const actingRole = 'manager'
  const [actingUserId, setActingUserId] = useState(null)
  const [toasts, setToasts] = useState([])
  const toastIdRef = useRef(0)

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
    toastIdRef.current += 1
    const id = `task-toast-${toastIdRef.current}`
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
    <div
      className={`grid min-h-[calc(100vh-4.75rem)] ${
        sectionNavCollapsed ? 'lg:grid-cols-[4.5rem_minmax(0,1fr)]' : 'lg:grid-cols-[16rem_minmax(0,1fr)]'
      }`}
    >
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      <SectionSidebar
        activeTab={activeTab}
        collapsed={sectionNavCollapsed}
        onChange={setActiveTab}
        onToggle={() => setSectionNavCollapsed((current) => !current)}
        tabs={TASK_TABS}
        title="Tasks"
      />

      <div className="min-w-0 space-y-5 px-4 py-6 sm:px-6 lg:px-8">
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
                    title="Overview"
                  />
                  <TasksOverview dashboard={dashboard} onOpenItem={(item) => loadTaskDetail(item.id)} />
                </>
              ) : null}
              {activeTab === 'calendar' ? (
                <>
                  <TasksFiltersBar
                    actingRole={actingRole}
                    actingUserId={currentActorId}
                    filters={filters}
                    onChange={patchFilters}
                    onNewTask={() => {
                      setTaskToEdit(null)
                      setFormOpen(true)
                    }}
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
                    filters={filters}
                    onChange={patchFilters}
                    onNewTask={() => {
                      setTaskToEdit(null)
                      setFormOpen(true)
                    }}
                    onUserChange={setActingUserId}
                    plants={plantOptions}
                    users={meta.users}
                    workerOptions={meta.workers}
                  />
                  <TasksList
                    onAction={handleRowAction}
                    onSelectTask={(task) => loadTaskDetail(task.id)}
                    tasks={tasks}
                  />
                </>
              ) : null}
              {activeTab === 'activity' ? (
                <>
                  <SectionHeading
                    title="Activity"
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

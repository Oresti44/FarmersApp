import { useMemo, useState } from 'react'

const workers = [
  { id: 'w1', name: 'Elira Hoxha', role: 'Irrigation Lead' },
  { id: 'w2', name: 'Arben Leka', role: 'Field Technician' },
  { id: 'w3', name: 'Mira Kola', role: 'Livestock Care' },
  { id: 'w4', name: 'Dritan Basha', role: 'Maintenance' },
]

const days = ['2026-04-06', '2026-04-07', '2026-04-08', '2026-04-09', '2026-04-10', '2026-04-11']
const hours = ['06:00', '07:00', '08:00', '09:00', '10:00', '12:00', '14:00', '16:00', '18:00']
const statusTone = {
  Scheduled: 'bg-sky-100 text-sky-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Postponed: 'bg-violet-100 text-violet-700',
  Overdue: 'bg-rose-200 text-rose-800',
  Draft: 'bg-stone-200 text-stone-700',
  Cancelled: 'bg-rose-100 text-rose-700',
}

const series = [
  { id: 'SER-01', title: 'Feed livestock', rule: 'Every day at 06:00 and 18:00', next: '2026-04-03 06:00' },
  { id: 'SER-02', title: 'Inspect irrigation lines', rule: 'Tue, Thu, Sat through April', next: '2026-04-04 07:30' },
  { id: 'SER-03', title: 'Water greenhouse plants', rule: 'Daily for 7 days at 08:00', next: '2026-04-03 08:00' },
]

const initialTasks = [
  {
    id: 'TASK-1048', title: 'Irrigate Field A', category: 'Irrigation', priority: 'High', status: 'Scheduled',
    startDate: '2026-04-07', startTime: '08:00', endTime: '10:00', estimatedDuration: 120, actualDuration: 0,
    workers: ['w1', 'w2'], location: 'Field A', relatedEntity: 'Field / Tomato Block', progress: 0, recurring: false,
    description: 'Run drip irrigation on the north rows and inspect pressure consistency before fertigation.',
    requiredItems: ['Pressure kit', 'Pump fuel'], checklist: ['Check pressure', 'Run cycle', 'Record output'],
    notes: 'Outdoor task. Check wind before pump start.', attachments: ['pressure-map.pdf'],
    history: ['Created by manager', 'Assigned to Elira and Arben'], dependencies: [], proof: 'Photo of pressure gauge',
  },
  {
    id: 'TASK-1049', title: 'Feed cows morning round', category: 'Feeding Animals', priority: 'Urgent', status: 'In Progress',
    startDate: '2026-04-03', startTime: '06:00', endTime: '07:00', estimatedDuration: 60, actualDuration: 35,
    workers: ['w3'], location: 'Barn 1', relatedEntity: 'Livestock / Dairy Group', progress: 55, recurring: true,
    description: 'Prepare feed mix and distribute to Barn 1 and Barn 2.',
    requiredItems: ['Feed mix', 'Mineral supplement'], checklist: ['Prepare mix', 'Distribute Barn 1', 'Distribute Barn 2'],
    notes: 'Worker note: Barn 2 will need extra mineral supplement tomorrow.', attachments: ['feeding-plan-april.docx'],
    history: ['Created from template', 'Worker started at 06:05'], dependencies: [], proof: 'Completion note only',
  },
  {
    id: 'TASK-1050', title: 'Spray Field B', category: 'Spraying', priority: 'Urgent', status: 'Scheduled',
    startDate: '2026-04-06', startTime: '07:00', endTime: '09:30', estimatedDuration: 150, actualDuration: 0,
    workers: ['w2', 'w4'], location: 'Field B', relatedEntity: 'Field / Pepper Zone', progress: 0, recurring: true,
    description: 'Target fungal pressure on the lower west section and follow treatment plan strictly.',
    requiredItems: ['Fungicide', 'Protective suits', 'Tractor sprayer'], checklist: ['Prepare chemicals', 'Wear safety gear', 'Apply treatment', 'Record results'],
    notes: 'Postpone if wind exceeds 18 km/h.', attachments: ['treatment-plan-b.pdf'],
    history: ['Dependency added: irrigation completion'], dependencies: ['TASK-1048'], proof: 'Photos and treatment log',
  },
  {
    id: 'TASK-1051', title: 'Greenhouse 2 watering', category: 'Irrigation', priority: 'Medium', status: 'Completed',
    startDate: '2026-04-02', startTime: '08:00', endTime: '09:00', estimatedDuration: 60, actualDuration: 58,
    workers: ['w1'], location: 'Greenhouse 2', relatedEntity: 'Greenhouse / Lettuce', progress: 100, recurring: true,
    description: 'Water greenhouse lettuce benches and verify humidity readings.',
    requiredItems: ['Water hose'], checklist: ['Water benches', 'Inspect humidity monitor'],
    notes: 'South bench dried faster than expected.', attachments: ['humidity-readings.xlsx'],
    history: ['Completed at 08:58', 'Proof photo uploaded'], dependencies: [], proof: 'Humidity reading and photo',
  },
  {
    id: 'TASK-1052', title: 'Repair irrigation valve', category: 'Maintenance', priority: 'High', status: 'Postponed',
    startDate: '2026-04-08', startTime: '14:00', endTime: '16:00', estimatedDuration: 120, actualDuration: 45,
    workers: ['w4'], location: 'Canal 3', relatedEntity: 'Equipment / Valve Unit 12', progress: 30, recurring: false,
    description: 'Replace the leaking valve near Storage Canal 3 before Thursday schedule starts.',
    requiredItems: ['Replacement valve', 'Seal tape'], checklist: ['Shut off main line', 'Remove damaged valve', 'Install replacement'],
    notes: 'Awaiting replacement part.', attachments: ['repair-manual.pdf'],
    history: ['Status changed to Postponed by worker request'], dependencies: [], proof: 'Photo after installation',
  },
  {
    id: 'TASK-1053', title: 'Harvest section A', category: 'Harvesting', priority: 'High', status: 'Overdue',
    startDate: '2026-04-01', startTime: '05:30', endTime: '11:30', estimatedDuration: 360, actualDuration: 210,
    workers: ['w1', 'w2'], location: 'Field C', relatedEntity: 'Field / Strawberry Section A', progress: 40, recurring: false,
    description: 'Prepare crates, harvest the ripe section, and transport produce to cold storage.',
    requiredItems: ['Harvest crates', 'Transport cart'], checklist: ['Prepare crates', 'Harvest section A', 'Transport to storage'],
    notes: 'Review why this slipped and rebalance crew load.', attachments: ['quality-spec.pdf'],
    history: ['Flagged overdue automatically'], dependencies: [], proof: 'Yield log',
  },
]

const compactFilters = {
  status: ['All', 'Scheduled', 'In Progress', 'Completed', 'Postponed', 'Overdue'],
  priority: ['All', 'Low', 'Medium', 'High', 'Urgent'],
  category: ['All', 'Irrigation', 'Spraying', 'Harvesting', 'Feeding Animals', 'Maintenance'],
}

const workerName = (id) => workers.find((worker) => worker.id === id)?.name ?? id
const durationLabel = (minutes) => {
  const hoursPart = Math.floor(minutes / 60)
  const minutesPart = minutes % 60
  if (!hoursPart) return `${minutesPart}m`
  if (!minutesPart) return `${hoursPart}h`
  return `${hoursPart}h ${minutesPart}m`
}

function WorkTasksPage() {
  const [role, setRole] = useState('manager')
  const [currentWorkerId, setCurrentWorkerId] = useState('w1')
  const [view, setView] = useState('calendar')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ status: 'All', priority: 'All', category: 'All' })
  const [tasks, setTasks] = useState(initialTasks)
  const [selectedTaskId, setSelectedTaskId] = useState(initialTasks[0].id)
  const [draft, setDraft] = useState({
    title: 'Inspect greenhouse vents',
    category: 'Inspection',
    priority: 'Medium',
    location: 'Greenhouse 1',
    startDate: '2026-04-09',
    startTime: '09:00',
    endTime: '10:00',
    workers: ['w4'],
    recurring: false,
  })

  const visibleTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const searchHit =
          !search || `${task.title} ${task.description} ${task.location}`.toLowerCase().includes(search.toLowerCase())
        const statusHit = filters.status === 'All' || task.status === filters.status
        const priorityHit = filters.priority === 'All' || task.priority === filters.priority
        const categoryHit = filters.category === 'All' || task.category === filters.category
        const workerHit = role === 'manager' || task.workers.includes(currentWorkerId)
        return searchHit && statusHit && priorityHit && categoryHit && workerHit
      }),
    [tasks, search, filters, role, currentWorkerId],
  )

  const selectedTask = visibleTasks.find((task) => task.id === selectedTaskId) ?? visibleTasks[0]
  const metrics = [
    ['Total tasks', visibleTasks.length],
    ['Scheduled', visibleTasks.filter((task) => task.status === 'Scheduled').length],
    ['In progress', visibleTasks.filter((task) => task.status === 'In Progress').length],
    ['Overdue', visibleTasks.filter((task) => task.status === 'Overdue').length],
    ['Completed', visibleTasks.filter((task) => task.status === 'Completed').length],
    ['Urgent', visibleTasks.filter((task) => task.priority === 'Urgent').length],
  ]

  const workerLoads = workers.map((worker) => {
    const assigned = tasks.filter((task) => task.workers.includes(worker.id))
    return {
      ...worker,
      total: assigned.length,
      hours: durationLabel(assigned.reduce((sum, task) => sum + task.estimatedDuration, 0)),
      overdue: assigned.filter((task) => task.status === 'Overdue').length,
    }
  })

  const updateStatus = (status) =>
    selectedTask &&
    setTasks((current) =>
      current.map((task) =>
        task.id === selectedTask.id
          ? { ...task, status, progress: status === 'Completed' ? 100 : task.progress, history: [`Status updated to ${status}`, ...task.history] }
          : task,
      ),
    )
  const moveSelected = (daysToMove) =>
    selectedTask &&
    setTasks((current) =>
      current.map((task) => {
        if (task.id !== selectedTask.id) return task
        const date = new Date(`${task.startDate}T00:00:00`)
        date.setDate(date.getDate() + daysToMove)
        const next = date.toISOString().slice(0, 10)
        return { ...task, startDate: next, history: [`Rescheduled to ${next}`, ...task.history] }
      }),
    )
  const saveDraft = () => {
    const task = {
      id: `TASK-${1060 + tasks.length}`,
      title: draft.title,
      category: draft.category,
      priority: draft.priority,
      status: 'Draft',
      startDate: draft.startDate,
      startTime: draft.startTime,
      endTime: draft.endTime,
      estimatedDuration: 60,
      actualDuration: 0,
      workers: draft.workers,
      location: draft.location,
      relatedEntity: 'Pending link',
      progress: 0,
      recurring: draft.recurring,
      description: 'Newly drafted task created from the quick planner.',
      requiredItems: [],
      checklist: [],
      notes: 'Draft task',
      attachments: [],
      history: ['Draft created from planner'],
      dependencies: [],
      proof: 'Optional',
    }
    setTasks((current) => [task, ...current])
    setSelectedTaskId(task.id)
    setView('details')
  }

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[36px] border border-white/80 bg-[linear-gradient(135deg,rgba(246,242,229,0.96),rgba(236,246,235,0.95))] p-8 shadow-[0_28px_90px_rgba(82,97,69,0.12)] sm:p-10">
        <div className="grid gap-8 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-stone-500">Work and Task Manager</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-6xl">Plan, assign, schedule, track, and analyze all farm work in one place.</h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600">Manager mode exposes scheduling, assignment, recurring logic, reporting, and conflict visibility. Worker mode narrows the surface to assigned tasks, status updates, notes, proof, and time tracking.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['manager', 'worker'].map((option) => (
                <button key={option} type="button" onClick={() => setRole(option)} className={`rounded-full px-5 py-3 text-sm font-semibold transition ${role === option ? 'bg-stone-950 text-stone-100' : 'bg-white/80 text-stone-700 ring-1 ring-stone-200 hover:bg-white'}`}>
                  {option === 'manager' ? 'Manager Mode' : 'Worker Mode'}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 backdrop-blur">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Worker profile</p>
            <div className="mt-5 grid gap-3">
              {workers.map((worker) => (
                <button key={worker.id} type="button" onClick={() => setCurrentWorkerId(worker.id)} className={`flex items-center justify-between rounded-[20px] px-4 py-3 text-left transition ${currentWorkerId === worker.id ? 'bg-stone-900 text-stone-100' : 'bg-stone-50 text-stone-700 ring-1 ring-stone-200 hover:bg-stone-100'}`}>
                  <span>
                    <span className="block font-semibold">{worker.name}</span>
                    <span className="block text-sm opacity-75">{worker.role}</span>
                  </span>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">mobile ready</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        {metrics.map(([label, value]) => (
          <article key={label} className="rounded-[26px] border border-white/80 bg-white/84 p-5 shadow-[0_20px_55px_rgba(82,97,69,0.08)]">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">{label}</p>
            <p className="mt-3 text-4xl font-semibold tracking-tight text-stone-950">{value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-6">
          <div className="rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex flex-wrap gap-2">
                {['calendar', 'list', 'details', 'reports', 'series', 'form'].map((name) => (
                  <button key={name} type="button" onClick={() => setView(name)} className={`rounded-full px-4 py-2 text-sm font-medium transition ${view === name ? 'bg-stone-900 text-stone-100' : 'bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900'}`}>
                    {name === 'form' ? 'Create / Edit' : name[0].toUpperCase() + name.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, description, or location" className="min-w-[240px] rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-700 outline-none" />
                {Object.entries(compactFilters).map(([key, values]) => (
                  <select key={key} value={filters[key]} onChange={(event) => setFilters((current) => ({ ...current, [key]: event.target.value }))} className="rounded-full border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-700 outline-none">
                    {values.map((value) => <option key={value}>{value}</option>)}
                  </select>
                ))}
              </div>
            </div>
          </div>
          {view === 'calendar' && (
            <section className="rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Calendar View</p>
                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Weekly planner with task blocks and overlap awareness</h2>
                </div>
                <div className="flex gap-2 text-sm text-stone-500">
                  <span className="rounded-full bg-stone-100 px-3 py-1">Month</span>
                  <span className="rounded-full bg-stone-900 px-3 py-1 text-stone-100">Week</span>
                  <span className="rounded-full bg-stone-100 px-3 py-1">Day</span>
                </div>
              </div>
              <div className="mt-6 overflow-x-auto">
                <div className="grid min-w-[920px] grid-cols-[90px_repeat(6,minmax(130px,1fr))] gap-3">
                  <div />
                  {days.map((day) => <div key={day} className="rounded-[20px] bg-stone-100 px-4 py-3 text-center text-sm font-semibold text-stone-700">{day.slice(5)}</div>)}
                  {hours.map((hour) => [
                    <div key={`${hour}-label`} className="pt-4 text-sm font-medium text-stone-500">{hour}</div>,
                    ...days.map((day) => (
                      <div key={`${day}-${hour}`} className="min-h-[84px] rounded-[22px] border border-dashed border-stone-200 bg-stone-50/70 p-2">
                        <div className="space-y-2">
                          {visibleTasks
                            .filter((task) => task.startDate === day && task.startTime.slice(0, 2) === hour.slice(0, 2))
                            .map((task) => (
                              <button key={task.id} type="button" onClick={() => { setSelectedTaskId(task.id); setView('details') }} className={`w-full rounded-[18px] px-3 py-3 text-left shadow-sm transition hover:scale-[1.01] ${statusTone[task.status] ?? 'bg-stone-100 text-stone-700'}`}>
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-semibold">{task.title}</span>
                                  <span className="text-xs font-semibold">{task.priority}</span>
                                </div>
                                <p className="mt-1 text-xs opacity-80">{task.startTime} - {task.endTime}</p>
                                <p className="mt-2 text-xs opacity-75">{task.workers.map(workerName).join(', ')}</p>
                              </button>
                            ))}
                        </div>
                      </div>
                    )),
                  ])}
                </div>
              </div>
            </section>
          )}

          {view === 'list' && (
            <section className="rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Task List View</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Filter by worker, status, priority, category, and location</h2>
              <div className="mt-6 space-y-3">
                {visibleTasks.map((task) => (
                  <button key={task.id} type="button" onClick={() => { setSelectedTaskId(task.id); setView('details') }} className="grid w-full gap-4 rounded-[24px] border border-stone-200 bg-stone-50 px-5 py-5 text-left transition hover:border-stone-300 hover:bg-white md:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr_0.9fr]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold text-stone-900">{task.title}</span>
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[task.status]}`}>{task.status}</span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-stone-600">{task.description}</p>
                    </div>
                    <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">When</p><p className="mt-2 text-sm font-medium text-stone-800">{task.startDate} {task.startTime}</p><p className="text-sm text-stone-500">{durationLabel(task.estimatedDuration)}</p></div>
                    <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Workers</p><p className="mt-2 text-sm text-stone-800">{task.workers.map(workerName).join(', ')}</p></div>
                    <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Location</p><p className="mt-2 text-sm text-stone-800">{task.location}</p></div>
                    <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Priority</p><p className="mt-2 text-sm font-semibold text-stone-800">{task.priority}</p></div>
                  </button>
                ))}
              </div>
            </section>
          )}

          {view === 'details' && selectedTask && (
            <section className="rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">{selectedTask.id}</p>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusTone[selectedTask.status]}`}>{selectedTask.status}</span>
                    <span className="text-sm font-semibold text-stone-600">{selectedTask.priority} priority</span>
                  </div>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-950">{selectedTask.title}</h2>
                  <p className="mt-3 max-w-3xl text-base leading-8 text-stone-600">{selectedTask.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {role === 'manager' ? (
                    <>
                      <button type="button" onClick={() => moveSelected(1)} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-stone-100">Move +1 day</button>
                      <button type="button" onClick={() => updateStatus('Postponed')} className="rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">Postpone</button>
                      <button type="button" onClick={() => updateStatus('Cancelled')} className="rounded-full bg-rose-100 px-4 py-2 text-sm font-medium text-rose-700">Cancel</button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => updateStatus('In Progress')} className="rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-700">Start task</button>
                      <button type="button" onClick={() => updateStatus('Completed')} className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-medium text-emerald-700">Mark completed</button>
                      <button type="button" onClick={() => updateStatus('Postponed')} className="rounded-full bg-violet-100 px-4 py-2 text-sm font-medium text-violet-700">Request reschedule</button>
                    </>
                  )}
                </div>
              </div>
              <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-6">
                  <div className="rounded-[24px] bg-stone-50 p-5 ring-1 ring-stone-200">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Task details</h3>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div><p className="text-xs uppercase tracking-[0.18em] text-stone-500">Schedule</p><p className="mt-2 text-sm text-stone-800">{selectedTask.startDate} {selectedTask.startTime} - {selectedTask.endTime}</p></div>
                      <div><p className="text-xs uppercase tracking-[0.18em] text-stone-500">Location</p><p className="mt-2 text-sm text-stone-800">{selectedTask.location}</p></div>
                      <div><p className="text-xs uppercase tracking-[0.18em] text-stone-500">Assigned workers</p><p className="mt-2 text-sm text-stone-800">{selectedTask.workers.map(workerName).join(', ')}</p></div>
                      <div><p className="text-xs uppercase tracking-[0.18em] text-stone-500">Entity link</p><p className="mt-2 text-sm text-stone-800">{selectedTask.relatedEntity}</p></div>
                      <div><p className="text-xs uppercase tracking-[0.18em] text-stone-500">Estimated vs actual</p><p className="mt-2 text-sm text-stone-800">{durationLabel(selectedTask.estimatedDuration)} planned / {durationLabel(selectedTask.actualDuration)} actual</p></div>
                      <div><p className="text-xs uppercase tracking-[0.18em] text-stone-500">Proof</p><p className="mt-2 text-sm text-stone-800">{selectedTask.proof}</p></div>
                    </div>
                  </div>
                  <div className="rounded-[24px] bg-[#f6f1e8] p-5 ring-1 ring-[#eadfc8]">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Checklist and dependencies</h3>
                    <div className="mt-4 space-y-3">
                      {selectedTask.checklist.map((item) => <div key={item} className="rounded-[18px] bg-white/85 px-4 py-3 text-sm text-stone-700">{item}</div>)}
                      <div className="rounded-[18px] bg-white/85 px-4 py-3 text-sm text-stone-600">Dependencies: {selectedTask.dependencies.length ? selectedTask.dependencies.join(', ') : 'None'}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="rounded-[24px] bg-[#eef5ea] p-5 ring-1 ring-[#d6e4cf]">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Resources and field notes</h3>
                    <div className="mt-4 space-y-3">
                      {selectedTask.requiredItems.map((item) => <div key={item} className="rounded-[18px] bg-white/85 px-4 py-3 text-sm text-stone-700">{item}</div>)}
                      <div className="rounded-[18px] bg-white/85 px-4 py-3 text-sm leading-7 text-stone-600"><strong className="text-stone-900">Notes:</strong> {selectedTask.notes}</div>
                    </div>
                  </div>
                  <div className="rounded-[24px] bg-stone-50 p-5 ring-1 ring-stone-200">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Attachments and audit trail</h3>
                    <div className="mt-4 space-y-3">
                      <div className="rounded-[18px] bg-white px-4 py-3 ring-1 ring-stone-200 text-sm text-stone-600">{selectedTask.attachments.join(', ') || 'No attachments'}</div>
                      <div className="rounded-[18px] bg-white px-4 py-3 ring-1 ring-stone-200">{selectedTask.history.map((entry) => <p key={entry} className="text-sm text-stone-600">{entry}</p>)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {view === 'reports' && (
            <section className="grid gap-6 xl:grid-cols-[1fr_0.92fr]">
              <div className="rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Reports and Analytics</p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Distribution by day and category</h2>
                <div className="mt-6 grid gap-4">
                  {[...new Set(visibleTasks.map((task) => task.startDate))].sort().map((date) => {
                    const count = visibleTasks.filter((task) => task.startDate === date).length
                    return (
                      <div key={date}>
                        <div className="flex items-center justify-between text-sm text-stone-600"><span>{date}</span><span>{count} tasks</span></div>
                        <div className="mt-2 h-3 rounded-full bg-stone-100"><div className="h-3 rounded-full bg-[linear-gradient(90deg,#2f855a,#d69e2e)]" style={{ width: `${Math.min(count * 18, 100)}%` }} /></div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {[...new Set(visibleTasks.map((task) => task.category))].map((name) => (
                    <div key={name} className="rounded-[22px] bg-stone-50 p-4 ring-1 ring-stone-200">
                      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">{name}</p>
                      <p className="mt-2 text-3xl font-semibold text-stone-950">{visibleTasks.filter((task) => task.category === name).length}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Worker Workload</p>
                <div className="mt-5 space-y-3">
                  {workerLoads.map((worker) => (
                    <article key={worker.id} className="rounded-[22px] bg-stone-50 p-4 ring-1 ring-stone-200">
                      <div className="flex items-center justify-between">
                        <div><h3 className="text-lg font-semibold text-stone-900">{worker.name}</h3><p className="text-sm text-stone-500">{worker.role}</p></div>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-stone-600">{worker.total} tasks</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between text-sm text-stone-600"><span>Weekly load</span><span>{worker.hours}</span></div>
                      <div className="mt-2 flex items-center justify-between text-sm text-stone-600"><span>Overdue</span><span>{worker.overdue}</span></div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {view === 'series' && (
            <section className="rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Recurring Series Management</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">Edit this occurrence, this and following, or the whole series</h2>
              <div className="mt-6 space-y-4">
                {series.map((item) => (
                  <article key={item.id} className="rounded-[24px] bg-stone-50 p-5 ring-1 ring-stone-200">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">{item.id}</span>
                          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">Recurring</span>
                        </div>
                        <h3 className="mt-2 text-xl font-semibold text-stone-950">{item.title}</h3>
                        <p className="mt-2 text-sm leading-7 text-stone-600">{item.rule}</p>
                        <p className="mt-2 text-sm text-stone-500">Next run: {item.next}</p>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-stone-600">
                        <span className="rounded-full bg-white px-3 py-2 ring-1 ring-stone-200">This occurrence</span>
                        <span className="rounded-full bg-white px-3 py-2 ring-1 ring-stone-200">This and following</span>
                        <span className="rounded-full bg-white px-3 py-2 ring-1 ring-stone-200">Whole series</span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {view === 'form' && (
            <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Create / Edit Task</p>
                <div className="mt-5 space-y-4">
                  <input value={draft.title} onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none" placeholder="Task title" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <select value={draft.category} onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))} className="rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none">
                      {compactFilters.category.slice(1).concat('Inspection').map((item) => <option key={item}>{item}</option>)}
                    </select>
                    <select value={draft.priority} onChange={(event) => setDraft((current) => ({ ...current, priority: event.target.value }))} className="rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none">
                      {compactFilters.priority.slice(1).map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </div>
                  <input value={draft.location} onChange={(event) => setDraft((current) => ({ ...current, location: event.target.value }))} className="w-full rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none" placeholder="Location" />
                  <div className="grid gap-4 sm:grid-cols-3">
                    <input type="date" value={draft.startDate} onChange={(event) => setDraft((current) => ({ ...current, startDate: event.target.value }))} className="rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none" />
                    <input type="time" value={draft.startTime} onChange={(event) => setDraft((current) => ({ ...current, startTime: event.target.value }))} className="rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none" />
                    <input type="time" value={draft.endTime} onChange={(event) => setDraft((current) => ({ ...current, endTime: event.target.value }))} className="rounded-[20px] border border-stone-200 bg-stone-50 px-4 py-3 text-stone-800 outline-none" />
                  </div>
                  <div className="rounded-[22px] bg-[#edf5ea] p-4">
                    <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Assign workers</p>
                    <div className="mt-3 grid gap-2">
                      {workers.map((worker) => {
                        const active = draft.workers.includes(worker.id)
                        return <button key={worker.id} type="button" onClick={() => setDraft((current) => ({ ...current, workers: active ? current.workers.filter((id) => id !== worker.id) : [...current.workers, worker.id] }))} className={`flex items-center justify-between rounded-[18px] px-4 py-3 text-left ${active ? 'bg-stone-900 text-stone-100' : 'bg-white text-stone-700 ring-1 ring-stone-200'}`}><span>{worker.name}</span><span className="text-xs uppercase tracking-[0.18em]">{worker.role}</span></button>
                      })}
                    </div>
                  </div>
                  <label className="flex items-center gap-3 rounded-[20px] bg-stone-50 px-4 py-3 ring-1 ring-stone-200"><input type="checkbox" checked={draft.recurring} onChange={(event) => setDraft((current) => ({ ...current, recurring: event.target.checked }))} /><span className="text-sm text-stone-700">Recurring task / series template</span></label>
                  <button type="button" onClick={saveDraft} className="w-full rounded-[20px] bg-stone-900 px-4 py-3 text-sm font-semibold text-stone-100">Save task draft</button>
                </div>
              </div>
              <div className="rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Templates and bulk actions</p>
                <div className="mt-5 grid gap-3">
                  {['Daily livestock feeding', 'Greenhouse irrigation', 'Spraying with safety checklist', 'Harvest and transport'].map((template) => <div key={template} className="rounded-[22px] bg-stone-50 px-4 py-4 ring-1 ring-stone-200"><p className="font-semibold text-stone-900">{template}</p><p className="mt-1 text-sm text-stone-500">Reusable farm workflow template</p></div>)}
                </div>
                <div className="mt-8 rounded-[24px] bg-[#f6f1e8] p-5 ring-1 ring-[#eadfc8]">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-stone-500">Included extras</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {['Subtasks and checklists', 'Notifications and overdue alerts', 'Attachments and completion proof', 'Resource consumption tracking', 'Dependency rules', 'Bulk reschedule / assign / cancel', 'Multi-location support', 'Export-ready reporting area'].map((item) => <div key={item} className="rounded-[18px] bg-white/80 px-4 py-3 text-sm text-stone-700">{item}</div>)}
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">{role === 'manager' ? 'Manager dashboard' : 'My Tasks'}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">{role === 'manager' ? 'Crew balance and conflict warnings' : 'Worker-only task stream'}</h2>
            <div className="mt-5 space-y-3">
              {visibleTasks.slice(0, 5).map((task) => (
                <button key={task.id} type="button" onClick={() => { setSelectedTaskId(task.id); setView('details') }} className="w-full rounded-[22px] bg-stone-50 px-4 py-4 text-left ring-1 ring-stone-200 transition hover:bg-white">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-stone-900">{task.title}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusTone[task.status]}`}>{task.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-stone-500">{task.startDate} {task.startTime} | {task.location}</p>
                </button>
              ))}
            </div>
          </section>
          <section className="rounded-[32px] border border-white/80 bg-white/84 p-6 shadow-[0_24px_80px_rgba(82,97,69,0.1)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-500">Worker Views</p>
            <div className="mt-4 grid gap-3">
              {[
                ['Today’s Tasks', visibleTasks.filter((task) => task.startDate === '2026-04-03').length],
                ['Upcoming Tasks', visibleTasks.filter((task) => task.status === 'Scheduled').length],
                ['Completed Tasks', visibleTasks.filter((task) => task.status === 'Completed').length],
                ['Overdue Tasks', visibleTasks.filter((task) => task.status === 'Overdue').length],
              ].map(([label, value]) => <div key={label} className="flex items-center justify-between rounded-[20px] bg-stone-50 px-4 py-3 ring-1 ring-stone-200"><span className="text-sm text-stone-700">{label}</span><span className="text-lg font-semibold text-stone-950">{value}</span></div>)}
            </div>
          </section>
          <section className="rounded-[32px] border border-white/80 bg-[linear-gradient(160deg,rgba(39,39,42,0.98),rgba(68,64,60,0.96))] p-6 text-white shadow-[0_24px_80px_rgba(32,34,28,0.22)]">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-stone-300">Alerts and reminders</p>
            <div className="mt-4 space-y-3 text-sm leading-7 text-stone-200">
              <p>Double-booking risk: Arben Leka is assigned to both irrigation prep and spraying on Monday 07:00-09:00.</p>
              <p>Overdue alert: Harvest section A slipped yesterday and should be rebalanced before heat risk increases.</p>
              <p>Offline note: worker mode is designed for low-connectivity field use with compact update actions.</p>
            </div>
          </section>
        </aside>
      </section>
    </div>
  )
}

export default WorkTasksPage

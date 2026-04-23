import { useEffect, useState } from 'react'

import EmptyState from '../../../components/common/EmptyState.jsx'
import SectionSidebar from '../../../components/common/SectionSidebar.jsx'
import ToastViewport from '../../../components/common/ToastViewport.jsx'
import tasksApi from '../../tasks/api/tasksApi.js'
import plantsApi from '../api/plantsApi.js'
import DeletePlantDialog from '../components/DeletePlantDialog.jsx'
import GreenhouseForm from '../components/GreenhouseForm.jsx'
import GreenhousesTable from '../components/GreenhousesTable.jsx'
import HarvestForm from '../components/HarvestForm.jsx'
import HarvestHistoryTable from '../components/HarvestHistoryTable.jsx'
import PlantDrawer from '../components/PlantDrawer.jsx'
import PlantForm from '../components/PlantForm.jsx'
import PlantsFiltersBar from '../components/PlantsFiltersBar.jsx'
import PlantsOverview from '../components/PlantsOverview.jsx'
import PlantsTable from '../components/PlantsTable.jsx'
import PlotForm from '../components/PlotForm.jsx'
import PlotsTable from '../components/PlotsTable.jsx'
import ResourceUsageForm from '../components/ResourceUsageForm.jsx'
import ResourceUsageTable from '../components/ResourceUsageTable.jsx'
import useGreenhouses from '../hooks/useGreenhouses.js'
import usePlants from '../hooks/usePlants.js'
import usePlots from '../hooks/usePlots.js'
import { PLANTS_TABS } from '../types/plants.js'

function blankFilters() {
  return {
    status: '',
    stage: '',
    farm: null,
    area_type: '',
    search: '',
    expected_from: '',
    expected_to: '',
    show_archived: false,
  }
}

function blankRecordFilters() {
  return {
    search: '',
    date_from: '',
    date_to: '',
  }
}

function ActionButton({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-md bg-stone-950 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:bg-stone-900 hover:text-stone-200"
    >
      {children}
    </button>
  )
}

function SectionHeading({ action, description, eyebrow, title }) {
  return (
    <div className="flex flex-col gap-3 border-b border-stone-200 pb-4 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950">{title}</h2>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-600">{description}</p> : null}
      </div>
      {action}
    </div>
  )
}

function RecordFiltersBar({ action, filters, onChange, searchPlaceholder, title }) {
  return (
    <section className="rounded-lg border border-stone-200/80 bg-white/82 p-4 shadow-sm backdrop-blur">
      <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Filters</p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">{title}</h2>
        </div>
        {action}
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Search
          </span>
          <input
            value={filters.search}
            onChange={(event) => onChange({ search: event.target.value })}
            placeholder={searchPlaceholder}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none transition focus:border-stone-400"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Date from
          </span>
          <input
            type="date"
            value={filters.date_from}
            onChange={(event) => onChange({ date_from: event.target.value })}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none"
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">
            Date to
          </span>
          <input
            type="date"
            value={filters.date_to}
            onChange={(event) => onChange({ date_to: event.target.value })}
            className="w-full rounded-md border border-stone-200 bg-white px-3 py-3 text-sm text-stone-800 outline-none"
          />
        </label>
      </div>
    </section>
  )
}

function containsSearch(values, search) {
  const query = search.trim().toLowerCase()
  if (!query) {
    return true
  }

  return values.some((value) => String(value || '').toLowerCase().includes(query))
}

function matchesFarm(item, farmId) {
  return !farmId || String(item.farm?.id) === String(farmId)
}

function dateInRange(value, dateFrom, dateTo) {
  const date = value ? String(value).slice(0, 10) : ''
  return (!dateFrom || date >= dateFrom) && (!dateTo || date <= dateTo)
}

function PlantsPage() {
  const [filters, setFilters] = useState(blankFilters)
  const [harvestFilters, setHarvestFilters] = useState(blankRecordFilters)
  const [resourceFilters, setResourceFilters] = useState(blankRecordFilters)
  const [activeTab, setActiveTab] = useState('overview')
  const [sectionNavCollapsed, setSectionNavCollapsed] = useState(false)
  const [selectedPlant, setSelectedPlant] = useState(null)
  const [plantFormState, setPlantFormState] = useState({ open: false, plant: null })
  const [plotFormState, setPlotFormState] = useState({ open: false, plot: null })
  const [greenhouseFormState, setGreenhouseFormState] = useState({ open: false, greenhouse: null })
  const [harvestFormState, setHarvestFormState] = useState({ open: false, entry: null, plantId: null })
  const [resourceFormState, setResourceFormState] = useState({ open: false, entry: null, plantId: null })
  const [deleteState, setDeleteState] = useState({ open: false, impact: null, title: '', entity: '', action: null })
  const [toasts, setToasts] = useState([])
  const [harvestEntries, setHarvestEntries] = useState([])
  const [resourceEntries, setResourceEntries] = useState([])
  const [tasks, setTasks] = useState([])

  const { dashboard, error, loading, meta, plants, refresh } = usePlants(filters)
  const { greenhouses, refresh: refreshGreenhouses } = useGreenhouses()
  const { plots, refresh: refreshPlots } = usePlots()

  useEffect(() => {
    let active = true

    async function loadExtras() {
      const [harvestData, resourceData, taskData] = await Promise.all([
        plantsApi.listHarvest(),
        plantsApi.listResourceUsage(),
        tasksApi.list({}),
      ])

      if (!active) {
        return
      }

      setHarvestEntries(harvestData)
      setResourceEntries(resourceData)
      setTasks(taskData)
    }

    loadExtras().catch(() => {})

    return () => {
      active = false
    }
  }, [])

  function patchFilters(next) {
    setFilters((current) => ({ ...current, ...next }))
  }

  function patchHarvestFilters(next) {
    setHarvestFilters((current) => ({ ...current, ...next }))
  }

  function patchResourceFilters(next) {
    setResourceFilters((current) => ({ ...current, ...next }))
  }

  function pushToast(title, message, tone = 'success') {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((current) => [...current, { id, title, message, tone }])
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 4000)
  }

  function dismissToast(id) {
    setToasts((current) => current.filter((toast) => toast.id !== id))
  }

  async function refreshAll() {
    await Promise.all([refresh(), refreshPlots(), refreshGreenhouses()])
    const [harvestData, resourceData, taskData] = await Promise.all([
      plantsApi.listHarvest(),
      plantsApi.listResourceUsage(),
      tasksApi.list({}),
    ])
    setHarvestEntries(harvestData)
    setResourceEntries(resourceData)
    setTasks(taskData)
  }

  async function openPlant(plantId) {
    const detail = await plantsApi.get(plantId)
    setSelectedPlant(detail)
  }

  async function savePlant(payload) {
    try {
      if (plantFormState.plant?.id) {
        await plantsApi.update(plantFormState.plant.id, payload)
        pushToast('Plant updated')
      } else {
        await plantsApi.create(payload)
        pushToast('Plant created')
      }
      setPlantFormState({ open: false, plant: null })
      await refreshAll()
    } catch (caughtError) {
      pushToast('Plant request failed', caughtError.message, 'error')
    }
  }

  async function savePlot(payload) {
    try {
      if (plotFormState.plot?.id) {
        await plantsApi.updatePlot(plotFormState.plot.id, payload)
        pushToast('Plot updated')
      } else {
        await plantsApi.createPlot(payload)
        pushToast('Plot created')
      }
      setPlotFormState({ open: false, plot: null })
      await refreshAll()
    } catch (caughtError) {
      pushToast('Plot request failed', caughtError.message, 'error')
    }
  }

  async function saveGreenhouse(payload) {
    try {
      if (greenhouseFormState.greenhouse?.id) {
        await plantsApi.updateGreenhouse(greenhouseFormState.greenhouse.id, payload)
        pushToast('Greenhouse updated')
      } else {
        await plantsApi.createGreenhouse(payload)
        pushToast('Greenhouse created')
      }
      setGreenhouseFormState({ open: false, greenhouse: null })
      await refreshAll()
    } catch (caughtError) {
      pushToast('Greenhouse request failed', caughtError.message, 'error')
    }
  }

  async function saveHarvest(payload) {
    try {
      if (harvestFormState.entry?.id) {
        await plantsApi.updateHarvest(harvestFormState.entry.id, payload)
        pushToast('Harvest entry updated')
      } else {
        await plantsApi.createHarvest(payload)
        pushToast('Harvest entry created')
      }
      setHarvestFormState({ open: false, entry: null, plantId: null })
      await refreshAll()
    } catch (caughtError) {
      pushToast('Harvest request failed', caughtError.message, 'error')
    }
  }

  async function saveResource(payload) {
    try {
      if (resourceFormState.entry?.id) {
        await plantsApi.updateResourceUsage(resourceFormState.entry.id, payload)
        pushToast('Resource usage updated')
      } else {
        await plantsApi.createResourceUsage(payload)
        pushToast('Resource usage created')
      }
      setResourceFormState({ open: false, entry: null, plantId: null })
      await refreshAll()
    } catch (caughtError) {
      pushToast('Resource request failed', caughtError.message, 'error')
    }
  }

  async function openDelete(entity, item) {
    try {
      let impact = {}
      let action = async () => {}

      if (entity === 'plant') {
        impact = await plantsApi.deleteImpact(item.id)
        action = () => plantsApi.delete(item.id)
      } else if (entity === 'plot') {
        impact = await plantsApi.plotDeleteImpact(item.id)
        action = () => plantsApi.deletePlot(item.id)
      } else if (entity === 'greenhouse') {
        impact = await plantsApi.greenhouseDeleteImpact(item.id)
        action = () => plantsApi.deleteGreenhouse(item.id)
      }

      setDeleteState({
        open: true,
        impact,
        title: `Delete ${item.name || 'record'}?`,
        entity,
        action,
      })
    } catch (caughtError) {
      pushToast('Delete preview failed', caughtError.message, 'error')
    }
  }

  async function confirmDelete() {
    try {
      await deleteState.action()
      setDeleteState({ open: false, impact: null, title: '', entity: '', action: null })
      setSelectedPlant(null)
      pushToast('Record deleted')
      await refreshAll()
    } catch (caughtError) {
      pushToast('Delete failed', caughtError.message, 'error')
    }
  }

  async function handlePlantAction(actionName, plant) {
    if (actionName === 'view') {
      await openPlant(plant.id)
      return
    }
    if (actionName === 'edit' || actionName === 'change stage') {
      const detail = await plantsApi.get(plant.id)
      setPlantFormState({ open: true, plant: detail })
      return
    }
    if (actionName === 'record harvest') {
      setHarvestFormState({ open: true, entry: null, plantId: plant.id })
      return
    }
    if (actionName === 'add resource usage') {
      setResourceFormState({ open: true, entry: null, plantId: plant.id })
      return
    }
    if (actionName === 'mark failed') {
      await plantsApi.markFailed(plant.id, { note: 'Marked failed from plants table.' })
      pushToast('Plant marked failed')
      await refreshAll()
      return
    }
    if (actionName === 'delete') {
      openDelete('plant', plant)
    }
  }

  async function handlePlotAction(actionName, plot) {
    if (actionName === 'edit') {
      setPlotFormState({ open: true, plot })
      return
    }
    if (actionName === 'archive') {
      await plantsApi.updatePlot(plot.id, { status: 'archived' })
      pushToast('Plot archived')
      await refreshAll()
      return
    }
    if (actionName === 'create plant') {
      setPlantFormState({
        open: true,
        plant: {
          area_summary: { type: 'plot', id: plot.id },
        },
      })
      return
    }
    if (actionName === 'delete') {
      openDelete('plot', plot)
    }
  }

  async function handleGreenhouseAction(actionName, greenhouse) {
    if (actionName === 'edit') {
      setGreenhouseFormState({ open: true, greenhouse })
      return
    }
    if (actionName === 'archive') {
      await plantsApi.updateGreenhouse(greenhouse.id, { status: 'archived' })
      pushToast('Greenhouse archived')
      await refreshAll()
      return
    }
    if (actionName === 'create plant') {
      setPlantFormState({
        open: true,
        plant: {
          area_summary: { type: 'greenhouse', id: greenhouse.id },
        },
      })
      return
    }
    if (actionName === 'delete') {
      openDelete('greenhouse', greenhouse)
    }
  }

  async function handleHarvestAction(actionName, entry) {
    if (actionName === 'edit') {
      setHarvestFormState({ open: true, entry, plantId: entry.plant })
      return
    }
    await plantsApi.deleteHarvest(entry.id)
    pushToast('Harvest entry deleted')
    await refreshAll()
  }

  async function handleResourceAction(actionName, entry) {
    if (actionName === 'edit') {
      setResourceFormState({ open: true, entry, plantId: entry.plant })
      return
    }
    await plantsApi.deleteResourceUsage(entry.id)
    pushToast('Resource usage deleted')
    await refreshAll()
  }

  const visiblePlots = plots.filter((plot) => {
    if (!filters.show_archived && plot.status !== 'active') {
      return false
    }

    return (
      matchesFarm(plot, filters.farm) &&
      containsSearch(
        [plot.name, plot.code, plot.farm?.name, plot.soil_type, plot.irrigation_type, plot.current_plant?.name],
        filters.search,
      )
    )
  })
  const visibleGreenhouses = greenhouses.filter((greenhouse) => {
    if (!filters.show_archived && greenhouse.status !== 'active') {
      return false
    }

    return (
      matchesFarm(greenhouse, filters.farm) &&
      containsSearch(
        [
          greenhouse.name,
          greenhouse.code,
          greenhouse.farm?.name,
          greenhouse.greenhouse_type,
          greenhouse.current_plant?.name,
        ],
        filters.search,
      )
    )
  })
  const visibleHarvestEntries = harvestEntries.filter(
    (entry) =>
      containsSearch(
        [entry.plant, entry.quality_grade, entry.notes, entry.recorded_by?.full_name],
        harvestFilters.search,
      ) && dateInRange(entry.harvested_at, harvestFilters.date_from, harvestFilters.date_to),
  )
  const visibleResourceEntries = resourceEntries.filter(
    (entry) =>
      containsSearch(
        [
          entry.plant,
          entry.linked_task?.title,
          entry.resource_name,
          entry.resource_type,
          entry.notes,
          entry.recorded_by?.full_name,
        ],
        resourceFilters.search,
      ) && dateInRange(entry.used_at, resourceFilters.date_from, resourceFilters.date_to),
  )

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
        tabs={PLANTS_TABS}
        title="Plants"
      />

      <div className="min-w-0 space-y-5 px-4 py-6 sm:px-6 lg:px-8">
          {error ? <EmptyState title="Plants API unavailable" description={error} /> : null}
          {loading ? (
            <EmptyState title="Loading plants" description="Pulling plants, dashboard data, and reference lists from the API." />
          ) : null}

          {!loading && !error ? (
            <>
              {activeTab === 'overview' ? (
                <>
                  <SectionHeading
                    eyebrow="Plants"
                    title="Overview"
                    description="Current plant counts, area use, and harvest/resource activity summaries."
                  />
                  <PlantsOverview dashboard={dashboard} />
                </>
              ) : null}
              {activeTab === 'plants' ? (
                <>
                  <PlantsFiltersBar
                    action={<ActionButton onClick={() => setPlantFormState({ open: true, plant: null })}>Add Plant</ActionButton>}
                    farms={meta.farms}
                    filters={filters}
                    onChange={patchFilters}
                    stages={meta.plant_stages}
                  />
                  <PlantsTable onAction={handlePlantAction} onOpen={(plant) => openPlant(plant.id)} plants={plants} />
                </>
              ) : null}
              {activeTab === 'plots' ? (
                <>
                  <PlantsFiltersBar
                    action={<ActionButton onClick={() => setPlotFormState({ open: true, plot: null })}>Add Plot</ActionButton>}
                    farms={meta.farms}
                    filters={filters}
                    mode="areas"
                    onChange={patchFilters}
                  />
                  <PlotsTable onAction={handlePlotAction} plots={visiblePlots} />
                </>
              ) : null}
              {activeTab === 'greenhouses' ? (
                <>
                  <PlantsFiltersBar
                    action={
                      <ActionButton onClick={() => setGreenhouseFormState({ open: true, greenhouse: null })}>
                        Add Greenhouse
                      </ActionButton>
                    }
                    farms={meta.farms}
                    filters={filters}
                    mode="areas"
                    onChange={patchFilters}
                  />
                  <GreenhousesTable onAction={handleGreenhouseAction} greenhouses={visibleGreenhouses} />
                </>
              ) : null}
              {activeTab === 'harvest' ? (
                <>
                  <RecordFiltersBar
                    action={
                      <ActionButton onClick={() => setHarvestFormState({ open: true, entry: null, plantId: null })}>
                        Record Harvest
                      </ActionButton>
                    }
                    filters={harvestFilters}
                    onChange={patchHarvestFilters}
                    searchPlaceholder="Plant, quality, note, or recorder"
                    title="Harvest filters"
                  />
                  <HarvestHistoryTable entries={visibleHarvestEntries} onAction={handleHarvestAction} />
                </>
              ) : null}
              {activeTab === 'resources' ? (
                <>
                  <RecordFiltersBar
                    action={
                      <ActionButton onClick={() => setResourceFormState({ open: true, entry: null, plantId: null })}>
                        Add Usage
                      </ActionButton>
                    }
                    filters={resourceFilters}
                    onChange={patchResourceFilters}
                    searchPlaceholder="Plant, resource, task, note, or recorder"
                    title="Resource filters"
                  />
                  <ResourceUsageTable entries={visibleResourceEntries} onAction={handleResourceAction} />
                </>
              ) : null}
            </>
          ) : null}
      </div>

      <PlantDrawer
        onClose={() => setSelectedPlant(null)}
        onEdit={(plant) => setPlantFormState({ open: true, plant })}
        onNewHarvest={(plant) => setHarvestFormState({ open: true, entry: null, plantId: plant.id })}
        onNewResource={(plant) => setResourceFormState({ open: true, entry: null, plantId: plant.id })}
        open={Boolean(selectedPlant)}
        plant={selectedPlant}
      />
      <PlantForm
        greenhouses={visibleGreenhouses}
        onClose={() => setPlantFormState({ open: false, plant: null })}
        onSubmit={savePlant}
        open={plantFormState.open}
        plant={plantFormState.plant}
        plots={visiblePlots}
        stages={meta.plant_stages}
      />
      <PlotForm farms={meta.farms} onClose={() => setPlotFormState({ open: false, plot: null })} onSubmit={savePlot} open={plotFormState.open} plot={plotFormState.plot} />
      <GreenhouseForm
        farms={meta.farms}
        greenhouse={greenhouseFormState.greenhouse}
        onClose={() => setGreenhouseFormState({ open: false, greenhouse: null })}
        onSubmit={saveGreenhouse}
        open={greenhouseFormState.open}
      />
      <HarvestForm
        entry={harvestFormState.entry}
        onClose={() => setHarvestFormState({ open: false, entry: null, plantId: null })}
        onSubmit={saveHarvest}
        open={harvestFormState.open}
        plantId={harvestFormState.plantId}
        plants={plants}
      />
      <ResourceUsageForm
        entry={resourceFormState.entry}
        onClose={() => setResourceFormState({ open: false, entry: null, plantId: null })}
        onSubmit={saveResource}
        open={resourceFormState.open}
        plantId={resourceFormState.plantId}
        plants={plants}
        tasks={tasks}
      />
      <DeletePlantDialog
        entityLabel={deleteState.entity || 'record'}
        impact={deleteState.impact}
        open={deleteState.open}
        onCancel={() => setDeleteState({ open: false, impact: null, title: '', entity: '', action: null })}
        onConfirm={confirmDelete}
        title={deleteState.title}
      />
    </div>
  )
}

export default PlantsPage

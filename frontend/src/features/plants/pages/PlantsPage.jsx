import { useEffect, useState } from 'react'

import EmptyState from '../../../components/common/EmptyState.jsx'
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
import PlantsHeader from '../components/PlantsHeader.jsx'
import PlantsOverview from '../components/PlantsOverview.jsx'
import PlantsTable from '../components/PlantsTable.jsx'
import PlantsTabs from '../components/PlantsTabs.jsx'
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

function PlantsPage() {
  const [filters, setFilters] = useState(blankFilters)
  const [activeTab, setActiveTab] = useState('overview')
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

  const visiblePlots = filters.show_archived ? plots : plots.filter((plot) => plot.status === 'active')
  const visibleGreenhouses = filters.show_archived
    ? greenhouses
    : greenhouses.filter((greenhouse) => greenhouse.status === 'active')

  return (
    <div className="space-y-6">
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
      <PlantsHeader farms={meta.farms} filters={filters} onChange={patchFilters} onNewPlant={() => setPlantFormState({ open: true, plant: null })} />
      <PlantsFiltersBar filters={filters} onChange={patchFilters} stages={meta.plant_stages} />
      <PlantsTabs activeTab={activeTab} onChange={setActiveTab} tabs={PLANTS_TABS} />

      {error ? <EmptyState title="Plants API unavailable" description={error} /> : null}
      {loading ? <EmptyState title="Loading plants" description="Pulling plants, dashboard data, and reference lists from the API." /> : null}

      {!loading && !error ? (
        <>
          {activeTab === 'overview' ? <PlantsOverview dashboard={dashboard} /> : null}
          {activeTab === 'plants' ? <PlantsTable onAction={handlePlantAction} onOpen={(plant) => openPlant(plant.id)} plants={plants} /> : null}
          {activeTab === 'plots' ? <PlotsTable onAction={handlePlotAction} plots={visiblePlots} /> : null}
          {activeTab === 'greenhouses' ? (
            <GreenhousesTable onAction={handleGreenhouseAction} greenhouses={visibleGreenhouses} />
          ) : null}
          {activeTab === 'harvest' ? <HarvestHistoryTable entries={harvestEntries} onAction={handleHarvestAction} /> : null}
          {activeTab === 'resources' ? <ResourceUsageTable entries={resourceEntries} onAction={handleResourceAction} /> : null}
        </>
      ) : null}

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

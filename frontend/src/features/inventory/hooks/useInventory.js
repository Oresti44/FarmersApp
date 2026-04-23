import { useCallback, useEffect, useState } from 'react'

import inventoryApi from '../api/inventoryApi.js'
import plantsApi from '../../plants/api/plantsApi.js'
import tasksApi from '../../tasks/api/tasksApi.js'

function useInventory(filters, movementFilters) {
  const [dashboard, setDashboard] = useState(null)
  const [items, setItems] = useState([])
  const [movements, setMovements] = useState([])
  const [meta, setMeta] = useState({
    farms: [],
    inventory_categories: [],
    users: [],
    workers: [],
    plants: [],
    tasks: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async function refreshInventory() {
    setLoading(true)
    setError('')

    try {
      const [metaData, dashboardData, itemsData, movementData, plantsData, tasksData] = await Promise.all([
        plantsApi.meta(),
        inventoryApi.dashboard(filters),
        inventoryApi.listItems(filters),
        inventoryApi.listMovements(movementFilters),
        plantsApi.list({}),
        tasksApi.list({}),
      ])

      setMeta({
        ...metaData,
        plants: plantsData,
        tasks: tasksData,
      })
      setDashboard(dashboardData)
      setItems(itemsData)
      setMovements(movementData)
    } catch (caughtError) {
      setError(caughtError.message || 'Unable to load inventory.')
    } finally {
      setLoading(false)
    }
  }, [filters, movementFilters])

  useEffect(() => {
    refresh().catch(() => {})
  }, [refresh])

  return {
    dashboard,
    error,
    items,
    loading,
    meta,
    movements,
    refresh,
  }
}

export default useInventory

import { useEffect, useRef, useState } from 'react'

import plantsApi from '../api/plantsApi.js'

function usePlants(filters) {
  const [plants, setPlants] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [meta, setMeta] = useState({ farms: [], plant_stages: [], users: [], workers: [] })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const hasLoadedRef = useRef(false)

  useEffect(() => {
    let active = true

    async function load() {
      const isInitialLoad = !hasLoadedRef.current

      if (isInitialLoad) {
        setLoading(true)
      } else {
        setRefreshing(true)
      }
      setError('')

      try {
        const [plantsData, dashboardData, metaData] = await Promise.all([
          plantsApi.list(filters),
          plantsApi.dashboard(filters),
          plantsApi.meta(),
        ])

        if (!active) {
          return
        }

        setPlants(plantsData)
        setDashboard(dashboardData)
        setMeta(metaData)
        hasLoadedRef.current = true
      } catch (caughtError) {
        if (active) {
          setError(caughtError.message)
        }
      } finally {
        if (active) {
          if (isInitialLoad) {
            setLoading(false)
          } else {
            setRefreshing(false)
          }
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [filters])

  async function refresh(nextFilters = filters) {
    const isInitialLoad = !hasLoadedRef.current

    if (isInitialLoad) {
      setLoading(true)
    } else {
      setRefreshing(true)
    }

    try {
      const [plantsData, dashboardData] = await Promise.all([
        plantsApi.list(nextFilters),
        plantsApi.dashboard(nextFilters),
      ])
      setPlants(plantsData)
      setDashboard(dashboardData)
      setError('')
      hasLoadedRef.current = true
    } catch (caughtError) {
      setError(caughtError.message)
      throw caughtError
    } finally {
      if (isInitialLoad) {
        setLoading(false)
      } else {
        setRefreshing(false)
      }
    }
  }

  return {
    dashboard,
    error,
    loading,
    meta,
    plants,
    refresh,
    refreshing,
  }
}

export default usePlants

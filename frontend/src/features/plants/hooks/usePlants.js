import { useEffect, useState } from 'react'

import plantsApi from '../api/plantsApi.js'

function usePlants(filters) {
  const [plants, setPlants] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [meta, setMeta] = useState({ farms: [], plant_stages: [], users: [], workers: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
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
      } catch (caughtError) {
        if (active) {
          setError(caughtError.message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [filters])

  async function refresh(nextFilters = filters) {
    setLoading(true)
    try {
      const [plantsData, dashboardData] = await Promise.all([
        plantsApi.list(nextFilters),
        plantsApi.dashboard(nextFilters),
      ])
      setPlants(plantsData)
      setDashboard(dashboardData)
      setError('')
    } catch (caughtError) {
      setError(caughtError.message)
      throw caughtError
    } finally {
      setLoading(false)
    }
  }

  return {
    dashboard,
    error,
    loading,
    meta,
    plants,
    refresh,
  }
}

export default usePlants

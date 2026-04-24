import { useEffect, useRef, useState } from 'react'

import { request } from '../../../lib/apiClient.js'
import tasksApi from '../api/tasksApi.js'

function useTasks(filters) {
  const [tasks, setTasks] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [activity, setActivity] = useState([])
  const [meta, setMeta] = useState({ farms: [], plant_stages: [], users: [], workers: [] })
  const [plantsCatalog, setPlantsCatalog] = useState([])
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
        const [tasksData, dashboardData, metaData, activityData, plantsData] = await Promise.all([
          tasksApi.list(filters),
          tasksApi.dashboard(filters),
          request('/ui-meta/'),
          tasksApi.activity({}),
          request('/plants/'),
        ])

        if (!active) {
          return
        }

        setTasks(tasksData)
        setDashboard(dashboardData)
        setMeta(metaData)
        setActivity(activityData)
        setPlantsCatalog(plantsData)
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
      const [tasksData, dashboardData, activityData, plantsData] = await Promise.all([
        tasksApi.list(nextFilters),
        tasksApi.dashboard(nextFilters),
        tasksApi.activity({}),
        request('/plants/'),
      ])
      setTasks(tasksData)
      setDashboard(dashboardData)
      setActivity(activityData)
      setPlantsCatalog(plantsData)
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
    activity,
    dashboard,
    error,
    loading,
    meta,
    plantsCatalog,
    refresh,
    refreshing,
    setActivity,
    tasks,
  }
}

export default useTasks

import { useEffect, useState } from 'react'

import { request } from '../../../lib/apiClient.js'
import tasksApi from '../api/tasksApi.js'

function useTasks(filters) {
  const [tasks, setTasks] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [activity, setActivity] = useState([])
  const [meta, setMeta] = useState({ farms: [], plant_stages: [], users: [], workers: [] })
  const [plantsCatalog, setPlantsCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
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
    } catch (caughtError) {
      setError(caughtError.message)
      throw caughtError
    } finally {
      setLoading(false)
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
    setActivity,
    tasks,
  }
}

export default useTasks

import { useEffect, useState } from 'react'

import plantsApi from '../api/plantsApi.js'

function usePlots() {
  const [plots, setPlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await plantsApi.listPlots()
        if (active) {
          setPlots(data)
          setError('')
        }
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
  }, [])

  async function refresh() {
    const data = await plantsApi.listPlots()
    setPlots(data)
    return data
  }

  return { error, loading, plots, refresh }
}

export default usePlots

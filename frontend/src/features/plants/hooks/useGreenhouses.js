import { useEffect, useState } from 'react'

import plantsApi from '../api/plantsApi.js'

function useGreenhouses() {
  const [greenhouses, setGreenhouses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function load() {
      try {
        const data = await plantsApi.listGreenhouses()
        if (active) {
          setGreenhouses(data)
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
    const data = await plantsApi.listGreenhouses()
    setGreenhouses(data)
    return data
  }

  return { error, greenhouses, loading, refresh }
}

export default useGreenhouses

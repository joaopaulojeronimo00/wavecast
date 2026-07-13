import { useEffect, useState } from 'react'
import { searchLocations } from '../api/forecast'

export function useLocationSearch(query, { delay = 300 } = {}) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    let active = true
    setLoading(true)
    const timer = setTimeout(() => {
      searchLocations(query)
        .then((res) => {
          if (active) setResults(res)
        })
        .catch(() => {
          if (active) setResults([])
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }, delay)

    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [query, delay])

  return { results, loading }
}

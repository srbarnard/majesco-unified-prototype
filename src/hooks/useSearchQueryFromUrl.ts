import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router'

/** Seeds list-page search from `?q=` once, then clears the param. */
export function useSearchQueryFromUrl(onQuery: (query: string) => void) {
  const [searchParams, setSearchParams] = useSearchParams()
  const appliedRef = useRef<string | null>(null)

  useEffect(() => {
    const query = searchParams.get('q')
    if (!query) {
      appliedRef.current = null
      return
    }
    if (appliedRef.current === query) return

    appliedRef.current = query
    onQuery(query)

    setSearchParams(
      (current) => {
        const nextParams = new URLSearchParams(current)
        nextParams.delete('q')
        return nextParams
      },
      { replace: true },
    )
  }, [onQuery, searchParams, setSearchParams])
}

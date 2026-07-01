import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router'

type BrowserHistoryState = {
  idx: number
  maxIdx: number
}

function readHistoryIdx(): number {
  const state = window.history.state as BrowserHistoryState | null
  return typeof state?.idx === 'number' ? state.idx : 0
}

/**
 * Browser-style back/forward controls for the global nav.
 * Uses React Router's history `idx` plus a tracked max index for forward availability.
 */
export function useBrowserHistoryNavigation() {
  const location = useLocation()
  const navigationType = useNavigationType()
  const [historyIdx, setHistoryIdx] = useState(readHistoryIdx)
  const [maxHistoryIdx, setMaxHistoryIdx] = useState(readHistoryIdx)

  useEffect(() => {
    const idx = readHistoryIdx()

    if (navigationType === 'POP') {
      setHistoryIdx(idx)
      setMaxHistoryIdx((current) => Math.max(current, idx))
      return
    }

    setHistoryIdx(idx)
    setMaxHistoryIdx(idx)
  }, [location.key, navigationType])

  useEffect(() => {
    const handlePopState = () => {
      const idx = readHistoryIdx()
      setHistoryIdx(idx)
      setMaxHistoryIdx((current) => Math.max(current, idx))
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  const canGoBack = historyIdx > 0
  const canGoForward = historyIdx < maxHistoryIdx

  const goBack = useCallback(() => {
    if (canGoBack) {
      window.history.back()
    }
  }, [canGoBack])

  const goForward = useCallback(() => {
    if (canGoForward) {
      window.history.forward()
    }
  }, [canGoForward])

  return { canGoBack, canGoForward, goBack, goForward }
}

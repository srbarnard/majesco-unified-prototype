import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import {
  AGENTIC_SEARCHES,
  QUICK_LOOKUPS,
  type AgenticSearchId,
  type QuickLookupId,
} from '@/app/navigation/globalSearchConfig'

export type GlobalCopilotView = 'daily-summary' | 'agentic-search' | null

type GlobalSearchContextValue = {
  copilotOpen: boolean
  copilotView: GlobalCopilotView
  agenticPrompt: string | null
  runQuickLookup: (id: QuickLookupId) => void
  runAgenticSearch: (id: AgenticSearchId) => void
  runAgenticSearchPrompt: (prompt: string) => void
  openDailySummary: () => void
  closeCopilot: () => void
  toggleCopilot: () => void
  openHomeCopilotDefault: () => void
}

const GlobalSearchContext = createContext<GlobalSearchContextValue | null>(null)

export function GlobalSearchProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [copilotView, setCopilotView] = useState<GlobalCopilotView>(null)
  const [agenticPrompt, setAgenticPrompt] = useState<string | null>(null)

  const runQuickLookup = useCallback(
    (id: QuickLookupId) => {
      const lookup = QUICK_LOOKUPS.find((item) => item.id === id)
      if (!lookup) return
      navigate(`${lookup.path}?lookup=${id}`)
    },
    [navigate],
  )

  const runAgenticSearch = useCallback(
    (id: AgenticSearchId) => {
      const search = AGENTIC_SEARCHES.find((item) => item.id === id)
      if (!search) return
      setAgenticPrompt(search.prompt)
      setCopilotView('agentic-search')
      setCopilotOpen(true)
      navigate('/')
    },
    [navigate],
  )

  const runAgenticSearchPrompt = useCallback(
    (prompt: string) => {
      const trimmed = prompt.trim()
      if (!trimmed) return
      setAgenticPrompt(trimmed)
      setCopilotView('agentic-search')
      setCopilotOpen(true)
      navigate('/')
    },
    [navigate],
  )

  const openDailySummary = useCallback(() => {
    setAgenticPrompt(null)
    setCopilotView('daily-summary')
    setCopilotOpen(true)
    navigate('/')
  }, [navigate])

  const closeCopilot = useCallback(() => {
    setCopilotOpen(false)
    setCopilotView(null)
    setAgenticPrompt(null)
  }, [])

  const toggleCopilot = useCallback(() => {
    if (copilotOpen) {
      closeCopilot()
      return
    }
    setAgenticPrompt(null)
    setCopilotView('daily-summary')
    setCopilotOpen(true)
  }, [closeCopilot, copilotOpen])

  const openHomeCopilotDefault = useCallback(() => {
    setAgenticPrompt(null)
    setCopilotView('daily-summary')
    setCopilotOpen(true)
  }, [])

  const value = useMemo(
    () => ({
      copilotOpen,
      copilotView,
      agenticPrompt,
      runQuickLookup,
      runAgenticSearch,
      runAgenticSearchPrompt,
      openDailySummary,
      closeCopilot,
      toggleCopilot,
      openHomeCopilotDefault,
    }),
    [
      agenticPrompt,
      closeCopilot,
      copilotOpen,
      copilotView,
      openDailySummary,
      openHomeCopilotDefault,
      runAgenticSearch,
      runAgenticSearchPrompt,
      runQuickLookup,
      toggleCopilot,
    ],
  )

  return <GlobalSearchContext.Provider value={value}>{children}</GlobalSearchContext.Provider>
}

export function useGlobalSearch() {
  const context = useContext(GlobalSearchContext)
  if (!context) {
    throw new Error('useGlobalSearch must be used within GlobalSearchProvider')
  }
  return context
}

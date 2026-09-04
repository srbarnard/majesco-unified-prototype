import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useGlobalSearch } from '@/app/contexts/GlobalSearchContext'
import type { CopilotPanelProps } from '@/pages/policies/components/CopilotPanel'

export type RightToolId = 'copilot' | 'notes' | 'email' | 'filter' | 'parties'

export type RightToolRecordContext = {
  title: string
  subtitle?: string
} | null

export type RightToolCopilotSession = Omit<CopilotPanelProps, 'onClose'>

type RightToolContextValue = {
  activeTool: RightToolId | null
  recordContext: RightToolRecordContext
  copilotSession: RightToolCopilotSession | null
  /** Specialty Copilot UIs (submissions, quote wizard) rendered instead of CopilotPanel. */
  copilotCustomContent: ReactNode | null
  /** Page-registered Filter panel; non-null means Filter is available on the rail. */
  filterContent: ReactNode | null
  /** Page-registered Parties/Contacts panel; non-null means Parties is available on the rail. */
  partiesContent: ReactNode | null
  openTool: (tool: RightToolId) => void
  closeTool: () => void
  toggleTool: (tool: RightToolId) => void
  setRecordContext: (context: RightToolRecordContext) => void
  setCopilotSession: (session: RightToolCopilotSession | null) => void
  setCopilotCustomContent: (content: ReactNode | null) => void
  setFilterContent: (content: ReactNode | null) => void
  setPartiesContent: (content: ReactNode | null) => void
}

const RightToolContext = createContext<RightToolContextValue | null>(null)

export function RightToolProvider({ children }: { children: ReactNode }) {
  const { copilotOpen, openHomeCopilotDefault, closeCopilot } = useGlobalSearch()
  const [activeTool, setActiveTool] = useState<RightToolId | null>(null)
  const [recordContext, setRecordContext] = useState<RightToolRecordContext>(null)
  const [copilotSession, setCopilotSession] = useState<RightToolCopilotSession | null>(null)
  const [copilotCustomContent, setCopilotCustomContent] = useState<ReactNode | null>(null)
  const [filterContent, setFilterContent] = useState<ReactNode | null>(null)
  const [partiesContent, setPartiesContent] = useState<ReactNode | null>(null)

  const closeTool = useCallback(() => {
    setActiveTool(null)
    closeCopilot()
  }, [closeCopilot])

  const openTool = useCallback(
    (tool: RightToolId) => {
      if (tool === 'copilot') {
        setActiveTool('copilot')
        // Preserve agentic / existing Copilot view when already open.
        if (!copilotOpen) {
          openHomeCopilotDefault()
        }
        return
      }
      // Close Copilot flags first so the sync effect cannot snap activeTool back to Copilot.
      closeCopilot()
      setActiveTool(tool)
    },
    [closeCopilot, copilotOpen, openHomeCopilotDefault],
  )

  const toggleTool = useCallback(
    (tool: RightToolId) => {
      if (activeTool === tool) {
        closeTool()
        return
      }
      openTool(tool)
    },
    [activeTool, closeTool, openTool],
  )

  // Keep rail Copilot in sync with GlobalSearch open flags (agentic search, Home default, etc.).
  // Do not clear Notes/Email/Filter/Parties when Copilot flags turn off.
  useEffect(() => {
    if (copilotOpen) {
      setActiveTool('copilot')
      return
    }
    setActiveTool((current) => (current === 'copilot' ? null : current))
  }, [copilotOpen])

  // Drop contextual tools when the page unregisters their content.
  useEffect(() => {
    if (activeTool === 'filter' && filterContent == null) {
      setActiveTool(null)
    }
  }, [activeTool, filterContent])

  useEffect(() => {
    if (activeTool === 'parties' && partiesContent == null) {
      setActiveTool(null)
    }
  }, [activeTool, partiesContent])

  const value = useMemo(
    () => ({
      activeTool,
      recordContext,
      copilotSession,
      copilotCustomContent,
      filterContent,
      partiesContent,
      openTool,
      closeTool,
      toggleTool,
      setRecordContext,
      setCopilotSession,
      setCopilotCustomContent,
      setFilterContent,
      setPartiesContent,
    }),
    [
      activeTool,
      closeTool,
      copilotCustomContent,
      copilotSession,
      filterContent,
      openTool,
      partiesContent,
      recordContext,
      toggleTool,
    ],
  )

  return <RightToolContext.Provider value={value}>{children}</RightToolContext.Provider>
}

export function useRightTool() {
  const context = useContext(RightToolContext)
  if (!context) {
    throw new Error('useRightTool must be used within RightToolProvider')
  }
  return context
}

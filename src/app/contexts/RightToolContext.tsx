import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useGlobalSearch } from '@/app/contexts/GlobalSearchContext'
import type { DocumentAttachMode } from '@/pages/policies/components/DocumentAttachComposer'
import type { CopilotPanelProps } from '@/pages/policies/components/CopilotPanel'

export type RightToolId = 'copilot' | 'notes' | 'email' | 'filter' | 'parties'

export type RightToolRecordContext = {
  title: string
  subtitle?: string
} | null

export type RightToolCopilotSession = Omit<CopilotPanelProps, 'onClose'>

export type RightToolEmailAttachMode = DocumentAttachMode | null
export type RightToolNoteAttachMode = DocumentAttachMode | null

type RightToolState = {
  activeTool: RightToolId | null
  recordContext: RightToolRecordContext
  copilotSession: RightToolCopilotSession | null
  /** Specialty Copilot UIs (submissions, quote wizard) rendered instead of CopilotPanel. */
  copilotCustomContent: ReactNode | null
  /** Page-registered document email draft (document viewer); drives Email tool content. */
  emailAttachMode: RightToolEmailAttachMode
  /** Page-registered document note draft (document viewer); drives Notes tool content. */
  noteAttachMode: RightToolNoteAttachMode
  /** Page-registered Filter panel; non-null means Filter is available on the rail. */
  filterContent: ReactNode | null
  /** Page-registered Parties/Contacts panel; non-null means Parties is available on the rail. */
  partiesContent: ReactNode | null
}

type RightToolDispatch = {
  openTool: (tool: RightToolId) => void
  closeTool: () => void
  toggleTool: (tool: RightToolId) => void
  setRecordContext: (context: RightToolRecordContext) => void
  setCopilotSession: (session: RightToolCopilotSession | null) => void
  setCopilotCustomContent: (content: ReactNode | null) => void
  setEmailAttachMode: (mode: RightToolEmailAttachMode) => void
  setNoteAttachMode: (mode: RightToolNoteAttachMode) => void
  setFilterContent: (content: ReactNode | null) => void
  setPartiesContent: (content: ReactNode | null) => void
}

type RightToolContextValue = RightToolState & RightToolDispatch

const RightToolStateContext = createContext<RightToolState | null>(null)
const RightToolDispatchContext = createContext<RightToolDispatch | null>(null)

export function RightToolProvider({ children }: { children: ReactNode }) {
  const { copilotOpen, openHomeCopilotDefault, closeCopilot } = useGlobalSearch()
  const [activeTool, setActiveTool] = useState<RightToolId | null>(null)
  const [recordContext, setRecordContext] = useState<RightToolRecordContext>(null)
  const [copilotSession, setCopilotSession] = useState<RightToolCopilotSession | null>(null)
  const [copilotCustomContent, setCopilotCustomContent] = useState<ReactNode | null>(null)
  const [emailAttachMode, setEmailAttachMode] = useState<RightToolEmailAttachMode>(null)
  const [noteAttachMode, setNoteAttachMode] = useState<RightToolNoteAttachMode>(null)
  const [filterContent, setFilterContent] = useState<ReactNode | null>(null)
  const [partiesContent, setPartiesContent] = useState<ReactNode | null>(null)

  // Keep latest flags in refs so open/toggle stay referentially stable. Unstable
  // openTool identities previously re-fired page URL sync effects and froze SPA nav.
  const copilotOpenRef = useRef(copilotOpen)
  copilotOpenRef.current = copilotOpen
  const activeToolRef = useRef(activeTool)
  activeToolRef.current = activeTool

  const closeTool = useCallback(() => {
    setActiveTool(null)
    closeCopilot()
  }, [closeCopilot])

  const openTool = useCallback(
    (tool: RightToolId) => {
      if (tool === 'copilot') {
        setActiveTool((current) => (current === 'copilot' ? current : 'copilot'))
        // Preserve agentic / existing Copilot view when already open.
        if (!copilotOpenRef.current) {
          openHomeCopilotDefault()
        }
        return
      }
      // Close Copilot flags first so the sync effect cannot snap activeTool back to Copilot.
      closeCopilot()
      setActiveTool(tool)
    },
    [closeCopilot, openHomeCopilotDefault],
  )

  const toggleTool = useCallback(
    (tool: RightToolId) => {
      if (activeToolRef.current === tool) {
        closeTool()
        return
      }
      openTool(tool)
    },
    [closeTool, openTool],
  )

  // Keep rail Copilot in sync with GlobalSearch open flags (agentic search, Home default, etc.).
  // Do not clear Notes/Email/Filter/Parties when Copilot flags turn off.
  useEffect(() => {
    if (copilotOpen) {
      setActiveTool((current) => (current === 'copilot' ? current : 'copilot'))
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

  const state = useMemo(
    () => ({
      activeTool,
      recordContext,
      copilotSession,
      copilotCustomContent,
      emailAttachMode,
      noteAttachMode,
      filterContent,
      partiesContent,
    }),
    [
      activeTool,
      recordContext,
      copilotSession,
      copilotCustomContent,
      emailAttachMode,
      noteAttachMode,
      filterContent,
      partiesContent,
    ],
  )

  // Stable dispatch surface so page registration / URL sync hooks don't re-render
  // or re-fire when session content or activeTool changes.
  const dispatch = useMemo(
    () => ({
      openTool,
      closeTool,
      toggleTool,
      setRecordContext,
      setCopilotSession,
      setCopilotCustomContent,
      setEmailAttachMode,
      setNoteAttachMode,
      setFilterContent,
      setPartiesContent,
    }),
    [openTool, closeTool, toggleTool],
  )

  return (
    <RightToolDispatchContext.Provider value={dispatch}>
      <RightToolStateContext.Provider value={state}>{children}</RightToolStateContext.Provider>
    </RightToolDispatchContext.Provider>
  )
}

/** Full tool state + actions (drawer, rail, pages that need session content). */
export function useRightTool(): RightToolContextValue {
  const state = useContext(RightToolStateContext)
  const dispatch = useContext(RightToolDispatchContext)
  if (!state || !dispatch) {
    throw new Error('useRightTool must be used within RightToolProvider')
  }
  return useMemo(() => ({ ...state, ...dispatch }), [state, dispatch])
}

/** Actions/setters only — safe for route pages that register Copilot/filter content. */
export function useRightToolDispatch(): RightToolDispatch {
  const dispatch = useContext(RightToolDispatchContext)
  if (!dispatch) {
    throw new Error('useRightToolDispatch must be used within RightToolProvider')
  }
  return dispatch
}

import { useEffect, useRef, type ReactNode } from 'react'
import {
  useRightTool,
  type RightToolCopilotSession,
  type RightToolRecordContext,
} from '@/app/contexts/RightToolContext'

/** Register page-specific Copilot props while this route is mounted. */
export function useRegisterRightToolCopilot(
  session: RightToolCopilotSession | null,
  deps: ReadonlyArray<unknown>,
) {
  const { setCopilotSession } = useRightTool()
  const sessionRef = useRef(session)
  sessionRef.current = session

  useEffect(() => {
    setCopilotSession(sessionRef.current)
    return () => setCopilotSession(null)
    // Caller supplies the meaningful dependency list for the session snapshot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Register a specialty Copilot UI (e.g. SubmissionsCopilotPanel, QuoteWizardCopilotPanel)
 * that replaces CopilotPanel in the shell drawer while this route is mounted.
 *
 * Content is kept in a ref and a revision bump triggers the drawer to re-read it,
 * avoiding ReactNode identity loops from putting elements directly in context state.
 */
export function useRegisterRightToolCopilotCustom(
  content: ReactNode | null,
  deps: ReadonlyArray<unknown>,
) {
  const { setCopilotCustomContent } = useRightTool()
  const contentRef = useRef(content)
  contentRef.current = content

  useEffect(() => {
    setCopilotCustomContent(contentRef.current)
    return () => setCopilotCustomContent(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/** Register account/policy label shown in Notes / Email drawer headers. */
export function useRegisterRightToolRecordContext(
  context: RightToolRecordContext,
  deps: ReadonlyArray<unknown>,
) {
  const { setRecordContext } = useRightTool()

  useEffect(() => {
    setRecordContext(context)
    return () => setRecordContext(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Register a page Filter panel in the shell drawer.
 * Pass null to hide the Filter rail button (e.g. analytics tab / non-documents tab).
 */
export function useRegisterRightToolFilter(content: ReactNode | null, deps: ReadonlyArray<unknown>) {
  const { setFilterContent } = useRightTool()
  const contentRef = useRef(content)
  contentRef.current = content

  useEffect(() => {
    setFilterContent(contentRef.current)
    return () => setFilterContent(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Register a page Parties/Contacts panel in the shell drawer.
 * Pass null to hide the Parties rail button.
 */
export function useRegisterRightToolParties(content: ReactNode | null, deps: ReadonlyArray<unknown>) {
  const { setPartiesContent } = useRightTool()
  const contentRef = useRef(content)
  contentRef.current = content

  useEffect(() => {
    setPartiesContent(contentRef.current)
    return () => setPartiesContent(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

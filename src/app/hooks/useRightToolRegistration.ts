import { useEffect, useRef, type ReactNode } from 'react'
import {
  useRightToolDispatch,
  type RightToolCopilotSession,
  type RightToolEmailAttachMode,
  type RightToolNoteAttachMode,
  type RightToolRecordContext,
} from '@/app/contexts/RightToolContext'

/** Register page-specific Copilot props while this route is mounted. */
export function useRegisterRightToolCopilot(
  session: RightToolCopilotSession | null,
  deps: ReadonlyArray<unknown>,
) {
  const { setCopilotSession } = useRightToolDispatch()
  const sessionRef = useRef(session)
  sessionRef.current = session

  useEffect(() => {
    setCopilotSession(sessionRef.current)
    return () => setCopilotSession(null)
    // Prefer primitives in `deps`. Object deps + useRightTool() on the same page
    // caused Maximum update depth and froze client navigation from document viewer.
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
  const { setCopilotCustomContent } = useRightToolDispatch()
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
  const { setRecordContext } = useRightToolDispatch()
  const contextRef = useRef(context)
  contextRef.current = context

  useEffect(() => {
    setRecordContext(contextRef.current)
    return () => setRecordContext(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Register a document-backed Email draft for the Email tool (document viewer).
 * When set, rail Email opens the document-specific composer instead of the generic follow-up.
 */
export function useRegisterRightToolEmailAttach(
  mode: RightToolEmailAttachMode,
  deps: ReadonlyArray<unknown>,
) {
  const { setEmailAttachMode } = useRightToolDispatch()
  const modeRef = useRef(mode)
  modeRef.current = mode

  useEffect(() => {
    setEmailAttachMode(modeRef.current)
    return () => setEmailAttachMode(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Register a document-backed Note draft for the Notes tool (document viewer).
 * When set, rail Notes opens the document-specific composer instead of a blank note.
 */
export function useRegisterRightToolNoteAttach(
  mode: RightToolNoteAttachMode,
  deps: ReadonlyArray<unknown>,
) {
  const { setNoteAttachMode } = useRightToolDispatch()
  const modeRef = useRef(mode)
  modeRef.current = mode

  useEffect(() => {
    setNoteAttachMode(modeRef.current)
    return () => setNoteAttachMode(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

/**
 * Register a page Filter panel in the shell drawer.
 * Pass null to hide the Filter rail button (e.g. analytics tab / non-documents tab).
 */
export function useRegisterRightToolFilter(content: ReactNode | null, deps: ReadonlyArray<unknown>) {
  const { setFilterContent } = useRightToolDispatch()
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
  const { setPartiesContent } = useRightToolDispatch()
  const contentRef = useRef(content)
  contentRef.current = content

  useEffect(() => {
    setPartiesContent(contentRef.current)
    return () => setPartiesContent(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)
}

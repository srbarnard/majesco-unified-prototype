import { useRef, useState } from 'react'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { CreateClaimPanel } from '@/pages/claims/components/CreateClaimPanel'
import {
  discardClaimThread,
  getActiveClaimThread,
  saveClaimThread,
  setActiveClaimThread,
  useClaimDrawerRequest,
  useClaimThreads,
  type CreateClaimSavedState,
} from '@/pages/claims/data/claimDrawerStore'
import { getClaim, upsertClaim } from '@/pages/claims/data/claimsStore'
import { recordFromDraft } from '@/pages/claims/data/createClaimDraft'

function threadTitle({ draft }: CreateClaimSavedState) {
  if (!draft) return 'New claim'
  const insured = draft.policy?.insured ?? getClaim(draft.claimNumber)?.insured
  return insured ? `${draft.claimNumber} · ${insured}` : draft.claimNumber
}

/** Global Create claim drawer: opens from the rail, the Claims header, Create new → Claim, or a Claims row. */
export function CreateClaimToolPanel() {
  const { closeTool } = useRightTool()
  const threads = useClaimThreads()
  const request = useClaimDrawerRequest()
  const [session, setSession] = useState(0)
  /** History opens the saved claim; a new drawer request starts a fresh claim. */
  const openedFromHistory = useRef(false)
  const requestKey = useRef(request.key)
  if (requestKey.current !== request.key) {
    requestKey.current = request.key
    openedFromHistory.current = false
  }

  return (
    <CreateClaimPanel
      key={`${request.key}-${session}`}
      initialState={getActiveClaimThread()?.state ?? null}
      initialIntent={request.intent}
      openedFromHistory={openedFromHistory.current}
      history={threads.map(({ id, state }) => ({
        id,
        title: threadTitle(state),
        subtitle: state.created ? 'Created' : 'Draft',
      }))}
      onOpenHistory={(id) => {
        const thread = threads.find((entry) => entry.id === id)
        if (!thread) return
        setActiveClaimThread(thread)
        openedFromHistory.current = true
        setSession((current) => current + 1)
      }}
      onStartOver={() => setActiveClaimThread(null)}
      onClose={closeTool}
      onSaveDraft={(state) => {
        saveClaimThread(state)
        if (state.draft) upsertClaim(recordFromDraft(state.draft, 'Draft', getClaim(state.draft.claimNumber)))
        closeTool()
      }}
      onDiscard={(claimNumber) => {
        if (claimNumber) discardClaimThread(claimNumber)
        setActiveClaimThread(null)
        closeTool()
      }}
      onCreate={(state) => {
        saveClaimThread(state)
        const { draft } = state
        if (!draft) return
        const status = draft.driver?.status === 'referred' ? 'Coverage referral' : 'Reported'
        upsertClaim(recordFromDraft(draft, status, getClaim(draft.claimNumber)))
        // The confirmation lives only in this mount; the next open starts a new claim.
        setActiveClaimThread(null)
      }}
    />
  )
}

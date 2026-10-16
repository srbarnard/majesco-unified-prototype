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
  type ClaimThread,
} from '@/pages/claims/data/claimDrawerStore'
import { getClaim, upsertClaim, type ClaimStatus } from '@/pages/claims/data/claimsStore'
import { CLAIM_STATUS_TONES } from '@/pages/claims/data/claimStatusTones'
import { recordFromDraft } from '@/pages/claims/data/createClaimDraft'

function historyEntry({ id, state }: ClaimThread) {
  const { draft, created } = state
  const record = draft ? getClaim(draft.claimNumber) : null
  const insured = draft?.policy?.insured ?? record?.insured ?? null
  const status: ClaimStatus = record?.status ?? (created ? 'Reported' : 'Draft')
  return {
    id,
    title: draft?.claimNumber ?? 'New claim',
    subtitle: insured ?? draft?.description ?? '',
    status: { label: status, tone: CLAIM_STATUS_TONES[status] },
  }
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
      history={threads.map(historyEntry)}
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

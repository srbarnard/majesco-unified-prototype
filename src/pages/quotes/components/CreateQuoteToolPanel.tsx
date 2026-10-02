import { useState } from 'react'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { CreateQuotePanel, type CreateQuoteSavedState } from '@/pages/quotes/components/CreateQuotePanel'
import { draftUid } from '@/pages/shared/components/DraftDrawer'

type SavedQuoteDraft = { id: string; state: CreateQuoteSavedState }

// Module scope survives the drawer unmounting between opens.
let savedQuoteDrafts: SavedQuoteDraft[] = []
/** The draft the drawer resumes on its next open; its row is updated on the next Save draft. */
let activeDraft: SavedQuoteDraft | null = null

/** Global Create quote drawer — opens from the rail, the Quotes header, or Create new → Quote. */
export function CreateQuoteToolPanel() {
  const { closeTool, openTool, setEmailAttachMode } = useRightTool()
  const [drafts, setDrafts] = useState(savedQuoteDrafts)
  const [session, setSession] = useState(0)
  const resumeQuote = () => openTool('newQuote')

  const holdDraft = (state: CreateQuoteSavedState) => {
    activeDraft = { id: activeDraft?.id ?? draftUid('quote'), state }
  }

  return (
    <CreateQuotePanel
      key={session}
      initialState={activeDraft?.state ?? null}
      history={drafts.map(({ id, state }) => ({ id, title: state.draft.name || 'New quote', subtitle: 'Draft' }))}
      onOpenHistory={(id) => {
        const draft = savedQuoteDrafts.find((entry) => entry.id === id)
        if (!draft) return
        activeDraft = draft
        setSession((current) => current + 1)
      }}
      onStartOver={() => {
        activeDraft = null
      }}
      onClose={closeTool}
      onSaveDraft={(state) => {
        holdDraft(state)
        const saved = activeDraft!
        savedQuoteDrafts = [saved, ...savedQuoteDrafts.filter((entry) => entry.id !== saved.id)]
        setDrafts(savedQuoteDrafts)
        closeTool()
      }}
      onAddNote={(state) => {
        holdDraft(state)
        openTool('notes')
      }}
      onEmailMissingInfo={({ subject, body }, state) => {
        holdDraft(state)
        setEmailAttachMode({
          target: 'email',
          documents: [],
          draft: { subject, body, title: 'Email for missing info', subtitle: state.draft.name || undefined },
          onCancel: resumeQuote,
          onSave: resumeQuote,
        })
        openTool('email')
      }}
    />
  )
}

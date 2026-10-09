import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { draftUid } from '@/pages/shared/components/DraftDrawer'
import { draftDocument } from '@/pages/shared/data/draftDocuments'
import {
  CreateSubmissionPanel,
  type CreateSubmissionSavedState,
} from '@/pages/submissions/components/CreateSubmissionPanel'

type SavedSubmissionDraft = { id: string; state: CreateSubmissionSavedState }

// Module scope survives the drawer unmounting between opens.
let savedSubmissionDrafts: SavedSubmissionDraft[] = []
/** The draft the drawer resumes on its next open; its row is updated on the next Save draft. */
let activeDraft: SavedSubmissionDraft | null = null

/** Global Create submission drawer — opens from the rail, the Submissions header, or Create new → Submission. */
export function CreateSubmissionToolPanel() {
  const { closeTool, openTool, setEmailAttachMode } = useRightTool()
  const [drafts, setDrafts] = useState(savedSubmissionDrafts)
  const [session, setSession] = useState(0)
  const resumeSubmission = () => openTool('newSubmission')
  const location = useLocation()
  const navigate = useNavigate()

  const holdDraft = (state: CreateSubmissionSavedState) => {
    activeDraft = { id: activeDraft?.id ?? draftUid('submission'), state }
  }

  return (
    <CreateSubmissionPanel
      key={session}
      initialState={activeDraft?.state ?? null}
      history={drafts.map(({ id, state }) => ({
        id,
        title: state.draft.account || 'New submission',
        subtitle: state.created?.submissionNumber ?? 'Draft',
      }))}
      onOpenHistory={(id) => {
        const draft = savedSubmissionDrafts.find((entry) => entry.id === id)
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
        savedSubmissionDrafts = [saved, ...savedSubmissionDrafts.filter((entry) => entry.id !== saved.id)]
        setDrafts(savedSubmissionDrafts)
        closeTool()
      }}
      onAddNote={(state) => {
        holdDraft(state)
        openTool('notes')
      }}
      onOpenDocument={(fileName, state) => {
        holdDraft(state)
        const title = state.draft.account || 'New submission'
        const document = draftDocument(`submission-${activeDraft!.id}`, fileName, {
          kind: 'Submission',
          label: state.created?.submissionNumber ?? 'New submission',
          recordTitle: title,
          path: `${location.pathname}${location.search}`,
          reopen: resumeSubmission,
        })
        navigate(`/documents/${document.id}`)
      }}
      onEmailMissingInfo={({ subject, body }, state) => {
        holdDraft(state)
        setEmailAttachMode({
          target: 'email',
          documents: [],
          draft: { subject, body, title: 'Email for missing info', subtitle: state.draft.account || undefined },
          onCancel: resumeSubmission,
          onSave: resumeSubmission,
        })
        openTool('email')
      }}
    />
  )
}

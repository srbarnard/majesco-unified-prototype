import Box from '@mui/material/Box'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useRightToolDispatch } from '@/app/contexts/RightToolContext'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolEmailAttach,
  useRegisterRightToolNoteAttach,
  useRegisterRightToolRecordContext,
} from '@/app/hooks/useRightToolRegistration'
import { PlaceholderPage } from '@/app/pages/PlaceholderPage'
import type { DocumentAttachMode } from '@/pages/policies/components/DocumentAttachComposer'
import { quickActionToAttachTarget } from '@/pages/policies/components/DocumentAttachComposer'
import { DocumentViewerCanvas } from '@/pages/policies/components/DocumentViewerCanvas'
import type { DocumentViewerAction } from '@/pages/policies/components/DocumentViewerHoverActions'
import { DocumentViewerHeader } from '@/pages/policies/components/DocumentViewerHeader'
import { getDocumentPreviewContent } from '@/pages/policies/data/documentPreviewData'
import { policyDetailsMock } from '@/pages/policies/data/mockPolicyDetails'
import {
  resolvePolicyDocument,
  resolveQuoteDocument,
  resolveSubmissionDocument,
} from '@/pages/policies/data/resolveDocument'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import { resolveQuoteContext } from '@/pages/quotes/data/resolveQuoteContext'
import { resolveDraftDocument } from '@/pages/shared/data/draftDocuments'
import { resolveSubmissionContext } from '@/pages/submissions/data/resolveSubmissionContext'

type DocumentViewerPageProps = {
  context: 'policy' | 'quote-detail' | 'submission-detail' | 'draft'
}

export function DocumentViewerPage({ context }: DocumentViewerPageProps) {
  const navigate = useNavigate()
  const isDesktop = useIsDesktopLayout()
  const { openTool, closeTool } = useRightToolDispatch()
  const { policyId, quoteId, submissionId, docId = '' } = useParams<{
    policyId?: string
    quoteId?: string
    submissionId?: string
    docId: string
  }>()

  const isQuote = context === 'quote-detail'
  const isSubmission = context === 'submission-detail'
  const isDraft = context === 'draft'
  const quote = isQuote ? resolveQuoteContext(quoteId) : null
  const submission = isSubmission ? resolveSubmissionContext(submissionId) : null
  const draftEntry = isDraft ? resolveDraftDocument(docId) : undefined
  const document = isQuote && quote
    ? resolveQuoteDocument(quote.quoteNumber, docId)
    : isSubmission && submission
      ? resolveSubmissionDocument(submission.id, docId)
      : isDraft
        ? draftEntry?.document
        : resolvePolicyDocument(docId)

  const [attachMode, setAttachMode] = useState<DocumentAttachMode | null>(null)
  const didInitCopilot = useRef(false)
  const wasDesktop = useRef(isDesktop)

  const preview = useMemo(
    () => (document ? getDocumentPreviewContent(document) : null),
    [document],
  )
  const entityLabel = isQuote
    ? `Quote ${quote?.quoteNumber ?? quoteId}`
    : isSubmission
      ? `Submission ${submission?.submissionNumber ?? submissionId}`
      : isDraft
        ? (draftEntry?.origin.label ?? 'Draft')
        : `Policy ${policyDetailsMock.policyNumber}`

  const recordTitle = isQuote
    ? (quote?.insuredName ?? 'Quote')
    : isSubmission
      ? (submission?.insuredName ?? 'Submission')
      : isDraft
        ? (draftEntry?.origin.recordTitle ?? 'Draft')
        : policyDetailsMock.companyName
  const recordSubtitle = isQuote
    ? (quote?.quoteNumber ?? quoteId)
    : isSubmission
      ? (submission?.submissionNumber ?? submissionId)
      : isDraft
        ? draftEntry?.origin.recordSubtitle
        : policyDetailsMock.policyNumber

  useRegisterRightToolRecordContext(
    { title: recordTitle, subtitle: recordSubtitle },
    [recordTitle, recordSubtitle],
  )

  // Keep Email / Notes tools document-specific on this screen (hover + rail share drafts).
  useRegisterRightToolEmailAttach(
    document ? { target: 'email', documents: [document] } : null,
    [document?.id],
  )
  useRegisterRightToolNoteAttach(
    document ? { target: 'note', documents: [document] } : null,
    [document?.id],
  )

  const documentId = document?.id ?? null
  const attachTarget = attachMode?.target ?? null
  useRegisterRightToolCopilot(
    document && preview
      ? {
          context: isDraft ? 'global' : context,
          activePolicyTab: 'documents',
          focusedDocument: document,
          documentPreviewMode: true,
          documentExtractedText: preview.extractedText,
          documentPreviewInsights: preview.keyInsights,
          attachMode,
          attachContextLabel: entityLabel,
          onCloseAttach: () => setAttachMode(null),
          onAttachSave: () => setAttachMode(null),
          onQuickAction: (action) => {
            const target = quickActionToAttachTarget(action)
            if (target === 'email') {
              openTool('email')
              return
            }
            if (target === 'note') {
              openTool('notes')
            }
          },
        }
      : null,
    // Primitives only. Object deps (preview, document, attachMode, callbacks) re-fire
    // registration → RightTool setState → re-render → Maximum update depth, which
    // freezes client-side navigation from the document viewer.
    [attachTarget, context, documentId, entityLabel],
  )

  useEffect(() => {
    if (didInitCopilot.current) return
    didInitCopilot.current = true
    if (isDesktop) {
      openTool('copilot')
    }
    // Intentionally omit openTool — only one-shot open on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesktop])

  useEffect(() => {
    if (wasDesktop.current && !isDesktop) {
      closeTool()
      setAttachMode(null)
    }
    wasDesktop.current = isDesktop
  }, [closeTool, isDesktop])

  const handleBackToDocuments = useCallback(() => {
    if (isQuote && quoteId) {
      navigate(`/quotes/${quoteId}?tab=documents`)
      return
    }
    if (isSubmission && submissionId) {
      navigate(`/submissions/${submissionId}?tab=documents`)
      return
    }
    if (isDraft) {
      // Back to the page and drawer the file was opened from, with the draft restored.
      const origin = draftEntry?.origin
      navigate(origin?.path ?? '/')
      origin?.reopen()
      return
    }
    navigate(`/policies/${policyId ?? policyDetailsMock.policyNumber}?tab=documents`)
  }, [draftEntry, isDraft, isQuote, isSubmission, navigate, policyId, quoteId, submissionId])

  const handleViewerAction = useCallback(
    (action: DocumentViewerAction) => {
      if (!document) return
      if (action === 'download') return
      if (action === 'note') {
        // Open the Notes tool (active rail icon) with the registered document draft.
        openTool('notes')
        return
      }
      if (action === 'task') {
        setAttachMode({ target: 'task', documents: [document] })
        openTool('copilot')
        return
      }
      if (action === 'email') {
        // Open the Email tool (active rail icon) with the registered document draft —
        // do not route through Chat attach, which left Email inactive / generic.
        openTool('email')
      }
    },
    [document, openTool],
  )

  if (!document || !preview) {
    return (
      <PlaceholderPage
        title="Document not found"
        description="This document could not be loaded. Return to the documents list and try again."
      />
    )
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <DocumentViewerHeader
          document={document}
          entityLabel={entityLabel}
          onBack={handleBackToDocuments}
        />

        <DocumentViewerCanvas document={document} onAction={handleViewerAction} />
      </Box>
    </Box>
  )
}

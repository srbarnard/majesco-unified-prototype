import Box from '@mui/material/Box'
import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { PlaceholderPage } from '@/app/pages/PlaceholderPage'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import type { DocumentAttachMode } from '@/pages/policies/components/DocumentAttachComposer'
import { DocumentViewerCanvas } from '@/pages/policies/components/DocumentViewerCanvas'
import type { DocumentViewerAction } from '@/pages/policies/components/DocumentViewerHoverActions'
import { DocumentViewerHeader } from '@/pages/policies/components/DocumentViewerHeader'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import { getDocumentPreviewContent } from '@/pages/policies/data/documentPreviewData'
import { policyDetailsMock } from '@/pages/policies/data/mockPolicyDetails'
import {
  resolvePolicyDocument,
  resolveQuoteDocument,
  resolveSubmissionDocument,
} from '@/pages/policies/data/resolveDocument'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import { resolveQuoteContext } from '@/pages/quotes/data/resolveQuoteContext'
import { resolveSubmissionContext } from '@/pages/submissions/data/resolveSubmissionContext'

type DocumentViewerPageProps = {
  context: 'policy' | 'quote-detail' | 'submission-detail'
}

export function DocumentViewerPage({ context }: DocumentViewerPageProps) {
  const navigate = useNavigate()
  const isDesktop = useIsDesktopLayout()
  const { policyId, quoteId, submissionId, docId = '' } = useParams<{
    policyId?: string
    quoteId?: string
    submissionId?: string
    docId: string
  }>()

  const isQuote = context === 'quote-detail'
  const isSubmission = context === 'submission-detail'
  const quote = isQuote ? resolveQuoteContext(quoteId) : null
  const submission = isSubmission ? resolveSubmissionContext(submissionId) : null
  const document = isQuote && quote
    ? resolveQuoteDocument(quote.quoteNumber, docId)
    : isSubmission && submission
      ? resolveSubmissionDocument(submission.id, docId)
      : resolvePolicyDocument(docId)

  const [copilotOpen, setCopilotOpen] = useState(false)
  const [attachMode, setAttachMode] = useState<DocumentAttachMode | null>(null)

  useEffect(() => {
    if (isDesktop) {
      setCopilotOpen(true)
    }
  }, [isDesktop])

  useEffect(() => {
    if (!isDesktop) {
      setCopilotOpen(false)
    }
  }, [isDesktop])

  const preview = document ? getDocumentPreviewContent(document) : null
  const entityLabel = isQuote
    ? `Quote ${quote?.quoteNumber ?? quoteId}`
    : isSubmission
      ? `Submission ${submission?.submissionNumber ?? submissionId}`
      : `Policy ${policyDetailsMock.policyNumber}`

  const handleBackToDocuments = useCallback(() => {
    if (isQuote && quoteId) {
      navigate(`/quotes/${quoteId}?tab=documents`)
      return
    }
    if (isSubmission && submissionId) {
      navigate(`/submissions/${submissionId}?tab=documents`)
      return
    }
    navigate(`/policies/${policyId ?? policyDetailsMock.policyNumber}?tab=documents`)
  }, [isQuote, isSubmission, navigate, policyId, quoteId, submissionId])

  const handleViewerAction = useCallback(
    (action: DocumentViewerAction) => {
      if (!document) return
      if (action === 'download') return
      if (action === 'note') {
        setAttachMode({ target: 'note', documents: [document] })
        setCopilotOpen(true)
        return
      }
      if (action === 'task') {
        setAttachMode({ target: 'task', documents: [document] })
        setCopilotOpen(true)
        return
      }
      if (action === 'email') {
        setAttachMode({ target: 'email', documents: [document] })
        setCopilotOpen(true)
      }
    },
    [document],
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
          copilotOpen={copilotOpen}
          onToggleCopilot={() => setCopilotOpen((open) => !open)}
          onBack={handleBackToDocuments}
        />

        <DocumentViewerCanvas document={document} onAction={handleViewerAction} />
      </Box>

      <ResizableRightPanel
        open={copilotOpen}
        variant="wide"
        onClose={() => {
          setCopilotOpen(false)
          setAttachMode(null)
        }}
      >
        <CopilotPanel
          context={context}
          activePolicyTab="documents"
          focusedDocument={document}
          documentPreviewMode
          documentExtractedText={preview.extractedText}
          documentPreviewInsights={preview.keyInsights}
          attachMode={attachMode}
          attachContextLabel={entityLabel}
          onCloseAttach={() => setAttachMode(null)}
          onAttachSave={() => setAttachMode(null)}
          onClose={() => {
            setCopilotOpen(false)
            setAttachMode(null)
          }}
        />
      </ResizableRightPanel>
    </Box>
  )
}

import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { DocumentPreviewViewer } from '@/pages/policies/components/DocumentPreviewViewer'
import type { DocumentAttachMode } from '@/pages/policies/components/DocumentAttachComposer'
import { getDocumentPreviewContent } from '@/pages/policies/data/documentPreviewData'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

type DocumentPreviewWorkspaceProps = {
  document: PolicyDocument
  context?: 'policy' | 'quote-detail'
  attachMode?: DocumentAttachMode | null
  attachContextLabel?: string
  onClose?: () => void
  onCloseAttach?: () => void
  onAttachSave?: (attachMode: DocumentAttachMode) => void
}

export function DocumentPreviewWorkspace({
  document,
  context = 'policy',
  attachMode = null,
  attachContextLabel,
  onClose,
  onCloseAttach,
  onAttachSave,
}: DocumentPreviewWorkspaceProps) {
  const preview = getDocumentPreviewContent(document)

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'row',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ flex: 1.15, minWidth: 0, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <DocumentPreviewViewer document={document} onClose={onClose} />
      </Box>
      <Divider orientation="vertical" flexItem />
      <Box
        sx={{
          flex: 1,
          minWidth: 300,
          maxWidth: 420,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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
          attachContextLabel={attachContextLabel}
          onCloseAttach={onCloseAttach}
          onAttachSave={onAttachSave}
          onClose={onClose}
        />
      </Box>
    </Box>
  )
}

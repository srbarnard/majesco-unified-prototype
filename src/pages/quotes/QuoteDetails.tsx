import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { Card } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { DocumentsTab } from '@/pages/policies/components/DocumentsTab'
import { PartiesPanel } from '@/pages/policies/components/PartiesPanel'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import { QuoteHeader, type QuoteRightPanel } from '@/pages/quotes/components/QuoteHeader'
import { QuoteOverviewTab } from '@/pages/quotes/components/QuoteOverviewTab'
import type { QuoteTab } from '@/pages/quotes/components/QuoteTabs'
import { getQuoteDocumentStory, getQuoteDocuments } from '@/pages/quotes/data/mockQuoteDocuments'
import {
  getQuoteOverviewStats,
  getQuoteUnderwritingNotes,
  resolveQuoteContext,
} from '@/pages/quotes/data/resolveQuoteContext'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

export function QuoteDetails() {
  const { quoteId } = useParams<{ quoteId: string }>()
  const quote = resolveQuoteContext(quoteId)
  const documentStory = getQuoteDocumentStory(quote.quoteNumber)
  const [activeTab, setActiveTab] = useState<QuoteTab>('overview')
  const [starred, setStarred] = useState(false)
  const [activeRightPanel, setActiveRightPanel] = useState<QuoteRightPanel | null>('copilot')
  const [copilotDocumentFocus, setCopilotDocumentFocus] = useState<PolicyDocument | null>(null)

  const handleToggleRightPanel = useCallback(
    (panel: QuoteRightPanel) => {
      setActiveRightPanel((current) => {
        if (current === panel) {
          return null
        }
        if (panel === 'copilot' && activeTab === 'documents') {
          return current
        }
        return panel
      })
    },
    [activeTab],
  )

  const handleCloseRightPanel = useCallback(() => {
    setActiveRightPanel(null)
  }, [])

  const handleTabChange = useCallback((tab: QuoteTab) => {
    setActiveTab(tab)
    setCopilotDocumentFocus(null)

    if (tab === 'overview') {
      setActiveRightPanel((current) => (current === 'parties' ? current : 'copilot'))
      return
    }

    setActiveRightPanel((current) => (current === 'copilot' ? null : current))
  }, [])

  const handleDocumentCopilot = useCallback((document: PolicyDocument) => {
    setCopilotDocumentFocus(document)
    setActiveRightPanel('copilot')
  }, [])

  const showCopilotPanel =
    activeRightPanel === 'copilot' && (activeTab !== 'documents' || copilotDocumentFocus !== null)

  useEffect(() => {
    if (activeTab === 'documents' && activeRightPanel !== 'copilot') {
      setCopilotDocumentFocus(null)
    }
  }, [activeTab, activeRightPanel])

  const isDocumentsTab = activeTab === 'documents'

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
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <QuoteHeader
            quote={quote}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            activeRightPanel={activeRightPanel}
            onToggleRightPanel={handleToggleRightPanel}
            starred={starred}
            onToggleStar={() => setStarred((prev) => !prev)}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: isDocumentsTab ? 'hidden' : 'auto',
            px: `${layoutTokens.contentPaddingX}px`,
            py: `${layoutTokens.contentPaddingX}px`,
            width: '100%',
            bgcolor: 'background.paper',
          }}
        >
          {isDocumentsTab && (
            <DocumentsTab
              documents={getQuoteDocuments(quote.quoteNumber)}
              documentStory={documentStory.story}
              documentStorySyncedAt={documentStory.syncedAt}
              onDocumentCopilot={handleDocumentCopilot}
              activeCopilotDocumentId={copilotDocumentFocus?.id ?? null}
            />
          )}
          {activeTab === 'overview' && (
            <QuoteOverviewTab quote={quote} stats={getQuoteOverviewStats(quote)} />
          )}
          {activeTab === 'underwriting' && (
            <Card title="Underwriting">
              <Stack spacing={1.5}>
                {getQuoteUnderwritingNotes(quote).map((note) => (
                  <Typography key={note} variant="body2" color="text.secondary" sx={bodySx}>
                    {note}
                  </Typography>
                ))}
              </Stack>
            </Card>
          )}
          {activeTab === 'activity' && (
            <Card title="Activity">
              <Typography variant="body2" color="text.secondary" sx={bodySx}>
                Rating, referral, and producer activity for this quote will appear here.
              </Typography>
            </Card>
          )}
        </Box>
      </Box>

      <ResizableRightPanel open={activeRightPanel !== null && (activeRightPanel !== 'copilot' || showCopilotPanel)}>
        {activeRightPanel === 'parties' && (
          <PartiesPanel parties={quote.parties} onClose={handleCloseRightPanel} />
        )}
        {showCopilotPanel && (
          <CopilotPanel
            context="quote-detail"
            activePolicyTab={isDocumentsTab ? 'documents' : 'overview'}
            focusedQuoteDetail={copilotDocumentFocus ? null : quote}
            focusedDocument={copilotDocumentFocus}
            onClose={() => {
              setCopilotDocumentFocus(null)
              handleCloseRightPanel()
            }}
          />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

export default QuoteDetails

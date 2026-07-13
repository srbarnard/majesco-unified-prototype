import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { Card } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { type DocumentAttachMode, type DocumentAttachTarget } from '@/pages/policies/components/DocumentAttachComposer'
import { DocumentsFilterPanel } from '@/pages/policies/components/DocumentsFilterPanel'
import { DocumentsTab } from '@/pages/policies/components/DocumentsTab'
import { PartiesPanel } from '@/pages/policies/components/PartiesPanel'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import {
  resolveOverviewCopilotPanel,
  useCloseCopilotWhenMobile,
  useDesktopCopilotInitialOpen,
} from '@/pages/policies/hooks/useResponsiveCopilotPanel'
import {
  quoteDocumentsCopilotInsights,
  quoteDocumentsCopilotSummary,
  quoteDocumentStoryImpactInsights,
  quoteDocumentStoryImpactSummary,
} from '@/pages/policies/data/documentsCopilotContent'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import { emptyDocumentsFilters, type DocumentsFilters } from '@/pages/policies/filters/documentsFilterTypes'
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
  const navigate = useNavigate()
  const quote = resolveQuoteContext(quoteId)
  const documentStory = getQuoteDocumentStory(quote.quoteNumber)
  const isDesktop = useIsDesktopLayout()
  const [activeTab, setActiveTab] = useState<QuoteTab>('overview')
  const [starred, setStarred] = useState(false)
  const [activeRightPanel, setActiveRightPanel] = useState<QuoteRightPanel | null>(null)
  const [documentsFilterOpen, setDocumentsFilterOpen] = useState(false)
  const [appliedDocumentsFilters, setAppliedDocumentsFilters] = useState<DocumentsFilters>(emptyDocumentsFilters)
  const [copilotDocumentFocus, setCopilotDocumentFocus] = useState<PolicyDocument | null>(null)
  const [documentsCopilotMode, setDocumentsCopilotMode] = useState<'workspace' | 'impact'>('workspace')
  const [attachMode, setAttachMode] = useState<DocumentAttachMode | null>(null)

  useDesktopCopilotInitialOpen(isDesktop, activeTab === 'overview', 'copilot', setActiveRightPanel)
  useCloseCopilotWhenMobile(isDesktop, activeRightPanel, 'copilot', setActiveRightPanel)

  const handleToggleRightPanel = useCallback((panel: QuoteRightPanel) => {
    if (panel === 'copilot') {
      setDocumentsCopilotMode('workspace')
      setCopilotDocumentFocus(null)
      setAttachMode(null)
    }
    setActiveRightPanel((current) => {
      if (current === panel) {
        return null
      }
      setDocumentsFilterOpen(false)
      return panel
    })
  }, [])

  const handleToggleDocumentsFilter = useCallback(() => {
    setDocumentsFilterOpen((current) => {
      if (!current) {
        setActiveRightPanel(null)
        setCopilotDocumentFocus(null)
      }
      return !current
    })
  }, [])

  const handleCloseRightPanel = useCallback(() => {
    setActiveRightPanel(null)
    setDocumentsFilterOpen(false)
    setAttachMode(null)
  }, [])

  const handleCloseDocumentsFilter = useCallback(() => {
    setDocumentsFilterOpen(false)
  }, [])

  const handleApplyDocumentsFilters = useCallback((filters: DocumentsFilters) => {
    setAppliedDocumentsFilters(filters)
  }, [])

  const handleTabChange = useCallback((tab: QuoteTab) => {
    setActiveTab(tab)
    setCopilotDocumentFocus(null)
    setDocumentsFilterOpen(false)
    setDocumentsCopilotMode('workspace')
    setAttachMode(null)

    if (tab === 'overview') {
      setActiveRightPanel((current) => resolveOverviewCopilotPanel(isDesktop, current, 'copilot', 'parties'))
      return
    }

    if (tab === 'documents') {
      setActiveRightPanel(null)
      return
    }

    setActiveRightPanel((current) => (current === 'copilot' ? null : current))
  }, [isDesktop])

  const handleDocumentOpen = useCallback(
    (document: PolicyDocument) => {
      navigate(`/quotes/${quoteId}/documents/${document.id}`)
    },
    [navigate, quoteId],
  )

  const getDocumentHref = useCallback(
    (document: PolicyDocument) => `/quotes/${quoteId}/documents/${document.id}`,
    [quoteId],
  )

  const handleAttachTo = useCallback((target: DocumentAttachTarget, documents: PolicyDocument[]) => {
    setAttachMode({ target, documents })
    setDocumentsFilterOpen(false)
    setDocumentsCopilotMode('workspace')
    setCopilotDocumentFocus(documents[0] ?? null)
    setActiveRightPanel('copilot')
  }, [])

  const handleCloseAttach = useCallback(() => {
    setAttachMode(null)
  }, [])

  const handleAttachSave = useCallback(() => {
    setAttachMode(null)
  }, [])

  const handleShowStoryImpact = useCallback(() => {
    setCopilotDocumentFocus(null)
    setAttachMode(null)
    setDocumentsCopilotMode('impact')
    setDocumentsFilterOpen(false)
    setActiveRightPanel('copilot')
  }, [])

  const showCopilotPanel = activeRightPanel === 'copilot'
  const isDocumentsTab = activeTab === 'documents'
  const rightPanelOpen = documentsFilterOpen || activeRightPanel !== null

  const handleCloseMobileRightPanel = useCallback(() => {
    if (documentsFilterOpen) {
      handleCloseDocumentsFilter()
      return
    }
    handleCloseRightPanel()
  }, [documentsFilterOpen, handleCloseDocumentsFilter, handleCloseRightPanel])

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
            documentsFilterOpen={documentsFilterOpen}
            onToggleDocumentsFilter={handleToggleDocumentsFilter}
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
              documentStoryHighlights={documentStory.highlights}
              appliedFilters={appliedDocumentsFilters}
              onDocumentOpen={handleDocumentOpen}
              getDocumentHref={getDocumentHref}
              onAttachTo={handleAttachTo}
              activeCopilotDocumentId={copilotDocumentFocus?.id ?? null}
              impactLinkLabel="Show how this impacts the quote"
              onShowStoryImpact={handleShowStoryImpact}
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

      <ResizableRightPanel open={rightPanelOpen} onClose={handleCloseMobileRightPanel}>
        {documentsFilterOpen && (
          <DocumentsFilterPanel
            appliedFilters={appliedDocumentsFilters}
            onApply={handleApplyDocumentsFilters}
            onClose={handleCloseDocumentsFilter}
          />
        )}
        {activeRightPanel === 'parties' && (
          <PartiesPanel parties={quote.parties} onClose={handleCloseRightPanel} />
        )}
        {showCopilotPanel && (
          <CopilotPanel
            context="quote-detail"
            activePolicyTab={isDocumentsTab ? 'documents' : 'overview'}
            focusedQuoteDetail={copilotDocumentFocus ? null : quote}
            focusedDocument={copilotDocumentFocus}
            documentsWorkspaceSummary={quoteDocumentsCopilotSummary}
            documentsWorkspaceInsights={quoteDocumentsCopilotInsights}
            documentsImpactSummary={quoteDocumentStoryImpactSummary}
            documentsImpactInsights={quoteDocumentStoryImpactInsights}
            documentsCopilotMode={documentsCopilotMode}
            documentsImpactTitle="Quote impact"
            attachMode={attachMode}
            attachContextLabel={quote.quoteNumber}
            onCloseAttach={handleCloseAttach}
            onAttachSave={handleAttachSave}
            onClose={() => {
              setCopilotDocumentFocus(null)
              setDocumentsCopilotMode('workspace')
              setAttachMode(null)
              handleCloseRightPanel()
            }}
          />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

export default QuoteDetails

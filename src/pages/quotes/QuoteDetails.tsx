import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router'
import { useRightTool } from '@/app/contexts/RightToolContext'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolFilter,
  useRegisterRightToolParties,
  useRegisterRightToolRecordContext,
} from '@/app/hooks/useRightToolRegistration'
import { Card } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { type DocumentAttachMode, type DocumentAttachTarget } from '@/pages/policies/components/DocumentAttachComposer'
import { DocumentsFilterPanel } from '@/pages/policies/components/DocumentsFilterPanel'
import { DocumentsTab } from '@/pages/policies/components/DocumentsTab'
import { PartiesPanel } from '@/pages/policies/components/PartiesPanel'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import {
  quoteDocumentsCopilotInsights,
  quoteDocumentsCopilotSummary,
} from '@/pages/policies/data/documentsCopilotContent'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import { emptyDocumentsFilters, type DocumentsFilters } from '@/pages/policies/filters/documentsFilterTypes'
import { QuoteHeader } from '@/pages/quotes/components/QuoteHeader'
import { QuoteOverviewTab } from '@/pages/quotes/components/QuoteOverviewTab'
import type { QuoteTab } from '@/pages/quotes/components/QuoteTabs'
import { getQuoteDocuments } from '@/pages/quotes/data/mockQuoteDocuments'
import {
  getQuoteOverviewStats,
  getQuoteUnderwritingNotes,
  resolveQuoteContext,
} from '@/pages/quotes/data/resolveQuoteContext'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function parseQuoteTab(value: string | null): QuoteTab | null {
  if (value === 'overview' || value === 'documents' || value === 'underwriting' || value === 'activity') {
    return value
  }
  return null
}

function shouldDefaultOpenCopilot(tab: QuoteTab) {
  return tab === 'overview' || tab === 'documents'
}

export function QuoteDetails() {
  const { quoteId } = useParams<{ quoteId: string }>()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const quote = useMemo(() => resolveQuoteContext(quoteId), [quoteId])
  const isDesktop = useIsDesktopLayout()
  const { openTool, closeTool, activeTool } = useRightTool()
  const [activeTab, setActiveTab] = useState<QuoteTab>(() => parseQuoteTab(searchParams.get('tab')) ?? 'overview')
  const [starred, setStarred] = useState(false)
  const [appliedDocumentsFilters, setAppliedDocumentsFilters] = useState<DocumentsFilters>(emptyDocumentsFilters)
  const [copilotDocumentFocus, setCopilotDocumentFocus] = useState<PolicyDocument | null>(null)
  const [attachMode, setAttachMode] = useState<DocumentAttachMode | null>(null)
  const didInitCopilot = useRef(false)
  const wasDesktop = useRef(isDesktop)

  const isDocumentsTab = activeTab === 'documents'
  const attachTarget = attachMode?.target ?? null
  const copilotDocumentId = copilotDocumentFocus?.id ?? null

  useRegisterRightToolRecordContext(
    { title: quote.insuredName, subtitle: quote.quoteNumber },
    [quote.insuredName, quote.quoteNumber],
  )

  useRegisterRightToolCopilot(
    {
      context: 'quote-detail',
      activePolicyTab: isDocumentsTab ? 'documents' : 'overview',
      focusedQuoteDetail: copilotDocumentFocus ? null : quote,
      focusedDocument: copilotDocumentFocus,
      documentsWorkspaceSummary: quoteDocumentsCopilotSummary,
      documentsWorkspaceInsights: quoteDocumentsCopilotInsights,
      attachMode,
      attachContextLabel: quote.quoteNumber,
      onCloseAttach: () => setAttachMode(null),
      onAttachSave: () => setAttachMode(null),
    },
    // Primitives only — `quote` from resolveQuoteContext() is a new object each call and
    // would re-fire registration → RightTool setState → freeze SPA navigation.
    [attachTarget, copilotDocumentId, isDocumentsTab, quote.quoteNumber],
  )

  const handleApplyDocumentsFilters = useCallback((filters: DocumentsFilters) => {
    setAppliedDocumentsFilters(filters)
  }, [])

  useRegisterRightToolFilter(
    activeTab === 'documents' ? (
      <DocumentsFilterPanel
        appliedFilters={appliedDocumentsFilters}
        onApply={handleApplyDocumentsFilters}
        onClose={closeTool}
      />
    ) : null,
    [activeTab, appliedDocumentsFilters, handleApplyDocumentsFilters, closeTool],
  )

  useRegisterRightToolParties(
    <PartiesPanel parties={quote.parties} onClose={closeTool} />,
    [quote.quoteNumber, closeTool],
  )

  useEffect(() => {
    if (didInitCopilot.current) return
    didInitCopilot.current = true
    if (isDesktop && shouldDefaultOpenCopilot(activeTab)) {
      openTool('copilot')
    }
    // Omit openTool — one-shot open on mount / first desktop layout.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, isDesktop])

  useEffect(() => {
    if (wasDesktop.current && !isDesktop && activeTool === 'copilot') {
      closeTool()
      setAttachMode(null)
      setCopilotDocumentFocus(null)
    }
    wasDesktop.current = isDesktop
  }, [activeTool, closeTool, isDesktop])

  const syncTabPanels = useCallback(
    (tab: QuoteTab) => {
      if (shouldDefaultOpenCopilot(tab)) {
        if (activeTool === 'parties' || activeTool === 'filter') return
        if (isDesktop) openTool('copilot')
        return
      }
      closeTool()
    },
    [activeTool, closeTool, isDesktop, openTool],
  )

  const syncTabPanelsRef = useRef(syncTabPanels)
  syncTabPanelsRef.current = syncTabPanels

  const tabFromUrl = parseQuoteTab(searchParams.get('tab'))

  useEffect(() => {
    if (!tabFromUrl) return

    setActiveTab(tabFromUrl)
    setCopilotDocumentFocus(null)
    setAttachMode(null)
    // Ref avoids openTool/activeTool identity changes re-entering this effect.
    syncTabPanelsRef.current(tabFromUrl)
  }, [tabFromUrl])

  const handleTabChange = useCallback(
    (tab: QuoteTab) => {
      setActiveTab(tab)
      setCopilotDocumentFocus(null)
      setAttachMode(null)
      syncTabPanels(tab)
    },
    [syncTabPanels],
  )

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

  const handleAttachTo = useCallback(
    (target: DocumentAttachTarget, documents: PolicyDocument[]) => {
      setAttachMode({ target, documents })
      setCopilotDocumentFocus(documents[0] ?? null)
      openTool('copilot')
    },
    [openTool],
  )

  const activeCopilotDocumentId =
    activeTool === 'copilot' && copilotDocumentFocus ? copilotDocumentFocus.id : null

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
              appliedFilters={appliedDocumentsFilters}
              onDocumentOpen={handleDocumentOpen}
              getDocumentHref={getDocumentHref}
              onAttachTo={handleAttachTo}
              activeCopilotDocumentId={activeCopilotDocumentId}
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
    </Box>
  )
}

export default QuoteDetails

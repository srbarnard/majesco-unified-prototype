import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { GridRowSelectionModel } from '@mui/x-data-grid-premium'
import { useMemo, useState } from 'react'
import type { Theme } from '@mui/material/styles'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { isDarkMode } from '@/design-system/theme/themeSurfaces'
import { applyDocumentsFilters } from '@/pages/policies/filters/applyDocumentsFilters'
import type { DocumentsFilters } from '@/pages/policies/filters/documentsFilterTypes'
import { countActiveDocumentsFilters } from '@/pages/policies/filters/documentsFilterTypes'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import {
  buildDocumentStoryHighlights,
  buildDocumentStoryStats,
  buildDocumentStorySummary,
  remainingHighlightCount,
} from '@/pages/policies/data/documentStoryUtils'
import type { DocumentStoryHighlight } from '@/pages/policies/components/DocumentStoryCard'
import { DocumentStoryCard } from '@/pages/policies/components/DocumentStoryCard'
import type { DocumentAttachTarget } from '@/pages/policies/components/DocumentAttachComposer'
import { DocumentsActionBar } from '@/pages/policies/components/DocumentsActionBar'
import { DocumentsDataGrid } from '@/pages/policies/components/DocumentsDataGrid'

const GUTTER = layoutTokens.contentPaddingX / 8

function documentsGridShellSx(theme: Theme) {
  return {
    flex: 1,
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    borderRadius: `${layoutTokens.cardRadius}px`,
    bgcolor: 'background.paper',
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: isDarkMode(theme) ? 'none' : layoutTokens.cardShadow,
  }
}

type DocumentsTabProps = {
  documents: PolicyDocument[]
  documentStory: string
  documentStorySyncedAt: string
  documentStoryHighlights?: DocumentStoryHighlight[]
  appliedFilters: DocumentsFilters
  onDocumentOpen?: (document: PolicyDocument) => void
  onAttachTo?: (target: DocumentAttachTarget, documents: PolicyDocument[]) => void
  activePreviewDocumentId?: string | null
  activeCopilotDocumentId?: string | null
  impactLinkLabel?: string
  onShowStoryImpact?: () => void
}

function matchesSearch(row: PolicyDocument, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const fields = [
    row.fileName,
    row.name,
    row.kind,
    row.description,
    row.aiSummary,
    row.author,
    row.authorDetail,
    ...row.tags,
  ]

  return fields.some((value) => value.toLowerCase().includes(normalized))
}

export function DocumentsTab({
  documents,
  documentStory,
  documentStorySyncedAt,
  documentStoryHighlights,
  appliedFilters,
  onDocumentOpen,
  onAttachTo,
  activePreviewDocumentId,
  activeCopilotDocumentId,
  impactLinkLabel,
  onShowStoryImpact,
}: DocumentsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])
  const [rows, setRows] = useState(documents)

  const filteredRows = useMemo(() => {
    const withFilters = applyDocumentsFilters(rows, appliedFilters)
    return withFilters.filter((row) => matchesSearch(row, searchQuery))
  }, [rows, appliedFilters, searchQuery])

  const filterCount = countActiveDocumentsFilters(appliedFilters)
  const searchActive = searchQuery.trim().length > 0
  const filtersActive = filterCount > 0 || searchActive
  const selectedDocuments = useMemo(
    () => rows.filter((row) => rowSelectionModel.includes(row.id)),
    [rows, rowSelectionModel],
  )

  const storyStats = useMemo(
    () => buildDocumentStoryStats(rows, filteredRows),
    [rows, filteredRows],
  )

  const storySummary = useMemo(
    () => buildDocumentStorySummary(filteredRows, documentStory),
    [filteredRows, documentStory],
  )

  const storyHighlights = useMemo(() => {
    if (filteredRows.length > 0) {
      return buildDocumentStoryHighlights(filteredRows)
    }
    return documentStoryHighlights ?? []
  }, [filteredRows, documentStoryHighlights])

  const extraHighlights = useMemo(
    () => remainingHighlightCount(filteredRows.length > 0 ? filteredRows : rows),
    [filteredRows, rows],
  )

  const handleRemoveSelected = () => {
    setRows((current) => current.filter((row) => !rowSelectionModel.includes(row.id)))
    setRowSelectionModel([])
  }

  const handleAttachTo = (target: DocumentAttachTarget) => {
    if (selectedDocuments.length === 0) return
    onAttachTo?.(target, selectedDocuments)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        width: '100%',
        gap: GUTTER,
      }}
    >
      <DocumentStoryCard
        summary={storySummary}
        syncedAt={documentStorySyncedAt}
        highlights={storyHighlights}
        stats={storyStats}
        remainingHighlightCount={extraHighlights}
        impactLinkLabel={impactLinkLabel}
        onShowImpact={onShowStoryImpact}
      />

      <Box sx={{ flexShrink: 0 }}>
        <DocumentsActionBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCount={rowSelectionModel.length}
          filterCount={filterCount}
          visibleCount={filteredRows.length}
          totalCount={rows.length}
          onRemoveSelected={handleRemoveSelected}
          onAttachTo={handleAttachTo}
        />
      </Box>

      <Box sx={(theme) => documentsGridShellSx(theme)}>
        <DocumentsDataGrid
          rows={filteredRows}
          rowSelectionModel={rowSelectionModel}
          onRowSelectionModelChange={setRowSelectionModel}
          onDocumentOpen={onDocumentOpen}
          activePreviewDocumentId={activePreviewDocumentId}
          activeCopilotDocumentId={activeCopilotDocumentId}
        />
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontFamily: figmaFontFamilyStack.body,
          textAlign: 'right',
          flexShrink: 0,
          mt: -1,
        }}
      >
        {filtersActive
          ? `Showing ${filteredRows.length} of ${rows.length} documents`
          : `Total documents: ${rows.length}`}
      </Typography>
    </Box>
  )
}

import Box from '@mui/material/Box'
import { useMemo, useState } from 'react'
import { layoutTokens } from '@/design-system/tokens/layout'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'
import { DocumentStoryCard } from './DocumentStoryCard'
import { DocumentsActionBar } from './DocumentsActionBar'
import { DocumentsDataGrid } from './DocumentsDataGrid'

const GUTTER = layoutTokens.contentPaddingX / 8

type DocumentsTabProps = {
  documents: PolicyDocument[]
  documentStory: string
  documentStorySyncedAt: string
  onDocumentCopilot?: (document: PolicyDocument) => void
  activeCopilotDocumentId?: string | null
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
  onDocumentCopilot,
  activeCopilotDocumentId,
}: DocumentsTabProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [rows, setRows] = useState(documents)

  const filteredRows = useMemo(
    () => rows.filter((row) => matchesSearch(row, searchQuery)),
    [rows, searchQuery],
  )

  const handleRemoveSelected = () => {
    setRows((current) => current.filter((row) => !selectedIds.has(row.id)))
    setSelectedIds(new Set())
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
      <Box sx={{ flexShrink: 0 }}>
        <DocumentStoryCard summary={documentStory} syncedAt={documentStorySyncedAt} />
      </Box>
      <Box sx={{ flexShrink: 0 }}>
        <DocumentsActionBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCount={selectedIds.size}
          onRemoveSelected={handleRemoveSelected}
        />
      </Box>
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <DocumentsDataGrid
          rows={filteredRows}
          selectedIds={selectedIds}
          onSelectionChange={(ids) => setSelectedIds(new Set(Array.from(ids, String)))}
          onDocumentCopilot={onDocumentCopilot}
          activeCopilotDocumentId={activeCopilotDocumentId}
        />
      </Box>
    </Box>
  )
}

import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import type { SxProps, Theme } from '@mui/material/styles'
import { DataGridPremium, useGridApiRef, type GridColDef } from '@mui/x-data-grid-premium'
import { useCallback, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useRightTool } from '@/app/contexts/RightToolContext'
import {
  Button,
  ListDataGridLink,
  ListDataGridToolbar,
  StatusChip,
  dataGridInteractionSx,
  getListDataGridSlotProps,
  listDataGridActionColumnProps,
  listDataGridFilterProps,
} from '@/design-system/components'
import { dataGridShellSx, sectionTabRowBorderSx } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import { listPageCreateButtonSx } from '@/design-system/tokens/listPageHeader'
import { listDataGridContainerSx, listPageContentOverflowSx } from '@/design-system/tokens/tableLayout'
import { useResponsivePinnedColumns } from '@/design-system/hooks/useResponsivePinnedColumns'
import { ClaimRowActions, type ClaimRowAction } from '@/pages/claims/components/ClaimRowActions'
import { DiscardClaimDialog } from '@/pages/claims/components/DiscardClaimDialog'
import {
  discardClaimThread,
  focusClaimInDrawer,
  startNewClaimInDrawer,
  useClaimDrawerRequest,
} from '@/pages/claims/data/claimDrawerStore'
import { CLAIM_STATUS_TONES } from '@/pages/claims/data/claimStatusTones'
import { formatLossDate } from '@/pages/claims/data/createClaimDraft'
import { removeClaim, updateClaim, useClaims, type ClaimRecord } from '@/pages/claims/data/claimsStore'
import { insuredIdFromName } from '@/pages/shared/insuredId'

const LIST_SECTION_GAP = layoutTokens.listSectionVerticalGap

const cellTextSx = { fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', py: 0.25 } as const

function matchesSearch(row: ClaimRecord, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true
  return [row.claimNumber, row.insured, row.product, row.status, row.assignee].some((value) =>
    value.toLowerCase().includes(normalized),
  )
}

export function ClaimsPage() {
  const apiRef = useGridApiRef()
  const navigate = useNavigate()
  const { openTool, activeTool } = useRightTool()
  const drawerRequest = useClaimDrawerRequest()
  const claims = useClaims()
  const [searchQuery, setSearchQuery] = useState('')
  const [discardTarget, setDiscardTarget] = useState<ClaimRecord | null>(null)
  const rows = useMemo(() => claims.filter((row) => matchesSearch(row, searchQuery)), [claims, searchQuery])
  const { pinnedColumns, disableColumnPinning } = useResponsivePinnedColumns({
    left: ['claimNumber'],
    right: ['actions'],
  })
  const contentPx = `${layoutTokens.contentPaddingX}px`
  const activeClaimNumber = activeTool === 'newClaim' ? drawerRequest.claimNumber : null

  const handleAction = useCallback(
    (row: ClaimRecord, action: ClaimRowAction) => {
      switch (action) {
        case 'details':
          navigate(`/claims/${encodeURIComponent(row.claimNumber)}`)
          return
        case 'discard':
          setDiscardTarget(row)
          return
        default:
          focusClaimInDrawer(row, action)
          openTool('newClaim')
      }
    },
    [navigate, openTool],
  )

  const columns = useMemo<GridColDef<ClaimRecord>[]>(
    () => [
      {
        field: 'claimNumber',
        headerName: 'Claim #',
        flex: 0.9,
        minWidth: 130,
        renderCell: ({ row }) => (
          <ListDataGridLink to={`/claims/${encodeURIComponent(row.claimNumber)}`} fontWeight={600}>
            {row.claimNumber}
          </ListDataGridLink>
        ),
      },
      {
        field: 'insured',
        headerName: 'Insured',
        flex: 1.4,
        minWidth: 200,
        renderCell: ({ row }) => (
          <ListDataGridLink to={`/insureds/${encodeURIComponent(insuredIdFromName(row.insured))}`} fontWeight={500}>
            {row.insured}
          </ListDataGridLink>
        ),
      },
      {
        field: 'product',
        headerName: 'Product',
        flex: 1.1,
        minWidth: 160,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={cellTextSx}>
            {row.product}
          </Typography>
        ),
      },
      {
        field: 'dateOfLoss',
        headerName: 'Date of loss',
        flex: 0.8,
        minWidth: 120,
        type: 'date',
        valueGetter: (_, row) => (row.dateOfLoss ? new Date(`${row.dateOfLoss}T00:00:00`) : null),
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={cellTextSx}>
            {row.dateOfLoss ? formatLossDate(row.dateOfLoss) : '—'}
          </Typography>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        flex: 0.9,
        minWidth: 150,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <StatusChip status={CLAIM_STATUS_TONES[row.status]} label={row.status} />
          </Box>
        ),
      },
      {
        field: 'assignee',
        headerName: 'Assignee',
        flex: 1,
        minWidth: 150,
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            color={row.assignee === 'Unassigned' ? 'text.secondary' : 'text.primary'}
            sx={cellTextSx}
          >
            {row.assignee}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: '',
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        sortable: false,
        resizable: false,
        align: 'right',
        headerAlign: 'right',
        ...listDataGridActionColumnProps,
        renderCell: ({ row }) => (
          <ClaimRowActions
            row={row}
            isAssistantActive={activeClaimNumber === row.claimNumber}
            onToggleAlert={(target) =>
              updateClaim(target.claimNumber, (claim) => ({ ...claim, hasAlert: !claim.hasAlert }))
            }
            onAskAssistant={(target) => {
              focusClaimInDrawer(target)
              openTool('newClaim')
            }}
            onAction={handleAction}
          />
        ),
      },
    ],
    [activeClaimNumber, handleAction, openTool],
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={1.5}
          sx={{ px: contentPx, pt: layoutTokens.policyHeaderTopPadding, pb: 1.5 }}
        >
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontFamily: figmaFontFamilyStack.heading,
              fontWeight: 600,
              fontSize: { xs: '1.25rem', md: '1.375rem' },
              lineHeight: 1.3,
              minWidth: 0,
            }}
          >
            Claims
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            aria-label="New claim"
            sx={listPageCreateButtonSx}
            onClick={() => {
              startNewClaimInDrawer()
              openTool('newClaim')
            }}
          >
            <span className="create-btn-label">New claim</span>
          </Button>
        </Stack>
        <Box sx={sectionTabRowBorderSx}>
          <Box sx={{ px: contentPx, minHeight: 44 }}>
            <Tabs
              value="all"
              aria-label="Claims sections"
              sx={{
                minHeight: 44,
                '& .MuiTabs-indicator': { height: 3, borderRadius: '3px 3px 0 0', bgcolor: 'primary.main' },
                '& .MuiTab-root': {
                  minHeight: 44,
                  minWidth: 'auto',
                  px: { xs: 1.25, md: 1.75 },
                  py: 0.875,
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  fontFamily: figmaFontFamilyStack.heading,
                },
                '& .Mui-selected': { color: 'primary.main', fontWeight: 600 },
              }}
            >
              <Tab label="All Claims" value="all" />
            </Tabs>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: LIST_SECTION_GAP,
          ...listPageContentOverflowSx(true),
          px: contentPx,
          pt: LIST_SECTION_GAP,
          pb: contentPx,
        }}
      >
        <Box sx={{ flexShrink: 0 }}>
          <ListDataGridToolbar
            apiRef={apiRef}
            exportFileName="claims"
            exportAriaLabel="Download claims"
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search claims"
          />
        </Box>
        <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <Box sx={listDataGridContainerSx({ headerFilters: true, footer: true })}>
            <DataGridPremium
              apiRef={apiRef}
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id}
              sortingOrder={['asc', 'desc']}
              pinnedColumns={pinnedColumns}
              disableColumnPinning={disableColumnPinning}
              disableColumnReorder
              disableRowSelectionOnClick
              columnHeaderHeight={40}
              getRowHeight={() => 'auto'}
              slotProps={getListDataGridSlotProps()}
              {...listDataGridFilterProps}
              sx={
                [
                  ...dataGridShellSx(
                    {
                      '& .MuiDataGrid-columnHeader[data-field="status"] .MuiDataGrid-columnHeaderTitleContainer': {
                        justifyContent: 'center',
                      },
                      '& .MuiDataGrid-cell[data-field="status"]': { justifyContent: 'center' },
                    },
                    { headerFilters: true, footer: true },
                  ),
                  dataGridInteractionSx,
                ] as SxProps<Theme>
              }
            />
          </Box>
        </Box>
      </Box>
      <DiscardClaimDialog
        claim={discardTarget}
        onClose={() => setDiscardTarget(null)}
        onConfirm={(claim) => {
          removeClaim(claim.claimNumber)
          discardClaimThread(claim.claimNumber)
          setDiscardTarget(null)
        }}
      />
    </Box>
  )
}

export default ClaimsPage

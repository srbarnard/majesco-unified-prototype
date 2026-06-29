import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import {
  DataGridPremium,
  type GridApi,
  type GridColDef,
} from '@mui/x-data-grid-premium'
import { useMemo, useState } from 'react'
import type { MutableRefObject } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router'
import {
  CopilotIcon,
  copilotActiveIconSx,
  dataGridInteractionSx,
  getListDataGridSlotProps,
  listDataGridActionColumnProps,
  listDataGridFilterProps,
  tableActionIconButtonSx,
  tableLinkSx,
} from '@/design-system/components'
import { dataGridShellSx } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { PolicyListRecord } from '@/pages/policies/data/mockPoliciesList'

type PoliciesListDataGridProps = {
  apiRef: MutableRefObject<GridApi>
  rows: PolicyListRecord[]
  onPolicyCopilot?: (policy: PolicyListRecord) => void
  activeCopilotPolicyId?: string | null
}

function formatPremium(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
}

function copilotActionIconSx(active?: boolean) {
  return copilotActiveIconSx(active)
}

function PolicyNumberCell({ row }: { row: PolicyListRecord }) {
  return (
    <Link
      component={RouterLink}
      to={`/policies/${encodeURIComponent(row.policyNumber)}`}
      variant="body2"
      underline="hover"
      sx={{ fontWeight: 400, textAlign: 'left', py: 0.25, ...tableLinkSx }}
    >
      {row.policyNumber}
    </Link>
  )
}

function InsuredNameCell({ row }: { row: PolicyListRecord }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ py: 0.25, minWidth: 0 }}>
      <Link
        component="button"
        variant="body2"
        underline="hover"
        sx={{ fontWeight: 500, textAlign: 'left', ...tableLinkSx }}
      >
        {row.insuredName}
      </Link>
      <BadgeOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
    </Stack>
  )
}

function RowActionsMenu({
  row,
  onPolicyCopilot,
  isCopilotActive,
}: {
  row: PolicyListRecord
  onPolicyCopilot?: (policy: PolicyListRecord) => void
  isCopilotActive?: boolean
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <>
      <Stack direction="row" spacing={0.25} justifyContent="flex-end" alignItems="center" sx={{ width: '100%' }}>
        <Tooltip title="Ask Copilot about this policy">
          <IconButton
            size="small"
            aria-label={`Ask Copilot about ${row.policyNumber}`}
            aria-pressed={isCopilotActive}
            onClick={() => onPolicyCopilot?.(row)}
            sx={copilotActionIconSx(isCopilotActive)}
          >
            <CopilotIcon size={18} active={isCopilotActive} />
          </IconButton>
        </Tooltip>
        <Tooltip title="More actions">
          <IconButton
            size="small"
            aria-label={`More actions for ${row.policyNumber}`}
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={tableActionIconButtonSx}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => setAnchorEl(null)}>View policy</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Endorse policy</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Renew policy</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Cancel policy</MenuItem>
      </Menu>
    </>
  )
}

export function PoliciesListDataGrid({
  apiRef,
  rows,
  onPolicyCopilot,
  activeCopilotPolicyId,
}: PoliciesListDataGridProps) {
  const columns = useMemo<GridColDef<PolicyListRecord>[]>(
    () => [
      {
        field: 'policyNumber',
        headerName: 'Policy #',
        flex: 1.1,
        minWidth: 168,
        sortable: true,
        renderCell: ({ row }) => <PolicyNumberCell row={row} />,
      },
      {
        field: 'effectiveDate',
        headerName: 'Effective date',
        flex: 0.75,
        minWidth: 112,
        type: 'date',
        sortable: true,
        valueGetter: (_, row) => new Date(row.effectiveDate),
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', py: 0.25 }}>
            {formatDate(row.effectiveDate)}
          </Typography>
        ),
      },
      {
        field: 'expirationDate',
        headerName: 'Expiration date',
        flex: 0.8,
        minWidth: 118,
        type: 'date',
        sortable: true,
        valueGetter: (_, row) => new Date(row.expirationDate),
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', py: 0.25 }}>
            {formatDate(row.expirationDate)}
          </Typography>
        ),
      },
      {
        field: 'insuredName',
        headerName: 'Insured name',
        flex: 1.35,
        minWidth: 200,
        sortable: true,
        renderCell: ({ row }) => <InsuredNameCell row={row} />,
      },
      {
        field: 'agency',
        headerName: 'Agency',
        flex: 1.05,
        minWidth: 150,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', py: 0.25 }}>
            {row.agency}
          </Typography>
        ),
      },
      {
        field: 'agencyNumber',
        headerName: 'Agency #',
        flex: 0.75,
        minWidth: 108,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', py: 0.25 }}>
            {row.agencyNumber}
          </Typography>
        ),
      },
      {
        field: 'underwriter',
        headerName: 'Underwriter',
        flex: 0.95,
        minWidth: 130,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', py: 0.25 }}>
            {row.underwriter}
          </Typography>
        ),
      },
      {
        field: 'twp',
        headerName: 'TWP',
        flex: 0.8,
        minWidth: 112,
        type: 'number',
        sortable: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', fontWeight: 500, py: 0.25, width: '100%', textAlign: 'right' }}
          >
            {formatPremium(row.twp)}
          </Typography>
        ),
      },
      {
        field: 'ftp',
        headerName: 'FTP',
        flex: 0.8,
        minWidth: 112,
        type: 'number',
        sortable: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', fontWeight: 500, py: 0.25, width: '100%', textAlign: 'right' }}
          >
            {formatPremium(row.ftp)}
          </Typography>
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 96,
        minWidth: 96,
        maxWidth: 96,
        sortable: false,
        resizable: false,
        align: 'right',
        headerAlign: 'right',
        ...listDataGridActionColumnProps,
        renderCell: ({ row }) => (
          <RowActionsMenu
            row={row}
            onPolicyCopilot={onPolicyCopilot}
            isCopilotActive={activeCopilotPolicyId === row.id}
          />
        ),
      },
    ],
    [activeCopilotPolicyId, onPolicyCopilot],
  )

  return (
    <Box sx={{ flex: 1, minHeight: 0, width: '100%', display: 'flex', flexDirection: 'column' }}>
      <DataGridPremium
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        sortingOrder={['asc', 'desc']}
        initialState={{
          sorting: { sortModel: [{ field: 'effectiveDate', sort: 'desc' }] },
        }}
        pinnedColumns={{ left: ['policyNumber'], right: ['actions'] }}
        disableColumnReorder
        columnHeaderHeight={40}
        getRowHeight={() => 'auto'}
        hideFooter
        slotProps={getListDataGridSlotProps()}
        {...listDataGridFilterProps}
        sx={[...dataGridShellSx(), dataGridInteractionSx] as SxProps<Theme>}
      />
    </Box>
  )
}

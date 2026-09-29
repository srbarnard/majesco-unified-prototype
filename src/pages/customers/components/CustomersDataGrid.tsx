import MoreVertIcon from '@mui/icons-material/MoreVert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
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
import { useResponsivePinnedColumns } from '@/design-system/hooks/useResponsivePinnedColumns'
import {
  CopilotIcon,
  copilotActiveIconSx,
  dataGridInteractionSx,
  getListDataGridSlotProps,
  ListDataGridLink,
  listDataGridActionColumnProps,
  listDataGridFilterProps,
  tableActionIconButtonSx,
} from '@/design-system/components'
import { listDataGridContainerSx } from '@/design-system/tokens/tableLayout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { dataGridShellSx } from '@/design-system/theme/themeSurfaces'
import { CustomerBillingStatusChip } from '@/pages/customers/components/CustomerBillingStatusChip'
import type { CustomerRecord } from '@/pages/customers/data/mockCustomers'
import { insuredIdFromName } from '@/pages/shared/insuredId'

type CustomersDataGridProps = {
  apiRef: MutableRefObject<GridApi>
  rows: CustomerRecord[]
  onCustomerCopilot?: (customer: CustomerRecord) => void
  activeCopilotCustomerId?: string | null
}

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.8125rem',
} as const

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric',
  })
}

function RowActionsMenu({
  row,
  onCustomerCopilot,
  isCopilotActive,
}: {
  row: CustomerRecord
  onCustomerCopilot?: (customer: CustomerRecord) => void
  isCopilotActive?: boolean
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <>
      <Stack direction="row" spacing={0.25} justifyContent="flex-end" alignItems="center" sx={{ width: '100%' }}>
        <Tooltip title="Ask Copilot about this customer">
          <IconButton
            size="small"
            aria-label={`Ask Copilot about ${row.name}`}
            aria-pressed={isCopilotActive}
            onClick={() => onCustomerCopilot?.(row)}
            sx={copilotActiveIconSx(isCopilotActive)}
          >
            <CopilotIcon size={18} active={isCopilotActive} />
          </IconButton>
        </Tooltip>
        <Tooltip title="More actions">
          <IconButton
            size="small"
            aria-label={`More actions for ${row.customerNumber}`}
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={tableActionIconButtonSx}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => setAnchorEl(null)}>View customer</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Edit customer</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>View policies</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>View billing</MenuItem>
      </Menu>
    </>
  )
}

export function CustomersDataGrid({
  apiRef,
  rows,
  onCustomerCopilot,
  activeCopilotCustomerId,
}: CustomersDataGridProps) {
  const columns = useMemo<GridColDef<CustomerRecord>[]>(
    () => [
      {
        field: 'customerNumber',
        headerName: 'Customer #',
        flex: 0.9,
        minWidth: 120,
        sortable: true,
        renderCell: ({ row }) => (
          <ListDataGridLink to={`/insureds/${encodeURIComponent(insuredIdFromName(row.name))}`}>
            {row.customerNumber}
          </ListDataGridLink>
        ),
      },
      {
        field: 'name',
        headerName: 'Customer Name',
        flex: 1.5,
        minWidth: 200,
        sortable: true,
        renderCell: ({ row }) => (
          <Box sx={{ py: 0.25, minWidth: 0 }}>
            <ListDataGridLink
              to={`/insureds/${encodeURIComponent(insuredIdFromName(row.name))}`}
              fontWeight={500}
            >
              {row.name}
            </ListDataGridLink>
            <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mt: 0.125 }}>
              {row.email}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'attention',
        headerName: 'Attention',
        flex: 1.2,
        minWidth: 168,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ ...bodySx, py: 0.25 }}>
            {row.attention}
          </Typography>
        ),
      },
      {
        field: 'insuredCount',
        headerName: 'Insured Count',
        flex: 0.7,
        minWidth: 110,
        type: 'number',
        sortable: true,
        align: 'right',
        headerAlign: 'right',
      },
      {
        field: 'customerSince',
        headerName: 'Customer since',
        flex: 0.85,
        minWidth: 120,
        type: 'date',
        sortable: true,
        valueGetter: (_, row) => new Date(row.customerSince),
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ ...bodySx, py: 0.25 }}>
            {formatDate(row.customerSince)}
          </Typography>
        ),
      },
      {
        field: 'activePolicies',
        headerName: 'Active Policies',
        flex: 0.75,
        minWidth: 120,
        type: 'number',
        sortable: true,
        align: 'right',
        headerAlign: 'right',
      },
      {
        field: 'openQuotes',
        headerName: 'Open Quotes',
        flex: 0.7,
        minWidth: 110,
        type: 'number',
        sortable: true,
        align: 'right',
        headerAlign: 'right',
      },
      {
        field: 'openClaims',
        headerName: 'Open Claims',
        flex: 0.7,
        minWidth: 110,
        type: 'number',
        sortable: true,
        align: 'right',
        headerAlign: 'right',
      },
      {
        field: 'billingStatus',
        headerName: 'Billing Status',
        flex: 0.9,
        minWidth: 120,
        sortable: true,
        align: 'center',
        headerAlign: 'center',
        renderCell: ({ row }) => (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <CustomerBillingStatusChip status={row.billingStatus} />
          </Box>
        ),
      },
      {
        field: 'twp',
        headerName: 'TWP',
        flex: 0.9,
        minWidth: 120,
        type: 'number',
        sortable: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ ...bodySx, fontWeight: 500, py: 0.25, width: '100%', textAlign: 'right' }}
          >
            {formatCurrency(row.twp)}
          </Typography>
        ),
      },
      {
        field: 'contactName',
        headerName: 'Contact',
        flex: 1.1,
        minWidth: 150,
        sortable: true,
        renderCell: ({ row }) => (
          <Box sx={{ py: 0.25, minWidth: 0 }}>
            <Typography variant="body2" sx={{ ...bodySx, fontWeight: 500 }}>
              {row.contactName}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block' }}>
              {row.contactPhone}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'address',
        headerName: 'Address',
        flex: 1.4,
        minWidth: 180,
        sortable: true,
        valueGetter: (_, row) => `${row.address}, ${row.city}, ${row.state} ${row.zip}`,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ ...bodySx, py: 0.25, whiteSpace: 'normal', lineHeight: 1.4 }}>
            {row.address}
            <br />
            {row.city}, {row.state} {row.zip}
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
            onCustomerCopilot={onCustomerCopilot}
            isCopilotActive={activeCopilotCustomerId === row.id}
          />
        ),
      },
    ],
    [activeCopilotCustomerId, onCustomerCopilot],
  )

  const { pinnedColumns, disableColumnPinning } = useResponsivePinnedColumns({
    left: ['customerNumber', 'name'],
    right: ['actions'],
  })

  return (
    <Box sx={listDataGridContainerSx({ headerFilters: true, footer: true })}>
      <DataGridPremium
        apiRef={apiRef}
        rows={rows}
        columns={columns}
        getRowId={(row) => row.id}
        sortingOrder={['asc', 'desc']}
        initialState={{
          sorting: { sortModel: [{ field: 'attention', sort: 'asc' }] },
        }}
        pinnedColumns={pinnedColumns}
        disableColumnPinning={disableColumnPinning}
        disableColumnReorder
        columnHeaderHeight={40}
        getRowHeight={() => 'auto'}
        slotProps={getListDataGridSlotProps()}
        {...listDataGridFilterProps}
        sx={[
          ...dataGridShellSx({
            '& .MuiDataGrid-columnHeader[data-field="billingStatus"] .MuiDataGrid-columnHeaderTitleContainer': {
              justifyContent: 'center',
            },
            '& .MuiDataGrid-cell[data-field="billingStatus"]': {
              justifyContent: 'center',
            },
          }, { headerFilters: true, footer: true }),
          dataGridInteractionSx,
        ] as SxProps<Theme>}
      />
    </Box>
  )
}

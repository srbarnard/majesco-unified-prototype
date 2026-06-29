import MoreVertIcon from '@mui/icons-material/MoreVert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Link from '@mui/material/Link'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Popover from '@mui/material/Popover'
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
import { insuredIdFromName } from '@/pages/shared/insuredId'
import {
  CopilotIcon,
  copilotActiveIconSx,
  dataGridInteractionSx,
  getListDataGridSlotProps,
  ListDataGridLink,
  listDataGridActionColumnProps,
  listDataGridFilterProps,
  tableActionIconButtonSx,
  tableLinkSx,
} from '@/design-system/components'
import { accentSubtle, dataGridShellSx, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { QuoteStatusChip } from '@/pages/quotes/components/QuoteStatusChip'
import type { Quote } from '@/pages/quotes/data/mockQuotes'

type QuotesDataGridProps = {
  apiRef: MutableRefObject<GridApi>
  rows: Quote[]
  onQuoteCopilot?: (quote: Quote) => void
  activeCopilotQuoteId?: string | null
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

function QuoteNumberCell({ row }: { row: Quote }) {
  return (
    <ListDataGridLink to={`/quotes/${encodeURIComponent(row.quoteNumber)}`}>
      {row.quoteNumber}
    </ListDataGridLink>
  )
}

const VISIBLE_LOB_COUNT = 2

function ProductsOverflowBadge({ products }: { products: string[] }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const hiddenCount = products.length - VISIBLE_LOB_COUNT
  const open = Boolean(anchorEl)

  if (hiddenCount <= 0) return null

  return (
    <>
      <Chip
        label={`+${hiddenCount}`}
        size="small"
        onClick={(event) => {
          event.stopPropagation()
          setAnchorEl(event.currentTarget)
        }}
        sx={(theme) => ({
          height: 20,
          fontSize: '0.6875rem',
          fontWeight: 500,
          borderRadius: '30px',
          cursor: 'pointer',
          bgcolor: open ? accentSubtle(theme) : surfaceSubtle(theme),
          color: open ? 'primary.main' : 'text.secondary',
          border: 'none',
          '&:hover': {
            bgcolor: open ? accentSubtle(theme) : surfaceSubtle(theme),
            color: open ? 'primary.main' : 'text.secondary',
          },
        })}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            onClick: (event) => event.stopPropagation(),
            sx: (theme) => ({
              mt: 0.75,
              py: 1.25,
              px: 1.5,
              minWidth: 168,
              borderRadius: `${layoutTokens.cardRadius}px`,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(0, 0, 0, 0.45)'
                  : '0 8px 24px rgba(0, 0, 0, 0.12)',
            }),
          },
        }}
      >
        <Stack spacing={0.75}>
          {products.map((product) => (
            <Typography
              key={product}
              variant="body2"
              sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', lineHeight: 1.4 }}
            >
              {product}
            </Typography>
          ))}
        </Stack>
      </Popover>
    </>
  )
}

function ProductsCell({ row }: { row: Quote }) {
  const visibleProducts = row.products.slice(0, VISIBLE_LOB_COUNT)
  const visibleText = visibleProducts.join(', ')

  return (
    <Stack direction="row" spacing={0.5} alignItems="center" sx={{ py: 0.25, minWidth: 0, overflow: 'hidden' }}>
      <Typography
        variant="body2"
        noWrap
        sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' }}
      >
        {visibleText}
      </Typography>
      <ProductsOverflowBadge products={row.products} />
    </Stack>
  )
}

function copilotActionIconSx(active?: boolean) {
  return copilotActiveIconSx(active)
}

function RowActionsMenu({
  row,
  onQuoteCopilot,
  isCopilotActive,
}: {
  row: Quote
  onQuoteCopilot?: (quote: Quote) => void
  isCopilotActive?: boolean
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  return (
    <>
      <Stack direction="row" spacing={0.25} justifyContent="flex-end" alignItems="center" sx={{ width: '100%' }}>
        <Tooltip title="Ask Copilot about this quote">
          <IconButton
            size="small"
            aria-label={`Ask Copilot about ${row.quoteNumber}`}
            aria-pressed={isCopilotActive}
            onClick={() => onQuoteCopilot?.(row)}
            sx={copilotActionIconSx(isCopilotActive)}
          >
            <CopilotIcon size={18} active={isCopilotActive} />
          </IconButton>
        </Tooltip>
        <Tooltip title="More actions">
          <IconButton
            size="small"
            aria-label={`More actions for ${row.quoteNumber}`}
            onClick={(event) => setAnchorEl(event.currentTarget)}
            sx={tableActionIconButtonSx}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => setAnchorEl(null)}>View quote</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Edit quote</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Duplicate</MenuItem>
        <MenuItem onClick={() => setAnchorEl(null)}>Archive</MenuItem>
      </Menu>
    </>
  )
}

export function QuotesDataGrid({
  apiRef,
  rows,
  onQuoteCopilot,
  activeCopilotQuoteId,
}: QuotesDataGridProps) {
  const columns = useMemo<GridColDef<Quote>[]>(
    () => [
      {
        field: 'quoteNumber',
        headerName: 'Quote #',
        flex: 1.1,
        minWidth: 168,
        sortable: true,
        renderCell: ({ row }) => <QuoteNumberCell row={row} />,
      },
      {
        field: 'insured',
        headerName: 'Insured',
        flex: 1.3,
        minWidth: 180,
        sortable: true,
        renderCell: ({ row }) => (
          <ListDataGridLink
            to={`/insureds/${encodeURIComponent(insuredIdFromName(row.insured))}`}
            fontWeight={500}
          >
            {row.insured}
          </ListDataGridLink>
        ),
      },
      {
        field: 'producer',
        headerName: 'Producer',
        flex: 1.2,
        minWidth: 170,
        sortable: true,
        renderCell: ({ row }) => (
          <Link
            component="button"
            variant="body2"
            underline="hover"
            sx={{ fontWeight: 500, textAlign: 'left', py: 0.25, ...tableLinkSx }}
          >
            {row.producer}
          </Link>
        ),
      },
      {
        field: 'products',
        headerName: 'Product(s)',
        flex: 1.1,
        minWidth: 150,
        sortable: true,
        valueGetter: (_, row) => row.products.join(', '),
        renderCell: ({ row }) => <ProductsCell row={row} />,
      },
      {
        field: 'effectiveDate',
        headerName: 'Effective',
        flex: 0.7,
        minWidth: 108,
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
        field: 'status',
        headerName: 'Status',
        flex: 1,
        minWidth: 148,
        sortable: true,
        align: 'center',
        headerAlign: 'center',
        valueGetter: (_, row) => row.status,
        renderCell: ({ row }) => (
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <QuoteStatusChip status={row.status} />
          </Box>
        ),
      },
      {
        field: 'premium',
        headerName: 'Premium',
        flex: 0.85,
        minWidth: 120,
        type: 'number',
        sortable: true,
        align: 'right',
        headerAlign: 'right',
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', fontWeight: 500, py: 0.25, width: '100%', textAlign: 'right' }}
          >
            {formatPremium(row.premium)}
          </Typography>
        ),
      },
      {
        field: 'updatedLabel',
        headerName: 'Updated',
        flex: 0.75,
        minWidth: 100,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', py: 0.25 }}
          >
            {row.updatedLabel}
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
            onQuoteCopilot={onQuoteCopilot}
            isCopilotActive={activeCopilotQuoteId === row.id}
          />
        ),
      },
    ],
    [activeCopilotQuoteId, onQuoteCopilot],
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
        pinnedColumns={{ left: ['quoteNumber'], right: ['actions'] }}
        disableColumnReorder
        columnHeaderHeight={40}
        getRowHeight={() => 'auto'}
        hideFooter
        slotProps={getListDataGridSlotProps()}
        {...listDataGridFilterProps}
        sx={[...dataGridShellSx({
            '& .MuiDataGrid-columnHeader[data-field="status"] .MuiDataGrid-columnHeaderTitleContainer': {
              justifyContent: 'center',
            },
            '& .MuiDataGrid-cell[data-field="status"]': {
              justifyContent: 'center',
            },
          }), dataGridInteractionSx] as SxProps<Theme>}
      />
    </Box>
  )
}

import ContactPageOutlinedIcon from '@mui/icons-material/ContactPageOutlined'
import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Box from '@mui/material/Box'
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
import { layoutTokens } from '@/design-system/tokens/layout'
import { dataGridShellSx } from '@/design-system/theme/themeSurfaces'
import { insuredIdFromName } from '@/pages/shared/insuredId'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  getPolicyInsuredContact,
  type PolicyListRecord,
} from '@/pages/policies/data/mockPoliciesList'
import { useNewTaskSelection, useTasksStore } from '@/app/contexts/TasksContext'
import { findRelated } from '@/pages/tasks/data/addTaskDraft'

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
    <ListDataGridLink to={`/policies/${encodeURIComponent(row.policyNumber)}`}>
      {row.policyNumber}
    </ListDataGridLink>
  )
}

function InsuredNameCell({ row }: { row: PolicyListRecord }) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)
  const contact = getPolicyInsuredContact(row.insuredName)

  return (
    <>
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ py: 0.25, minWidth: 0 }}>
        <ListDataGridLink
          to={`/insureds/${encodeURIComponent(insuredIdFromName(row.insuredName))}`}
          fontWeight={500}
          sx={{ py: 0, minWidth: 0 }}
        >
          {row.insuredName}
        </ListDataGridLink>
        <Tooltip title="Contact information">
          <IconButton
            size="small"
            aria-label={`Contact information for ${row.insuredName}`}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            onClick={(event) => {
              event.stopPropagation()
              setAnchorEl(event.currentTarget)
            }}
            onMouseDown={(event) => event.stopPropagation()}
            sx={{
              p: 0.25,
              color: 'text.secondary',
              flexShrink: 0,
              '&:hover': { color: 'primary.main', bgcolor: 'transparent' },
            }}
          >
            <ContactPageOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>
      </Stack>
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
              py: 1.5,
              px: 1.75,
              minWidth: 240,
              maxWidth: 300,
              borderRadius: `${layoutTokens.cardRadius}px`,
              border: `1px solid ${theme.palette.divider}`,
              boxShadow:
                theme.palette.mode === 'dark'
                  ? '0 8px 24px rgba(0, 0, 0, 0.45)'
                  : '0 8px 24px rgba(0, 0, 0, 0.12)',
            }),
          },
        }}
      >
        <Stack spacing={1.25}>
          <Box>
            <Typography
              variant="body2"
              sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', lineHeight: 1.45 }}
            >
              {contact.addressLine1}
            </Typography>
            <Stack direction="row" spacing={0.75} alignItems="center" justifyContent="space-between">
              <Typography
                variant="body2"
                sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', lineHeight: 1.45 }}
              >
                {contact.cityStateZip}
              </Typography>
              <PlaceOutlinedIcon sx={{ fontSize: 16, color: 'primary.main', flexShrink: 0 }} />
            </Stack>
          </Box>
          <Typography
            variant="body2"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', lineHeight: 1.45 }}
          >
            <Box component="span" sx={{ fontWeight: 600 }}>
              Email:{' '}
            </Box>
            <Link
              href={`mailto:${contact.email}`}
              underline="hover"
              onClick={(event) => event.stopPropagation()}
              sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' }}
            >
              Send message
            </Link>
          </Typography>
          <Typography
            variant="body2"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem', lineHeight: 1.45 }}
          >
            <Box component="span" sx={{ fontWeight: 600 }}>
              Phone:{' '}
            </Box>
            {contact.phone}
          </Typography>
        </Stack>
      </Popover>
    </>
  )
}

function policyRelated(row: PolicyListRecord) {
  return findRelated('Policy', row.policyNumber, [row.insuredName, row.agency, row.producer])
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
  const { openNewTask } = useTasksStore()

  return (
    <>
      <Stack direction="row" spacing={0.25} justifyContent="flex-end" alignItems="center" sx={{ width: '100%' }}>
        <Tooltip title="Ask assistant.">
          <IconButton
            size="small"
            aria-label={`Ask assistant about ${row.policyNumber}`}
            aria-pressed={isCopilotActive}
            onClick={() => onPolicyCopilot?.(row)}
            sx={copilotActionIconSx(isCopilotActive)}
          >
            <CopilotIcon size={22} active={isCopilotActive} />
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
        <MenuItem
          onClick={() => {
            setAnchorEl(null)
            openNewTask(policyRelated(row))
          }}
        >
          Add task
        </MenuItem>
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
  const selectedPolicy = rows.find((row) => row.id === activeCopilotPolicyId)
  useNewTaskSelection(selectedPolicy ? policyRelated(selectedPolicy) : null)

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

  const { pinnedColumns, disableColumnPinning } = useResponsivePinnedColumns({
    left: ['policyNumber'],
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
          sorting: { sortModel: [{ field: 'effectiveDate', sort: 'desc' }] },
        }}
        pinnedColumns={pinnedColumns}
        disableColumnPinning={disableColumnPinning}
        disableColumnReorder
        columnHeaderHeight={40}
        getRowHeight={() => 'auto'}
        slotProps={getListDataGridSlotProps()}
        {...listDataGridFilterProps}
        sx={
          [
            ...dataGridShellSx(undefined, { headerFilters: true, footer: true }),
            dataGridInteractionSx,
          ] as SxProps<Theme>
        }
      />
    </Box>
  )
}

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useGridApiRef } from '@mui/x-data-grid-premium'
import { useCallback, useMemo, useState } from 'react'
import { useRightTool } from '@/app/contexts/RightToolContext'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolFilter,
} from '@/app/hooks/useRightToolRegistration'
import { ListDataGridToolbar } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { listPageContentOverflowSx } from '@/design-system/tokens/tableLayout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CustomersDataGrid } from '@/pages/customers/components/CustomersDataGrid'
import { CustomersFilterPanel } from '@/pages/customers/components/CustomersFilterPanel'
import { CustomersHeader } from '@/pages/customers/components/CustomersHeader'
import {
  CUSTOMERS_TOTAL_ROWS,
  customersMock,
  type CustomerRecord,
} from '@/pages/customers/data/mockCustomers'
import { applyCustomersListFilters } from '@/pages/customers/filters/applyCustomersListFilters'
import {
  emptyCustomersListFilters,
  hasActiveCustomersFilters,
  type CustomersListFilters,
} from '@/pages/customers/filters/customersListFilterTypes'

const LIST_SECTION_GAP = layoutTokens.listSectionVerticalGap

function matchesSearch(row: CustomerRecord, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const fields = [
    row.customerNumber,
    row.name,
    row.email,
    row.attention,
    row.billingStatus,
    row.contactName,
    row.contactPhone,
    row.address,
    row.city,
    row.state,
    row.zip,
  ]
  return fields.some((value) => String(value).toLowerCase().includes(normalized))
}

export function CustomersPage() {
  const apiRef = useGridApiRef()
  const { activeTool, openTool, closeTool } = useRightTool()
  const [copilotCustomerFocus, setCopilotCustomerFocus] = useState<CustomerRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<CustomersListFilters>(emptyCustomersListFilters)

  const filteredRows = useMemo(() => {
    const withFilters = applyCustomersListFilters(customersMock, appliedFilters)
    return withFilters.filter((row) => matchesSearch(row, searchQuery))
  }, [appliedFilters, searchQuery])

  const filtersActive = hasActiveCustomersFilters(appliedFilters)

  useRegisterRightToolCopilot(
    {
      context: 'customers',
      focusedCustomer: copilotCustomerFocus,
      onBackToSummary: copilotCustomerFocus
        ? () => setCopilotCustomerFocus(null)
        : undefined,
      summaryBackLabel: 'Customers workspace',
    },
    [copilotCustomerFocus],
  )

  const handleApplyFilters = useCallback((filters: CustomersListFilters) => {
    setAppliedFilters(filters)
  }, [])

  useRegisterRightToolFilter(
    <CustomersFilterPanel
      appliedFilters={appliedFilters}
      onApply={handleApplyFilters}
      onClose={closeTool}
    />,
    [appliedFilters, handleApplyFilters, closeTool],
  )

  const handleCustomerCopilot = useCallback(
    (customer: CustomerRecord) => {
      setCopilotCustomerFocus(customer)
      openTool('copilot')
    },
    [openTool],
  )

  const contentPx = `${layoutTokens.contentPaddingX}px`
  const activeCopilotCustomerId =
    activeTool === 'copilot' && copilotCustomerFocus ? copilotCustomerFocus.id : null

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
          <CustomersHeader />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            ...listPageContentOverflowSx(true),
            px: contentPx,
            pt: LIST_SECTION_GAP,
            pb: contentPx,
            width: '100%',
            bgcolor: 'background.paper',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: 0,
              width: '100%',
              gap: LIST_SECTION_GAP,
            }}
          >
            <Box sx={{ flexShrink: 0 }}>
              <ListDataGridToolbar
                apiRef={apiRef}
                exportFileName="customers"
                exportAriaLabel="Download customers"
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchPlaceholder="Search customers"
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
              <CustomersDataGrid
                apiRef={apiRef}
                rows={filteredRows}
                onCustomerCopilot={handleCustomerCopilot}
                activeCopilotCustomerId={activeCopilotCustomerId}
              />
            </Box>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: figmaFontFamilyStack.body, textAlign: 'right', flexShrink: 0 }}
            >
              Total Rows: {filtersActive || searchQuery.trim() ? filteredRows.length : CUSTOMERS_TOTAL_ROWS}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default CustomersPage

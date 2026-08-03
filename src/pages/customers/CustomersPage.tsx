import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useGridApiRef } from '@mui/x-data-grid-premium'
import { useCallback, useMemo, useState } from 'react'
import { ListDataGridToolbar } from '@/design-system/components'
import { layoutTokens } from '@/design-system/tokens/layout'
import { listPageContentOverflowSx } from '@/design-system/tokens/tableLayout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
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
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [copilotCustomerFocus, setCopilotCustomerFocus] = useState<CustomerRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<CustomersListFilters>(emptyCustomersListFilters)

  const filteredRows = useMemo(() => {
    const withFilters = applyCustomersListFilters(customersMock, appliedFilters)
    return withFilters.filter((row) => matchesSearch(row, searchQuery))
  }, [appliedFilters, searchQuery])

  const filtersActive = hasActiveCustomersFilters(appliedFilters)

  const handleToggleFilter = useCallback(() => {
    setFilterOpen((current) => {
      if (!current) {
        setCopilotOpen(false)
        setCopilotCustomerFocus(null)
      }
      return !current
    })
  }, [])

  const handleCloseFilter = useCallback(() => {
    setFilterOpen(false)
  }, [])

  const handleApplyFilters = useCallback((filters: CustomersListFilters) => {
    setAppliedFilters(filters)
  }, [])

  const handleToggleCopilot = useCallback(() => {
    setCopilotOpen((current) => {
      if (current) {
        setCopilotCustomerFocus(null)
        return false
      }
      setFilterOpen(false)
      return true
    })
  }, [])

  const handleCloseCopilot = useCallback(() => {
    setCopilotOpen(false)
    setCopilotCustomerFocus(null)
  }, [])

  const handleCustomerCopilot = useCallback((customer: CustomerRecord) => {
    setCopilotCustomerFocus(customer)
    setFilterOpen(false)
    setCopilotOpen(true)
  }, [])

  const handleCloseMobileRightPanel = useCallback(() => {
    if (filterOpen) {
      handleCloseFilter()
      return
    }
    handleCloseCopilot()
  }, [filterOpen, handleCloseFilter, handleCloseCopilot])

  const contentPx = `${layoutTokens.contentPaddingX}px`

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
          <CustomersHeader
            filterOpen={filterOpen}
            onToggleFilter={handleToggleFilter}
            copilotOpen={copilotOpen}
            onToggleCopilot={handleToggleCopilot}
          />
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
                activeCopilotCustomerId={copilotCustomerFocus?.id ?? null}
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

      <ResizableRightPanel open={filterOpen || copilotOpen} onClose={handleCloseMobileRightPanel}>
        {filterOpen && (
          <CustomersFilterPanel
            appliedFilters={appliedFilters}
            onApply={handleApplyFilters}
            onClose={handleCloseFilter}
          />
        )}
        {copilotOpen && (
          <CopilotPanel
            context="customers"
            focusedCustomer={copilotCustomerFocus}
            onClose={handleCloseCopilot}
          />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

export default CustomersPage

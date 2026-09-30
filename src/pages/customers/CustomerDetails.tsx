import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo } from 'react'
import { useParams } from 'react-router'
import { useCustomersStore } from '@/app/contexts/CustomersContext'
import { useRightTool } from '@/app/contexts/RightToolContext'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolRecordContext,
} from '@/app/hooks/useRightToolRegistration'
import { EntityListHomeButton } from '@/design-system/components'
import type { AppTheme } from '@/design-system/theme'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CustomerBillingStatusChip } from '@/pages/customers/components/CustomerBillingStatusChip'
import { customersMock, type CustomerRecord } from '@/pages/customers/data/mockCustomers'
import type { OverviewStat } from '@/pages/policies/data/mockOverview'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import { EntityStatGrid, entityDetailCardSx } from '@/pages/shared/components/EntityStatGrid'

function formatCurrency(value: number) {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

function formatDate(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function customerStats(customer: CustomerRecord): OverviewStat[] {
  return [
    { id: 'policies', label: 'Active policies', value: customer.activePolicies, tone: 'success' },
    { id: 'quotes', label: 'Open quotes', value: customer.openQuotes, tone: 'info' },
    {
      id: 'claims',
      label: 'Open claims',
      value: customer.openClaims,
      tone: customer.openClaims > 0 ? 'warning' : 'success',
    },
    { id: 'twp', label: 'Total written premium', value: formatCurrency(customer.twp), tone: 'info' },
  ]
}

function customerFacts(customer: CustomerRecord): { term: string; value: string }[] {
  const cityLine = [customer.city, [customer.state, customer.zip].filter(Boolean).join(' ')]
    .filter(Boolean)
    .join(', ')
  return [
    { term: 'Customer #', value: customer.customerNumber },
    { term: 'Contact', value: customer.contactName },
    { term: 'Phone', value: customer.contactPhone },
    { term: 'Email', value: customer.email },
    { term: 'Address', value: [customer.address, cityLine].filter(Boolean).join(', ') },
    { term: 'Insureds', value: String(customer.insuredCount) },
    { term: 'Attention', value: customer.attention },
  ].filter((fact) => fact.value.trim() && fact.value !== '—')
}

export function CustomerDetails() {
  const { customerNumber } = useParams<{ customerNumber: string }>()
  const { createdCustomers } = useCustomersStore()
  const decodedNumber = decodeURIComponent(customerNumber ?? '')
  const customer = useMemo(
    () =>
      [...createdCustomers, ...customersMock].find((entry) => entry.customerNumber === decodedNumber) ?? null,
    [createdCustomers, decodedNumber],
  )
  const contentPx = `${layoutTokens.contentPaddingX}px`
  const isDesktop = useIsDesktopLayout()
  const { openTool, closeTool } = useRightTool()

  useRegisterRightToolRecordContext(
    { title: customer?.name ?? decodedNumber, subtitle: 'Customer' },
    [customer?.name, decodedNumber],
  )

  useRegisterRightToolCopilot(
    { context: 'customers', focusedCustomer: customer },
    // Primitives only — the record object is rebuilt whenever the store changes.
    [customer?.id, customer?.contactPhone, customer?.email, customer?.contactName],
  )

  // Arriving from the Create customer drawer (or any link) swaps the right panel to Copilot for this customer.
  useEffect(() => {
    if (isDesktop) openTool('copilot')
    else closeTool()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [decodedNumber])

  return (
    <Box sx={{ flex: 1, minHeight: 0, height: '100%', overflow: 'auto', bgcolor: 'background.paper' }}>
      <Box sx={{ px: contentPx, pt: layoutTokens.policyHeaderTopPadding, pb: 1.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <EntityListHomeButton to="/customers" label="All customers" icon={BusinessOutlinedIcon} tone="insureds" />
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle2"
              component="h1"
              noWrap
              sx={{
                fontFamily: figmaFontFamilyStack.heading,
                fontWeight: 600,
                lineHeight: 1.3,
                fontSize: { xs: '1rem', md: '1.0625rem' },
              }}
            >
              {customer?.name ?? 'Customer not found'}
            </Typography>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mt: 0.125, gap: 1, flexWrap: 'wrap' }}
            >
              <Stack direction="row" alignItems="center" sx={{ gap: 0.75, minWidth: 0 }}>
                <Typography
                  variant="subtitle2"
                  component="p"
                  sx={{
                    fontFamily: figmaFontFamilyStack.heading,
                    fontWeight: 500,
                    lineHeight: 1.3,
                    fontSize: { xs: '0.8125rem', md: '0.875rem' },
                    color: 'text.secondary',
                  }}
                >
                  Customer · {decodedNumber}
                </Typography>
                {customer ? <CustomerBillingStatusChip status={customer.billingStatus} /> : null}
              </Stack>
              {customer ? (
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8125rem', md: '0.875rem' } }}>
                  Customer since {formatDate(customer.customerSince)}
                </Typography>
              ) : null}
            </Stack>
          </Box>
        </Stack>
      </Box>

      <Box sx={{ px: contentPx, py: `${layoutTokens.contentPaddingX}px` }}>
        {customer ? (
          <Stack spacing={3.125}>
            <EntityStatGrid stats={customerStats(customer)} />
            <Box sx={(theme) => ({ ...entityDetailCardSx(theme as AppTheme), overflow: 'hidden' })}>
              <Typography
                component="h2"
                variant="subtitle1"
                sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, px: 2, pt: 1.75, pb: 1 }}
              >
                Details
              </Typography>
              <Box component="dl" sx={{ m: 0, px: 1, pb: 1 }}>
                {customerFacts(customer).map((fact, index) => (
                  <Box
                    key={fact.term}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '160px minmax(0, 1fr)',
                      columnGap: 2,
                      px: 1,
                      py: 1,
                      borderRadius: '5px',
                      bgcolor: index % 2 === 0 ? 'action.hover' : 'background.paper',
                    }}
                  >
                    <Typography component="dt" variant="body2" color="text.secondary">
                      {fact.term}
                    </Typography>
                    <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>
                      {fact.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No customer with number {decodedNumber}.
          </Typography>
        )}
      </Box>
    </Box>
  )
}

export default CustomerDetails

import { StatusChip, type StatusChipProps } from '@/design-system/components'
import type { CustomerBillingStatus } from '@/pages/customers/data/mockCustomers'

const billingToneMap: Record<CustomerBillingStatus, StatusChipProps['status']> = {
  'Past due': 'error',
  Current: 'success',
}

export function CustomerBillingStatusChip({ status }: { status: CustomerBillingStatus }) {
  return <StatusChip status={billingToneMap[status]} label={status} />
}

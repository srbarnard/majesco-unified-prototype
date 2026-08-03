import type { CustomerRecord } from '@/pages/customers/data/mockCustomers'
import type { CustomersListFilters } from '@/pages/customers/filters/customersListFilterTypes'

export function applyCustomersListFilters(rows: CustomerRecord[], filters: CustomersListFilters) {
  return rows.filter((row) => {
    if (filters.attentions.length > 0 && !filters.attentions.includes(row.attention)) {
      return false
    }
    if (filters.billingStatuses.length > 0 && !filters.billingStatuses.includes(row.billingStatus)) {
      return false
    }
    return true
  })
}

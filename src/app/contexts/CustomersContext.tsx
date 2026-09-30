import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { CreateCustomerSavedState } from '@/pages/customers/components/CreateCustomerPanel'
import type { CustomerRecord } from '@/pages/customers/data/mockCustomers'

export type CreatedCustomerEntry = { customer: CustomerRecord; createdAt: Date }

type CustomersContextValue = {
  /** Customers created this session, newest first; the Customers grid lists them above the mock rows. */
  createdCustomers: CustomerRecord[]
  createdCustomerHistory: CreatedCustomerEntry[]
  savedCreateCustomer: CreateCustomerSavedState | null
  setSavedCreateCustomer: (state: CreateCustomerSavedState | null) => void
  createCustomer: (customer: CustomerRecord) => void
}

const CustomersContext = createContext<CustomersContextValue | null>(null)

export function CustomersProvider({ children }: { children: ReactNode }) {
  const [createdCustomerHistory, setCreatedCustomerHistory] = useState<CreatedCustomerEntry[]>([])
  const [savedCreateCustomer, setSavedCreateCustomer] = useState<CreateCustomerSavedState | null>(null)

  const createCustomer = useCallback((customer: CustomerRecord) => {
    setCreatedCustomerHistory((current) => [{ customer, createdAt: new Date() }, ...current])
    setSavedCreateCustomer(null)
  }, [])

  const value = useMemo(
    () => ({
      createdCustomers: createdCustomerHistory.map((entry) => entry.customer),
      createdCustomerHistory,
      savedCreateCustomer,
      setSavedCreateCustomer,
      createCustomer,
    }),
    [createCustomer, createdCustomerHistory, savedCreateCustomer],
  )

  return <CustomersContext.Provider value={value}>{children}</CustomersContext.Provider>
}

export function useCustomersStore(): CustomersContextValue {
  const context = useContext(CustomersContext)
  if (!context) {
    throw new Error('useCustomersStore must be used within CustomersProvider')
  }
  return context
}

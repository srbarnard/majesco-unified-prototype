import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
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
  /** Replaces a customer created this session (matched by id). */
  updateCustomer: (customer: CustomerRecord) => void
  /** Id of the customer created moments ago, for a one-time highlight in the grid; clears itself. */
  justCreatedCustomerId: string | null
}

const JUST_CREATED_MS = 1500

const CustomersContext = createContext<CustomersContextValue | null>(null)

export function CustomersProvider({ children }: { children: ReactNode }) {
  const [createdCustomerHistory, setCreatedCustomerHistory] = useState<CreatedCustomerEntry[]>([])
  const [savedCreateCustomer, setSavedCreateCustomer] = useState<CreateCustomerSavedState | null>(null)
  const [justCreatedCustomerId, setJustCreatedCustomerId] = useState<string | null>(null)

  useEffect(() => {
    if (!justCreatedCustomerId) return
    const timer = window.setTimeout(() => setJustCreatedCustomerId(null), JUST_CREATED_MS)
    return () => window.clearTimeout(timer)
  }, [justCreatedCustomerId])

  const createCustomer = useCallback((customer: CustomerRecord) => {
    setCreatedCustomerHistory((current) => [{ customer, createdAt: new Date() }, ...current])
    setSavedCreateCustomer(null)
    setJustCreatedCustomerId(customer.id)
  }, [])

  const updateCustomer = useCallback((customer: CustomerRecord) => {
    setCreatedCustomerHistory((current) =>
      current.map((entry) => (entry.customer.id === customer.id ? { ...entry, customer } : entry)),
    )
  }, [])

  const value = useMemo(
    () => ({
      createdCustomers: createdCustomerHistory.map((entry) => entry.customer),
      createdCustomerHistory,
      savedCreateCustomer,
      setSavedCreateCustomer,
      createCustomer,
      updateCustomer,
      justCreatedCustomerId,
    }),
    [createCustomer, createdCustomerHistory, justCreatedCustomerId, savedCreateCustomer, updateCustomer],
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

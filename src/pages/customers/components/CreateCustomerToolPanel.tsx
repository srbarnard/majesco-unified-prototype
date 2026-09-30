import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useCustomersStore } from '@/app/contexts/CustomersContext'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { CreateCustomerPanel } from '@/pages/customers/components/CreateCustomerPanel'
import type { CustomerRecord } from '@/pages/customers/data/mockCustomers'
import type { DraftTab } from '@/pages/shared/components/DraftDrawer'
import { resolveTaskPageContext } from '@/pages/tasks/data/addTaskDraft'

/** Global Create customer drawer — opens from the rail over whatever page is active. */
export function CreateCustomerToolPanel() {
  const { closeTool } = useRightTool()
  const {
    createdCustomers,
    createdCustomerHistory,
    savedCreateCustomer,
    setSavedCreateCustomer,
    createCustomer,
  } = useCustomersStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [session, setSession] = useState<{ key: number; tab: DraftTab }>({ key: 0, tab: 'new' })
  const pageContext = useMemo(() => resolveTaskPageContext(location.pathname), [location.pathname])

  const handleCreate = (customer: CustomerRecord) => {
    createCustomer(customer)
    // Stay on the current page; History confirms the customer was created.
    setSession((current) => ({ key: current.key + 1, tab: 'history' }))
  }

  return (
    <CreateCustomerPanel
      key={session.key}
      initialState={savedCreateCustomer}
      initialTab={session.tab}
      history={createdCustomerHistory}
      createdCustomers={createdCustomers}
      pageContext={pageContext}
      onClose={closeTool}
      onSaveDraft={(state) => {
        setSavedCreateCustomer(state)
        closeTool()
      }}
      onCreate={handleCreate}
      onOpenCustomer={() => {
        closeTool()
        if (location.pathname !== '/customers') navigate('/customers')
      }}
    />
  )
}

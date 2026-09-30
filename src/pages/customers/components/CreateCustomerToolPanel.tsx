import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useCustomersStore } from '@/app/contexts/CustomersContext'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { useTasksStore } from '@/app/contexts/TasksContext'
import { CreateCustomerPanel } from '@/pages/customers/components/CreateCustomerPanel'
import { resolveTaskPageContext } from '@/pages/tasks/data/addTaskDraft'

/** Global Create customer drawer — opens from the rail over whatever page is active. */
export function CreateCustomerToolPanel() {
  const { closeTool } = useRightTool()
  const { openNewTask } = useTasksStore()
  const {
    createdCustomers,
    createdCustomerHistory,
    savedCreateCustomer,
    setSavedCreateCustomer,
    createCustomer,
    updateCustomer,
  } = useCustomersStore()
  const location = useLocation()
  const navigate = useNavigate()
  const pageContext = useMemo(() => resolveTaskPageContext(location.pathname), [location.pathname])

  return (
    <CreateCustomerPanel
      initialState={savedCreateCustomer}
      history={createdCustomerHistory}
      createdCustomers={createdCustomers}
      pageContext={pageContext}
      onClose={closeTool}
      onSaveDraft={(state) => {
        setSavedCreateCustomer(state)
        closeTool()
      }}
      onCreate={createCustomer}
      onUpdate={updateCustomer}
      onStartQuote={(prefill) => {
        closeTool()
        navigate('/quotes/new', { state: { quotePrefill: prefill } })
      }}
      onOpenTask={(related, draftToKeep) => {
        if (draftToKeep) setSavedCreateCustomer(draftToKeep)
        openNewTask(related)
      }}
      onOpenCustomer={() => {
        closeTool()
        if (location.pathname !== '/customers') navigate('/customers')
      }}
    />
  )
}

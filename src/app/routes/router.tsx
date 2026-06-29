import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/app/layouts/AppLayout'
import { ClaimsPage } from '@/app/pages/ClaimsPage'
import { CustomersPage } from '@/app/pages/CustomersPage'
import { DashboardPage } from '@/app/pages/DashboardPage'
import { PlaceholderPage } from '@/app/pages/PlaceholderPage'
import { PoliciesListPage } from '@/pages/policies/PoliciesListPage'
import { SettingsPage } from '@/app/pages/SettingsPage'
import { PolicyDetails } from '@/pages/policies/PolicyDetails'
import { QuotesPage } from '@/pages/quotes/QuotesPage'
import { TasksPage } from '@/pages/tasks/TasksPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'activity', element: <PlaceholderPage title="Activity" description="Recent policy and submission activity will appear here." /> },
      { path: 'favorites', element: <PlaceholderPage title="Favorites" description="Saved policies, insureds, and watchlists will appear here." /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'quotes', element: <QuotesPage /> },
      { path: 'submissions', element: <PlaceholderPage title="Submissions" description="New business and endorsement submissions will appear here." /> },
      { path: 'insureds', element: <PlaceholderPage title="Insureds" description="Search and manage insured accounts." /> },
      { path: 'producers', element: <PlaceholderPage title="Producers" description="Producer appointments and hierarchies." /> },
      { path: 'sub-producers', element: <PlaceholderPage title="Sub producers" description="Sub-producer relationships and commissions." /> },
      { path: 'copilot-studio', element: <PlaceholderPage title="Copilot Studio" description="Build and manage Copilot agents and automations." /> },
      { path: 'policies', element: <PoliciesListPage /> },
      { path: 'policies/:policyId', element: <PolicyDetails /> },
      { path: 'claims', element: <ClaimsPage /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

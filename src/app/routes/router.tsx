import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/app/layouts/AppLayout'
import { ClaimDetails } from '@/pages/claims/ClaimDetails'
import { ClaimsPage } from '@/pages/claims/ClaimsPage'
import { CustomerDetails } from '@/pages/customers/CustomerDetails'
import { CustomersPage } from '@/pages/customers/CustomersPage'
import { DashboardPage } from '@/app/pages/DashboardPage'
import { ActivityPage } from '@/app/pages/ActivityPage'
import { PlaceholderPage } from '@/app/pages/PlaceholderPage'
import { CopilotStudioPage } from '@/pages/copilot-studio/CopilotStudioPage'
import { PoliciesListPage } from '@/pages/policies/PoliciesListPage'
import { SettingsPage } from '@/app/pages/SettingsPage'
import { PolicyDetails } from '@/pages/policies/PolicyDetails'
import { DocumentViewerPage } from '@/pages/policies/DocumentViewerPage'
import { InsuredDetails } from '@/pages/insureds/InsuredDetails'
import { InsuredsPage } from '@/pages/insureds/InsuredsPage'
import { QuoteDetails } from '@/pages/quotes/QuoteDetails'
import { NewQuoteWizardPage } from '@/pages/quotes/NewQuoteWizardPage'
import { QuotesPage } from '@/pages/quotes/QuotesPage'
import { SubmissionsPage } from '@/pages/submissions/SubmissionsPage'
import { SubmissionDetails } from '@/pages/submissions/SubmissionDetails'
import { TasksPage } from '@/pages/tasks/TasksPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'activity', element: <ActivityPage /> },
      { path: 'favorites', element: <PlaceholderPage title="Favorites" description="Saved policies, insureds, and watchlists will appear here." /> },
      { path: 'tasks', element: <TasksPage /> },
      { path: 'quotes', element: <QuotesPage /> },
      { path: 'quotes/new', element: <NewQuoteWizardPage /> },
      { path: 'quotes/:quoteId', element: <QuoteDetails /> },
      { path: 'quotes/:quoteId/documents/:docId', element: <DocumentViewerPage context="quote-detail" /> },
      { path: 'submissions', element: <SubmissionsPage /> },
      { path: 'submissions/:submissionId', element: <SubmissionDetails /> },
      { path: 'submissions/:submissionId/documents/:docId', element: <DocumentViewerPage context="submission-detail" /> },
      { path: 'insureds', element: <InsuredsPage /> },
      { path: 'insureds/:insuredId', element: <InsuredDetails /> },
      { path: 'producers', element: <PlaceholderPage title="Producers" description="Producer appointments and hierarchies." /> },
      { path: 'sub-producers', element: <PlaceholderPage title="Sub producers" description="Sub-producer relationships and commissions." /> },
      { path: 'copilot-studio', element: <CopilotStudioPage /> },
      { path: 'policies', element: <PoliciesListPage /> },
      { path: 'policies/:policyId', element: <PolicyDetails /> },
      { path: 'policies/:policyId/documents/:docId', element: <DocumentViewerPage context="policy" /> },
      { path: 'claims', element: <ClaimsPage /> },
      { path: 'claims/:claimNumber', element: <ClaimDetails /> },
      { path: 'claims/:claimNumber/documents/:docId', element: <DocumentViewerPage context="draft" /> },
      { path: 'documents/:docId', element: <DocumentViewerPage context="draft" /> },
      { path: 'customers', element: <CustomersPage /> },
      { path: 'customers/:customerNumber', element: <CustomerDetails /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
])

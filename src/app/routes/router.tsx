import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/app/layouts/AppLayout'
import { DashboardPage } from '@/app/pages/DashboardPage'
import { SettingsPage } from '@/app/pages/SettingsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
    ],
  },
])

export type OverviewStatTone = 'success' | 'info' | 'warning' | 'error'

export type OverviewStat = {
  id: string
  label: string
  value: string | number
  helperText?: string
  tone: OverviewStatTone
}

export type OverviewTimeSeriesPoint = {
  label: string
  value: number
  date?: string
}

export const overviewStatsMock: OverviewStat[] = [
  { id: 'endorsements', label: 'Endorsements', value: 4, helperText: 'Last 90 days', tone: 'success' },
  { id: 'vehicles-added', label: 'Vehicle Added', value: 1, helperText: 'Current term', tone: 'info' },
  { id: 'pending-changes', label: 'Pending Changes', value: 3, helperText: 'Needs review', tone: 'warning' },
  { id: 'active-claims', label: 'Active Claim', value: 1, helperText: 'Open status', tone: 'error' },
]

export const overviewTransactionsOverTimeMock: OverviewTimeSeriesPoint[] = [
  { label: 'Jan 2026', value: 0, date: 'Jan 3, 2026' },
  { label: '', value: 1, date: 'Jan 12, 2026' },
  { label: '', value: 2, date: 'Jan 22, 2026' },
  { label: 'Feb 2026', value: 1, date: 'Feb 2, 2026' },
  { label: '', value: 2, date: 'Feb 14, 2026' },
  { label: '', value: 3, date: 'Feb 26, 2026' },
  { label: 'Mar 2026', value: 2, date: 'Mar 5, 2026' },
  { label: '', value: 3, date: 'Mar 16, 2026' },
  { label: '', value: 4, date: 'Mar 28, 2026' },
  { label: 'Apr 2026', value: 3, date: 'Apr 4, 2026' },
  { label: '', value: 5, date: 'Apr 12, 2026' },
  { label: '', value: 7, date: 'Apr 15, 2026' },
  { label: '', value: 4, date: 'Apr 24, 2026' },
  { label: 'May 2026', value: 3, date: 'May 3, 2026' },
  { label: '', value: 5, date: 'May 14, 2026' },
  { label: '', value: 4, date: 'May 25, 2026' },
  { label: 'Jun 2026', value: 4, date: 'Jun 2, 2026' },
  { label: '', value: 6, date: 'Jun 12, 2026' },
  { label: '', value: 5, date: 'Jun 22, 2026' },
]

export type OverviewTransaction = {
  id: string
  type: string
  description: string
  status: string
  statusTone: 'success' | 'warning' | 'error' | 'info' | 'default'
  premiumChange?: string
  premiumDirection?: 'up' | 'down'
  effectiveDate: string
  revision?: string
}

export type OverviewVehicle = {
  id: string
  year: string
  make: string
  model: string
  vin: string
  garaging: string
  status: string
}

export type OverviewQuickAction = {
  id: string
  label: string
  variant?: 'contained' | 'outlined'
}

export type OverviewHighlight = {
  label: string
  value: string
}

export const overviewTransactionsMock: OverviewTransaction[] = [
  {
    id: 'tx-1',
    type: 'Endorsement',
    description: 'Add 2024 Ford F-350 to fleet schedule',
    status: 'In-Force',
    statusTone: 'success',
    premiumChange: '+$1,240.00',
    premiumDirection: 'up',
    effectiveDate: 'Jun 18, 2026',
    revision: 'Rev 6',
  },
  {
    id: 'tx-2',
    type: 'Renewal',
    description: '2026 renewal quote issued to producer',
    status: 'Pending',
    statusTone: 'info',
    premiumChange: '+$22,480.00',
    premiumDirection: 'up',
    effectiveDate: 'Jun 12, 2026',
    revision: 'Rev 5',
  },
  {
    id: 'tx-3',
    type: 'Claim',
    description: 'Auto collision — unit 14 rear-end incident',
    status: 'Open',
    statusTone: 'warning',
    effectiveDate: 'Jun 8, 2026',
  },
  {
    id: 'tx-4',
    type: 'Billing',
    description: 'Installment invoice posted — Q2 schedule',
    status: 'In-Force',
    statusTone: 'success',
    effectiveDate: 'Jun 1, 2026',
    revision: 'Rev 4',
  },
  {
    id: 'tx-5',
    type: 'Endorsement',
    description: 'Additional insured — West Coast Distribution',
    status: 'In-Force',
    statusTone: 'success',
    premiumChange: '+$185.00',
    premiumDirection: 'up',
    effectiveDate: 'May 28, 2026',
    revision: 'Rev 4',
  },
  {
    id: 'tx-6',
    type: 'Policy Change',
    description: 'Garaging address update — San Diego yard',
    status: 'In-Force',
    statusTone: 'success',
    effectiveDate: 'May 19, 2026',
    revision: 'Rev 3',
  },
  {
    id: 'tx-7',
    type: 'Endorsement',
    description: 'Remove 2021 Freightliner M2 from schedule',
    status: 'In-Force',
    statusTone: 'success',
    premiumChange: '-$960.00',
    premiumDirection: 'down',
    effectiveDate: 'May 10, 2026',
    revision: 'Rev 3',
  },
  {
    id: 'tx-8',
    type: 'Audit',
    description: 'Premium audit adjustment — mileage variance',
    status: 'Pending',
    statusTone: 'warning',
    premiumChange: '+$3,420.00',
    premiumDirection: 'up',
    effectiveDate: 'Apr 30, 2026',
  },
  {
    id: 'tx-9',
    type: 'Billing',
    description: 'Non-payment reminder — 15-day notice',
    status: 'In-Force',
    statusTone: 'success',
    effectiveDate: 'Apr 22, 2026',
  },
  {
    id: 'tx-10',
    type: 'Certificate',
    description: 'Certificate of insurance reissued for project bid',
    status: 'Issued',
    statusTone: 'info',
    effectiveDate: 'Apr 15, 2026',
  },
  {
    id: 'tx-11',
    type: 'Inspection',
    description: 'Loss control follow-up — dock safety signage',
    status: 'Scheduled',
    statusTone: 'default',
    effectiveDate: 'Apr 4, 2026',
  },
  {
    id: 'tx-12',
    type: 'Reinstatement',
    description: 'Policy reinstated after payment received',
    status: 'In-Force',
    statusTone: 'success',
    premiumChange: '+$0.00',
    premiumDirection: 'up',
    effectiveDate: 'Mar 21, 2026',
    revision: 'Rev 2',
  },
]

export const overviewVehiclesMock: OverviewVehicle[] = [
  {
    id: 'v-1',
    year: '2024',
    make: 'Ford',
    model: 'F-350 Super Duty',
    vin: '1FT8W3DT5REC41208',
    garaging: 'San Diego, CA',
    status: 'Active',
  },
  {
    id: 'v-2',
    year: '2023',
    make: 'Chevrolet',
    model: 'Silverado 2500HD',
    vin: '1GC4YNEY8PF128447',
    garaging: 'San Diego, CA',
    status: 'Active',
  },
  {
    id: 'v-3',
    year: '2022',
    make: 'Ram',
    model: '3500 Chassis Cab',
    vin: '3C7WRNFL9NG512903',
    garaging: 'El Cajon, CA',
    status: 'Active',
  },
  {
    id: 'v-4',
    year: '2021',
    make: 'Freightliner',
    model: 'M2 106',
    vin: '3ALACWFC1MDMK8291',
    garaging: 'San Diego, CA',
    status: 'Removed',
  },
]

export const overviewQuickActionsMock: OverviewQuickAction[] = [
  { id: 'endorse', label: 'New Endorsement', variant: 'outlined' },
  { id: 'documents', label: 'View Documents', variant: 'outlined' },
  { id: 'renewal', label: 'Renewal Quote', variant: 'outlined' },
  { id: 'note', label: 'Add Note', variant: 'outlined' },
  { id: 'email', label: 'Send Email', variant: 'outlined' },
  { id: 'underwriting', label: 'Send to Underwriting', variant: 'outlined' },
]

export const overviewHighlightsMock: OverviewHighlight[] = [
  { label: 'Named Insured', value: 'Atlantic Ridge Construction, LLC' },
  { label: 'Risk State', value: 'California' },
  { label: 'Primary Garage', value: 'San Diego, CA' },
  { label: 'Policy Type', value: 'Commercial Auto - Business Auto' },
  { label: 'Fleet Size', value: '48 units (3 active changes)' },
  { label: 'Producer', value: 'Liberty Group' },
]

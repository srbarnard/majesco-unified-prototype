import type { QuoteFilterStatus } from '@/pages/quotes/filters/quotesListFilterTypes'

export type QuoteStatus =
  | 'Quoted'
  | 'Draft'
  | 'Setup in progress'
  | 'Presented'
  | 'Ready for booking'
  | 'Referred'
  | 'Rating blocked'
  | 'Pending issuance'
  | 'Issued'

export type Quote = {
  id: string
  quoteNumber: string
  insured: string
  producer: string
  products: string[]
  effectiveDate: string
  status: QuoteStatus
  filterStatus: QuoteFilterStatus
  premium: number
  updatedLabel: string
  lastUpdated: string
}

export const quotesMock: Quote[] = [
  {
    id: 'q-1',
    quoteNumber: '01-CA-000100005-0',
    insured: 'Redwood Ridge Construction LLC',
    producer: 'Atlantic Ridge Construction, LLC',
    products: ['Commercial Auto'],
    effectiveDate: '2026-07-01',
    status: 'Quoted',
    filterStatus: 'Quoted',
    premium: 1245320,
    updatedLabel: 'Today',
    lastUpdated: '2026-06-26',
  },
  {
    id: 'q-2',
    quoteNumber: '01-CP-000017809-0',
    insured: 'Atlas Freight Solutions Inc.',
    producer: 'Blue Harbor Logistics Inc.',
    products: ['Commercial Package', 'Umbrella'],
    effectiveDate: '2026-07-03',
    status: 'Draft',
    filterStatus: 'Open',
    premium: 875640,
    updatedLabel: 'Today',
    lastUpdated: '2026-06-26',
  },
  {
    id: 'q-3',
    quoteNumber: '01-BP-000028506-0',
    insured: 'Harborview Property Management',
    producer: 'Maple Grove Property Management',
    products: ['General Liability', 'Property'],
    effectiveDate: '2025-03-07',
    status: 'Setup in progress',
    filterStatus: 'Open',
    premium: 2310980,
    updatedLabel: '4h ago',
    lastUpdated: '2026-06-26',
  },
  {
    id: 'q-4',
    quoteNumber: '01-CP-000017813-0',
    insured: 'Keystone Manufacturing Co.',
    producer: 'Silverline Manufacturing Co.',
    products: ['Commercial Auto'],
    effectiveDate: '2025-03-01',
    status: 'Presented',
    filterStatus: 'In review',
    premium: 456210,
    updatedLabel: 'Yesterday',
    lastUpdated: '2026-06-25',
  },
  {
    id: 'q-5',
    quoteNumber: '01-CA-000100009-0',
    insured: 'Blue Oak Hospitality Group',
    producer: 'Northshore Medical Group, P.C.',
    products: ['Commercial Property', 'Umbrella'],
    effectiveDate: '2026-06-26',
    status: 'Ready for booking',
    filterStatus: 'Quoted',
    premium: 3785400,
    updatedLabel: 'Yesterday',
    lastUpdated: '2026-06-25',
  },
  {
    id: 'q-6',
    quoteNumber: '01-BP-000028511-0',
    insured: 'Summit Electrical Services LLC',
    producer: 'Keystone Commercial Realty',
    products: ['BOP', 'General Liability', 'Workers Compensation'],
    effectiveDate: '2026-07-10',
    status: 'Referred',
    filterStatus: 'In review',
    premium: 1092775,
    updatedLabel: '2 days ago',
    lastUpdated: '2026-06-24',
  },
  {
    id: 'q-7',
    quoteNumber: '01-CA-000100006-0',
    insured: 'Northstar Logistics Partners',
    producer: 'Summit Outdoor Equipment, Inc.',
    products: ['Commercial Auto', 'Workers Compensation'],
    effectiveDate: '2026-06-28',
    status: 'Rating blocked',
    filterStatus: 'Declined',
    premium: 642890,
    updatedLabel: '3 days ago',
    lastUpdated: '2026-06-23',
  },
  {
    id: 'q-8',
    quoteNumber: '01-CP-000017810-0',
    insured: 'Ironclad Security Systems Inc.',
    producer: 'Red Oak Hospitality Group',
    products: ['BOP', 'General Liability', 'Umbrella'],
    effectiveDate: '2026-07-15',
    status: 'Pending issuance',
    filterStatus: 'In review',
    premium: 5420300,
    updatedLabel: '5 days ago',
    lastUpdated: '2026-06-21',
  },
  {
    id: 'q-9',
    quoteNumber: '01-BP-000028508-0',
    insured: 'ClearPath Consulting Group',
    producer: 'Evergreen Food Distributors',
    products: ['Commercial Auto', 'General Liability', 'Motor Truck Cargo'],
    effectiveDate: '2025-01-25',
    status: 'Issued',
    filterStatus: 'Quoted',
    premium: 1965150,
    updatedLabel: '6 days ago',
    lastUpdated: '2026-06-20',
  },
  {
    id: 'q-10',
    quoteNumber: '01-CA-000100012-0',
    insured: 'Silverline Commercial Realty',
    producer: 'Horizon Fleet Services, LLC',
    products: ['Commercial Package', 'Umbrella'],
    effectiveDate: '2026-06-30',
    status: 'Issued',
    filterStatus: 'Quoted',
    premium: 728460,
    updatedLabel: '6 days ago',
    lastUpdated: '2026-06-20',
  },
]

export const QUOTES_TOTAL_ROWS = 100

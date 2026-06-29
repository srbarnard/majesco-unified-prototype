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
  premium: number
  updatedLabel: string
}

export const quotesMock: Quote[] = [
  {
    id: 'q-1',
    quoteNumber: '01-CA-000100005-0',
    insured: 'Redwood Ridge Construction LLC',
    producer: 'Atlantic Ridge Construction, LLC',
    products: ['Commercial Auto'],
    effectiveDate: '2025-12-15',
    status: 'Quoted',
    premium: 1245320,
    updatedLabel: 'Today',
  },
  {
    id: 'q-2',
    quoteNumber: '01-CP-000017809-0',
    insured: 'Atlas Freight Solutions Inc.',
    producer: 'Blue Harbor Logistics Inc.',
    products: ['Commercial Package', 'Umbrella'],
    effectiveDate: '2026-01-03',
    status: 'Draft',
    premium: 875640,
    updatedLabel: 'Today',
  },
  {
    id: 'q-3',
    quoteNumber: '01-BP-000028506-0',
    insured: 'Harborview Property Management',
    producer: 'Maple Grove Property Management',
    products: ['General Liability', 'Property'],
    effectiveDate: '2025-03-07',
    status: 'Setup in progress',
    premium: 2310980,
    updatedLabel: '4h ago',
  },
  {
    id: 'q-4',
    quoteNumber: '01-CP-000017813-0',
    insured: 'Keystone Manufacturing Co.',
    producer: 'Silverline Manufacturing Co.',
    products: ['Commercial Auto'],
    effectiveDate: '2025-03-01',
    status: 'Presented',
    premium: 456210,
    updatedLabel: 'Yesterday',
  },
  {
    id: 'q-5',
    quoteNumber: '01-CA-000100009-0',
    insured: 'Blue Oak Hospitality Group',
    producer: 'Northshore Medical Group, P.C.',
    products: ['Commercial Property', 'Umbrella'],
    effectiveDate: '2025-07-05',
    status: 'Ready for booking',
    premium: 3785400,
    updatedLabel: 'Yesterday',
  },
  {
    id: 'q-6',
    quoteNumber: '01-BP-000028511-0',
    insured: 'Summit Electrical Services LLC',
    producer: 'Keystone Commercial Realty',
    products: ['BOP', 'General Liability', 'Workers Compensation'],
    effectiveDate: '2025-07-05',
    status: 'Referred',
    premium: 1092775,
    updatedLabel: '2 days ago',
  },
  {
    id: 'q-7',
    quoteNumber: '01-CA-000100006-0',
    insured: 'Northstar Logistics Partners',
    producer: 'Summit Outdoor Equipment, Inc.',
    products: ['Commercial Auto', 'Workers Compensation'],
    effectiveDate: '2025-07-05',
    status: 'Rating blocked',
    premium: 642890,
    updatedLabel: '3 days ago',
  },
  {
    id: 'q-8',
    quoteNumber: '01-CP-000017810-0',
    insured: 'Ironclad Security Systems Inc.',
    producer: 'Red Oak Hospitality Group',
    products: ['BOP', 'General Liability', 'Umbrella'],
    effectiveDate: '2025-12-31',
    status: 'Pending issuance',
    premium: 5420300,
    updatedLabel: '5 days ago',
  },
  {
    id: 'q-9',
    quoteNumber: '01-BP-000028508-0',
    insured: 'ClearPath Consulting Group',
    producer: 'Evergreen Food Distributors',
    products: ['Commercial Auto', 'General Liability', 'Motor Truck Cargo'],
    effectiveDate: '2025-01-25',
    status: 'Issued',
    premium: 1965150,
    updatedLabel: '6 days ago',
  },
  {
    id: 'q-10',
    quoteNumber: '01-CA-000100012-0',
    insured: 'Silverline Commercial Realty',
    producer: 'Horizon Fleet Services, LLC',
    products: ['Commercial Package', 'Umbrella'],
    effectiveDate: '2025-06-26',
    status: 'Issued',
    premium: 728460,
    updatedLabel: '6 days ago',
  },
]

export const QUOTES_TOTAL_ROWS = 100

export type PolicyListRecord = {
  id: string
  policyNumber: string
  effectiveDate: string
  expirationDate: string
  insuredName: string
  agency: string
  agencyNumber: string
  underwriter: string
  twp: number
  ftp: number
}

export const policiesListMock: PolicyListRecord[] = [
  {
    id: 'p-1',
    policyNumber: '01-CA-000100005-0',
    effectiveDate: '2025-12-15',
    expirationDate: '2026-12-15',
    insuredName: 'Atlantic Ridge Construction, LLC',
    agency: 'Harborview Agency',
    agencyNumber: '9000000001',
    underwriter: 'Jennifer Collins',
    twp: 1245320,
    ftp: 1180450,
  },
  {
    id: 'p-2',
    policyNumber: '01-CP-000017809-0',
    effectiveDate: '2026-01-03',
    expirationDate: '2028-01-03',
    insuredName: 'Blue Harbor Logistics Inc.',
    agency: 'Summit Risk',
    agencyNumber: '9000000047',
    underwriter: 'Michael Reynolds',
    twp: 875640,
    ftp: 842300,
  },
  {
    id: 'p-3',
    policyNumber: '01-BP-000028506-0',
    effectiveDate: '2025-03-07',
    expirationDate: '2026-03-07',
    insuredName: 'Maple Grove Property Management',
    agency: 'Blue Ridge Insurance',
    agencyNumber: '9000000123',
    underwriter: 'Sarah Thompson',
    twp: 2310980,
    ftp: 2095600,
  },
  {
    id: 'p-4',
    policyNumber: '01-CP-000017813-0',
    effectiveDate: '2025-03-01',
    expirationDate: '2026-03-01',
    insuredName: 'Silverline Manufacturing Co.',
    agency: 'Northern Plains Agency',
    agencyNumber: '9000000234',
    underwriter: 'Daniel Parker',
    twp: 456210,
    ftp: 445880,
  },
  {
    id: 'p-5',
    policyNumber: '01-CA-000100009-0',
    effectiveDate: '2025-07-05',
    expirationDate: '2026-07-05',
    insuredName: 'Northshore Medical Group, P.C.',
    agency: 'Atlas Insurance Group',
    agencyNumber: '9000000287',
    underwriter: 'Emily Carter',
    twp: 3785400,
    ftp: 3625100,
  },
  {
    id: 'p-6',
    policyNumber: '01-BP-000028511-0',
    effectiveDate: '2025-07-05',
    expirationDate: '2026-07-05',
    insuredName: 'Keystone Commercial Realty',
    agency: 'First Coastal Agency',
    agencyNumber: '9000000326',
    underwriter: 'David Hernandez',
    twp: 1092775,
    ftp: 1045600,
  },
  {
    id: 'p-7',
    policyNumber: '01-CA-000100006-0',
    effectiveDate: '2025-07-05',
    expirationDate: '2026-07-05',
    insuredName: 'Summit Outdoor Equipment, Inc.',
    agency: 'Pioneer Insurance Group',
    agencyNumber: '9000000368',
    underwriter: 'Laura Mitchell',
    twp: 642890,
    ftp: 620450,
  },
  {
    id: 'p-8',
    policyNumber: '01-CP-000017810-0',
    effectiveDate: '2025-12-31',
    expirationDate: '2026-12-31',
    insuredName: 'Red Oak Hospitality Group',
    agency: 'Frontier Commercial Agency',
    agencyNumber: '9000000410',
    underwriter: 'James Anderson',
    twp: 5420300,
    ftp: 5295000,
  },
  {
    id: 'p-9',
    policyNumber: '01-BP-000028508-0',
    effectiveDate: '2025-01-25',
    expirationDate: '2026-01-25',
    insuredName: 'Evergreen Food Distributors',
    agency: 'Harborfront Agency',
    agencyNumber: '9000000453',
    underwriter: 'Olivia Martinez',
    twp: 1965150,
    ftp: 1912800,
  },
  {
    id: 'p-10',
    policyNumber: '01-CA-000100012-0',
    effectiveDate: '2025-06-26',
    expirationDate: '2026-06-26',
    insuredName: 'Horizon Fleet Services, LLC',
    agency: 'Capital Risk',
    agencyNumber: '9000000478',
    underwriter: 'Christopher Lee',
    twp: 728460,
    ftp: 702300,
  },
]

export const POLICIES_TOTAL_ROWS = 100

export type SubmissionStatus = 'Ready' | 'Blocked'

export type SubmissionIssueSeverity = 'blocking' | 'warning'

export type SubmissionIssue = {
  id: string
  title: string
  severity: SubmissionIssueSeverity
  summary: string
  whyItMatters: string
  missingDetails: string[]
  resolvedDetails?: string[]
  composerPlaceholder: string
  resolvedAt?: string
}

export type PremiumEstimate = {
  label: 'Optimized' | 'Balanced' | 'Conservative'
  range: string
}

export type SubmissionReadyInsight = {
  id: string
  title: string
  summary: string
  severity: 'success' | 'warning'
}

export type SubmissionListRecord = {
  id: string
  submissionNumber: string
  status: SubmissionStatus
  insuredName: string
  linesOfBusiness: string[]
  assignedTo: string
  submittedAt: string
  hasAlert: boolean
  confidence: number
  issues: SubmissionIssue[]
  premiumEstimates?: PremiumEstimate[]
  readyInsights?: SubmissionReadyInsight[]
  notes: string[]
}

export const SUBMISSIONS_TOTAL_ROWS = 75

export const submissionsMock: SubmissionListRecord[] = [
  {
    id: 'sub-00123',
    submissionNumber: 'SUB-00123',
    status: 'Ready',
    insuredName: 'Atlantic Ridge Construction, LLC',
    linesOfBusiness: ['Commercial Auto', 'General Liability', 'Workers Compensation'],
    assignedTo: 'Sarah Thompson',
    submittedAt: '2026-04-15T16:15:00',
    hasAlert: false,
    confidence: 92,
    issues: [],
    premiumEstimates: [
      { label: 'Optimized', range: '$1.1M - $1.3M' },
      { label: 'Balanced', range: '$900K - $1.1M' },
      { label: 'Conservative', range: '$1.3M - $1.6M' },
    ],
    readyInsights: [
      {
        id: 'ri-1',
        title: 'Limited Loss History Depth',
        summary: 'Less than 3 years of claims data.',
        severity: 'warning',
      },
      {
        id: 'ri-2',
        title: 'Rapid Revenue Growth',
        summary: 'Exposure may be understated.',
        severity: 'warning',
      },
    ],
    notes: ['Producer confirmed fleet schedule is current through Q2.'],
  },
  {
    id: 'sub-00122',
    submissionNumber: 'SUB-00122',
    status: 'Blocked',
    insuredName: 'Blue Harbor Logistics Inc.',
    linesOfBusiness: ['Workers Compensation'],
    assignedTo: 'Underwriting Queue',
    submittedAt: '2026-04-14T11:30:00',
    hasAlert: true,
    confidence: 64,
    issues: [
      {
        id: 'iss-payroll',
        title: 'Missing Payroll Information',
        severity: 'blocking',
        summary: 'Premium cannot be calculated',
        whyItMatters: 'Required to determine Workers Compensation exposure.',
        missingDetails: ['Annual payroll', 'Payroll breakdown by role'],
        composerPlaceholder: 'Enter payroll details...',
      },
      {
        id: 'iss-loss',
        title: 'Incomplete Loss History',
        severity: 'blocking',
        summary: 'Risk profile cannot be validated',
        whyItMatters: 'Loss runs are required to evaluate prior claims frequency and severity.',
        missingDetails: ['3-year loss runs', 'Open claim reserves'],
        composerPlaceholder: 'Provide loss history details...',
      },
      {
        id: 'iss-address',
        title: 'Unverified Business Address',
        severity: 'blocking',
        summary: 'Location-based risk scoring unavailable',
        whyItMatters: 'Primary location drives territory rating and catastrophe exposure.',
        missingDetails: ['Verified street address', 'Occupancy confirmation'],
        composerPlaceholder: 'Confirm business address...',
      },
      {
        id: 'iss-vehicle',
        title: 'Vehicle Exposure Not Confirmed',
        severity: 'blocking',
        summary: 'Coverage recommendations incomplete',
        whyItMatters: 'Fleet size and vehicle classes affect rating and eligibility.',
        missingDetails: ['Vehicle schedule', 'Driver roster'],
        composerPlaceholder: 'Describe vehicle exposure...',
      },
      {
        id: 'iss-appetite',
        title: 'Outside Preferred Appetite',
        severity: 'warning',
        summary: 'Review before proceeding',
        whyItMatters: 'Account mix sits near the edge of preferred underwriting guidelines.',
        missingDetails: [],
        composerPlaceholder: 'Add appetite notes...',
      },
      {
        id: 'iss-risk',
        title: 'Elevated Risk Indicators',
        severity: 'warning',
        summary: 'Consider adjusted coverage',
        whyItMatters: 'Industry class and recent growth suggest elevated exposure volatility.',
        missingDetails: [],
        composerPlaceholder: 'Add risk notes...',
      },
    ],
    notes: ['Waiting on payroll breakdown from producer.'],
  },
  {
    id: 'sub-00121',
    submissionNumber: 'SUB-00121',
    status: 'Ready',
    insuredName: 'Keystone Commercial Realty',
    linesOfBusiness: ['General Liability'],
    assignedTo: 'Dana Patel',
    submittedAt: '2026-04-14T09:05:00',
    hasAlert: false,
    confidence: 88,
    issues: [],
    premiumEstimates: [
      { label: 'Optimized', range: '$420K - $480K' },
      { label: 'Balanced', range: '$380K - $420K' },
      { label: 'Conservative', range: '$480K - $540K' },
    ],
    readyInsights: [
      {
        id: 'ri-3',
        title: 'Optimized',
        summary: 'Estimated: $420K - $480K',
        severity: 'success',
      },
    ],
    notes: [],
  },
  {
    id: 'sub-00120',
    submissionNumber: 'SUB-00120',
    status: 'Ready',
    insuredName: 'Red Oak Hospitality Group',
    linesOfBusiness: ['Commercial Package', 'Umbrella'],
    assignedTo: 'Sarah Thompson',
    submittedAt: '2026-04-13T15:40:00',
    hasAlert: true,
    confidence: 85,
    issues: [],
    premiumEstimates: [
      { label: 'Optimized', range: '$760K - $890K' },
      { label: 'Balanced', range: '$690K - $760K' },
      { label: 'Conservative', range: '$890K - $980K' },
    ],
    readyInsights: [
      {
        id: 'ri-4',
        title: 'Seasonal Occupancy Spike',
        summary: 'Q3 occupancy exceeds baseline by 28%.',
        severity: 'warning',
      },
    ],
    notes: ['Umbrella attachment confirmed at $5M.'],
  },
  {
    id: 'sub-00119',
    submissionNumber: 'SUB-00119',
    status: 'Blocked',
    insuredName: 'Summit Outdoor Equipment, Inc.',
    linesOfBusiness: ['Commercial Auto'],
    assignedTo: 'Underwriting Queue',
    submittedAt: '2026-04-13T10:20:00',
    hasAlert: true,
    confidence: 58,
    issues: [
      {
        id: 'iss-drivers',
        title: 'Driver MVR Pending',
        severity: 'blocking',
        summary: 'Cannot finalize auto rating',
        whyItMatters: 'MVRs are required for all scheduled drivers before quoting.',
        missingDetails: ['MVR reports', 'Driver hire dates'],
        composerPlaceholder: 'Provide driver / MVR details...',
      },
      {
        id: 'iss-radius',
        title: 'Radius of Operation Unclear',
        severity: 'blocking',
        summary: 'Territory rating incomplete',
        whyItMatters: 'Operating radius determines auto territory and long-haul loadings.',
        missingDetails: ['Primary radius', 'States traveled'],
        composerPlaceholder: 'Describe operating radius...',
      },
      {
        id: 'iss-fleet-age',
        title: 'Aging Fleet Mix',
        severity: 'warning',
        summary: 'Review before proceeding',
        whyItMatters: 'Average vehicle age exceeds preferred guidelines.',
        missingDetails: [],
        composerPlaceholder: 'Add fleet notes...',
      },
    ],
    notes: [],
  },
  {
    id: 'sub-00118',
    submissionNumber: 'SUB-00118',
    status: 'Ready',
    insuredName: 'Evergreen Food Distributors',
    linesOfBusiness: ['Inland Marine'],
    assignedTo: 'Marcus Lee',
    submittedAt: '2026-04-12T14:55:00',
    hasAlert: false,
    confidence: 91,
    issues: [],
    premiumEstimates: [
      { label: 'Optimized', range: '$210K - $245K' },
      { label: 'Balanced', range: '$185K - $210K' },
      { label: 'Conservative', range: '$245K - $275K' },
    ],
    readyInsights: [],
    notes: [],
  },
  {
    id: 'sub-00117',
    submissionNumber: 'SUB-00117',
    status: 'Blocked',
    insuredName: 'Horizon Fleet Services, LLC',
    linesOfBusiness: ['General Liability', 'Commercial Auto', 'Workers Compensation'],
    assignedTo: 'Underwriting Queue',
    submittedAt: '2026-04-12T08:10:00',
    hasAlert: true,
    confidence: 51,
    issues: [
      {
        id: 'iss-gl-ops',
        title: 'Operations Description Incomplete',
        severity: 'blocking',
        summary: 'GL class codes cannot be assigned',
        whyItMatters: 'Detailed operations drive GL classification and rate.',
        missingDetails: ['Primary operations', 'Subcontractor usage %'],
        composerPlaceholder: 'Describe operations...',
      },
      {
        id: 'iss-wc-class',
        title: 'Missing WC Class Codes',
        severity: 'blocking',
        summary: 'Workers Comp rating blocked',
        whyItMatters: 'Class codes are required to rate payroll exposure.',
        missingDetails: ['Class code list', 'Payroll by class'],
        composerPlaceholder: 'Provide WC class details...',
      },
      {
        id: 'iss-multi-state',
        title: 'Multi-State Exposure',
        severity: 'warning',
        summary: 'Consider adjusted coverage',
        whyItMatters: 'Operations span 4 states with varying regulatory requirements.',
        missingDetails: [],
        composerPlaceholder: 'Add multi-state notes...',
      },
    ],
    notes: ['Producer requested rush review.'],
  },
  {
    id: 'sub-00116',
    submissionNumber: 'SUB-00116',
    status: 'Ready',
    insuredName: 'Northshore Medical Group, P.C.',
    linesOfBusiness: ['Professional Liability'],
    assignedTo: 'Dana Patel',
    submittedAt: '2026-04-11T16:45:00',
    hasAlert: false,
    confidence: 94,
    issues: [],
    premiumEstimates: [
      { label: 'Optimized', range: '$310K - $355K' },
      { label: 'Balanced', range: '$280K - $310K' },
      { label: 'Conservative', range: '$355K - $390K' },
    ],
    readyInsights: [],
    notes: [],
  },
  {
    id: 'sub-00115',
    submissionNumber: 'SUB-00115',
    status: 'Ready',
    insuredName: 'Maple Grove Property Management',
    linesOfBusiness: ['Commercial Property', 'General Liability'],
    assignedTo: 'Sarah Thompson',
    submittedAt: '2026-04-11T11:00:00',
    hasAlert: false,
    confidence: 87,
    issues: [],
    premiumEstimates: [
      { label: 'Optimized', range: '$540K - $610K' },
      { label: 'Balanced', range: '$490K - $540K' },
      { label: 'Conservative', range: '$610K - $680K' },
    ],
    readyInsights: [
      {
        id: 'ri-5',
        title: 'Coastal Wind Exposure',
        summary: 'Two locations within Tier 1 wind zones.',
        severity: 'warning',
      },
    ],
    notes: [],
  },
  {
    id: 'sub-00114',
    submissionNumber: 'SUB-00114',
    status: 'Blocked',
    insuredName: 'Silverline Manufacturing Co.',
    linesOfBusiness: ['Commercial Package'],
    assignedTo: 'Underwriting Queue',
    submittedAt: '2026-04-10T13:25:00',
    hasAlert: true,
    confidence: 47,
    issues: [
      {
        id: 'iss-soi',
        title: 'Statement of Values Missing',
        severity: 'blocking',
        summary: 'Property TIV cannot be confirmed',
        whyItMatters: 'SOV is required to bind property coverage and set limits.',
        missingDetails: ['Building values', 'Business personal property', 'Business income'],
        composerPlaceholder: 'Provide statement of values...',
      },
      {
        id: 'iss-sprinkler',
        title: 'Sprinkler Status Unknown',
        severity: 'warning',
        summary: 'Review before proceeding',
        whyItMatters: 'Protection class credits depend on confirmed sprinkler systems.',
        missingDetails: [],
        composerPlaceholder: 'Confirm sprinkler status...',
      },
    ],
    notes: [],
  },
  {
    id: 'sub-00113',
    submissionNumber: 'SUB-00113',
    status: 'Ready',
    insuredName: 'Harborview Property Management',
    linesOfBusiness: ['BOP'],
    assignedTo: 'Marcus Lee',
    submittedAt: '2026-04-10T09:40:00',
    hasAlert: false,
    confidence: 90,
    issues: [],
    premiumEstimates: [
      { label: 'Optimized', range: '$95K - $110K' },
      { label: 'Balanced', range: '$82K - $95K' },
      { label: 'Conservative', range: '$110K - $125K' },
    ],
    readyInsights: [],
    notes: [],
  },
  {
    id: 'sub-00112',
    submissionNumber: 'SUB-00112',
    status: 'Blocked',
    insuredName: 'Atlas Freight Solutions Inc.',
    linesOfBusiness: ['Motor Truck Cargo', 'Commercial Auto'],
    assignedTo: 'Underwriting Queue',
    submittedAt: '2026-04-09T17:10:00',
    hasAlert: true,
    confidence: 55,
    issues: [
      {
        id: 'iss-cargo',
        title: 'Cargo Commodity List Incomplete',
        severity: 'blocking',
        summary: 'Cargo limit recommendations blocked',
        whyItMatters: 'Commodity mix drives cargo rate and excluded goods screening.',
        missingDetails: ['Top commodities', 'Average load value', 'Max load value'],
        composerPlaceholder: 'Describe cargo commodities...',
      },
      {
        id: 'iss-theft',
        title: 'Elevated Theft Corridor',
        severity: 'warning',
        summary: 'Consider adjusted coverage',
        whyItMatters: 'Primary routes include high-theft corridors.',
        missingDetails: [],
        composerPlaceholder: 'Add theft mitigation notes...',
      },
    ],
    notes: ['Broker asked for guidance on cargo sublimits.'],
  },
]

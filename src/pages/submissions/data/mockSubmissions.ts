export type SubmissionStatus = 'Ready' | 'Blocked'

export type SubmissionIssueSeverity = 'blocking' | 'warning'

export type SubmissionIssueResolutionMode = 'conversation' | 'guided'

export type SubmissionIssue = {
  id: string
  title: string
  severity: SubmissionIssueSeverity
  summary: string
  whyItMatters: string
  missingDetails: string[]
  resolvedDetails?: string[]
  composerPlaceholder: string
  /** conversation = resolve in composer; guided = needs checklist / structured actions */
  resolutionMode?: SubmissionIssueResolutionMode
  guidedActions?: string[]
  reportedAt: string
  resolvedAt?: string
}

export type PremiumEstimate = {
  label: 'Optimized' | 'Balanced' | 'Conservative'
  range: string
  /** Short underwriting rationale — why this structure is distinct. */
  rationale: string
  /** Agent-marked preferred structure when more than one option is shown. */
  recommended?: boolean
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
  /**
   * Agent-chosen premium/structure options (1–3).
   * Only meaningfully distinct alternatives should be included — never pad to 3.
   */
  premiumEstimates?: PremiumEstimate[]
  readyInsights?: SubmissionReadyInsight[]
  notes: string[]
  /** Copilot-approved structure label, when the UW confirms an option. */
  approvedPremiumLabel?: PremiumEstimate['label']
}

/**
 * Agent decision helper: keep only distinct, useful structure options (max 3).
 * Trusts authored 1–3 option lists that already include rationales; otherwise
 * prunes near-duplicates and caps count by account complexity.
 */
export function resolvePremiumStructureOptions(
  estimates: PremiumEstimate[] | undefined,
  context?: { linesOfBusiness?: string[]; confidence?: number },
): PremiumEstimate[] {
  if (!estimates?.length) return []

  const ensureRecommended = (options: PremiumEstimate[]) => {
    if (options.length === 0) return options
    if (options.length === 1) {
      return options.map((option) => ({ ...option, recommended: true }))
    }
    if (options.some((option) => option.recommended)) return options
    const balanced = options.find((option) => option.label === 'Balanced')
    return options.map((option) => ({
      ...option,
      recommended: balanced ? option.label === 'Balanced' : option === options[0],
    }))
  }

  // Authored Copilot decisions already carry rationales — do not force-prune to fewer.
  if (estimates.length <= 3 && estimates.every((option) => Boolean(option.rationale?.trim()))) {
    const uniqueAuthored = estimates.filter((option, index, all) => {
      const normalized = option.range.replace(/\s/g, '').toLowerCase()
      return all.findIndex((item) => item.range.replace(/\s/g, '').toLowerCase() === normalized) === index
    })
    return ensureRecommended(uniqueAuthored.slice(0, 3))
  }

  const uniqueByRange = estimates.filter((option, index, all) => {
    const normalized = option.range.replace(/\s/g, '').toLowerCase()
    return all.findIndex((item) => item.range.replace(/\s/g, '').toLowerCase() === normalized) === index
  })

  const lobCount = context?.linesOfBusiness?.length ?? 1
  const confidence = context?.confidence ?? 80
  // High-confidence, single-LOB accounts rarely need three structures.
  const maxOptions =
    uniqueByRange.length === 1
      ? 1
      : lobCount >= 3 && confidence < 90
        ? 3
        : lobCount >= 2 || confidence < 88
          ? Math.min(2, uniqueByRange.length)
          : Math.min(uniqueByRange.length, confidence >= 93 ? 1 : 2)

  return ensureRecommended(uniqueByRange.slice(0, Math.min(maxOptions, 3)))
}

/** Hand-crafted demo rows (rich Copilot issue detail). Extra volume is generated below. */
const curatedSubmissions: SubmissionListRecord[] = [
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
      {
        label: 'Optimized',
        range: '$1.1M - $1.3M',
        rationale: 'Leaner rate, tighter terms for the multi-line package.',
      },
      {
        label: 'Balanced',
        range: '$900K - $1.1M',
        rationale: 'Best fit for current exposures with standard deductible structure.',
        recommended: true,
      },
      {
        label: 'Conservative',
        range: '$1.3M - $1.6M',
        rationale: 'More limit / load given construction class.',
      },
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
        missingDetails: ['Annual payroll', 'Payroll breakdown by role (clerical, field, drivers)'],
        composerPlaceholder: 'Enter payroll details...',
        reportedAt: '04/23/2026 9:00am',
      },
      {
        id: 'iss-loss',
        title: 'Incomplete Loss History',
        severity: 'blocking',
        summary: 'Risk profile cannot be validated',
        whyItMatters: 'Loss runs are required to evaluate prior claims frequency and severity.',
        missingDetails: ['3-year loss runs', 'Open claim reserves'],
        composerPlaceholder: 'Provide loss history details...',
        resolutionMode: 'guided',
        guidedActions: ['Request loss runs from producer', 'Upload 3-year loss PDF', 'Confirm open reserves'],
        reportedAt: '04/23/2026 9:00am',
      },
      {
        id: 'iss-appetite',
        title: 'Outside Preferred Appetite',
        severity: 'warning',
        summary: 'Review before proceeding',
        whyItMatters: 'Account mix sits near the edge of preferred underwriting guidelines.',
        missingDetails: [],
        composerPlaceholder: 'Add appetite notes...',
        reportedAt: '04/23/2026 9:00am',
      },
      {
        id: 'iss-risk',
        title: 'Elevated Risk Indicators',
        severity: 'warning',
        summary: 'Consider adjusted coverage',
        whyItMatters: 'Industry class and recent growth suggest elevated exposure volatility.',
        missingDetails: [],
        composerPlaceholder: 'Add risk notes...',
        reportedAt: '04/23/2026 9:00am',
      },
    ],
    notes: ['Waiting on payroll breakdown from producer.'],
  },
  {
    id: 'sub-00121',
    submissionNumber: 'SUB-00121',
    status: 'Blocked',
    insuredName: 'Keystone Commercial Realty',
    linesOfBusiness: ['Commercial Property', 'General Liability'],
    assignedTo: 'Underwriting Queue',
    submittedAt: '2026-04-14T09:05:00',
    hasAlert: true,
    confidence: 48,
    issues: [
      {
        id: 'iss-keystone-sov',
        title: 'Statement of Values Missing',
        severity: 'blocking',
        summary: 'Property schedule TIV cannot be confirmed',
        whyItMatters: 'SOV is required to bind property coverage and set limits for the schedule.',
        missingDetails: ['Building values', 'Business personal property', 'Business income'],
        composerPlaceholder: 'Provide statement of values...',
        resolutionMode: 'guided',
        guidedActions: [
          'Explain the SOV gap',
          'Draft a note to the producer',
          'What can proceed vs what is frozen',
        ],
        reportedAt: '04/23/2026 9:00am',
      },
      {
        id: 'iss-keystone-schedule',
        title: 'Incomplete Location Schedule',
        severity: 'warning',
        summary: 'Two locations lack occupancy detail',
        whyItMatters: 'Occupancy drives property class and rating credits.',
        missingDetails: [],
        composerPlaceholder: 'Confirm location occupancy...',
        reportedAt: '04/23/2026 9:00am',
      },
    ],
    premiumEstimates: [],
    readyInsights: [],
    notes: ['Producer said SOV workbook is in progress.'],
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
      {
        label: 'Optimized',
        range: '$760K - $890K',
        rationale: 'Seasonal occupancy load with umbrella retained at $5M.',
        recommended: true,
      },
      {
        label: 'Balanced',
        range: '$690K - $760K',
        rationale: 'Tighter package terms with higher hospitality deductibles.',
      },
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
        resolutionMode: 'guided',
        guidedActions: ['Request MVRs', 'Open driver checklist', 'Escalate to auto UW'],
        reportedAt: '04/23/2026 9:00am',
      },
      {
        id: 'iss-radius',
        title: 'Radius of Operation Unclear',
        severity: 'blocking',
        summary: 'Territory rating incomplete',
        whyItMatters: 'Operating radius determines auto territory and long-haul loadings.',
        missingDetails: ['Primary radius', 'States traveled'],
        composerPlaceholder: 'Describe operating radius...',
        reportedAt: '04/23/2026 9:00am',
      },
      {
        id: 'iss-fleet-age',
        title: 'Aging Fleet Mix',
        severity: 'warning',
        summary: 'Review before proceeding',
        whyItMatters: 'Average vehicle age exceeds preferred guidelines.',
        missingDetails: [],
        composerPlaceholder: 'Add fleet notes...',
        reportedAt: '04/23/2026 9:00am',
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
      {
        label: 'Balanced',
        range: '$185K - $210K',
        rationale: 'Inland marine schedule is stable — one structure is sufficient.',
        recommended: true,
      },
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
    assignedTo: 'Compliance',
    submittedAt: '2026-04-12T08:10:00',
    hasAlert: true,
    confidence: 51,
    issues: [
      {
        id: 'iss-ofac',
        title: 'OFAC Hold',
        severity: 'blocking',
        summary: 'Compliance clearance required before intake can proceed',
        whyItMatters:
          'OFAC screening flagged this account. Compliance owns the hold until identity and ownership documents clear.',
        missingDetails: ['Updated ownership attestation', 'Compliance clearance memo'],
        composerPlaceholder: 'Add compliance clearance details...',
        resolutionMode: 'guided',
        guidedActions: [
          'Explain the OFAC hold',
          'Draft a note to compliance',
          'What can proceed vs what is frozen',
        ],
        reportedAt: '04/23/2026 8:15am',
      },
      {
        id: 'iss-gl-ops',
        title: 'Operations Description Incomplete',
        severity: 'warning',
        summary: 'GL class codes cannot be finalized',
        whyItMatters: 'Detailed operations drive GL classification and rate.',
        missingDetails: ['Primary operations', 'Subcontractor usage %'],
        composerPlaceholder: 'Describe operations...',
        resolutionMode: 'guided',
        guidedActions: ['Open operations questionnaire', 'Request producer narrative'],
        reportedAt: '04/23/2026 9:00am',
      },
    ],
    notes: ['Compliance requested rush ownership packet from producer.'],
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
      {
        label: 'Optimized',
        range: '$310K - $355K',
        rationale: 'Professional liability with extended reporting endorsement.',
      },
      {
        label: 'Balanced',
        range: '$280K - $310K',
        rationale: 'Standard claims-made terms matching peer medical groups.',
        recommended: true,
      },
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
      {
        label: 'Optimized',
        range: '$540K - $610K',
        rationale: 'Competitive property terms if wind mitigation credits hold.',
      },
      {
        label: 'Balanced',
        range: '$490K - $540K',
        rationale: 'Mid-market deductibles with shared GL attachment.',
      },
      {
        label: 'Conservative',
        range: '$610K - $680K',
        rationale: 'Elevated wind deductible and Tier 1 coastal load.',
        recommended: true,
      },
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
        resolutionMode: 'guided',
        guidedActions: ['Request SOV workbook', 'Open property worksheet', 'Escalate to property UW'],
        reportedAt: '04/23/2026 9:00am',
      },
      {
        id: 'iss-sprinkler',
        title: 'Sprinkler Status Unknown',
        severity: 'warning',
        summary: 'Review before proceeding',
        whyItMatters: 'Protection class credits depend on confirmed sprinkler systems.',
        missingDetails: [],
        composerPlaceholder: 'Confirm sprinkler status...',
        reportedAt: '04/23/2026 9:00am',
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
      {
        label: 'Optimized',
        range: '$95K - $110K',
        rationale: 'Straightforward BOP — alternatives would not change the decision.',
        recommended: true,
      },
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
        resolutionMode: 'guided',
        guidedActions: ['Request commodity schedule', 'Open cargo worksheet'],
        reportedAt: '04/23/2026 9:00am',
      },
      {
        id: 'iss-theft',
        title: 'Elevated Theft Corridor',
        severity: 'warning',
        summary: 'Consider adjusted coverage',
        whyItMatters: 'Primary routes include high-theft corridors.',
        missingDetails: [],
        composerPlaceholder: 'Add theft mitigation notes...',
        reportedAt: '04/23/2026 9:00am',
      },
    ],
    notes: ['Broker asked for guidance on cargo sublimits.'],
  },
]

const INSURED_NAME_POOL = [
  'Cedar Peak Builders',
  'Ironclad Steelworks',
  'Lakeside Retail Partners',
  'Prairie Wind Energy Co.',
  'Copperline Plumbing LLC',
  'BrightPath Learning Centers',
  'Oakmont Dental Associates',
  'Riverbend Warehousing',
  'Summit Peak Outfitters',
  'Coastal Breeze Hotels',
  'Granite State Fabricators',
  'Yellowstone Transit Group',
  'Pinecrest Landscaping Inc.',
  'Metro Lift Elevator Co.',
  'Harvest Moon Agribusiness',
  'Skyline Facade Systems',
  'Northwind Cold Storage',
  'Beacon Street Pharmacies',
  'Clearwater Marine Services',
  'Ridgeway Auto Body Group',
  'Silver Creek Distillery',
  'Frontier Fiber Networks',
  'Ember & Ash Restaurants',
  'Valley View Veterinary',
  'Pacific Rim Import Co.',
  'Stonebridge Masonry Inc.',
  'Apex Drone Logistics',
  'Greenfield Solar Installers',
  'Twin Cities Printworks',
  'Highland Trails Resort',
  'Bayfront Yacht Club Ops',
  'Midwest Grain Elevators',
  'Urban Nest Property Co.',
  'Falcon Security Services',
  'Cascade Coffee Roasters',
  'Redline Motorsport LLC',
  'Willowbrook Senior Living',
  'Arcadia Theme Parks Inc.',
  'Northern Lights HVAC',
  'Sunbelt Pool Builders',
  'Eclipse Digital Media',
  'Frontier Ranch Outfitters',
  'Capitol Hill Catering',
  'Bluegrass Equine Center',
  'Desert Bloom Nurseries',
  'Harbor Crane Rentals',
  'Kinetic Fitness Franchise',
  'Alpine Ski Patrol Co-op',
  'Meridian Data Centers',
  'Southbay Seafood Packers',
  'TruNorth Mining Support',
  'Velvet Curtain Theaters',
  'Orbit Transit Advertising',
  'Canvas & Co. Interiors',
  'Iron Horse Rail Services',
  'Pearl Street Boutiques',
  'Astra Aerospace Parts',
  'Lone Star Fence Co.',
  'Glacier Ice Logistics',
  'Nova Biotech Labs',
  'Crescent City Jazz Clubs',
  'Thunder Bay Paper Mill',
  'Golden Gate Tours Inc.',
  'Shadowridge Golf Ops',
  'PrimeCut Meats Dist.',
  'Echo Valley Wineries',
  'Rapid Response EMS Co.',
  'Lumen Street Lighting',
  'Forge & Flame Foundry',
  'Seabreeze Charter School',
  'Atlas Modular Homes',
  'Brightline Telecom Co.',
  'Crowne Plaza Franchisee',
  'Delta Force Training Gym',
  'Everest Climbing Gear',
  'Frostline Refrigeration',
  'Galaxy Arcade Holdings',
  'Horizon Pet Hospitals',
  'Indigo Textile Mills',
  'Juniper Wellness Spas',
  'Knotty Pine Cabinetry',
  'Lighthouse Maritime Ins.',
  'Moonrise Cinema Chain',
  'Nexus Cloud Hosting',
  'Orchid Floral Wholesale',
  'Pinnacle Roofing Group',
  'Quarry Stone Supplies',
  'Radiant Heat Systems',
  'Starlight Event Venues',
  'Timberline Logging Co.',
  'Umbra Design Studios',
  'Vortex Water Parks',
  'Windward Sailing School',
  'Xenon Neon Sign Co.',
  'Yukon Freight Brokers',
  'Zenith Orthopedics',
  'Amber Fields Farms',
  'Boulder Creek Brewing',
  'Cypress Tree Care Inc.',
  'Driftwood Surf Shops',
  'Elm Street Bakeries',
  'Foxfire Campgrounds',
  'Graphite Pencil Co.',
  'Hawthorn Legal Offices',
  'Ivory Coast Importers',
  'Jade Mountain Spa Chain',
  'Key West Charter Boats',
  'Lunar Nightclubs LLC',
  'Mystic River Canoes',
  'Nebula Software Inc.',
]

const LOB_POOL: string[][] = [
  ['Workers Compensation'],
  ['Commercial Auto'],
  ['General Liability'],
  ['Commercial Property'],
  ['BOP'],
  ['Inland Marine'],
  ['Professional Liability'],
  ['Commercial Package'],
  ['Commercial Auto', 'General Liability'],
  ['Workers Compensation', 'Commercial Auto'],
  ['Commercial Property', 'General Liability'],
  ['Commercial Package', 'Umbrella'],
  ['Motor Truck Cargo', 'Commercial Auto'],
  ['General Liability', 'Workers Compensation', 'Commercial Auto'],
]

const ASSIGNEE_POOL = [
  'Underwriting Queue',
  'Sarah Thompson',
  'Dana Patel',
  'Marcus Lee',
  'Jordan Reyes',
  'Ava Chen',
  'Chris Nolan',
  'Priya Shah',
]

const BLOCKING_ISSUE_TEMPLATES: Omit<SubmissionIssue, 'id' | 'reportedAt'>[] = [
  {
    title: 'Missing Payroll Information',
    severity: 'blocking',
    summary: 'Premium cannot be calculated',
    whyItMatters: 'Required to determine Workers Compensation exposure.',
    missingDetails: ['Annual payroll', 'Payroll breakdown by role'],
    composerPlaceholder: 'Enter payroll details...',
  },
  {
    title: 'Incomplete Loss History',
    severity: 'blocking',
    summary: 'Risk profile cannot be validated',
    whyItMatters: 'Loss runs are required to evaluate prior claims frequency and severity.',
    missingDetails: ['3-year loss runs', 'Open claim reserves'],
    composerPlaceholder: 'Provide loss history details...',
    resolutionMode: 'guided',
    guidedActions: ['Request loss runs from producer', 'Upload 3-year loss PDF'],
  },
  {
    title: 'Unverified Business Address',
    severity: 'blocking',
    summary: 'Location-based risk scoring unavailable',
    whyItMatters: 'Primary location drives territory rating and catastrophe exposure.',
    missingDetails: ['Verified street address', 'Occupancy confirmation'],
    composerPlaceholder: 'Confirm business address...',
  },
  {
    title: 'Driver MVR Pending',
    severity: 'blocking',
    summary: 'Cannot finalize auto rating',
    whyItMatters: 'MVRs are required for all scheduled drivers before quoting.',
    missingDetails: ['MVR reports', 'Driver hire dates'],
    composerPlaceholder: 'Provide driver / MVR details...',
    resolutionMode: 'guided',
    guidedActions: ['Request MVRs', 'Open driver checklist'],
  },
  {
    title: 'Statement of Values Missing',
    severity: 'blocking',
    summary: 'Property TIV cannot be confirmed',
    whyItMatters: 'SOV is required to bind property coverage and set limits.',
    missingDetails: ['Building values', 'Business personal property'],
    composerPlaceholder: 'Provide statement of values...',
    resolutionMode: 'guided',
    guidedActions: ['Request SOV workbook', 'Open property worksheet'],
  },
  {
    title: 'Operations Description Incomplete',
    severity: 'blocking',
    summary: 'GL class codes cannot be assigned',
    whyItMatters: 'Detailed operations drive GL classification and rate.',
    missingDetails: ['Primary operations', 'Subcontractor usage %'],
    composerPlaceholder: 'Describe operations...',
    resolutionMode: 'guided',
    guidedActions: ['Open operations questionnaire', 'Request producer narrative'],
  },
  {
    title: 'Cargo Commodity List Incomplete',
    severity: 'blocking',
    summary: 'Cargo limit recommendations blocked',
    whyItMatters: 'Commodity mix drives cargo rate and excluded goods screening.',
    missingDetails: ['Top commodities', 'Average load value'],
    composerPlaceholder: 'Describe cargo commodities...',
    resolutionMode: 'guided',
    guidedActions: ['Request commodity schedule', 'Open cargo worksheet'],
  },
  {
    title: 'Missing WC Class Codes',
    severity: 'blocking',
    summary: 'Workers Comp rating blocked',
    whyItMatters: 'Class codes are required to rate payroll exposure.',
    missingDetails: ['Class code list', 'Payroll by class'],
    composerPlaceholder: 'Provide WC class details...',
    resolutionMode: 'guided',
    guidedActions: ['Open class-code checklist', 'Request payroll by class'],
  },
]

const WARNING_ISSUE_TEMPLATES: Omit<SubmissionIssue, 'id' | 'reportedAt'>[] = [
  {
    title: 'Outside Preferred Appetite',
    severity: 'warning',
    summary: 'Review before proceeding',
    whyItMatters: 'Account mix sits near the edge of preferred underwriting guidelines.',
    missingDetails: [],
    composerPlaceholder: 'Add appetite notes...',
  },
  {
    title: 'Elevated Risk Indicators',
    severity: 'warning',
    summary: 'Consider adjusted coverage',
    whyItMatters: 'Industry class and recent growth suggest elevated exposure volatility.',
    missingDetails: [],
    composerPlaceholder: 'Add risk notes...',
  },
  {
    title: 'Aging Fleet Mix',
    severity: 'warning',
    summary: 'Review before proceeding',
    whyItMatters: 'Average vehicle age exceeds preferred guidelines.',
    missingDetails: [],
    composerPlaceholder: 'Add fleet notes...',
  },
  {
    title: 'Multi-State Exposure',
    severity: 'warning',
    summary: 'Consider adjusted coverage',
    whyItMatters: 'Operations span multiple states with varying regulatory requirements.',
    missingDetails: [],
    composerPlaceholder: 'Add multi-state notes...',
  },
  {
    title: 'Coastal Wind Exposure',
    severity: 'warning',
    summary: 'Review before proceeding',
    whyItMatters: 'One or more locations sit within elevated wind zones.',
    missingDetails: [],
    composerPlaceholder: 'Add wind mitigation notes...',
  },
]

const PREMIUM_OPTION_SETS: PremiumEstimate[][] = [
  [
    {
      label: 'Optimized',
      range: '$95K - $110K',
      rationale: 'Lean schedule credits with standard deductibles.',
      recommended: true,
    },
    {
      label: 'Balanced',
      range: '$82K - $95K',
      rationale: 'Lower premium via higher deductibles and tighter limits.',
    },
    {
      label: 'Conservative',
      range: '$110K - $125K',
      rationale: 'Additional catastrophe and equipment floaters.',
    },
  ],
  [
    {
      label: 'Optimized',
      range: '$210K - $245K',
      rationale: 'Preferred terms for clean loss history.',
    },
    {
      label: 'Balanced',
      range: '$185K - $210K',
      rationale: 'Market midpoint with shared retention.',
      recommended: true,
    },
    {
      label: 'Conservative',
      range: '$245K - $275K',
      rationale: 'Extra capacity for seasonal inventory spikes.',
    },
  ],
  [
    {
      label: 'Optimized',
      range: '$420K - $480K',
      rationale: 'Aggressive packaging across primary lines.',
      recommended: true,
    },
    {
      label: 'Balanced',
      range: '$380K - $420K',
      rationale: 'Balanced deductibles without umbrella stretch.',
    },
    {
      label: 'Conservative',
      range: '$480K - $540K',
      rationale: 'Higher attachment for multi-location GL.',
    },
  ],
  [
    {
      label: 'Optimized',
      range: '$760K - $890K',
      rationale: 'Full package with umbrella retained.',
      recommended: true,
    },
    {
      label: 'Balanced',
      range: '$690K - $760K',
      rationale: 'Reduced umbrella and higher property deductibles.',
    },
    {
      label: 'Conservative',
      range: '$890K - $980K',
      rationale: 'Conservative catastrophe and liquor loads.',
    },
  ],
  [
    {
      label: 'Optimized',
      range: '$1.1M - $1.3M',
      rationale: 'Broad multi-line terms for complex operations.',
    },
    {
      label: 'Balanced',
      range: '$900K - $1.1M',
      rationale: 'Best overall fit for current exposure mix.',
      recommended: true,
    },
    {
      label: 'Conservative',
      range: '$1.3M - $1.6M',
      rationale: 'Elevated limits and stricter underwriting terms.',
    },
  ],
]

/** Pick 1–3 options the way the agent would — only when alternatives are useful. */
function pickGeneratedPremiumOptions(index: number, linesOfBusiness: string[]): PremiumEstimate[] {
  const pool = PREMIUM_OPTION_SETS[index % PREMIUM_OPTION_SETS.length]
  const lobCount = linesOfBusiness.length
  // Variety for the volume demo: many Ready rows get 1 option; some 2; complex multi-LOB get 3.
  const desiredCount =
    lobCount >= 3 ? 3 : lobCount === 2 ? 2 : index % 4 === 0 ? 2 : 1
  return resolvePremiumStructureOptions(pool.slice(0, desiredCount), {
    linesOfBusiness,
    confidence: 82 + (index % 14),
  })
}

/** Target volume for the list demo — Copilot still works off the same row model. */
export const SUBMISSIONS_TOTAL_ROWS = 120

function padSubmissionNumber(n: number) {
  return `SUB-${String(n).padStart(5, '0')}`
}

function submittedAtForIndex(index: number) {
  const base = Date.UTC(2026, 3, 9, 8, 0, 0)
  const offsetMs = index * 3.25 * 60 * 60 * 1000
  return new Date(base - offsetMs).toISOString().replace(/\.\d{3}Z$/, '')
}

function buildGeneratedSubmissions(count: number, startNumber: number): SubmissionListRecord[] {
  const rows: SubmissionListRecord[] = []

  for (let i = 0; i < count; i += 1) {
    const submissionNumber = padSubmissionNumber(startNumber - i)
    const id = `sub-${String(startNumber - i).padStart(5, '0')}`
    const isBlocked = i % 3 !== 0
    const insuredName = INSURED_NAME_POOL[i % INSURED_NAME_POOL.length]
    const linesOfBusiness = LOB_POOL[i % LOB_POOL.length]
    const assignedTo = isBlocked
      ? i % 4 === 0
        ? ASSIGNEE_POOL[(i % (ASSIGNEE_POOL.length - 1)) + 1]
        : 'Underwriting Queue'
      : ASSIGNEE_POOL[(i % (ASSIGNEE_POOL.length - 1)) + 1]

    if (isBlocked) {
      const blockerCount = 1 + (i % 3)
      const issues: SubmissionIssue[] = []
      for (let b = 0; b < blockerCount; b += 1) {
        const template = BLOCKING_ISSUE_TEMPLATES[(i + b) % BLOCKING_ISSUE_TEMPLATES.length]
        issues.push({
          ...template,
          id: `${id}-block-${b}`,
          reportedAt: '04/23/2026 9:00am',
        })
      }
      if (i % 2 === 0) {
        const warning = WARNING_ISSUE_TEMPLATES[i % WARNING_ISSUE_TEMPLATES.length]
        issues.push({
          ...warning,
          id: `${id}-warn-0`,
          reportedAt: '04/23/2026 9:00am',
        })
      }

      rows.push({
        id,
        submissionNumber,
        status: 'Blocked',
        insuredName,
        linesOfBusiness,
        assignedTo,
        submittedAt: submittedAtForIndex(i),
        hasAlert: true,
        confidence: 42 + (i % 28),
        issues,
        notes: i % 5 === 0 ? ['Producer follow-up scheduled.'] : [],
      })
      continue
    }

    const premiums = pickGeneratedPremiumOptions(i, linesOfBusiness)
    const readyInsights: SubmissionReadyInsight[] =
      i % 4 === 0
        ? [
            {
              id: `${id}-ri`,
              title: WARNING_ISSUE_TEMPLATES[i % WARNING_ISSUE_TEMPLATES.length].title,
              summary: WARNING_ISSUE_TEMPLATES[i % WARNING_ISSUE_TEMPLATES.length].summary,
              severity: 'warning',
            },
          ]
        : []

    rows.push({
      id,
      submissionNumber,
      status: 'Ready',
      insuredName,
      linesOfBusiness,
      assignedTo,
      submittedAt: submittedAtForIndex(i),
      hasAlert: readyInsights.length > 0,
      confidence: 82 + (i % 14),
      issues: [],
      premiumEstimates: premiums,
      readyInsights,
      notes: [],
    })
  }

  return rows
}

const curatedNumbers = new Set(curatedSubmissions.map((row) => row.submissionNumber))
const generatedStart = 111
const generatedNeeded = Math.max(0, SUBMISSIONS_TOTAL_ROWS - curatedSubmissions.length)
const generatedSubmissions = buildGeneratedSubmissions(generatedNeeded, generatedStart).filter(
  (row) => !curatedNumbers.has(row.submissionNumber),
)

export const submissionsMock: SubmissionListRecord[] = [
  ...curatedSubmissions,
  ...generatedSubmissions,
]

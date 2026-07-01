export type TaskPriority = 'High' | 'Medium' | 'Low'

export type TaskStatus =
  | 'Pending'
  | 'Started'
  | 'Suspended'
  | 'Discarded'
  | 'Completed'
  | 'Unassigned'

export type TaskReferenceType = 'Quote' | 'Policy' | 'Claim'

export type TaskTheme =
  | 'AI-assisted renewal queue'
  | 'Exception handling'
  | 'Compliance watch'
  | 'Producer support'
  | 'Automated quote issues'

export type TaskDocument = {
  name: string
  status: string
  required: boolean
}

export type TaskRelatedEntities = {
  policyNumber: string | null
  quoteNumber: string | null
  insuredName: string | null
  producer: string | null
  submissionId: string | null
  claimNumber: string | null
}

export type TaskRecord = {
  id: string
  taskName: string
  assigner: string
  assignedTo: string
  team: string
  priority: TaskPriority
  priorityReason: string
  status: TaskStatus
  displayStatus: string
  nextAction: string
  theme: TaskTheme
  assignedDate: string
  dueDate: string
  assignedLabel: string
  dueLabel: string
  ageIndicator: string
  refNumber: string
  referenceType: TaskReferenceType
  agingDays: number
  isPastDue: boolean
  hasAiInsights: boolean
  description: string
  copilotInsights: string[]
  documents: TaskDocument[]
  blockingIssues: string | null
  notes: string | null
  relatedEntities: TaskRelatedEntities
}

export type TeamMemberRecord = {
  id: string
  name: string
  initials: string
  title: string
  totalTasks: number
  dueToday: number
  pastDue: number
  days0to2: number
  days3to5: number
  days6plus: number
  directReports: number
  managerId?: string
}

export function getTaskRelatedSummary(task: TaskRecord) {
  const { policyNumber, quoteNumber, insuredName, claimNumber } = task.relatedEntities
  const reference = policyNumber ?? quoteNumber ?? claimNumber ?? task.refNumber
  return {
    primary: insuredName ?? '—',
    secondary: reference,
  }
}

export function getTaskPolicyRoute(task: TaskRecord) {
  const policyNumber = task.relatedEntities.policyNumber
  if (!policyNumber) return null
  return `/policies/${encodeURIComponent(policyNumber)}`
}

export function getTaskRelatedEntityRoute(task: TaskRecord): { to: string; label: string } | null {
  const policyRoute = getTaskPolicyRoute(task)
  if (policyRoute) {
    return { to: policyRoute, label: 'View policy' }
  }
  if (task.relatedEntities.quoteNumber) {
    return { to: '/quotes', label: 'View quote' }
  }
  return null
}

export const tasksMock: TaskRecord[] = [
  {
    id: 'task-001',
    theme: 'AI-assisted renewal queue',
    taskName: 'Renewal UW review — loss ratio spike',
    refNumber: 'RNW-284719',
    priority: 'High',
    priorityReason: 'Renewal effective in 6 days; expiring premium $412K; loss ratio increased 18 pts YoY',
    status: 'Started',
    displayStatus: 'In review',
    nextAction: 'Complete referral worksheet and approve or decline by EOD Thursday',
    assignedDate: '2026-06-24',
    dueDate: '2026-07-02',
    assignedLabel: 'Jun 24, 2026',
    dueLabel: 'Jul 2, 2026',
    ageIndicator: 'Due in 6 days',
    agingDays: 2,
    isPastDue: false,
    assignedTo: 'Jordan Ellis',
    team: 'Commercial UW — Midwest',
    assigner: 'Pamela Hollingsworth',
    referenceType: 'Policy',
    hasAiInsights: true,
    relatedEntities: {
      policyNumber: 'CP-8842-019',
      quoteNumber: null,
      insuredName: 'Midwest Grain Cooperative',
      producer: 'Hartwell Insurance Group',
      submissionId: null,
      claimNumber: null,
    },
    description:
      'Commercial property renewal flagged by Copilot after updated loss runs showed elevated CAT and water damage frequency. Account is strategic producer book; prior term had no rate change. Underwriting referral required before renewal terms can release to producer. The account spans 12 locations across Nebraska and Iowa with total insured values exceeding $48M. Recent water intrusion claims at the Omaha grain elevator and secondary cold storage facility drove the loss ratio above the 62% referral threshold. Producer Hartwell Insurance Group has requested to maintain the current rate pending completion of roof mitigation at two flagged locations. Copilot pre-filled referral worksheet sections 1–4; sections 5–7 require underwriter narrative on catastrophe exposure and business income limits.',
    copilotInsights: [
      'Recommend +8–12% rate adjustment on property line; liability remains within appetite at current limits.',
      'Similar accounts in ZIP cluster 68102 renewed at avg +10.4% when loss ratio exceeded 62%.',
      'Generate draft referral memo citing 3 largest water losses and mitigation recommendations.',
    ],
    documents: [
      { name: 'Updated loss runs (5-year)', status: 'Received', required: true },
      { name: 'Property inspection report (2024)', status: 'Received', required: true },
      { name: 'Signed renewal application', status: 'Missing', required: true },
    ],
    blockingIssues: 'Signed renewal application not yet uploaded by producer portal.',
    notes: 'Producer requested hold on rate discussion until inspection findings reviewed.',
  },
  {
    id: 'task-002',
    theme: 'Exception handling',
    taskName: 'Endorsement — add additional insured',
    refNumber: 'END-773104',
    priority: 'Medium',
    priorityReason: 'Contract requirement; policyholder closing on facility lease Friday',
    status: 'Pending',
    displayStatus: 'Pending documents',
    nextAction: 'Validate AIHO wording and issue endorsement upon receipt of lease schedule',
    assignedDate: '2026-06-25',
    dueDate: '2026-07-04',
    assignedLabel: 'Jun 25, 2026',
    dueLabel: 'Jul 4, 2026',
    ageIndicator: 'Due in 4 days',
    agingDays: 1,
    isPastDue: false,
    assignedTo: 'Maria Santos',
    team: 'Policy Services',
    assigner: 'Chris Reynolds',
    referenceType: 'Policy',
    hasAiInsights: true,
    relatedEntities: {
      policyNumber: 'GL-5521-447',
      quoteNumber: null,
      insuredName: 'Summit Logistics LLC',
      producer: 'NorthBridge Commercial',
      submissionId: null,
      claimNumber: null,
    },
    description:
      'Request to add property manager as additional insured on general liability per executed lease. Endorsement type: CG 20 11 / CG 20 37 bundle. Billing impact: none. Must match mortgagee/landlord naming on lease exhibit B.',
    copilotInsights: [
      'Lease schedule names Summit Property Mgmt Inc. — verify match to requested AI entity spelling.',
      'Prior endorsement END-662901 on this policy used ISO form revision 04 13; maintain consistency.',
      'Auto-generate endorsement draft with standard primary/non-contributory language if producer confirms.',
    ],
    documents: [
      { name: 'Executed lease (exhibit B)', status: 'Received', required: true },
      { name: 'Additional insured schedule', status: 'Missing', required: true },
      { name: 'Producer authorization', status: 'Received', required: false },
    ],
    blockingIssues: 'Additional insured schedule PDF is password-protected; cannot extract entity list.',
    notes: null,
  },
  {
    id: 'task-003',
    theme: 'Automated quote issues',
    taskName: 'Auto quote exception — VIN decode mismatch',
    refNumber: 'AQE-119883',
    priority: 'High',
    priorityReason: 'Quote stuck in bind-ready; producer waiting for same-day bind',
    status: 'Started',
    displayStatus: 'Exception',
    nextAction: 'Resolve vehicle garaging/trim mismatch and re-run rating',
    assignedDate: '2026-06-26',
    dueDate: '2026-06-26',
    assignedLabel: 'Today',
    dueLabel: 'Today',
    ageIndicator: 'Due today',
    agingDays: 0,
    isPastDue: false,
    assignedTo: 'Auto Installer Queue',
    team: 'Personal Lines Processing',
    assigner: 'System',
    referenceType: 'Quote',
    hasAiInsights: true,
    relatedEntities: {
      policyNumber: null,
      quoteNumber: 'Q-PA-993821',
      insuredName: 'David & Patricia Nguyen',
      producer: 'Valley Auto Agency',
      submissionId: 'SUB-44821',
      claimNumber: null,
    },
    description:
      'Automated quote from Auto Installer failed validation: NHTSA decode returned 2024 Honda CR-V EX-L AWD; application entered LX trim. Garaging ZIP differs from MVR garaging by one digit. Quote cannot proceed to bind until corrected.',
    copilotInsights: [
      'MVR garaging ZIP 95834 aligns with DMV record; recommend updating quote garaging to match.',
      'Trim correction to EX-L AWD increases premium est. +$47/term — within producer authority.',
      'One-click fix available: apply MVR garaging + decoded trim, then re-rate.',
    ],
    documents: [
      { name: 'MVR (driver 1)', status: 'Received', required: true },
      { name: 'Vehicle photos', status: 'Not required', required: false },
    ],
    blockingIssues: 'Rating engine error code VIN-TRIM-004 prevents bind until resolved.',
    notes: 'Producer noted customer traded vehicles last week.',
  },
  {
    id: 'task-004',
    theme: 'Compliance watch',
    taskName: 'OFAC / sanctions screening hit — clear',
    refNumber: 'CMP-002941',
    priority: 'High',
    priorityReason: 'Regulatory SLA: clear or escalate within 24 hours of hit',
    status: 'Pending',
    displayStatus: 'Open',
    nextAction: 'Review false-positive evidence and document clearance in compliance log',
    assignedDate: '2026-06-26',
    dueDate: '2026-06-26',
    assignedLabel: 'Today',
    dueLabel: 'Today',
    ageIndicator: 'SLA due today',
    agingDays: 0,
    isPastDue: false,
    assignedTo: 'Compliance Ops',
    team: 'Enterprise Compliance',
    assigner: 'System',
    referenceType: 'Policy',
    hasAiInsights: true,
    relatedEntities: {
      policyNumber: 'WC-7710-002',
      quoteNumber: 'Q-WC-881204',
      insuredName: 'Atlas Mechanical Services',
      producer: 'Keystone Benefits Partners',
      submissionId: 'SUB-51209',
      claimNumber: null,
    },
    description:
      'Sanctions screening returned potential match on principal owner name during new business quote bind prep. Preliminary Copilot match score 0.71 — likely false positive due to common name + different DOB/state. Bind is blocked pending compliance clearance.',
    copilotInsights: [
      'Screening hit entity DOB differs by 12 years from application owner DOB — strong false-positive signal.',
      'Recommend clearance with note; no prior compliance flags on producer or insured.',
      'If escalated, assign to Tier 2 compliance; do not release quote to bind until status = Cleared.',
    ],
    documents: [
      { name: 'Owner ID verification', status: 'Received', required: true },
      { name: 'OFAC screening report', status: 'Received', required: true },
      { name: 'Compliance clearance form', status: 'Missing', required: true },
    ],
    blockingIssues: 'Quote bind blocked by compliance hold COM-HOLD-881.',
    notes: 'Producer aware of delay; requested callback after clearance.',
  },
  {
    id: 'task-005',
    theme: 'Producer support',
    taskName: 'Producer inquiry — commission statement discrepancy',
    refNumber: 'PRD-88412',
    priority: 'Low',
    priorityReason: 'Non-binding inquiry; no policy impact',
    status: 'Suspended',
    displayStatus: 'Waiting on internal',
    nextAction: 'Reconcile May commission file against policy CP-2201-889 cancellation credit',
    assignedDate: '2026-06-23',
    dueDate: '2026-07-08',
    assignedLabel: 'Jun 23, 2026',
    dueLabel: 'Jul 8, 2026',
    ageIndicator: 'Due in 8 days',
    agingDays: 3,
    isPastDue: false,
    assignedTo: 'Account Support — Producer Desk',
    team: 'Distribution Operations',
    assigner: 'Leslie Neuman',
    referenceType: 'Policy',
    hasAiInsights: true,
    relatedEntities: {
      policyNumber: 'CP-2201-889',
      quoteNumber: null,
      insuredName: 'Riverfront Retail Partners',
      producer: 'Hartwell Insurance Group',
      submissionId: null,
      claimNumber: null,
    },
    description:
      'Producer reports $1,240 commission variance on May statement tied to mid-term cancellation and rewrite on same insured. Need to confirm whether rewrite was treated as new business vs renewal for commission plan purposes.',
    copilotInsights: [
      'Cancellation effective 05/14; rewrite bound 05/16 — likely caused split commission accrual.',
      'Compare to commission plan HART-COMM-2025 §4.2 (rewrite within 30 days).',
      'Draft producer response email with line-item reconciliation once finance confirms.',
    ],
    documents: [
      { name: 'May 2026 commission statement', status: 'Received', required: true },
      { name: 'Cancellation notice', status: 'Received', required: true },
      { name: 'Rewrite bind confirmation', status: 'Received', required: true },
    ],
    blockingIssues: null,
    notes: 'Producer POC: Amanda Cho — prefers email response.',
  },
  {
    id: 'task-006',
    theme: 'Exception handling',
    taskName: 'Claims follow-up — reserve review request',
    refNumber: 'CLM-99304',
    priority: 'Medium',
    priorityReason: 'Claim open 45 days; reserve exceeds UW authority threshold',
    status: 'Started',
    displayStatus: 'In progress',
    nextAction: 'Schedule UW–claims sync and update reserve recommendation',
    assignedDate: '2026-06-21',
    dueDate: '2026-06-25',
    assignedLabel: 'Jun 21, 2026',
    dueLabel: 'Past due',
    ageIndicator: 'Past due 1 day',
    agingDays: 5,
    isPastDue: true,
    assignedTo: 'Jordan Ellis',
    team: 'Commercial UW — Midwest',
    assigner: 'Dana Patel',
    referenceType: 'Claim',
    hasAiInsights: true,
    relatedEntities: {
      policyNumber: 'CP-8842-019',
      quoteNumber: null,
      insuredName: 'Midwest Grain Cooperative',
      producer: 'Hartwell Insurance Group',
      submissionId: null,
      claimNumber: 'CL-2026-44821',
    },
    description:
      'Claims adjuster requested UW review after structural engineer report increased BI/PD exposure on warehouse fire claim. Current reserve $890K vs initial $420K. Need underwriting sign-off on continued coverage position and potential subrogation.',
    copilotInsights: [
      'Policy includes ordinance/law coverage — confirm limits apply to partial rebuild scenario.',
      'Similar fire claims in book avg 78 days to settlement; reserve may stabilize after engineer final.',
      'Suggest Copilot-drafted reserve memo template for claims file.',
    ],
    documents: [
      { name: 'Engineer report (final draft)', status: 'Received', required: true },
      { name: 'Proof of loss', status: 'Received', required: true },
      { name: 'UW reserve approval memo', status: 'Missing', required: true },
    ],
    blockingIssues: 'Reserve change pending UW approval; payment hold on structural repairs.',
    notes: 'Linked to renewal task RNW-284719 — coordinate messaging.',
  },
  {
    id: 'task-007',
    theme: 'AI-assisted renewal queue',
    taskName: 'Submission intake — BML missing SOV lines',
    refNumber: 'SUB-52877',
    priority: 'Medium',
    priorityReason: 'Submission in PAS queue 4 days; producer expects indication within 48 hrs',
    status: 'Pending',
    displayStatus: 'Pending insured',
    nextAction: 'Send structured SOV gap list to producer; pause rating until complete',
    assignedDate: '2026-06-22',
    dueDate: '2026-07-01',
    assignedLabel: 'Jun 22, 2026',
    dueLabel: 'Jul 1, 2026',
    ageIndicator: 'Due in 2 days',
    agingDays: 4,
    isPastDue: false,
    assignedTo: 'Submission Processing',
    team: 'BML Commercial Lines',
    assigner: 'Ethan Brooks',
    referenceType: 'Quote',
    hasAiInsights: true,
    relatedEntities: {
      policyNumber: null,
      quoteNumber: null,
      insuredName: 'Pinnacle Food Distributors Inc.',
      producer: 'NorthBridge Commercial',
      submissionId: 'SUB-52877',
      claimNumber: null,
    },
    description:
      'New business BML submission received via portal. Copilot parsed SOV but 14 locations missing TIV, construction type, or year built. Cannot release to UW until minimum data completeness threshold met (85%).',
    copilotInsights: [
      '14 of 62 locations incomplete — all missing fields are construction/year built.',
      'Auto-email template ready with location-level gap table for producer.',
      'If producer uploads revised SOV, re-parse and route to UW within 2 hrs.',
    ],
    documents: [
      { name: 'Statement of values (partial)', status: 'Received', required: true },
      { name: 'ACORD 125/126', status: 'Received', required: true },
      { name: '5-year loss runs', status: 'Missing', required: true },
      { name: 'Complete SOV', status: 'Missing', required: true },
    ],
    blockingIssues: 'PAS routing blocked — data completeness 77% (min 85%).',
    notes: 'Target effective date 08/01/2026.',
  },
  {
    id: 'task-008',
    theme: 'Compliance watch',
    taskName: 'Policy audit — workers comp class code verification',
    refNumber: 'AUD-44102',
    priority: 'Low',
    priorityReason: 'Routine mid-term audit; no immediate coverage risk',
    status: 'Pending',
    displayStatus: 'Scheduled',
    nextAction: 'Review payroll reports and validate class codes 8810 vs 8742',
    assignedDate: '2026-06-19',
    dueDate: '2026-07-15',
    assignedLabel: 'Jun 19, 2026',
    dueLabel: 'Jul 15, 2026',
    ageIndicator: 'Due in 15 days',
    agingDays: 7,
    isPastDue: false,
    assignedTo: 'Premium Audit',
    team: 'Policy Administration',
    assigner: 'Brenda Holmes',
    referenceType: 'Policy',
    hasAiInsights: true,
    relatedEntities: {
      policyNumber: 'WC-3399-118',
      quoteNumber: null,
      insuredName: 'GreenLine Hospitality Group',
      producer: 'Keystone Benefits Partners',
      submissionId: null,
      claimNumber: null,
    },
    description:
      'Scheduled premium audit for multi-state WC policy. Copilot flagged possible misclassification: clerical staff payroll may be assigned to restaurant class. Audit outcome may generate endorsement and additional premium invoice.',
    copilotInsights: [
      'Payroll split shows 22% in class 8742 — peer restaurants avg 8% for similar headcount.',
      'Recommend requesting detailed job descriptions before final audit close.',
      'Est. premium impact +$3.2K–$5.8K if reclass confirmed.',
    ],
    documents: [
      { name: 'Payroll reports (Q1–Q2)', status: 'Received', required: true },
      { name: 'Job description packet', status: 'Missing', required: true },
      { name: 'Prior audit worksheet', status: 'Received', required: false },
    ],
    blockingIssues: null,
    notes: 'Insured finance contact prefers audit correspondence via portal.',
  },
  {
    id: 'task-009',
    theme: 'Automated quote issues',
    taskName: 'Bind failure — payment authorization declined',
    refNumber: 'BNF-77201',
    priority: 'High',
    priorityReason: 'Bind started; policy not issued; producer retrying with insured on phone',
    status: 'Started',
    displayStatus: 'Failed',
    nextAction: 'Confirm payment method or switch to agency bill hold until cleared',
    assignedDate: '2026-06-26',
    dueDate: '2026-06-26',
    assignedLabel: 'Today',
    dueLabel: 'Today',
    ageIndicator: 'Due today',
    agingDays: 0,
    isPastDue: false,
    assignedTo: 'Bind Desk',
    team: 'Personal Lines Processing',
    assigner: 'System',
    referenceType: 'Quote',
    hasAiInsights: true,
    relatedEntities: {
      policyNumber: null,
      quoteNumber: 'Q-PA-994102',
      insuredName: 'Elena Morales',
      producer: 'Valley Auto Agency',
      submissionId: 'SUB-44902',
      claimNumber: null,
    },
    description:
      'Auto Installer completed rating and generated bind packet. Payment gateway returned AUTH_DECLINE (insufficient funds) on down payment. Quote remains in bind-pending; no policy number issued. Insured requested alternate card.',
    copilotInsights: [
      'Second payment attempt allowed after 15 min cooldown — next window 2:45 PM local.',
      'If switching to agency bill, verify producer has AB authority on personal auto new business.',
      'Send insured SMS-friendly payment link via producer portal (template available).',
    ],
    documents: [
      { name: 'Signed application', status: 'Received', required: true },
      { name: 'Payment authorization log', status: 'Received', required: true },
      { name: 'Alternate payment confirmation', status: 'Missing', required: true },
    ],
    blockingIssues: 'Bind transaction BTX-994102-03 failed; policy shell not created.',
    notes: 'Producer on live call with insured — prioritize.',
  },
  {
    id: 'task-010',
    theme: 'Producer support',
    taskName: 'Watchlist review — expiring quote no activity',
    refNumber: 'WTL-33019',
    priority: 'Medium',
    priorityReason: 'Quote expires in 3 days; $218K premium; no producer activity 12 days',
    status: 'Pending',
    displayStatus: 'Open',
    nextAction: 'Contact producer or extend quote per delegation authority',
    assignedDate: '2026-06-25',
    dueDate: '2026-07-03',
    assignedLabel: 'Jun 25, 2026',
    dueLabel: 'Jul 3, 2026',
    ageIndicator: 'Due in 3 days',
    agingDays: 1,
    isPastDue: false,
    assignedTo: 'Maria Santos',
    team: 'Account Management',
    assigner: 'Leslie Neuman',
    referenceType: 'Quote',
    hasAiInsights: true,
    relatedEntities: {
      policyNumber: null,
      quoteNumber: 'Q-CP-772901',
      insuredName: 'Lakeview Medical Office Park LLC',
      producer: 'NorthBridge Commercial',
      submissionId: 'SUB-50112',
      claimNumber: null,
    },
    description:
      'Quote on internal watchlist due to expiration proximity and stalled status. Insured is new business commercial package (CP + GL + Umb). Copilot detected producer last viewed quote 12 days ago; no bind or revision requests logged.',
    copilotInsights: [
      'Recommend 7-day extension — within AM authority; competitor indication likely per producer notes.',
      'Similar stalled quotes converted 34% after single outreach call within 5 days of expiry.',
      'Generate outreach brief: highlight umbrella limit gap vs expiring carrier schedule.',
    ],
    documents: [
      { name: 'Indication proposal', status: 'Received', required: false },
      { name: 'Competitor expiring dec page', status: 'Missing', required: false },
      { name: 'Extension approval', status: 'Missing', required: true },
    ],
    blockingIssues: null,
    notes: 'Added to Quotes watchlist 06/26; linked insured also on insured watchlist.',
  },
]

export const teamMembersMock: TeamMemberRecord[] = [
  {
    id: 'tm-1',
    name: 'Pamela Hollingsworth',
    initials: 'PH',
    title: 'SVP, Client Partner',
    totalTasks: 6,
    dueToday: 2,
    pastDue: 1,
    days0to2: 3,
    days3to5: 2,
    days6plus: 1,
    directReports: 11,
  },
  {
    id: 'tm-2',
    name: 'Leslie Neuman',
    initials: 'LN',
    title: 'VP, Client Relations',
    totalTasks: 8,
    dueToday: 1,
    pastDue: 0,
    days0to2: 4,
    days3to5: 3,
    days6plus: 1,
    directReports: 4,
    managerId: 'tm-1',
  },
  {
    id: 'tm-3',
    name: 'Chris Reynolds',
    initials: 'CR',
    title: 'VP, Underwriting',
    totalTasks: 5,
    dueToday: 0,
    pastDue: 1,
    days0to2: 2,
    days3to5: 1,
    days6plus: 2,
    directReports: 3,
    managerId: 'tm-1',
  },
  {
    id: 'tm-4',
    name: 'Dana Patel',
    initials: 'DP',
    title: 'VP, Operations',
    totalTasks: 7,
    dueToday: 1,
    pastDue: 0,
    days0to2: 3,
    days3to5: 2,
    days6plus: 2,
    directReports: 5,
    managerId: 'tm-1',
  },
  {
    id: 'tm-5',
    name: 'Alex Carter',
    initials: 'AC',
    title: 'Account Manager',
    totalTasks: 12,
    dueToday: 2,
    pastDue: 1,
    days0to2: 5,
    days3to5: 4,
    days6plus: 3,
    directReports: 2,
    managerId: 'tm-2',
  },
  {
    id: 'tm-6',
    name: 'Jasmine Nguyen',
    initials: 'JN',
    title: 'Account Manager',
    totalTasks: 9,
    dueToday: 1,
    pastDue: 0,
    days0to2: 4,
    days3to5: 3,
    days6plus: 2,
    directReports: 0,
    managerId: 'tm-2',
  },
  {
    id: 'tm-7',
    name: 'Brenda Holmes',
    initials: 'BH',
    title: 'Account Manager',
    totalTasks: 10,
    dueToday: 0,
    pastDue: 2,
    days0to2: 3,
    days3to5: 3,
    days6plus: 4,
    directReports: 1,
    managerId: 'tm-3',
  },
  {
    id: 'tm-8',
    name: 'Landon Wilson',
    initials: 'LW',
    title: 'Account Manager',
    totalTasks: 6,
    dueToday: 1,
    pastDue: 0,
    days0to2: 2,
    days3to5: 2,
    days6plus: 2,
    directReports: 0,
    managerId: 'tm-3',
  },
  {
    id: 'tm-9',
    name: 'Kevin Ortiz',
    initials: 'KO',
    title: 'Account Manager',
    totalTasks: 8,
    dueToday: 1,
    pastDue: 1,
    days0to2: 3,
    days3to5: 2,
    days6plus: 3,
    directReports: 0,
    managerId: 'tm-4',
  },
  {
    id: 'tm-10',
    name: 'Brianna Lopez',
    initials: 'BL',
    title: 'Associate Account Manager',
    totalTasks: 4,
    dueToday: 0,
    pastDue: 0,
    days0to2: 2,
    days3to5: 1,
    days6plus: 1,
    directReports: 0,
    managerId: 'tm-5',
  },
  {
    id: 'tm-11',
    name: 'Ethan Brooks',
    initials: 'EB',
    title: 'Account Manager',
    totalTasks: 11,
    dueToday: 2,
    pastDue: 0,
    days0to2: 5,
    days3to5: 3,
    days6plus: 3,
    directReports: 0,
    managerId: 'tm-2',
  },
]

export const TASKS_TOTAL_ROWS = tasksMock.length

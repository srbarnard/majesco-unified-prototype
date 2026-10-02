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
  | 'Assisted renewal queue'
  | 'Exception handling'
  | 'Compliance watch'
  | 'Producer support'
  | 'Automated quote issues'

export type TaskDocumentType = 'pdf' | 'spreadsheet' | 'image' | 'form' | 'package' | 'email'

export type TaskDocument = {
  id: string
  name: string
  status: string
  required: boolean
  /** Visual chip / file-type cue in the task drawer. */
  type?: TaskDocumentType
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
  hasAlert: boolean
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

export function getTaskDocumentHref(task: TaskRecord, document: TaskDocument): string {
  const policyNumber = task.relatedEntities.policyNumber
  if (policyNumber) {
    return `/policies/${encodeURIComponent(policyNumber)}/documents/${document.id}`
  }

  const quoteNumber = task.relatedEntities.quoteNumber
  if (quoteNumber) {
    return `/quotes/${encodeURIComponent(quoteNumber)}/documents/${document.id}`
  }

  // Fallback for submissions / other refs — still open the shared document viewer.
  return `/policies/01-CA-000100005-0/documents/${document.id}`
}

const baseTasks: TaskRecord[] = [
  {
    id: 'task-001',
    theme: 'Assisted renewal queue',
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
    hasAlert: true,
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
      'Commercial property renewal flagged by the assistant after updated loss runs showed elevated CAT and water damage frequency. Account is strategic producer book; prior term had no rate change. Underwriting referral required before renewal terms can release to producer. The account spans 12 locations across Nebraska and Iowa with total insured values exceeding $48M. Recent water intrusion claims at the Omaha grain elevator and secondary cold storage facility drove the loss ratio above the 62% referral threshold. Producer Hartwell Insurance Group has requested to maintain the current rate pending completion of roof mitigation at two flagged locations. The assistant pre-filled referral worksheet sections 1–4; sections 5–7 require underwriter narrative on catastrophe exposure and business income limits.',
    copilotInsights: [
      'Recommend +8–12% rate adjustment on property line; liability remains within appetite at current limits.',
      'Similar accounts in ZIP cluster 68102 renewed at avg +10.4% when loss ratio exceeded 62%.',
      'Generate draft referral memo citing 3 largest water losses and mitigation recommendations.',
    ],
    documents: [
      { id: 'task-att-loss-runs-5yr', name: 'Updated loss runs (5-year)', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-property-inspection-2024', name: 'Property inspection report (2024)', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-site-photos', name: 'Site photos (Omaha elevator)', status: 'Received', required: false, type: 'image' },
      { id: 'task-att-signed-renewal-app', name: 'Signed renewal application', status: 'Missing', required: true, type: 'form' },
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
    hasAlert: false,
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
      { id: 'task-att-executed-lease', name: 'Executed lease (exhibit B)', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-ai-schedule', name: 'Additional insured schedule', status: 'Missing', required: true, type: 'spreadsheet' },
      { id: 'task-att-producer-auth', name: 'Producer authorization', status: 'Received', required: false, type: 'email' },
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
    hasAlert: false,
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
      { id: 'task-att-mvr-driver-1', name: 'MVR (driver 1)', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-vehicle-photos', name: 'Vehicle photos', status: 'Not required', required: false, type: 'image' },
      { id: 'task-att-vin-decode', name: 'VIN decode worksheet', status: 'Received', required: true, type: 'spreadsheet' },
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
    hasAlert: true,
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
      'Sanctions screening returned potential match on principal owner name during new business quote bind prep. Preliminary assistant match score 0.71 — likely false positive due to common name + different DOB/state. Bind is blocked pending compliance clearance.',
    copilotInsights: [
      'Screening hit entity DOB differs by 12 years from application owner DOB — strong false-positive signal.',
      'Recommend clearance with note; no prior compliance flags on producer or insured.',
      'If escalated, assign to Tier 2 compliance; do not release quote to bind until status = Cleared.',
    ],
    documents: [
      { id: 'task-att-owner-id', name: 'Owner ID verification', status: 'Received', required: true, type: 'image' },
      { id: 'task-att-ofac-report', name: 'OFAC screening report', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-compliance-clearance', name: 'Compliance clearance form', status: 'Missing', required: true, type: 'form' },
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
    hasAlert: false,
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
      { id: 'task-att-commission-may-2026', name: 'May 2026 commission statement', status: 'Received', required: true, type: 'spreadsheet' },
      { id: 'task-att-cancellation-notice', name: 'Cancellation notice', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-rewrite-bind', name: 'Rewrite bind confirmation', status: 'Received', required: true, type: 'email' },
      { id: 'task-att-rewrite-packet', name: 'Rewrite bind packet', status: 'Received', required: false, type: 'package' },
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
    hasAlert: true,
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
      'Suggest assistant-drafted reserve memo template for claims file.',
    ],
    documents: [
      { id: 'task-att-engineer-report', name: 'Engineer report (final draft)', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-proof-of-loss', name: 'Proof of loss', status: 'Received', required: true, type: 'form' },
      { id: 'task-att-damage-photos', name: 'Damage photos', status: 'Received', required: false, type: 'image' },
      { id: 'task-att-uw-reserve-memo', name: 'UW reserve approval memo', status: 'Missing', required: true, type: 'email' },
    ],
    blockingIssues: 'Reserve change pending UW approval; payment hold on structural repairs.',
    notes: 'Linked to renewal task RNW-284719 — coordinate messaging.',
  },
  {
    id: 'task-007',
    theme: 'Assisted renewal queue',
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
    hasAlert: true,
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
      'New business BML submission received via portal. The assistant parsed SOV but 14 locations missing TIV, construction type, or year built. Cannot release to UW until minimum data completeness threshold met (85%).',
    copilotInsights: [
      '14 of 62 locations incomplete — all missing fields are construction/year built.',
      'Auto-email template ready with location-level gap table for producer.',
      'If producer uploads revised SOV, re-parse and route to UW within 2 hrs.',
    ],
    documents: [
      { id: 'task-att-sov-partial', name: 'Statement of values (partial)', status: 'Received', required: true, type: 'spreadsheet' },
      { id: 'task-att-acord-125-126', name: 'ACORD 125/126', status: 'Received', required: true, type: 'form' },
      { id: 'task-att-5yr-loss-runs', name: '5-year loss runs', status: 'Missing', required: true, type: 'pdf' },
      { id: 'task-att-complete-sov', name: 'Complete SOV', status: 'Missing', required: true, type: 'spreadsheet' },
      { id: 'task-att-submission-package', name: 'Submission package', status: 'Received', required: false, type: 'package' },
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
    hasAlert: false,
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
      'Scheduled premium audit for multi-state WC policy. The assistant flagged possible misclassification: clerical staff payroll may be assigned to restaurant class. Audit outcome may generate endorsement and additional premium invoice.',
    copilotInsights: [
      'Payroll split shows 22% in class 8742 — peer restaurants avg 8% for similar headcount.',
      'Recommend requesting detailed job descriptions before final audit close.',
      'Est. premium impact +$3.2K–$5.8K if reclass confirmed.',
    ],
    documents: [
      { id: 'task-att-payroll-q1q2', name: 'Payroll reports (Q1–Q2)', status: 'Received', required: true, type: 'spreadsheet' },
      { id: 'task-att-job-descriptions', name: 'Job description packet', status: 'Missing', required: true, type: 'package' },
      { id: 'task-att-prior-audit', name: 'Prior audit worksheet', status: 'Received', required: false, type: 'spreadsheet' },
      { id: 'task-att-audit-email', name: 'Audit correspondence', status: 'Received', required: false, type: 'email' },
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
    hasAlert: false,
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
      { id: 'task-att-signed-application', name: 'Signed application', status: 'Received', required: true, type: 'form' },
      { id: 'task-att-payment-auth-log', name: 'Payment authorization log', status: 'Received', required: true, type: 'pdf' },
      { id: 'task-att-card-scan', name: 'Alternate card scan', status: 'Not required', required: false, type: 'image' },
      { id: 'task-att-alt-payment', name: 'Alternate payment confirmation', status: 'Missing', required: true, type: 'email' },
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
    hasAlert: true,
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
      'Quote on internal watchlist due to expiration proximity and stalled status. Insured is new business commercial package (CP + GL + Umb). The assistant detected producer last viewed quote 12 days ago; no bind or revision requests logged.',
    copilotInsights: [
      'Recommend 7-day extension — within AM authority; competitor indication likely per producer notes.',
      'Similar stalled quotes converted 34% after single outreach call within 5 days of expiry.',
      'Generate outreach brief: highlight umbrella limit gap vs expiring carrier schedule.',
    ],
    documents: [
      { id: 'task-att-indication-proposal', name: 'Indication proposal', status: 'Received', required: false, type: 'pdf' },
      { id: 'task-att-competitor-dec', name: 'Competitor expiring dec page', status: 'Missing', required: false, type: 'pdf' },
      { id: 'task-att-rate-sheet', name: 'Competitor rate sheet', status: 'Received', required: false, type: 'spreadsheet' },
      { id: 'task-att-extension-approval', name: 'Extension approval', status: 'Missing', required: true, type: 'email' },
    ],
    blockingIssues: null,
    notes: 'Added to Quotes watchlist 06/26; linked insured also on insured watchlist.',
  },
]

type TaskSeed = {
  name: string
  theme: TaskTheme
  priority: TaskPriority
  status: TaskStatus
  displayStatus: string
  nextAction: string
  assignedTo: string
  assigner: string
  team: string
  /** Days from the mock "today" (Jun 26, 2026); negative = past due. */
  dueIn: number
  agingDays: number
  refPrefix: string
  referenceType: TaskReferenceType
  insured: string
  producer: string
  policy?: string
  quote?: string
  claim?: string
  blocker?: string
  alert?: boolean
}

const MOCK_TODAY = Date.UTC(2026, 5, 26)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function mockDate(offsetDays: number) {
  const d = new Date(MOCK_TODAY + offsetDays * 86_400_000)
  const iso = d.toISOString().slice(0, 10)
  return { iso, label: `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}` }
}

function ageIndicatorFor(dueIn: number) {
  if (dueIn < 0) return `Past due ${-dueIn} ${dueIn === -1 ? 'day' : 'days'}`
  if (dueIn === 0) return 'Due today'
  return `Due in ${dueIn} ${dueIn === 1 ? 'day' : 'days'}`
}

function buildSeedTask(seed: TaskSeed, index: number): TaskRecord {
  const assigned = mockDate(-seed.agingDays)
  const due = mockDate(seed.dueIn)
  const refNumber = `${seed.refPrefix}-${String(400_000 + index * 7_919).slice(0, 6)}`
  return {
    id: `task-${String(baseTasks.length + index + 1).padStart(3, '0')}`,
    taskName: seed.name,
    assigner: seed.assigner,
    assignedTo: seed.assignedTo,
    team: seed.team,
    priority: seed.priority,
    priorityReason: seed.dueIn <= 0 ? 'SLA at or past due' : `Due in ${seed.dueIn} days`,
    status: seed.status,
    displayStatus: seed.displayStatus,
    nextAction: seed.nextAction,
    theme: seed.theme,
    assignedDate: assigned.iso,
    dueDate: due.iso,
    assignedLabel: assigned.label,
    dueLabel: due.label,
    ageIndicator: ageIndicatorFor(seed.dueIn),
    refNumber,
    referenceType: seed.referenceType,
    agingDays: seed.agingDays,
    isPastDue: seed.dueIn < 0,
    hasAlert: seed.alert ?? seed.dueIn <= 0,
    hasAiInsights: index % 3 !== 2,
    description: `${seed.name} for ${seed.insured}. ${seed.nextAction}.`,
    copilotInsights: [
      `Similar ${seed.theme.toLowerCase()} items for ${seed.producer} closed in ~${Math.max(1, seed.agingDays)} days on average.`,
      'Draft a producer update summarizing outstanding items and next steps.',
    ],
    documents: [
      { id: `${refNumber}-doc-1`, name: 'Supporting documentation', status: 'Received', required: true, type: 'pdf' },
      {
        id: `${refNumber}-doc-2`,
        name: 'Producer correspondence',
        status: seed.blocker ? 'Missing' : 'Received',
        required: false,
        type: 'email',
      },
    ],
    blockingIssues: seed.blocker ?? null,
    notes: null,
    relatedEntities: {
      policyNumber: seed.policy ?? null,
      quoteNumber: seed.quote ?? null,
      insuredName: seed.insured,
      producer: seed.producer,
      submissionId: null,
      claimNumber: seed.claim ?? null,
    },
  }
}

const UW = 'Commercial UW — Midwest'
const CLIENT = 'Client Relations'
const OPS = 'Distribution Operations'

const taskSeeds: TaskSeed[] = [
  { name: 'Renewal pricing review — property schedule update', theme: 'Assisted renewal queue', priority: 'High', status: 'Started', displayStatus: 'In review', nextAction: 'Confirm updated TIV and release renewal terms', assignedTo: 'Chris Reynolds', assigner: 'Pamela Hollingsworth', team: UW, dueIn: 2, agingDays: 3, refPrefix: 'RNW', referenceType: 'Policy', insured: 'Riverbend Foods Inc.', producer: 'Hartwell Insurance Group', policy: 'CP-7710-204' },
  { name: 'Referral — umbrella limit above authority', theme: 'Exception handling', priority: 'High', status: 'Pending', displayStatus: 'Pending documents', nextAction: 'Obtain underlying auto schedule before approving $10M excess', assignedTo: 'Brenda Holmes', assigner: 'Chris Reynolds', team: UW, dueIn: -2, agingDays: 6, refPrefix: 'REF', referenceType: 'Policy', insured: 'Keystone Freight Co.', producer: 'NorthBridge Commercial', policy: 'UM-3321-088', blocker: 'Underlying auto schedule not received from producer.' },
  { name: 'Loss control recommendations follow-up', theme: 'Compliance watch', priority: 'Medium', status: 'Started', displayStatus: 'In progress', nextAction: 'Confirm sprinkler remediation at Building 3', assignedTo: 'Brenda Holmes', assigner: 'Chris Reynolds', team: UW, dueIn: 5, agingDays: 9, refPrefix: 'LCR', referenceType: 'Policy', insured: 'Lakeshore Plastics LLC', producer: 'Summit Risk Partners', policy: 'CP-6604-512' },
  { name: 'New business quote — contractor GL', theme: 'Automated quote issues', priority: 'Medium', status: 'Started', displayStatus: 'In review', nextAction: 'Validate subcontractor cost exposure and rate', assignedTo: 'Landon Wilson', assigner: 'Chris Reynolds', team: UW, dueIn: 3, agingDays: 2, refPrefix: 'NBQ', referenceType: 'Quote', insured: 'Prairie Build Group', producer: 'Hartwell Insurance Group', quote: 'Q-GL-884120' },
  { name: 'Cancellation — non-payment notice review', theme: 'Exception handling', priority: 'High', status: 'Pending', displayStatus: 'Open', nextAction: 'Verify reinstatement eligibility before notice issues', assignedTo: 'Landon Wilson', assigner: 'Dana Patel', team: 'Policy Services', dueIn: 0, agingDays: 4, refPrefix: 'CXL', referenceType: 'Policy', insured: 'Bluewater Marina Group', producer: 'Coastal Brokerage', policy: 'IM-2209-731' },
  { name: 'Mid-term endorsement — add location', theme: 'Producer support', priority: 'Low', status: 'Pending', displayStatus: 'Pending insured', nextAction: 'Collect COPE details for new warehouse', assignedTo: 'Jordan Ellis', assigner: 'Chris Reynolds', team: UW, dueIn: 8, agingDays: 1, refPrefix: 'END', referenceType: 'Policy', insured: 'Summit Logistics LLC', producer: 'NorthBridge Commercial', policy: 'GL-5521-447' },
  { name: 'Inspection report review — roof condition', theme: 'Assisted renewal queue', priority: 'Medium', status: 'Started', displayStatus: 'In progress', nextAction: 'Decide on roof surfacing exclusion', assignedTo: 'Maria Santos', assigner: 'Chris Reynolds', team: UW, dueIn: 4, agingDays: 5, refPrefix: 'INS', referenceType: 'Policy', insured: 'Heartland Cold Storage', producer: 'Summit Risk Partners', policy: 'CP-9012-330' },
  { name: 'Producer onboarding — appointment paperwork', theme: 'Producer support', priority: 'Low', status: 'Pending', displayStatus: 'Waiting on internal', nextAction: 'Route E&O certificate to licensing', assignedTo: 'Leslie Neuman', assigner: 'Pamela Hollingsworth', team: CLIENT, dueIn: 10, agingDays: 3, refPrefix: 'PRD', referenceType: 'Policy', insured: 'Granite Peak Agency', producer: 'Granite Peak Agency' },
  { name: 'Key account stewardship review', theme: 'Assisted renewal queue', priority: 'Medium', status: 'Started', displayStatus: 'In review', nextAction: 'Prepare stewardship deck for Q3 meeting', assignedTo: 'Leslie Neuman', assigner: 'Pamela Hollingsworth', team: CLIENT, dueIn: 6, agingDays: 8, refPrefix: 'STW', referenceType: 'Policy', insured: 'Midwest Grain Cooperative', producer: 'Hartwell Insurance Group', policy: 'CP-8842-019' },
  { name: 'Billing dispute — audit premium adjustment', theme: 'Producer support', priority: 'High', status: 'Started', displayStatus: 'In progress', nextAction: 'Reconcile payroll classes with insured controller', assignedTo: 'Alex Carter', assigner: 'Leslie Neuman', team: CLIENT, dueIn: -1, agingDays: 12, refPrefix: 'BIL', referenceType: 'Policy', insured: 'Crescent Staffing Solutions', producer: 'Summit Risk Partners', policy: 'WC-4471-902' },
  { name: 'Certificate request — owner/GC requirements', theme: 'Producer support', priority: 'Low', status: 'Completed', displayStatus: 'Completed', nextAction: 'Certificate issued; confirm receipt with producer', assignedTo: 'Alex Carter', assigner: 'Leslie Neuman', team: CLIENT, dueIn: 1, agingDays: 2, refPrefix: 'COI', referenceType: 'Policy', insured: 'Prairie Build Group', producer: 'Hartwell Insurance Group', policy: 'GL-6120-515' },
  { name: 'Renewal outreach — expiring in 45 days', theme: 'Assisted renewal queue', priority: 'Medium', status: 'Pending', displayStatus: 'Open', nextAction: 'Send renewal questionnaire to producer', assignedTo: 'Alex Carter', assigner: 'Leslie Neuman', team: CLIENT, dueIn: 0, agingDays: 1, refPrefix: 'RNW', referenceType: 'Policy', insured: 'Oakridge Dental Group', producer: 'Coastal Brokerage', policy: 'BOP-1180-266' },
  { name: 'Coverage question — cyber sublimit', theme: 'Producer support', priority: 'Low', status: 'Started', displayStatus: 'In progress', nextAction: 'Draft response on social engineering sublimit', assignedTo: 'Brianna Lopez', assigner: 'Alex Carter', team: CLIENT, dueIn: 3, agingDays: 2, refPrefix: 'CVQ', referenceType: 'Policy', insured: 'Oakridge Dental Group', producer: 'Coastal Brokerage', policy: 'CY-3390-120' },
  { name: 'Payment plan change request', theme: 'Producer support', priority: 'Low', status: 'Pending', displayStatus: 'Pending insured', nextAction: 'Confirm EFT authorization for quarterly plan', assignedTo: 'Brianna Lopez', assigner: 'Alex Carter', team: CLIENT, dueIn: 7, agingDays: 1, refPrefix: 'PAY', referenceType: 'Policy', insured: 'Lakeview Medical Partners', producer: 'Summit Risk Partners', policy: 'PL-7702-441' },
  { name: 'OFAC potential match — named insured', theme: 'Compliance watch', priority: 'High', status: 'Pending', displayStatus: 'Open', nextAction: 'Clear or escalate potential SDN match', assignedTo: 'Jasmine Nguyen', assigner: 'System', team: 'Enterprise Compliance', dueIn: 0, agingDays: 0, refPrefix: 'OFC', referenceType: 'Policy', insured: 'Atlas Import Traders', producer: 'Coastal Brokerage', policy: 'IM-5530-018', alert: true },
  { name: 'Account review — multi-line cross-sell', theme: 'Assisted renewal queue', priority: 'Low', status: 'Started', displayStatus: 'In review', nextAction: 'Review assistant umbrella and cyber recommendations', assignedTo: 'Jasmine Nguyen', assigner: 'Leslie Neuman', team: CLIENT, dueIn: 12, agingDays: 4, refPrefix: 'XSL', referenceType: 'Policy', insured: 'Riverbend Foods Inc.', producer: 'Hartwell Insurance Group', policy: 'CP-7710-204' },
  { name: 'Claim notice — water damage FNOL', theme: 'Exception handling', priority: 'High', status: 'Started', displayStatus: 'In progress', nextAction: 'Confirm coverage and assign field adjuster', assignedTo: 'Jasmine Nguyen', assigner: 'Leslie Neuman', team: CLIENT, dueIn: 1, agingDays: 1, refPrefix: 'CLM', referenceType: 'Claim', insured: 'Heartland Cold Storage', producer: 'Summit Risk Partners', policy: 'CP-9012-330', claim: 'CLM-2026-04418' },
  { name: 'Quote follow-up — producer decision pending', theme: 'Automated quote issues', priority: 'Medium', status: 'Pending', displayStatus: 'Pending insured', nextAction: 'Follow up on bind decision before quote expires', assignedTo: 'Ethan Brooks', assigner: 'Leslie Neuman', team: CLIENT, dueIn: 2, agingDays: 7, refPrefix: 'QFU', referenceType: 'Quote', insured: 'Granite Ridge Hospitality', producer: 'Granite Peak Agency', quote: 'Q-BOP-771034' },
  { name: 'Bind failure — payment gateway timeout', theme: 'Automated quote issues', priority: 'High', status: 'Started', displayStatus: 'Failed', nextAction: 'Retry bind and confirm premium collected', assignedTo: 'Ethan Brooks', assigner: 'System', team: 'Personal Lines Processing', dueIn: -1, agingDays: 2, refPrefix: 'BND', referenceType: 'Quote', insured: 'Sarah & Tom Whitfield', producer: 'Direct', quote: 'Q-HO-552190', blocker: 'Payment gateway returned timeout on 3 retries.' },
  { name: 'Renewal — declined coverage restoration', theme: 'Assisted renewal queue', priority: 'Medium', status: 'Suspended', displayStatus: 'Waiting on internal', nextAction: 'Await actuarial sign-off on restored EPL', assignedTo: 'Ethan Brooks', assigner: 'Leslie Neuman', team: CLIENT, dueIn: 9, agingDays: 5, refPrefix: 'RNW', referenceType: 'Policy', insured: 'Crescent Staffing Solutions', producer: 'Summit Risk Partners', policy: 'EPL-2280-615' },
  { name: 'Producer commission reconciliation', theme: 'Producer support', priority: 'Medium', status: 'Started', displayStatus: 'In progress', nextAction: 'Match June statement to booked premium', assignedTo: 'Dana Patel', assigner: 'Pamela Hollingsworth', team: OPS, dueIn: 4, agingDays: 6, refPrefix: 'COM', referenceType: 'Policy', insured: 'Hartwell Insurance Group', producer: 'Hartwell Insurance Group' },
  { name: 'Workflow exception — document indexing backlog', theme: 'Exception handling', priority: 'High', status: 'Started', displayStatus: 'Exception', nextAction: 'Reassign 42 unindexed documents to overflow queue', assignedTo: 'Dana Patel', assigner: 'System', team: OPS, dueIn: 0, agingDays: 3, refPrefix: 'WFX', referenceType: 'Policy', insured: 'Multiple insureds', producer: 'Internal' },
  { name: 'Premium audit — scheduled field visit', theme: 'Compliance watch', priority: 'Low', status: 'Pending', displayStatus: 'Scheduled', nextAction: 'Confirm audit date with insured', assignedTo: 'Kevin Ortiz', assigner: 'Dana Patel', team: OPS, dueIn: 11, agingDays: 2, refPrefix: 'AUD', referenceType: 'Policy', insured: 'Keystone Freight Co.', producer: 'NorthBridge Commercial', policy: 'CA-1109-874' },
  { name: 'Reinstatement request — lapse under 30 days', theme: 'Exception handling', priority: 'High', status: 'Pending', displayStatus: 'Pending documents', nextAction: 'Obtain no-loss statement and process reinstatement', assignedTo: 'Kevin Ortiz', assigner: 'Dana Patel', team: 'Policy Services', dueIn: -3, agingDays: 8, refPrefix: 'RIN', referenceType: 'Policy', insured: 'Bluewater Marina Group', producer: 'Coastal Brokerage', policy: 'IM-2209-731', blocker: 'Signed no-loss statement not received.' },
  { name: 'Auto ID card reissue — vehicle added', theme: 'Automated quote issues', priority: 'Low', status: 'Completed', displayStatus: 'Completed', nextAction: 'ID cards issued; notify producer', assignedTo: 'Kevin Ortiz', assigner: 'System', team: 'Personal Lines Processing', dueIn: 2, agingDays: 1, refPrefix: 'AID', referenceType: 'Policy', insured: 'Keystone Freight Co.', producer: 'NorthBridge Commercial', policy: 'CA-1109-874' },
  { name: 'Large loss review — reserve adequacy', theme: 'Exception handling', priority: 'High', status: 'Started', displayStatus: 'In review', nextAction: 'Approve reserve increase to $1.2M', assignedTo: 'Pamela Hollingsworth', assigner: 'System', team: 'Executive', dueIn: 1, agingDays: 4, refPrefix: 'LLR', referenceType: 'Claim', insured: 'Riverbend Foods Inc.', producer: 'Hartwell Insurance Group', policy: 'CP-7710-204', claim: 'CLM-2026-03982' },
  { name: 'Authority exception — rate deviation approval', theme: 'Exception handling', priority: 'Medium', status: 'Pending', displayStatus: 'Open', nextAction: 'Review -15% deviation request against portfolio targets', assignedTo: 'Pamela Hollingsworth', assigner: 'Chris Reynolds', team: 'Executive', dueIn: 3, agingDays: 2, refPrefix: 'AUX', referenceType: 'Quote', insured: 'Granite Ridge Hospitality', producer: 'Granite Peak Agency', quote: 'Q-CP-903311' },
  { name: 'Submission clearance — duplicate check', theme: 'Automated quote issues', priority: 'Medium', status: 'Unassigned', displayStatus: 'Open', nextAction: 'Resolve duplicate submission from two producers', assignedTo: 'Submission Processing', assigner: 'System', team: 'BML Commercial Lines', dueIn: 1, agingDays: 1, refPrefix: 'SUB', referenceType: 'Quote', insured: 'Northwind Brewing Co.', producer: 'Granite Peak Agency', quote: 'Q-GL-903577' },
  { name: 'Sanctions rescreen — renewal batch', theme: 'Compliance watch', priority: 'Medium', status: 'Started', displayStatus: 'In progress', nextAction: 'Review 6 flagged records from nightly rescreen', assignedTo: 'Compliance Ops', assigner: 'System', team: 'Enterprise Compliance', dueIn: 2, agingDays: 1, refPrefix: 'SAN', referenceType: 'Policy', insured: 'Multiple insureds', producer: 'Internal' },
  { name: 'Rating error — territory code missing', theme: 'Automated quote issues', priority: 'High', status: 'Started', displayStatus: 'Exception', nextAction: 'Correct territory mapping and re-rate', assignedTo: 'Auto Installer Queue', assigner: 'System', team: 'Personal Lines Processing', dueIn: 0, agingDays: 0, refPrefix: 'AQE', referenceType: 'Quote', insured: 'Daniel Okafor', producer: 'Direct', quote: 'Q-PA-661408' },
  { name: 'Producer portal access issue', theme: 'Producer support', priority: 'Low', status: 'Discarded', displayStatus: 'Discarded', nextAction: 'Duplicate of existing ticket; no action required', assignedTo: 'Account Support — Producer Desk', assigner: 'Leslie Neuman', team: OPS, dueIn: 5, agingDays: 3, refPrefix: 'PPA', referenceType: 'Policy', insured: 'Coastal Brokerage', producer: 'Coastal Brokerage' },
  { name: 'Excess placement — layered program quote', theme: 'Assisted renewal queue', priority: 'Medium', status: 'Started', displayStatus: 'In review', nextAction: 'Compare reinsurer indications for $25M xs $10M layer', assignedTo: 'Chris Reynolds', assigner: 'Pamela Hollingsworth', team: UW, dueIn: 7, agingDays: 5, refPrefix: 'XSP', referenceType: 'Quote', insured: 'Keystone Freight Co.', producer: 'NorthBridge Commercial', quote: 'Q-XS-440921' },
]

export const tasksMock: TaskRecord[] = [...baseTasks, ...taskSeeds.map(buildSeedTask)]

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
    directReports: 4,
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
  {
    id: 'tm-12',
    name: 'Jordan Ellis',
    initials: 'JE',
    title: 'Senior Underwriter',
    totalTasks: 2,
    dueToday: 0,
    pastDue: 0,
    days0to2: 1,
    days3to5: 1,
    days6plus: 0,
    directReports: 0,
    managerId: 'tm-3',
  },
  {
    id: 'tm-13',
    name: 'Maria Santos',
    initials: 'MS',
    title: 'Underwriter',
    totalTasks: 2,
    dueToday: 1,
    pastDue: 0,
    days0to2: 1,
    days3to5: 0,
    days6plus: 1,
    directReports: 0,
    managerId: 'tm-3',
  },
]

/** Stable per-person index for avatar color (roster order). */
export function getTeamMemberIndex(memberId: string) {
  return Math.max(0, teamMembersMock.findIndex((member) => member.id === memberId))
}

/** A person plus everyone under them — used to filter All tasks from the org chart. */
export function getTeamSubtreeNames(memberId: string): string[] {
  const names: string[] = []
  const visit = (id: string) => {
    const member = teamMembersMock.find((m) => m.id === id)
    if (!member) return
    names.push(member.name)
    teamMembersMock.filter((m) => m.managerId === id).forEach((m) => visit(m.id))
  }
  visit(memberId)
  return names
}

export const TASKS_TOTAL_ROWS = tasksMock.length

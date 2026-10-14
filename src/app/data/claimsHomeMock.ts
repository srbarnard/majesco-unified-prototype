/** Joan's claims home (home.js): persona, claims, metrics, approvals. Dates are relative to HOME_TODAY. */

export const HOME_TODAY = '2026-08-19'
export const HOME_PAGE_SIZE = 5
export const HOME_PERSONA = { name: 'Jordan Blake', role: 'Claims Adjuster' }

export type HomeTask = {
  id: string
  description: string
  dueDate: string
  status: 'Open' | 'Closed'
  tags: string[]
  assignedTo: string
}

export type HomeMilestone = {
  id: string
  type: string
  label: string
  dueDate: string
  status: 'inProgress' | 'complete'
}

export type HomeNote = { author: string; date: string; text: string }

export type HomeFeature = {
  id: string
  featureNumber: number
  featureStatus: string
  subject: string
  coverage: string
  assignedTo: string
  typeIcon: 'home_work' | 'personal_injury'
  tasks: HomeTask[]
  milestones: HomeMilestone[]
  notes: HomeNote[]
}

export type HomeClaim = {
  claim: string
  insured: string
  type: string
  detail: string
  detailType: string
  assignee: string
  tasks: HomeTask[]
  milestones: HomeMilestone[]
  features: HomeFeature[]
  notes: HomeNote[]
}

/* ---- dates ---- */
export const isoDate = (d: Date) => d.toISOString().slice(0, 10)
export const parseIsoDate = (v: string) => {
  const [y, m, d] = v.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}
export const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setUTCDate(x.getUTCDate() + n)
  return x
}
export const mondayFor = (d: Date) => {
  const day = d.getUTCDay()
  return addDays(d, day === 0 ? -6 : 1 - day)
}
export const fmtMonthDay = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })
export const fmtMonthDayLong = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', timeZone: 'UTC' })
export const fmtLongDay = (d: Date) =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })

export const homeInitials = (name: string) =>
  name
    .split(' ')
    .map((x) => x[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const overdueDays = (date: string) => {
  const d = Math.max(1, Math.round((parseIsoDate(HOME_TODAY).getTime() - parseIsoDate(date).getTime()) / 86400000))
  return `${d} day${d === 1 ? '' : 's'}`
}

export const humanDue = (date: string | null | undefined) => {
  if (!date) return 'No due date'
  if (date < HOME_TODAY) return `${overdueDays(date)} ago`
  if (date === HOME_TODAY) return 'Today'
  if (date === isoDate(addDays(parseIsoDate(HOME_TODAY), 1))) return 'Tomorrow'
  return fmtMonthDay(parseIsoDate(date))
}

export type DueState = 'overdue' | 'today' | 'soon' | 'future'
export const dueState = (date: string): DueState =>
  date < HOME_TODAY
    ? 'overdue'
    : date === HOME_TODAY
      ? 'today'
      : date <= isoDate(addDays(parseIsoDate(HOME_TODAY), 3))
        ? 'soon'
        : 'future'

/* ---- claims ---- */
const homeTask = (id: string, description: string, dueDate: string, status: HomeTask['status'], tags: string[]): HomeTask => ({
  id,
  description,
  dueDate,
  status,
  tags,
  assignedTo: '',
})
const addIsoDays = (date: string, days: number) => isoDate(addDays(parseIsoDate(date), days))

function claimRec(
  claim: string,
  insured: string,
  type: string,
  detail: string,
  detailType: string,
  assignee: string,
  tasks: HomeTask[],
): HomeClaim {
  tasks.forEach((t) => (t.assignedTo = assignee))
  const firstOpen = [...tasks].filter((t) => t.status === 'Open').sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0]
  const milestoneName = detailType === 'Property' ? 'Inspection Review' : '30 Day Follow Up'
  const milestone: HomeMilestone = {
    id: `${claim}-m1`,
    type: 'Manual',
    label: milestoneName,
    dueDate: firstOpen ? addIsoDays(firstOpen.dueDate, 2) : '2026-09-01',
    status: 'inProgress',
  }
  const coverage = detailType === 'Property' ? 'Property Damage Liability' : 'Bodily Injury Liability'
  const feature: HomeFeature = {
    id: `${claim}-f1`,
    featureNumber: 1,
    featureStatus: 'Open',
    subject: detail,
    coverage,
    assignedTo: assignee,
    typeIcon: detailType === 'Property' ? 'home_work' : 'personal_injury',
    tasks: tasks.map((x) => ({ ...x })),
    milestones: [{ ...milestone }],
    notes: [{ author: assignee, date: 'Aug 18, 2026', text: `Reviewed ${detail} and documented current next steps.` }],
  }
  return {
    claim,
    insured,
    type,
    detail,
    detailType,
    assignee,
    tasks,
    milestones: [milestone],
    features: [feature],
    notes: [{ author: assignee, date: 'Aug 18, 2026', text: 'Claim reviewed; follow-up activity remains open.' }],
  }
}

export const homeClaims: { injury: HomeClaim[]; property: HomeClaim[] } = {
  injury: [
    claimRec('CL-40218856-002', 'Meridian Freight Co.', 'Auto Liability', 'Irene Indola', 'Whiplash / Soft Tissue', 'Jordan Blake', [
      homeTask('ht-1', 'Follow up on outstanding medical bills', '2026-08-04', 'Open', ['Medical', 'Past Due']),
      homeTask('ht-1b', 'Review treatment diary', '2026-08-25', 'Open', ['Medical']),
    ]),
    claimRec('CL-77120934-118', 'Vantage Retail Group', 'Slip and Fall', 'Ignacio Ilmater', 'Broken Bone', 'Jordan Blake', [
      homeTask('ht-2', 'Schedule IME with claimant', '2026-08-19', 'Open', ['IME', 'Injury']),
    ]),
    claimRec('CL-55893201-047', 'BrightPath Logistics', 'Product Liability', 'Irma Isengard', 'Laceration', 'Jordan Blake', [
      homeTask('ht-3', 'Review updated medical records', '2026-08-19', 'Open', ['Medical Records']),
    ]),
    claimRec('CL-11024478-390', 'Coastal Manufacturing', 'Premises Liability', 'Isaac Ibarra', 'Whiplash / Soft Tissue', 'Jordan Blake', [
      homeTask('ht-4', 'Confirm Medicare eligibility status', '2026-08-20', 'Open', ['Medicare']),
    ]),
    claimRec('CL-90345612-221', 'Summit Builders LLC', 'Auto Liability', 'Ivy Okafor', 'Broken Bone', 'Jordan Blake', [
      homeTask('ht-5', 'Draft settlement offer', '2026-08-20', 'Open', ['Settlement']),
    ]),
    claimRec('CL-23456789-064', 'Pinecrest Hospitality', 'Slip and Fall', 'Ismael Duarte', 'Soft Tissue', 'Jordan Blake', [
      homeTask('ht-6', 'Follow up with plaintiff attorney', '2026-08-22', 'Open', ['Attorney']),
    ]),
    claimRec('CL-68871345-509', 'NorthGate Industrial', 'Medical Malpractice', 'Inga Halvorsen', 'Internal Injury', 'Jordan Blake', [
      homeTask('ht-7', 'Review injury evaluation update', '2026-08-26', 'Open', ['Injury Evaluation']),
    ]),
    claimRec('CL-30129567-812', 'Delmont Shipping Co.', 'Product Liability', 'Idris Osei', 'Laceration', 'Jordan Blake', [
      homeTask('ht-8', 'Request updated wage-loss documentation', '2026-09-09', 'Open', ['Wage Loss']),
    ]),
  ],
  property: [
    claimRec('CL-51298033-441', 'Harborview Apartments LLC', 'Water Damage', 'Kitchen & unit 4B flooring', 'Property', 'Casey Morgan', [
      homeTask('pt-1', 'Schedule property inspection', '2026-08-18', 'Open', ['Inspection']),
    ]),
    claimRec('CL-88213045-207', 'Redstone Retail Center', 'Wind / Hail', 'Roof & signage damage', 'Property', 'Casey Morgan', [
      homeTask('pt-2', 'Review contractor repair estimate', '2026-08-19', 'Open', ['Estimate']),
    ]),
    claimRec('CL-70094412-655', 'Colby Family Trust', 'Fire', 'Detached garage total loss', 'Property', 'Casey Morgan', [
      homeTask('pt-3', 'Follow up with public adjuster', '2026-08-20', 'Open', ['Adjuster']),
    ]),
    claimRec('CL-33018827-390', 'Fenwick Warehousing', 'Theft / Vandalism', 'Loading dock forced entry', 'Property', 'Casey Morgan', [
      homeTask('pt-4', 'Verify coverage against policy limits', '2026-08-21', 'Open', ['Coverage']),
    ]),
    claimRec('CL-62456190-018', 'Alder Creek HOA', 'Wind / Hail', 'Clubhouse siding & gutters', 'Property', 'Casey Morgan', [
      homeTask('pt-5', 'Issue settlement payment', '2026-08-24', 'Open', ['Payment']),
    ]),
    claimRec('CL-73456789-129', 'Brookfield Commons HOA', 'Water Damage', 'Basement common area flooring', 'Property', 'Casey Morgan', [
      homeTask('pt-6', 'Schedule follow-up inspection', '2026-08-25', 'Open', ['Inspection']),
    ]),
  ],
}

/* ---- metrics ---- */
export type ClaimMetric = {
  id: string
  label: string
  value: string
  support: string
  trend: string
  actionType: 'agent' | 'copilot'
  actionTitle: string
}

export const claimManagementMetrics: ClaimMetric[] = [
  { id: 'avgClaims', label: 'Avg Claims per Adjuster', value: '18.5', support: 'Team target: 16', trend: '+16% above target', actionType: 'agent', actionTitle: 'Workload Balancing Recommendation' },
  { id: 'avgLifecycle', label: 'Avg Claim Lifecycle', value: '42 days', support: 'Target: 36 days', trend: '6 days above target', actionType: 'copilot', actionTitle: 'Explain Claims Performance' },
  { id: 'openClaims', label: 'Open Claims', value: '74', support: 'Across the current team', trend: '+3 vs. last week', actionType: 'copilot', actionTitle: 'Open Claims and Status Snapshot' },
  { id: 'pastTarget', label: 'Claims Past Target Lifecycle', value: '11', support: '15% of open claims', trend: '3 need near-term review', actionType: 'agent', actionTitle: 'Daily Claims Triage Agent' },
  { id: 'newClaims', label: 'New Claims', value: '18', support: 'Current week', trend: '+12% vs. prior week', actionType: 'copilot', actionTitle: 'New Claims Trend' },
  { id: 'closureRate', label: 'Claims Closure Rate', value: '68%', support: 'Target: 72%', trend: '4 pts below target', actionType: 'copilot', actionTitle: 'Claims Closure Rate' },
  { id: 'unassignedClaims', label: 'Unassigned Claims', value: '7', support: '4 older than 24 hours', trend: '$418K incurred', actionType: 'agent', actionTitle: 'Claim Routing and Complexity' },
  { id: 'largeLoss', label: 'Large Loss Claims', value: '6', support: 'Above configured thresholds', trend: '$3.8M incurred', actionType: 'agent', actionTitle: 'Reserve and Large-Loss Review' },
  { id: 'noReserve', label: 'Open Claims Without Reserves', value: '5', support: '2 have payments', trend: '$74K paid', actionType: 'agent', actionTitle: 'Reserve / Payment Analysis' },
  { id: 'coverageQuestion', label: 'Coverage in Question', value: '9', support: '3 with payments', trend: 'Oldest: 12 days', actionType: 'copilot', actionTitle: 'Coverage-in-Question Claims' },
  { id: 'pendingFnol', label: 'Pending FNOLs', value: '8', support: 'Not yet converted to claims', trend: 'Oldest: 9 hours', actionType: 'agent', actionTitle: 'Daily Claims Triage Agent' },
  { id: 'litigationAging', label: 'Litigation Aging', value: '14', support: 'Open legal matters', trend: '4 past milestone target', actionType: 'agent', actionTitle: 'Litigation and Arbitration Review' },
  { id: 'recoveryOpportunity', label: 'Recovery Opportunity', value: '$1.2M', support: 'Potential salvage / subrogation', trend: '8 high-value candidates', actionType: 'agent', actionTitle: 'Recovery Opportunity Sweep' },
  { id: 'contactSla', label: 'Contact / SLA Performance', value: '87%', support: 'Within first-contact target', trend: '+3 pts vs. last month', actionType: 'agent', actionTitle: 'Contact and SLA Follow-up' },
  { id: 'claimSeverity', label: 'Claim Severity', value: '$31.4K', support: 'Average incurred per open claim', trend: '+5% vs. prior quarter', actionType: 'copilot', actionTitle: 'Cost, Expense, Frequency, and Severity' },
  { id: 'catExposure', label: 'CAT Exposure', value: '23', support: 'Open CAT-linked claims', trend: '$1.9M incurred', actionType: 'agent', actionTitle: 'Catastrophe Surge Response' },
]

export const FIGMA_METRIC_LABELS: Record<string, string> = {
  avgClaims: 'Avg claim per adjuster',
  avgLifecycle: 'Avg claim per lifecycle',
  openClaims: 'Open claims',
  pastTarget: 'Claims past target lifecycle',
}

export type MetricVisualization =
  | { type: 'bars'; label: string; values: number[]; categories: string[] }
  | { type: 'trend'; label: string; values: number[]; target?: number }
  | { type: 'progress'; label: string; value: number; target: number }

export const METRIC_VISUALIZATIONS: Record<string, MetricVisualization> = {
  avgClaims: { type: 'bars', label: 'Open claims by adjuster', values: [26, 14, 21, 13], categories: ['Blake', 'Morgan', 'Lee', 'Chen'] },
  avgLifecycle: { type: 'trend', label: 'Lifecycle days', values: [36, 38, 37, 40, 41, 42], target: 36 },
  openClaims: { type: 'trend', label: 'Open inventory', values: [62, 65, 64, 69, 71, 74] },
  pastTarget: { type: 'progress', label: 'Share of open claims', value: 15, target: 10 },
  newClaims: { type: 'trend', label: 'New claims per week', values: [11, 14, 12, 16, 16, 18] },
  closureRate: { type: 'progress', label: 'Closure rate', value: 68, target: 72 },
  unassignedClaims: { type: 'bars', label: 'Age of unassigned', values: [3, 2, 1, 1], categories: ['<4h', '4-12h', '12-24h', '24h+'] },
  largeLoss: { type: 'bars', label: 'Incurred band ($M)', values: [0.4, 0.9, 1.2, 1.3], categories: ['<0.5', '0.5-1', '1-1.5', '>1.5'] },
  noReserve: { type: 'progress', label: 'Share of open claims', value: 7, target: 0 },
  coverageQuestion: { type: 'trend', label: 'Open CIQ claims', values: [5, 6, 7, 8, 8, 9] },
  pendingFnol: { type: 'bars', label: 'Queue age', values: [4, 2, 1, 1], categories: ['<2h', '2-4h', '4-8h', '8h+'] },
  litigationAging: { type: 'trend', label: 'Open legal matters', values: [9, 10, 11, 12, 13, 14] },
  recoveryOpportunity: { type: 'trend', label: 'Identified ($M)', values: [0.6, 0.7, 0.9, 1.0, 1.1, 1.2] },
  contactSla: { type: 'progress', label: 'Within first-contact target', value: 87, target: 90 },
  claimSeverity: { type: 'trend', label: 'Avg incurred ($K)', values: [28.1, 29.4, 29.0, 30.2, 30.8, 31.4] },
  catExposure: { type: 'trend', label: 'CAT-linked claims', values: [0, 4, 9, 15, 19, 23] },
}

export const workloadRows = [
  { name: 'Jordan Blake', current: 26, complexity: 'High', projected: 21 },
  { name: 'Casey Morgan', current: 14, complexity: 'Moderate', projected: 17 },
  { name: 'Morgan Lee', current: 21, complexity: 'High', projected: 18 },
  { name: 'Avery Chen', current: 13, complexity: 'Moderate', projected: 18 },
]

export const workloadMoves = [
  { claim: 'CL-11024478-390', from: 'Jordan Blake', to: 'Casey Morgan', reason: 'Low-complexity follow-up work and available capacity' },
  { claim: 'CL-23456789-064', from: 'Jordan Blake', to: 'Avery Chen', reason: 'Routine attorney follow-up with no active litigation' },
  { claim: 'CL-70094412-655', from: 'Morgan Lee', to: 'Avery Chen', reason: 'Property follow-up aligns with available workload' },
]

export const escalations = [
  { claim: 'CL-23456789-064', description: 'Attorney representation was received more than 30 days after the claim opened.' },
  { claim: 'CL-90345612-221', description: 'Projected injury exposure is approaching the available policy limit.' },
  { claim: 'CL-88213045-207', description: 'A newly ingested insured email contains language consistent with a service complaint.' },
]

/* ---- approvals ---- */
export type HomeApproval = {
  id: string
  requested: string
  type: 'Reserve' | 'Payment'
  amount: number
  claim: string
  feature: string
  requestor: string
  reason: string
  notes: HomeNote[]
  attachments: { name: string; type: string; date: string }[]
  status: 'Pending' | 'Approved' | 'Rejected'
  decisionComment?: string
}

export const initialApprovals: HomeApproval[] = [
  {
    id: 'ap-1',
    requested: '2026-08-11',
    type: 'Reserve',
    amount: 75000,
    claim: 'CL-90345612-221',
    feature: 'Ivy Okafor · Bodily Injury',
    requestor: 'Jordan Blake',
    reason: 'Adjuster Limits',
    notes: [{ author: 'Jordan Blake', date: 'Aug 11, 2026', text: 'Updated medical evaluation supports the reserve increase.' }],
    attachments: [{ name: 'Reserve_Evaluation.pdf', type: 'Evaluation', date: 'Aug 11, 2026' }],
    status: 'Pending',
  },
  {
    id: 'ap-2',
    requested: '2026-08-14',
    type: 'Payment',
    amount: 42000,
    claim: 'CL-62456190-018',
    feature: 'Clubhouse siding & gutters',
    requestor: 'Casey Morgan',
    reason: 'Policy Limits',
    notes: [{ author: 'Casey Morgan', date: 'Aug 14, 2026', text: 'Settlement requires supervisor approval due to payment authority.' }],
    attachments: [
      { name: 'Settlement_Summary.pdf', type: 'Settlement', date: 'Aug 14, 2026' },
      { name: 'Contractor_Estimate.pdf', type: 'Estimate', date: 'Aug 12, 2026' },
    ],
    status: 'Pending',
  },
]

/** Joan's claim alerts for the home section. Active is the error row; inactive is the success row. */
export type HomeClaimAlert = { id: string; claimNumber: string; description: string; active: boolean }
export const claimAlerts: HomeClaimAlert[] = [
  {
    id: 'ca-1',
    claimNumber: 'CL-90345612-221',
    description: 'Projected injury exposure is approaching the available policy limit.',
    active: true,
  },
  {
    id: 'ca-2',
    claimNumber: 'CL-40218856-002',
    description: 'Claim has an open task more than 10 days past due.',
    active: false,
  },
]

/* ---- claim helpers ---- */
type WithWork = { tasks?: HomeTask[]; milestones?: HomeMilestone[] }
export const openTasks = (c: WithWork) => (c.tasks ?? []).filter((t) => t.status === 'Open')
export const nextOpenTask = (c: WithWork) =>
  [...openTasks(c)].sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0] ?? null
export const nextMilestone = (c: WithWork) =>
  (c.milestones ?? [])
    .filter((m) => m.status !== 'complete')
    .sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'))[0] ?? null
export const sortedClaims = (items: HomeClaim[]) =>
  [...items].sort((a, b) => (nextOpenTask(a)?.dueDate || '9999').localeCompare(nextOpenTask(b)?.dueDate || '9999'))
export const featureName = (f: HomeFeature) => `${f.featureNumber} - ${f.subject} - ${f.coverage}`

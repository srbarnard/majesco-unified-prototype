/**
 * Claim details content.
 * Home claims, alerts, and approvals come from the existing claims home sample.
 * CL-77451209-104 is the commercial auto claim in Joan's data.js, including its financials.
 * Missing money stays null. Nothing here adds a claim number or an amount that is not in those sources.
 */
import {
  HOME_PERSONA,
  claimAlerts,
  homeClaims,
  humanDue,
  initialApprovals,
  type HomeClaim,
  type HomeFeature,
} from '@/app/data/claimsHomeMock'
import type { ClaimRecord } from '@/pages/claims/data/claimsStore'
import { sc } from '@/pages/claims/data/sentenceCase'

export type CollabTask = {
  id: string
  status: 'Open' | 'Completed'
  description: string
  assignedTo: string
  dueLabel: string
  tags: string[]
  featureId: string | null
}

export type CollabNote = {
  id: string
  author: string
  date: string
  text: string
  tags: string[]
  featureId: string | null
}

export type CollabEmail = {
  id: string
  subject: string
  sender: string
  recipients: string
  timestamp: string
  direction: 'Inbound' | 'Outbound'
  featureLabel: string
  preview: string
  status: string
  tags: string[]
  attachmentCount: number
}

export type CollabDocument = {
  id: string
  name: string
  type: string
  uploadedBy: string
  date: string
  tags: string[]
  featureId: string | null
}

export type ClaimParty = {
  name: string
  type: string
  role: string
  contact: string
  feature: string
}

export type FeatureCard = { title: string; fields: { label: string; value: string }[] }

export type FeatureFinancials = {
  lossReserve: number | null
  lossPaid: number | null
  expenseReserve: number | null
  expensePaid: number | null
  recovered: number | null
}

export type DetailFeature = {
  id: string
  featureNumber: number
  status: string
  displayName: string
  kind: 'injury' | 'vehicle' | 'property'
  adjusterName: string
  adjusterContact: string
  mine: boolean
  cards: FeatureCard[]
  milestones: { label: string; status: string }[]
  financials: FeatureFinancials
  litigation: boolean
}

export type PolicyCoverage = { name: string; limit: number; limitType: string; consumed: number }
export type PolicyHistoryRow = { claim: string; dateOfLoss: string; type: string; status: string; paid: string }
export type PolicyFormRow = { form: string; description: string; edition: string; status: string }
export type ClaimAlertRow = { id: string; description: string; active: boolean }
export type ClaimInsight = { type: string; description: string }
export type PendingApproval = { id: string; type: 'Reserve' | 'Payment'; amount: number; feature: string; status: string; reason: string }

export type ClaimDetailModel = {
  claimNumber: string
  insured: string
  claimType: string
  status: string
  dateOfLoss: string | null
  dateReported: string | null
  lossDescription: string | null
  owner: string
  policyNumber: string | null
  policyType: string | null
  policyEffective: string | null
  policyExpiration: string | null
  coverages: PolicyCoverage[]
  policyHistory: PolicyHistoryRow[]
  forms: PolicyFormRow[]
  alerts: ClaimAlertRow[]
  insights: ClaimInsight[]
  features: DetailFeature[]
  tasks: CollabTask[]
  notes: CollabNote[]
  emails: CollabEmail[]
  documents: CollabDocument[]
  parties: ClaimParty[]
  approvals: PendingApproval[]
}

const emptyMoney = (): FeatureFinancials => ({
  lossReserve: null,
  lossPaid: null,
  expenseReserve: null,
  expensePaid: null,
  recovered: null,
})

export function money(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return `$${value.toLocaleString('en-US')}`
}

export function sumMoney(values: Array<number | null>): number | null {
  if (values.every((value) => value == null)) return null
  return values.reduce<number>((total, value) => total + (value ?? 0), 0)
}

function featureFinancials(features: DetailFeature[], key: keyof FeatureFinancials): number | null {
  return sumMoney(features.map((feature) => feature.financials[key]))
}

export function claimFinancials(detail: ClaimDetailModel): FeatureFinancials & { incurred: number | null } {
  const lossReserve = featureFinancials(detail.features, 'lossReserve')
  const lossPaid = featureFinancials(detail.features, 'lossPaid')
  const expenseReserve = featureFinancials(detail.features, 'expenseReserve')
  const expensePaid = featureFinancials(detail.features, 'expensePaid')
  const recovered = featureFinancials(detail.features, 'recovered')
  const incurred =
    lossReserve == null && lossPaid == null && recovered == null
      ? null
      : (lossReserve ?? 0) + (lossPaid ?? 0) - (recovered ?? 0)
  return { lossReserve, lossPaid, expenseReserve, expensePaid, recovered, incurred }
}

export function incurredFor(financials: FeatureFinancials): number | null {
  if (financials.lossReserve == null && financials.lossPaid == null && financials.recovered == null) return null
  return (financials.lossReserve ?? 0) + (financials.lossPaid ?? 0) - (financials.recovered ?? 0)
}

function homeDetail(claim: HomeClaim): ClaimDetailModel {
  const approvals = initialApprovals.filter((approval) => approval.claim === claim.claim)
  const alerts = claimAlerts
    .filter((alert) => alert.claimNumber === claim.claim)
    .map((alert) => ({ id: alert.id, description: alert.description, active: alert.active }))
  const features = claim.features.map((feature) => homeFeature(claim, feature))
  const tasks: CollabTask[] = claim.features.flatMap((feature) =>
    feature.tasks.map((task) => ({
      id: task.id,
      status: task.status === 'Closed' ? 'Completed' : 'Open',
      description: task.description,
      assignedTo: task.assignedTo || claim.assignee,
      dueLabel: humanDue(task.dueDate),
      tags: task.tags,
      featureId: feature.id,
    })),
  )
  const notes: CollabNote[] = [
    ...claim.notes.map((note, index) => ({
      id: `${claim.claim}-note-${index}`,
      author: note.author,
      date: note.date,
      text: note.text,
      tags: ['Claim'],
      featureId: null,
    })),
    ...claim.features.flatMap((feature) =>
      feature.notes.map((note, index) => ({
        id: `${feature.id}-note-${index}`,
        author: note.author,
        date: note.date,
        text: note.text,
        tags: [sc(feature.coverage)],
        featureId: feature.id,
      })),
    ),
  ]
  const documents: CollabDocument[] = approvals.flatMap((approval) =>
    approval.attachments.map((file, index) => ({
      id: `${approval.id}-file-${index}`,
      name: file.name,
      type: file.type,
      uploadedBy: approval.requestor,
      date: file.date,
      tags: [approval.type],
      featureId: null,
    })),
  )
  const nextTask = tasks.find((task) => task.status === 'Open')
  const insights: ClaimInsight[] = [
    ...alerts.map((alert) => ({ type: alert.active ? 'Attention' : 'Inactive', description: alert.description })),
    ...(nextTask ? [{ type: 'Next task', description: nextTask.description }] : []),
  ]
  return {
    claimNumber: claim.claim,
    insured: claim.insured,
    claimType: claim.type,
    status: 'Open',
    dateOfLoss: null,
    dateReported: null,
    lossDescription: `${sc(claim.type)} · ${claim.detail}`,
    owner: claim.assignee,
    policyNumber: null,
    policyType: null,
    policyEffective: null,
    policyExpiration: null,
    coverages: [],
    policyHistory: [],
    forms: [],
    alerts,
    insights,
    features,
    tasks,
    notes,
    emails: [],
    documents,
    parties: homeParties(claim),
    approvals: approvals.map((approval) => ({
      id: approval.id,
      type: approval.type,
      amount: approval.amount,
      feature: approval.feature,
      status: approval.status,
      reason: approval.reason,
    })),
  }
}

function homeFeature(claim: HomeClaim, feature: HomeFeature): DetailFeature {
  const coverage = sc(feature.coverage)
  return {
    id: feature.id,
    featureNumber: feature.featureNumber,
    status: feature.featureStatus,
    displayName: `${feature.featureNumber} - ${feature.subject} - ${coverage}`,
    kind: feature.typeIcon === 'home_work' ? 'property' : 'injury',
    adjusterName: feature.assignedTo,
    adjusterContact: '',
    mine: feature.assignedTo === HOME_PERSONA.name,
    milestones: feature.milestones.map((milestone) => ({
      label: sc(milestone.label),
      status: milestone.status === 'complete' ? 'Complete' : 'In progress',
    })),
    financials: emptyMoney(),
    litigation: false,
    cards: [
      {
        title: 'Coverage details',
        fields: [
          { label: 'Coverage', value: coverage },
          { label: 'Coverage status', value: feature.featureStatus },
        ],
      },
      {
        title: claim.detailType === 'Property' ? 'Property details' : 'Injury details',
        fields: [
          { label: claim.detailType === 'Property' ? 'Property' : 'Injured party', value: feature.subject },
          { label: 'Claim type', value: claim.type },
        ],
      },
    ],
  }
}

function homeParties(claim: HomeClaim): ClaimParty[] {
  return [
    { name: claim.insured, type: 'Organization', role: 'Insured', contact: '—', feature: 'Claim level' },
    { name: claim.assignee, type: 'Person', role: 'Adjuster', contact: '—', feature: 'Claim level' },
    ...claim.features.map((feature) => ({
      name: feature.subject,
      type: claim.detailType === 'Property' ? 'Property' : 'Person',
      role: claim.detailType === 'Property' ? 'Damaged property' : 'Injured party',
      contact: '—',
      feature: `${feature.featureNumber} - ${feature.subject}`,
    })),
  ]
}

type JoanMoney = { lossReserve: number; lossPaid: number; expenseReserve: number; expensePaid: number }

function joanMoney(financials: JoanMoney): FeatureFinancials {
  return { ...financials, recovered: 0 }
}

const JOAN_CLAIM = 'CL-77451209-104'

function joanDetail(): ClaimDetailModel {
  const lossPaid = 12300
  const features: DetailFeature[] = [
    joanInjury({
      id: 'inj-1',
      featureNumber: 1,
      subject: 'Marcus Webb',
      coverage: 'Medical Payments',
      limit: 10000,
      cause: 'Whiplash / Soft Tissue',
      description:
        'Driver of insured vehicle reports neck and lower back pain following the collision. Evaluated on-site by EMS, declined transport.',
      adjuster: 'Jordan Blake · jblake@insurer.com · (555) 201-3344',
      financials: { lossReserve: 2500, lossPaid: 0, expenseReserve: 500, expensePaid: 150 },
      exposure: '$7,500 - $10,000',
      medicare: 'Eligible',
      isoStatus: 'Match',
      isoRisk: 'Low Risk',
      litigation: null,
      milestones: [
        ['Contact', 'Complete'],
        ['Medicare reporting', 'Complete'],
        ['Injury evaluation', 'Complete'],
        ['Coverage and financials', 'Complete'],
        ['30 day follow up', 'In progress'],
      ],
    }),
    joanInjury({
      id: 'inj-2',
      featureNumber: 2,
      subject: 'Pam Paulsen',
      coverage: 'Bodily Injury Liability',
      limit: 500000,
      cause: 'Broken Bone',
      description:
        'Driver of the third-party vehicle sustained a fractured wrist bracing for impact. Currently in a cast, ongoing orthopedic follow-up.',
      adjuster: 'Jordan Blake · jblake@insurer.com · (555) 201-3344',
      financials: { lossReserve: 55000, lossPaid: 0, expenseReserve: 8000, expensePaid: 2400 },
      exposure: '$50,000 - $60,000',
      medicare: 'Pending response',
      isoStatus: 'No Match',
      isoRisk: 'No Risk',
      litigation: 'Open',
      milestones: [
        ['Contact', 'Complete'],
        ['Medicare reporting', 'In progress'],
        ['Injury evaluation', 'Complete'],
        ['Coverage and financials', 'Complete'],
        ['30 day follow up', 'Not started'],
      ],
    }),
    joanVehicle({
      id: 'veh-1',
      featureNumber: 3,
      status: 'Closed',
      year: '2023',
      make: 'Freightliner',
      model: 'Cascadia',
      owner: 'ABC Trucking',
      driver: 'Marcus Webb',
      coverage: 'Collision',
      limit: 50000,
      adjuster: 'Jordan Blake · jblake@insurer.com · (555) 201-3344',
      financials: { lossReserve: 0, lossPaid: 12300, expenseReserve: 0, expensePaid: 350 },
      inspection: 'Completed',
      appraiser: 'ABC Appraisals',
      damages: '$12,300',
      isoStatus: 'Match',
      isoRisk: 'Low Risk',
      milestones: [
        ['Contact', 'Complete'],
        ['Inspection scheduled', 'Complete'],
        ['Estimate review', 'Complete'],
        ['Coverage and financials', 'Complete'],
        ['Settle', 'In progress'],
      ],
    }),
    joanVehicle({
      id: 'veh-2',
      featureNumber: 4,
      status: 'Open',
      year: '2021',
      make: 'Honda',
      model: 'Accord',
      owner: 'Pam Paulsen',
      driver: 'Pam Paulsen',
      coverage: 'Property Damage Liability',
      limit: 250000,
      adjuster: 'Casey Morgan · cmorgan@insurer.com · (555) 402-8871',
      financials: { lossReserve: 9800, lossPaid: 0, expenseReserve: 600, expensePaid: 0 },
      inspection: 'Pending',
      appraiser: 'Pending Assignment',
      damages: 'TBD',
      isoStatus: 'Not Submitted',
      isoRisk: '—',
      milestones: [
        ['Contact', 'Complete'],
        ['Inspection scheduled', 'In progress'],
        ['Estimate review', 'Not started'],
        ['Coverage and financials', 'Complete'],
        ['Settle', 'Not started'],
      ],
    }),
  ]

  return {
    claimNumber: JOAN_CLAIM,
    insured: 'ABC Trucking',
    claimType: 'Collision',
    status: 'Open',
    dateOfLoss: 'Jun 14, 2026',
    dateReported: 'Jun 16, 2026',
    lossDescription:
      "Insured's commercial vehicle rear-ended a passenger vehicle at a signalized intersection during evening rush hour. Both drivers reported pain at the scene; both vehicles sustained damage requiring inspection.",
    owner: 'Jordan Blake',
    policyNumber: '01-5550005-03',
    policyType: 'Occurrence',
    policyEffective: 'Feb 1, 2026',
    policyExpiration: 'Jan 31, 2027',
    coverages: [
      { name: 'Bodily Injury Liability', limit: 500000, limitType: 'Per-Occurrence', consumed: 12300 },
      { name: 'Property Damage Liability', limit: 250000, limitType: 'Per-Occurrence', consumed: 8750 },
      { name: 'Collision', limit: 50000, limitType: 'Per-Occurrence', consumed: 6400 },
      { name: 'Comprehensive', limit: 50000, limitType: 'Per-Occurrence', consumed: 0 },
      { name: 'Medical Payments', limit: 10000, limitType: 'Per-Occurrence', consumed: 1850 },
    ],
    policyHistory: [
      { claim: 'CL-62190418-087', dateOfLoss: 'Oct 18, 2024', type: 'Commercial auto', status: 'Closed', paid: '$18,450' },
      { claim: 'CL-50811372-041', dateOfLoss: 'Mar 3, 2023', type: 'Commercial auto', status: 'Closed', paid: '$6,275' },
      { claim: JOAN_CLAIM, dateOfLoss: 'Jun 14, 2026', type: 'Collision', status: 'Open', paid: money(lossPaid) },
    ],
    forms: [
      { form: 'CA 00 01', description: 'Business auto coverage form', edition: '01/2026', status: 'Active' },
      { form: 'CA 99 10', description: 'Drive other car coverage', edition: '01/2026', status: 'Active' },
      { form: 'IL 00 17', description: 'Common policy conditions', edition: '11/1998', status: 'Active' },
    ],
    alerts: [
      { id: 'alert-demo-1', description: 'Claim reported within 30 days of policy inception.', active: true },
      { id: 'alert-demo-2', description: 'Multiple bodily injury exposures are present on the same loss.', active: false },
    ],
    insights: [
      {
        type: 'Attention',
        description: 'Medicare status is Eligible — no further CMS action required for 1 - Marcus Webb - Medical payments.',
      },
      {
        type: 'Litigation',
        description: 'Feature 2 - Pam Paulsen - Bodily injury liability has an active litigation record that should remain visible in claim handling.',
      },
      {
        type: 'Opportunity',
        description: 'Consider fast-track settlement under Medical payments coverage based on the current feature information.',
      },
    ],
    features,
    tasks: joanTasks(),
    notes: joanNotes(),
    emails: joanEmails(),
    documents: joanDocuments(),
    parties: [
      { name: 'ABC Trucking', type: 'Organization', role: 'Insured', contact: 'dispatch@abctrucking.example · (555) 310-4400', feature: 'Claim level' },
      { name: 'Bluegrass Mutual Agency', type: 'Organization', role: 'Agent', contact: 'service@bluegrassagency.example · (555) 310-4410', feature: 'Claim level' },
      { name: 'Jamie Hart', type: 'Person', role: 'Producer', contact: 'jamie.hart@producer.example · (502) 555-0182', feature: 'Claim level' },
      { name: 'Marcus Webb', type: 'Person', role: 'Injured party / Driver', contact: '(555) 555-0118', feature: 'Medical payments · 2023 Freightliner Cascadia' },
      { name: 'Pam Paulsen', type: 'Person', role: 'Injured party / Driver / Vehicle owner', contact: '(555) 555-0172', feature: 'Bodily injury liability · 2021 Honda Accord' },
      { name: 'Lisa B @ M&M', type: 'Organization', role: 'Plaintiff attorney', contact: '(123) 456-7890 x 981', feature: 'Pam Paulsen' },
      { name: 'John C @ Morris LLP', type: 'Organization', role: 'Defense attorney', contact: '(999) 813-7658', feature: 'Pam Paulsen' },
      { name: 'ABC Appraisals', type: 'Organization', role: 'Appraiser / Vendor', contact: 'Vendor contact on file', feature: '2023 Freightliner Cascadia' },
    ],
    approvals: [],
  }
}

function splitAdjuster(value: string) {
  const [name, ...rest] = value.split(' · ')
  return { name, contact: rest.join(' · ') }
}

function joanInjury(input: {
  id: string
  featureNumber: number
  subject: string
  coverage: string
  limit: number
  cause: string
  description: string
  adjuster: string
  financials: JoanMoney
  exposure: string
  medicare: string
  isoStatus: string
  isoRisk: string
  litigation: string | null
  milestones: [string, string][]
}): DetailFeature {
  const adjuster = splitAdjuster(input.adjuster)
  const coverage = sc(input.coverage)
  return {
    id: input.id,
    featureNumber: input.featureNumber,
    status: 'Open',
    displayName: `${input.featureNumber} - ${input.subject} - ${coverage}`,
    kind: 'injury',
    adjusterName: adjuster.name,
    adjusterContact: adjuster.contact,
    mine: adjuster.name === HOME_PERSONA.name,
    financials: joanMoney(input.financials),
    litigation: input.litigation != null,
    milestones: input.milestones.map(([label, status]) => ({ label: sc(label), status })),
    cards: [
      {
        title: 'Coverage details',
        fields: [
          { label: 'Coverage', value: coverage },
          { label: 'Coverage limit', value: money(input.limit) },
          { label: 'Limit type', value: 'Per-occurrence' },
        ],
      },
      {
        title: 'Financials',
        fields: [
          { label: 'Loss reserve', value: money(input.financials.lossReserve) },
          { label: 'Loss paid', value: money(input.financials.lossPaid) },
          { label: 'Expense reserve', value: money(input.financials.expenseReserve) },
          { label: 'Expense paid', value: money(input.financials.expensePaid) },
        ],
      },
      {
        title: 'Injury details',
        fields: [
          { label: 'Injured party', value: input.subject },
          { label: 'Injury', value: sc(input.cause) },
          { label: 'Injury description', value: input.description },
        ],
      },
      {
        title: 'Injury evaluation',
        fields: [{ label: 'Estimated exposure', value: input.exposure }],
      },
      {
        title: 'Medicare reporting',
        fields: [{ label: 'Medicare status', value: input.medicare }],
      },
      {
        title: 'ISO claim search',
        fields: [
          { label: 'Status', value: input.isoStatus },
          { label: 'Risk profile indicator', value: input.isoRisk },
        ],
      },
      ...(input.litigation
        ? [{ title: 'Litigation details', fields: [{ label: 'Status', value: input.litigation }] }]
        : []),
    ],
  }
}

function joanVehicle(input: {
  id: string
  featureNumber: number
  status: string
  year: string
  make: string
  model: string
  owner: string
  driver: string
  coverage: string
  limit: number
  adjuster: string
  financials: JoanMoney
  inspection: string
  appraiser: string
  damages: string
  isoStatus: string
  isoRisk: string
  milestones: [string, string][]
}): DetailFeature {
  const adjuster = splitAdjuster(input.adjuster)
  const coverage = sc(input.coverage)
  const vehicle = `${input.year} ${input.make} ${input.model}`
  return {
    id: input.id,
    featureNumber: input.featureNumber,
    status: input.status,
    displayName: `${input.featureNumber} - ${vehicle} - ${coverage}`,
    kind: 'vehicle',
    adjusterName: adjuster.name,
    adjusterContact: adjuster.contact,
    mine: adjuster.name === HOME_PERSONA.name,
    financials: joanMoney(input.financials),
    litigation: false,
    milestones: input.milestones.map(([label, status]) => ({ label: sc(label), status })),
    cards: [
      {
        title: 'Vehicle details',
        fields: [
          { label: 'Year', value: input.year },
          { label: 'Make', value: input.make },
          { label: 'Model', value: input.model },
          { label: 'Owner', value: input.owner },
          { label: 'Driver', value: input.driver },
        ],
      },
      {
        title: 'Coverage details',
        fields: [
          { label: 'Coverage', value: coverage },
          { label: 'Coverage limit', value: money(input.limit) },
          { label: 'Limit type', value: 'Per-occurrence' },
        ],
      },
      {
        title: 'Financials',
        fields: [
          { label: 'Loss reserve', value: money(input.financials.lossReserve) },
          { label: 'Loss paid', value: money(input.financials.lossPaid) },
          { label: 'Expense reserve', value: money(input.financials.expenseReserve) },
          { label: 'Expense paid', value: money(input.financials.expensePaid) },
        ],
      },
      {
        title: 'Inspections and appraisals',
        fields: [
          { label: 'Inspection status', value: input.inspection },
          { label: 'Appraiser', value: input.appraiser },
          { label: 'Estimate amount', value: input.damages },
        ],
      },
      {
        title: 'ISO claim search',
        fields: [
          { label: 'Status', value: input.isoStatus },
          { label: 'Risk profile indicator', value: input.isoRisk },
        ],
      },
    ],
  }
}

function task(
  id: string,
  status: 'Open' | 'Completed',
  description: string,
  assignedTo: string,
  dueLabel: string,
  tags: string[],
  featureId: string | null,
): CollabTask {
  return { id, status, description, assignedTo, dueLabel, tags: tags.map(sc), featureId }
}

function joanTasks(): CollabTask[] {
  return [
    task('claim-task-1', 'Open', 'Review overall liability strategy', 'Jordan Blake', 'Jul 22, 2026', ['Claim', 'Liability'], null),
    task('claim-task-2', 'Completed', 'Confirm insured contact information', 'Claims Intake', 'Jun 17, 2026', ['Claim', 'Contact'], null),
    task('task-inj1-medpay-1', 'Open', 'Complete 30 day medical follow-up', 'Jordan Blake', '2 days overdue', ['Medical Payments', 'Injury Evaluation'], 'inj-1'),
    task('task-inj1-medpay-2', 'Open', 'Request updated treatment status', 'Injury Claims Team', 'Jul 23, 2026', ['Medical Payments', 'Notes'], 'inj-1'),
    task('task-inj1-medpay-3', 'Completed', 'Verify Medicare eligibility', 'Jordan Blake', 'Jul 10, 2026', ['Medicare Reporting'], 'inj-1'),
    task('task-inj2-bi-1', 'Open', 'Follow up on pending CMS response', 'Jordan Blake', '3 days overdue', ['Bodily Injury Liability', 'Medicare Reporting'], 'inj-2'),
    task('task-inj2-bi-2', 'Open', 'Send updated wage-loss documentation', 'Jordan Blake', 'Today', ['Bodily Injury Liability', 'Litigation', 'Attachments'], 'inj-2'),
    task('task-inj2-bi-3', 'Open', 'Review injury evaluation exposure', 'Complex Injury Group', 'Jul 22, 2026', ['Bodily Injury Liability', 'Injury Evaluation'], 'inj-2'),
    task('task-inj2-bi-4', 'Completed', 'Initial attorney contact', 'Jordan Blake', 'Jun 17, 2026', ['Litigation', 'Notes'], 'inj-2'),
    task('task-veh1-collision-1', 'Open', 'Confirm final repair payment cleared', 'Casey Morgan', 'Tomorrow', ['Collision', 'Financials'], 'veh-1'),
    task('task-veh1-collision-2', 'Open', 'Prepare vehicle feature for closure', 'Property Claims Team', 'Jul 24, 2026', ['Collision', 'Inspection', 'Notes'], 'veh-1'),
    task('task-veh1-collision-3', 'Completed', 'Upload final repair invoice', 'Casey Morgan', 'Jun 24, 2026', ['Collision', 'Attachments'], 'veh-1'),
    task('task-veh2-pd-1', 'Open', 'Schedule vehicle inspection', 'Casey Morgan', '4 days overdue', ['Property Damage Liability', 'Inspection'], 'veh-2'),
    task('task-veh2-pd-2', 'Completed', 'Assign appraisal vendor', 'Property Claims Team', 'Jul 15, 2026', ['Property Damage Liability', 'Inspection'], 'veh-2'),
  ]
}

function joanNotes(): CollabNote[] {
  const row = (id: string, author: string, date: string, text: string, featureId: string | null, tags: string[]): CollabNote => ({
    id,
    author,
    date,
    text,
    tags,
    featureId,
  })
  return [
    row('claim-note-1', 'Claims Intake', 'Jun 16, 2026', 'Claim opened from first notice of loss and routed to Commercial auto.', null, ['Claim']),
    row('inj-1-n1', 'Jordan Blake', 'Jun 18, 2026', 'Spoke with claimant by phone — pain has improved since the ER visit, following up with primary care next week.', 'inj-1', ['Medical payments']),
    row('inj-1-n2', 'Jordan Blake', 'Jun 16, 2026', 'Reviewed EMS report from scene. No transport, declined further eval at time of loss.', 'inj-1', ['Medical payments']),
    row('inj-2-n1', 'Jordan Blake', 'Jul 19, 2026', 'Plaintiff attorney requesting updated wage-loss documentation. Follow-up call scheduled.', 'inj-2', ['Bodily injury liability']),
    row('inj-2-n2', 'Jordan Blake', 'Jul 12, 2026', 'Orthopedic follow-up shows cast remaining another 3 weeks. Estimate range unchanged.', 'inj-2', ['Bodily injury liability']),
    row('inj-2-n3', 'Jordan Blake', 'Jun 28, 2026', 'Medicare eligibility inquiry submitted to CMS; response still pending.', 'inj-2', ['Medicare']),
    row('inj-2-n4', 'Jordan Blake', 'Jun 17, 2026', "Initial contact with claimant's attorney. Litigation opened, defense counsel assigned.", 'inj-2', ['Litigation']),
    row('veh-1-n1', 'Casey Morgan', 'Jun 24, 2026', 'Repair completed at ABC Appraisals shop, final invoice matches estimate.', 'veh-1', ['Collision']),
  ]
}

function joanEmails(): CollabEmail[] {
  return [
    {
      id: 'email-1',
      subject: 'Updated wage loss request',
      sender: 'Lisa B <lisa.b@example.test>',
      recipients: 'Jordan Blake',
      timestamp: 'Jul 19, 2026 · 3:42 PM',
      direction: 'Inbound',
      featureLabel: 'Pam Paulsen · Bodily injury liability',
      preview: 'Please provide the updated wage-loss documentation discussed during our call.',
      status: 'Action needed',
      tags: ['Attorney', 'Attachments', 'Wage loss'],
      attachmentCount: 1,
    },
    {
      id: 'email-2',
      subject: 'Vehicle repair invoice confirmation',
      sender: 'Casey Morgan',
      recipients: 'ABC Appraisals',
      timestamp: 'Jun 24, 2026 · 11:18 AM',
      direction: 'Outbound',
      featureLabel: '2023 Freightliner Cascadia · Collision',
      preview: 'Confirming receipt of the final repair invoice and payment documentation.',
      status: 'Read',
      tags: ['Vendor', 'Financials'],
      attachmentCount: 1,
    },
    {
      id: 'email-3',
      subject: 'Claim acknowledgment',
      sender: 'Claims Intake',
      recipients: 'ABC Trucking',
      timestamp: 'Jun 16, 2026 · 9:08 AM',
      direction: 'Outbound',
      featureLabel: 'Claim level',
      preview: 'Your commercial auto claim has been received and assigned for handling.',
      status: 'Read',
      tags: ['Insured', 'Claim'],
      attachmentCount: 0,
    },
  ]
}

function joanDocuments(): CollabDocument[] {
  const row = (id: string, name: string, type: string, uploadedBy: string, date: string, featureId: string | null): CollabDocument => ({
    id,
    name,
    type,
    uploadedBy,
    date,
    tags: featureId ? [] : ['Claim'],
    featureId,
  })
  return [
    row('doc-fnol', 'FNOL_Report.pdf', 'Claim document', 'Claims Intake', 'Jun 16, 2026', null),
    row('doc-ems', 'EMS_Scene_Report.pdf', 'Medical record', 'Jordan Blake', 'Jun 16, 2026', 'inj-1'),
    row('doc-ortho', 'Orthopedic_Followup_0712.pdf', 'Medical record', 'Jordan Blake', 'Jul 12, 2026', 'inj-2'),
    row('doc-wage', 'Wage_Loss_Request.pdf', 'Correspondence', 'Lisa B (Plaintiff Atty)', 'Jul 19, 2026', 'inj-2'),
    row('doc-er', 'ER_Xray_Report.pdf', 'Medical record', 'Jordan Blake', 'Jun 17, 2026', 'inj-2'),
    row('doc-est', 'Repair_Estimate_ABC.pdf', 'Estimate', 'Casey Morgan', 'Jun 19, 2026', 'veh-1'),
    row('doc-inv', 'Final_Invoice.pdf', 'Invoice', 'Casey Morgan', 'Jun 24, 2026', 'veh-1'),
    row('doc-photos', 'Loss_Photos.zip', 'Photos', 'Casey Morgan', 'Jun 16, 2026', 'veh-2'),
  ]
}

const catalog = new Map<string, ClaimDetailModel>(
  [...homeClaims.injury, ...homeClaims.property].map((claim) => [claim.claim, homeDetail(claim)]),
)
catalog.set(JOAN_CLAIM, joanDetail())

export function claimDetailFromCatalog(claimNumber: string): ClaimDetailModel | null {
  return catalog.get(claimNumber) ?? null
}

export function claimDetailFromStore(record: ClaimRecord): ClaimDetailModel {
  return {
    claimNumber: record.claimNumber,
    insured: record.insured,
    claimType: record.product,
    status: record.status,
    dateOfLoss: record.dateOfLoss || null,
    dateReported: null,
    lossDescription: record.description,
    owner: record.assignee,
    policyNumber: record.policyNumber,
    policyType: null,
    policyEffective: null,
    policyExpiration: null,
    coverages: [],
    policyHistory: [],
    forms: [],
    alerts: [],
    insights: record.description ? [{ type: 'Loss', description: record.description }] : [],
    features: [],
    tasks: record.tasks.map((task) => ({
      id: task.id,
      status: 'Open',
      description: task.title,
      assignedTo: task.assignee,
      dueLabel: task.dueLabel,
      tags: [],
      featureId: null,
    })),
    notes: record.notes.map((note) => ({
      id: note.id,
      author: record.assignee,
      date: note.at,
      text: note.text,
      tags: ['Claim'],
      featureId: null,
    })),
    emails: [],
    documents: [],
    parties: [
      { name: record.insured, type: 'Organization', role: 'Insured', contact: '—', feature: 'Claim level' },
      { name: record.assignee, type: 'Person', role: 'Adjuster', contact: '—', feature: 'Claim level' },
    ],
    approvals: [],
  }
}

export function featureNameById(detail: ClaimDetailModel, featureId: string | null): string {
  if (!featureId) return 'Claim level'
  return detail.features.find((feature) => feature.id === featureId)?.displayName ?? 'Claim level'
}

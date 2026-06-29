export type PolicyDocument = {
  id: string
  fileName: string
  name: string
  kind: 'Document' | 'Form' | 'Package'
  description: string
  aiSummary: string
  tags: string[]
  author: string
  authorDetail: string
  date: string
  relativeTime: string
  activityLabel: string
  activityCount: number
}

export const policyDocumentsMock: PolicyDocument[] = [
  {
    id: 'doc-1',
    fileName: 'renewal_proposal_2026.pdf',
    name: 'renewal_proposal_2026.pdf',
    kind: 'Document',
    description: 'Renewal proposal package for 2026 term.',
    aiSummary: 'Proposes 22% premium hike to $594,800 with updated fleet schedule.',
    tags: ['2026 Renewal'],
    author: 'Maria Alvarez',
    authorDetail: 'Lockton broker portal',
    date: '2026-05-13',
    relativeTime: '2h ago',
    activityLabel: 'Policy',
    activityCount: 0,
  },
  {
    id: 'doc-2',
    fileName: 'vehicle_package_2026.pdf',
    name: 'Vehicle Package 2026',
    kind: 'Package',
    description: 'Package containing 4 vehicle schedule documents.',
    aiSummary: 'Fleet package with 4 attached vehicle schedules.',
    tags: ['Package', '2026 Renewal'],
    author: 'Maria Alvarez',
    authorDetail: 'maria.alvarez@lockton.com',
    date: '2026-05-13',
    relativeTime: '2h ago',
    activityLabel: 'Endorsement',
    activityCount: 4,
  },
  {
    id: 'doc-3',
    fileName: 'endorsement_ai_west_coast.pdf',
    name: 'endorsement_ai_west_coast.pdf',
    kind: 'Document',
    description: 'Additional insured endorsement for West Coast Distribution.',
    aiSummary: 'Adds West Coast Distribution Partners as additional insured.',
    tags: ['END-12'],
    author: 'System',
    authorDetail: 'Automated import',
    date: '2026-05-10',
    relativeTime: '3d ago',
    activityLabel: 'Endorsement',
    activityCount: 4,
  },
  {
    id: 'doc-4',
    fileName: 'cg_00_01_cgl.pdf',
    name: 'CG 00 01 – Commercial General Liability',
    kind: 'Form',
    description: 'ISO CGL coverage form.',
    aiSummary: 'Standard CGL form; no manuscript changes detected.',
    tags: ['Package'],
    author: 'System',
    authorDetail: 'ISO form library',
    date: '2026-05-08',
    relativeTime: '5d ago',
    activityLabel: 'Policy',
    activityCount: 0,
  },
  {
    id: 'doc-5',
    fileName: 'fleet_schedule_update.xlsx',
    name: 'fleet_schedule_update.xlsx',
    kind: 'Document',
    description: 'Updated fleet schedule with 12 new units.',
    aiSummary: 'Fleet count increased from 48 to 60 units.',
    tags: ['2026 Renewal'],
    author: 'Underwriting Bot',
    authorDetail: 'AI extraction',
    date: '2026-05-01',
    relativeTime: '1w ago',
    activityLabel: 'Endorsement',
    activityCount: 2,
  },
  {
    id: 'doc-6',
    fileName: 'loss_control_report.pdf',
    name: 'loss_control_report.pdf',
    kind: 'Document',
    description: 'Annual warehouse and fleet inspection summary.',
    aiSummary: 'Recommendations for dock safety signage noted.',
    tags: ['Correspondence'],
    author: 'Loss Control',
    authorDetail: 'losscontrol@majesco.com',
    date: '2026-04-28',
    relativeTime: '2w ago',
    activityLabel: 'Policy',
    activityCount: 0,
  },
]

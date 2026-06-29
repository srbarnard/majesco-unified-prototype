import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

export const quoteDocumentsMock: PolicyDocument[] = [
  {
    id: 'qdoc-1',
    fileName: 'quote_proposal_01-CA-000100005-0.pdf',
    name: 'quote_proposal_01-CA-000100005-0.pdf',
    kind: 'Document',
    description: 'Rated quote proposal for Commercial Auto effective Jul 1, 2026.',
    aiSummary: 'Quoted premium $1,245,320 for 12-vehicle fleet; includes liability, comp, and collision.',
    tags: ['Quote PDF', 'v3 Rated'],
    author: 'Rating Engine',
    authorDetail: 'Automated quote output',
    date: '2026-06-26',
    relativeTime: 'Today',
    activityLabel: 'Quote',
    activityCount: 0,
  },
  {
    id: 'qdoc-2',
    fileName: 'coverage_summary_commercial_auto.pdf',
    name: 'Coverage Summary — Commercial Auto',
    kind: 'Document',
    description: 'Coverage line summary with limits, deductibles, and premiums.',
    aiSummary: 'Summarizes CSL $1M liability, comp/collision ACV, and UM limits by vehicle class.',
    tags: ['Coverage Summary'],
    author: 'Jordan Ellis',
    authorDetail: 'jordan.ellis@pinnacle.com',
    date: '2026-06-25',
    relativeTime: 'Yesterday',
    activityLabel: 'Quote',
    activityCount: 0,
  },
  {
    id: 'qdoc-3',
    fileName: 'underwriting_notes_fleet_review.pdf',
    name: 'Underwriting Notes — Fleet Review',
    kind: 'Document',
    description: 'Underwriter notes on garaging, loss history, and VIN exception.',
    aiSummary: 'Flags 1 VIN decode mismatch and 2 out-of-state garaging units pending UW sign-off.',
    tags: ['Underwriting'],
    author: 'Jordan Ellis',
    authorDetail: 'Commercial Auto UW',
    date: '2026-06-24',
    relativeTime: '2d ago',
    activityLabel: 'Underwriting',
    activityCount: 2,
  },
  {
    id: 'qdoc-4',
    fileName: 'acord_125_application.pdf',
    name: 'ACORD 125 — Commercial Insurance Application',
    kind: 'Form',
    description: 'Signed commercial insurance application from producer.',
    aiSummary: 'Application complete; named insured and operations description verified.',
    tags: ['Application'],
    author: 'Maria Alvarez',
    authorDetail: 'Producer portal upload',
    date: '2026-06-20',
    relativeTime: '6d ago',
    activityLabel: 'Submission',
    activityCount: 0,
  },
  {
    id: 'qdoc-5',
    fileName: 'fleet_schedule_12_units.xlsx',
    name: 'fleet_schedule_12_units.xlsx',
    kind: 'Document',
    description: 'Scheduled vehicle list with VIN, garaging, and class codes.',
    aiSummary: '12 units listed; 1 trim mismatch on unit #7 requires correction before bind.',
    tags: ['Fleet', 'Rating Input'],
    author: 'Atlantic Ridge Construction, LLC',
    authorDetail: 'Producer submission',
    date: '2026-06-18',
    relativeTime: '1w ago',
    activityLabel: 'Submission',
    activityCount: 1,
  },
  {
    id: 'qdoc-6',
    fileName: 'loss_runs_5_year.pdf',
    name: 'loss_runs_5_year.pdf',
    kind: 'Document',
    description: 'Five-year loss runs for Redwood Ridge Construction LLC.',
    aiSummary: 'One incurred auto liability claim in prior 3 years; within appetite guidelines.',
    tags: ['Loss Runs'],
    author: 'Loss Run Service',
    authorDetail: 'Third-party retrieval',
    date: '2026-06-15',
    relativeTime: '1w ago',
    activityLabel: 'Underwriting',
    activityCount: 0,
  },
  {
    id: 'qdoc-7',
    fileName: 'quote_comparison_package.pdf',
    name: 'Quote Comparison Package',
    kind: 'Package',
    description: 'Package with quote PDF, coverage summary, and producer presentation deck.',
    aiSummary: '3-document package prepared for producer presentation.',
    tags: ['Package', 'Quote PDF'],
    author: 'Jordan Ellis',
    authorDetail: 'Quote workspace export',
    date: '2026-06-26',
    relativeTime: 'Today',
    activityLabel: 'Quote',
    activityCount: 3,
  },
]

export const quoteDocumentStoryMock =
  'This quote has **7 documents** attached across submission, rating, and underwriting. The latest rated proposal was generated **today** after the fleet schedule update. **Underwriting notes** flag a VIN exception on one unit that should be resolved before binding.'

export const quoteDocumentStorySyncedAtMock = '12 min ago'

export function getQuoteDocuments(_quoteNumber: string) {
  return quoteDocumentsMock
}

export function getQuoteDocumentStory(quoteNumber: string) {
  if (quoteNumber === '01-CA-000100005-0') {
    return {
      story: quoteDocumentStoryMock,
      syncedAt: quoteDocumentStorySyncedAtMock,
    }
  }

  return {
    story: `Documents for quote **${quoteNumber}** include applications, rating inputs, and underwriting correspondence. Select a document to summarize with Copilot.`,
    syncedAt: 'Recently',
  }
}

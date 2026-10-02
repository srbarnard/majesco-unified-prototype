import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

export type BrandedHighlightTone = 'primary' | 'warning' | 'neutral'

export type BrandedDocumentSegment = {
  text: string
  highlight?: BrandedHighlightTone
}

export type BrandedDocumentSection = {
  heading?: string
  segments: BrandedDocumentSegment[]
}

export type BrandedDocumentLayout = {
  issuer: string
  issuerSubtitle?: string
  title: string
  preparedFor?: string
  policyTerm?: string
  sections: BrandedDocumentSection[]
  footerLines?: string[]
}

export type DocumentPreviewType = 'pdf' | 'image' | 'spreadsheet'

export type DocumentPreviewContent = {
  previewType: DocumentPreviewType
  pageCount: number
  extractedText: string
  keyInsights: string[]
  brandedLayout?: BrandedDocumentLayout
}

function inferPreviewType(fileName: string): DocumentPreviewType {
  const lower = fileName.toLowerCase()
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls') || lower.endsWith('.csv')) {
    return 'spreadsheet'
  }
  if (lower.endsWith('.png') || lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.webp')) {
    return 'image'
  }
  return 'pdf'
}

const renewalProposalBranded: BrandedDocumentLayout = {
  issuer: 'LOCKTON COMPANIES',
  issuerSubtitle: 'Broker of Record',
  title: '2026 RENEWAL PROPOSAL',
  preparedFor: 'Atlantic Ridge Construction, LLC',
  policyTerm: '06/01/2026 – 06/01/2027',
  sections: [
    {
      heading: '1. Executive summary',
      segments: [
        { text: 'Proposed total premium: ' },
        { text: '$594,800', highlight: 'primary' },
        { text: ' (' },
        { text: '+22%', highlight: 'warning' },
        { text: ' vs prior term). Primary drivers include fleet expansion (+12 units), updated garaging schedule, and revised warehouse liability limits.' },
      ],
    },
    {
      heading: '2. Coverage summary',
      segments: [
        { text: 'Commercial Auto — Business Auto\nGeneral Liability — ' },
        { text: '$2M occurrence / $4M aggregate', highlight: 'primary' },
        { text: '\nWorkers Compensation — statutory limits by state' },
      ],
    },
    {
      heading: '3. Premium change detail',
      segments: [
        { text: 'Prior term premium: $487,540\nProposed renewal premium: ' },
        { text: '$594,800', highlight: 'primary' },
        { text: '\nChange: ' },
        { text: 'twenty-two percent (22%)', highlight: 'warning' },
      ],
    },
    {
      heading: '4. Broker notes',
      segments: [
        {
          text: 'Rate hold requested for 30 days while insured reviews updated fleet schedule. No manuscript CGL changes; ISO forms unchanged from prior term.',
        },
      ],
    },
  ],
  footerLines: [
    'Submitted by: Maria Alvarez',
    'Lockton Companies · 05/13/2026',
    'Ref: 01-CA-000100005-0',
  ],
}

const previewContentById: Record<string, Omit<DocumentPreviewContent, 'previewType'>> = {
  'doc-1': {
    pageCount: 12,
    extractedText: `2026 RENEWAL PROPOSAL

LOCKTON COMPANIES
Broker of Record

Prepared for: Atlantic Ridge Construction, LLC
Policy term: 06/01/2026 – 06/01/2027

1. Executive summary
Proposed total premium: $594,800 (+22% vs prior term).
Primary drivers: fleet expansion (+12 units), updated garaging schedule, and revised warehouse liability limits.

2. Coverage summary
Commercial Auto — Business Auto
General Liability — $2M occurrence / $4M aggregate
Workers Compensation — statutory limits by state

3. Premium change detail
Prior term premium: $487,540
Proposed renewal premium: $594,800
Change: twenty-two percent (22%)

4. Broker notes
Rate hold requested for 30 days while insured reviews updated fleet schedule.
No manuscript CGL changes; ISO forms unchanged from prior term.

Submitted by: Maria Alvarez
Lockton Companies · 05/13/2026
Ref: 01-CA-000100005-0`,
    keyInsights: [
      'Premium increase driven primarily by fleet expansion (+12 units).',
      'Broker requests 30-day rate hold while insured reviews schedule.',
      'No manuscript CGL changes; ISO forms unchanged from prior term.',
    ],
    brandedLayout: renewalProposalBranded,
  },
  'doc-2': {
    pageCount: 4,
    extractedText:
      'Vehicle Package 2026 — bundled schedules for units VIN-1001 through VIN-1060.\n\nIncludes: liability limits, physical damage, hired/non-owned auto.\n\n4 endorsement documents attached to package.',
    keyInsights: [
      'Package consolidates 4 vehicle schedules for underwriting review.',
      'All units classified commercial light/medium duty.',
      'Garaging locations span CA, TX, and OH.',
    ],
  },
  'doc-3': {
    pageCount: 2,
    extractedText:
      'Additional Insured Endorsement — West Coast Distribution Partners LLC.\n\nCoverage applies to ongoing operations and completed operations as required by contract.',
    keyInsights: [
      'Contractual additional insured requirement from shipper agreement.',
      'Endorsement effective with policy renewal date.',
      'No premium impact noted on endorsement form.',
    ],
  },
  'doc-4': {
    pageCount: 12,
    extractedText:
      'CG 00 01 — Commercial General Liability Coverage Form (ISO).\n\nOccurrence form with standard exclusions. No manuscript endorsements detected.',
    keyInsights: [
      'Standard ISO CGL form — no custom language.',
      'Products/completed operations included per declarations.',
      'Suitable for package inclusion without UW exception.',
    ],
  },
  'doc-5': {
    pageCount: 1,
    extractedText:
      'Fleet schedule update — unit count 48 → 60.\n\n12 new units added in Q1 2026.\n\nGaraging: 8 CA, 3 TX, 1 OH.',
    keyInsights: [
      'Fleet growth is primary driver of renewal premium change.',
      'New units predominantly light commercial vans.',
      'Schedule sourced from assistant extraction — verify VINs before bind.',
    ],
  },
  'doc-6': {
    pageCount: 6,
    extractedText:
      'Annual loss control inspection — warehouse and fleet operations.\n\nFindings: dock safety signage gaps, forklift training records current, fire suppression inspected.',
    keyInsights: [
      'Recommendations for dock safety signage before renewal.',
      'No critical violations; follow-up inspection in 90 days.',
      'Fleet maintenance records meet carrier guidelines.',
    ],
  },
}

function buildGenericBrandedLayout(document: PolicyDocument): BrandedDocumentLayout {
  const paragraphs = document.description.split(/(?<=\.)\s+/).filter(Boolean)
  return {
    issuer: document.author.toUpperCase(),
    issuerSubtitle: document.authorDetail,
    title: document.name,
    preparedFor: document.tags[0],
    sections: [
      {
        segments: [{ text: document.aiSummary }],
      },
      ...paragraphs.map((paragraph) => ({
        segments: [{ text: paragraph }],
      })),
    ],
    footerLines: [`Uploaded ${document.relativeTime} · ${document.fileName}`],
  }
}

export function getDocumentPreviewContent(document: PolicyDocument): DocumentPreviewContent {
  const stored = previewContentById[document.id]
  const previewType = inferPreviewType(document.fileName)

  if (stored) {
    return {
      previewType,
      ...stored,
      brandedLayout:
        stored.brandedLayout ?? (previewType === 'pdf' ? buildGenericBrandedLayout(document) : undefined),
    }
  }

  const extractedText = `${document.name}\n\n${document.description}\n\n${document.aiSummary}`

  return {
    previewType,
    pageCount: previewType === 'spreadsheet' ? 1 : 3,
    extractedText,
    keyInsights: [
      document.aiSummary,
      `Uploaded by ${document.author} · ${document.relativeTime}`,
      `${document.activityLabel} activity (${document.activityCount})`,
    ],
    brandedLayout: previewType === 'pdf' ? buildGenericBrandedLayout(document) : undefined,
  }
}

/** Client-ready excerpt for email/note attach flows. */
export function getDocumentCopilotExcerpt(document: PolicyDocument, maxLines = 12) {
  const preview = getDocumentPreviewContent(document)
  return preview.extractedText.split('\n').slice(0, maxLines).join('\n').trim()
}

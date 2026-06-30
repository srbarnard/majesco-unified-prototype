import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

export type DocumentPreviewType = 'pdf' | 'image' | 'spreadsheet'

export type DocumentPreviewContent = {
  previewType: DocumentPreviewType
  pageCount: number
  extractedText: string
  keyInsights: string[]
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

const previewContentById: Record<string, Omit<DocumentPreviewContent, 'previewType'>> = {
  'doc-1': {
    pageCount: 8,
    extractedText:
      'Renewal proposal for Acme Logistics LLC — policy term 06/01/2026 to 06/01/2027.\n\nProposed premium: $594,800 (+22% vs prior term).\n\nKey changes: updated fleet schedule (60 units), West Coast additional insured endorsement, revised warehouse liability limits.',
    keyInsights: [
      'Premium increase driven primarily by fleet expansion (+12 units).',
      'Broker requests 30-day rate hold while insured reviews schedule.',
      'No manuscript CGL changes; ISO forms unchanged from prior term.',
    ],
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
      'Schedule sourced from AI extraction — verify VINs before bind.',
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

export function getDocumentPreviewContent(document: PolicyDocument): DocumentPreviewContent {
  const stored = previewContentById[document.id]
  const previewType = inferPreviewType(document.fileName)

  if (stored) {
    return { previewType, ...stored }
  }

  return {
    previewType,
    pageCount: previewType === 'spreadsheet' ? 1 : 3,
    extractedText: `${document.name}\n\n${document.description}\n\n${document.aiSummary}`,
    keyInsights: [
      document.aiSummary,
      `Uploaded by ${document.author} · ${document.relativeTime}`,
      `${document.activityLabel} activity (${document.activityCount})`,
    ],
  }
}

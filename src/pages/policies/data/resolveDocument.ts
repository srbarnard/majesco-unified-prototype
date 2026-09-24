import { policyDocumentsMock, type PolicyDocument } from '@/pages/policies/data/mockDocuments'
import { getQuoteDocuments } from '@/pages/quotes/data/mockQuoteDocuments'
import { getSubmissionDocuments } from '@/pages/submissions/data/mockSubmissionDocuments'
import { resolveTaskAttachmentDocument } from '@/pages/tasks/data/taskAttachmentDocuments'

export function resolvePolicyDocument(docId: string): PolicyDocument | undefined {
  return policyDocumentsMock.find((document) => document.id === docId) ?? resolveTaskAttachmentDocument(docId)
}

export function resolveQuoteDocument(quoteNumber: string, docId: string): PolicyDocument | undefined {
  return (
    getQuoteDocuments(quoteNumber).find((document) => document.id === docId) ??
    resolveTaskAttachmentDocument(docId)
  )
}

export function resolveSubmissionDocument(submissionId: string, docId: string): PolicyDocument | undefined {
  return (
    getSubmissionDocuments(submissionId).find((document) => document.id === docId) ??
    resolveTaskAttachmentDocument(docId)
  )
}

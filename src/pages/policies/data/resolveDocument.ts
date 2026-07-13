import { policyDocumentsMock, type PolicyDocument } from '@/pages/policies/data/mockDocuments'
import { getQuoteDocuments } from '@/pages/quotes/data/mockQuoteDocuments'

export function resolvePolicyDocument(docId: string): PolicyDocument | undefined {
  return policyDocumentsMock.find((document) => document.id === docId)
}

export function resolveQuoteDocument(quoteNumber: string, docId: string): PolicyDocument | undefined {
  return getQuoteDocuments(quoteNumber).find((document) => document.id === docId)
}

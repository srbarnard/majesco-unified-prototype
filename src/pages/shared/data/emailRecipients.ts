import { getPolicyInsuredContact, policiesListMock } from '@/pages/policies/data/mockPoliciesList'

export type EmailRecipient = { role: 'Producer' | 'Insured'; name: string; email: string }

function mailDomain(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 24)
}

/** Placeholder titles ("New claim", "Draft") are not people to write to. */
function isRealName(name: string | null | undefined): name is string {
  return Boolean(name && name.trim() && !/^(new |draft\b)/i.test(name.trim()))
}

export function producerFor(insuredName: string | null | undefined): EmailRecipient | null {
  if (!isRealName(insuredName)) return null
  const policy = policiesListMock.find((entry) => entry.insuredName === insuredName)
  if (!policy) return null
  return { role: 'Producer', name: policy.agency, email: `service@${mailDomain(policy.agency)}.com` }
}

export function insuredFor(insuredName: string | null | undefined): EmailRecipient | null {
  if (!isRealName(insuredName)) return null
  return { role: 'Insured', name: insuredName, email: getPolicyInsuredContact(insuredName).email }
}

function uniqueBy<T>(items: T[], key: (item: T) => string) {
  return [...new Map(items.map((item) => [key(item), item])).values()]
}

/** Every producer agency on the book, A–Z. */
export const PRODUCER_DIRECTORY: EmailRecipient[] = uniqueBy(policiesListMock, (entry) => entry.agency)
  .map((entry) => ({ role: 'Producer' as const, name: entry.agency, email: `service@${mailDomain(entry.agency)}.com` }))
  .sort((a, b) => a.name.localeCompare(b.name))

/** Every named insured on the book, A–Z. */
export const INSURED_DIRECTORY: EmailRecipient[] = uniqueBy(policiesListMock, (entry) => entry.insuredName)
  .map((entry) => ({
    role: 'Insured' as const,
    name: entry.insuredName,
    email: getPolicyInsuredContact(entry.insuredName).email,
  }))
  .sort((a, b) => a.name.localeCompare(b.name))

/** Producer first, then the insured; empty when there is no named account. */
export function suggestedRecipients(insuredName: string | null | undefined): EmailRecipient[] {
  return [producerFor(insuredName), insuredFor(insuredName)].filter(
    (recipient): recipient is EmailRecipient => recipient != null,
  )
}

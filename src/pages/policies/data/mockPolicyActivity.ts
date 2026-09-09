import type { RecentActivityItem, RecentActivityKind } from '@/app/data/homeMock'
import type { OverviewTransaction } from '@/pages/policies/data/mockOverview'
import { policyDetailsMock } from '@/pages/policies/data/mockPolicyDetails'

function transactionKind(type: string): RecentActivityKind {
  const normalized = type.trim().toLowerCase()
  if (normalized.includes('endorsement')) return 'endorsement'
  if (normalized.includes('renewal')) return 'renewal'
  if (normalized.includes('claim')) return 'claim'
  if (normalized.includes('billing') || normalized.includes('invoice')) return 'billing'
  if (normalized.includes('certificate')) return 'document'
  if (normalized.includes('inspection')) return 'task'
  if (normalized.includes('quote')) return 'quote'
  return 'policy'
}

function transactionTimestamp(index: number, effectiveDate: string): string {
  if (index === 0) return 'Today · 11:40 AM'
  if (index === 1) return 'Today · 9:18 AM'
  if (index === 2) return 'Yesterday · 4:05 PM'
  if (index === 3) return 'Yesterday · 10:22 AM'
  return effectiveDate
}

/**
 * Maps policy Overview transactions into Home ActivityRail items.
 * Keeps the same transaction content; presentation matches Recent activity.
 */
export function getPolicyTransactionActivity(
  transactions: OverviewTransaction[],
  context: { policyNumber: string; insuredName: string } = {
    policyNumber: policyDetailsMock.policyNumber,
    insuredName: policyDetailsMock.companyName,
  },
): RecentActivityItem[] {
  const href = `/policies/${encodeURIComponent(context.policyNumber)}`
  const docsHref = `${href}?tab=documents`

  return transactions.map((tx, index) => {
    const kind = transactionKind(tx.type)
    const fields = [
      { label: 'Transaction', value: tx.type },
      { label: 'Status', value: tx.status },
      { label: 'Effective date', value: tx.effectiveDate },
      ...(tx.revision ? [{ label: 'Revision', value: tx.revision }] : []),
      ...(tx.premiumChange
        ? [{ label: 'Premium change', value: tx.premiumChange }]
        : []),
    ]

    return {
      id: tx.id,
      kind,
      label: tx.type,
      detail: tx.description,
      timestamp: transactionTimestamp(index, tx.effectiveDate),
      referenceId: tx.revision ? `${tx.type} · ${tx.revision}` : tx.id.toUpperCase(),
      status: tx.status,
      statusVariant: tx.statusTone,
      performedBy: 'Policy operations',
      insuredName: context.insuredName,
      policyNumber: context.policyNumber,
      summary: tx.description,
      fields,
      insights: [
        tx.premiumChange
          ? `Premium impact ${tx.premiumChange} on ${context.policyNumber}.`
          : `Review this ${tx.type.toLowerCase()} against the current term.`,
      ],
      primaryLink: { label: 'View policy', to: href },
      secondaryLink: { label: 'View documents', to: docsHref },
    }
  })
}

export function policyTransactionSubtitle(item: RecentActivityItem) {
  if (item.status) return `${item.detail} · ${item.status}`
  return item.detail
}

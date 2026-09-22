import type { CopilotHistoryEntry } from '@/pages/policies/components/copilot/copilotDrawerData'

export type DailySummaryQuickActionAnswer = {
  title: string
  items: string[]
  footer: string
  elapsedSeconds: number
}

function buildEntry(
  id: string,
  title: string,
  prompt: string,
  answer: DailySummaryQuickActionAnswer,
): CopilotHistoryEntry {
  return {
    id,
    title,
    kind: 'chat',
    messages: [
      {
        id: `${id}-u1`,
        role: 'user',
        content: prompt,
      },
      {
        id: `${id}-a1`,
        role: 'assistant',
        content: [answer.title, '', ...answer.items.map((item) => `• ${item}`), '', answer.footer].join(
          '\n',
        ),
        elapsedSeconds: answer.elapsedSeconds,
      },
    ],
  }
}

/** Structured Home Daily summary answers (same copy as the chat entry). */
export function resolveDailySummaryQuickActionAnswer(
  action: string,
): DailySummaryQuickActionAnswer | null {
  const normalized = action.toLowerCase().trim()

  if (normalized.includes('blocked submission')) {
    return {
      title: 'Blocked submissions',
      items: [
        'Midwest Fabrication · 01-CP-000017809-0 · loss-run review blocking renewal bind',
        'Horizon Fleet Services · 01-CA-000100012-0 · OFAC hold pending compliance clearance',
        'Keystone Commercial Realty · 01-BP-000028511-0 · missing SOV for property schedule',
      ],
      footer: '3 blocked, 1 can wait until tomorrow.',
      elapsedSeconds: 1.24,
    }
  }

  if (normalized.includes('pricing approval') || normalized.includes('renewals need pricing')) {
    return {
      title: 'Renewals awaiting pricing approval',
      items: [
        'Red Oak Hospitality Group · 01-CP-000017810-0 · renewal package ready for rate sign-off',
        'New business policy · 01-BP-000028506-0 · Approve Renewal Pricing task due today',
        'Silverline Manufacturing Co. · 01-CP-000017813-0 · quoted rate pending underwriter lock',
      ],
      footer: '3 accounts are waiting on pricing approval.',
      elapsedSeconds: 1.24,
    }
  }

  if (normalized.includes('wait until tomorrow') || normalized.includes('can wait')) {
    return {
      title: 'Items that can wait until tomorrow',
      items: [
        'Summit Outdoor Equipment · 01-CA-000100006-0 · Send Quote to Producer (due in 3 days)',
        'Horizon Fleet Services · 01-CA-000100012-0 · Inspection follow-up (due tomorrow)',
        'Keystone Commercial Realty · 01-BP-000028511-0 · Verify additional insured (due in 5 days)',
        'Blue Harbor Logistics · 01-CP-000017809-0 · Billing discrepancy reconcile (due next week)',
      ],
      footer: 'None of these are past due — safe to defer.',
      elapsedSeconds: 1.24,
    }
  }

  return null
}

/** Mock chat replies for Home Daily summary quick actions. */
export function resolveDailySummaryQuickAction(action: string): CopilotHistoryEntry | null {
  const answer = resolveDailySummaryQuickActionAnswer(action)
  if (!answer) return null

  const normalized = action.toLowerCase().trim()
  if (normalized.includes('blocked submission')) {
    return buildEntry('daily-qa-blocked', 'Blocked submissions', action, answer)
  }
  if (normalized.includes('pricing approval') || normalized.includes('renewals need pricing')) {
    return buildEntry('daily-qa-pricing', 'Renewals awaiting pricing', action, answer)
  }
  if (normalized.includes('wait until tomorrow') || normalized.includes('can wait')) {
    return buildEntry('daily-qa-defer', 'Can wait until tomorrow', action, answer)
  }
  return null
}

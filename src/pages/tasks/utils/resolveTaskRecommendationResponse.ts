import type { TaskRecord } from '@/pages/tasks/data/mockTasks'

export type TaskRecommendationResponse = {
  heading: string
  intro?: string
  items: string[]
  summary: string
  actions: string[]
  elapsedSeconds: number
}

export function resolveTaskRecommendationResponse(
  insight: string,
  task: TaskRecord,
): TaskRecommendationResponse {
  const normalized = insight.toLowerCase()
  const insured = task.relatedEntities.insuredName ?? 'this account'

  if (normalized.includes('rate adjustment') || normalized.includes('+')) {
    return {
      heading: 'Rate adjustment draft',
      intro: `For ${insured}, Copilot modeled the property line using updated loss runs and peer renewals in the same ZIP cluster.`,
      items: [
        'Recommend +8–12% on property; liability can remain at current limits.',
        'Cite the three largest water losses and mitigation status in the referral memo.',
        'Hold renewal release until signed application is received from the producer portal.',
      ],
      summary: 'I can pre-fill sections 5–7 of the referral worksheet with catastrophe exposure notes if you want to proceed.',
      actions: ['Generate referral memo', 'Compare similar accounts'],
      elapsedSeconds: 5.18,
    }
  }

  if (normalized.includes('referral memo') || normalized.includes('draft')) {
    return {
      heading: 'Referral memo draft',
      intro: `I'll anchor the memo to ${task.refNumber} and the open underwriting items on this task.`,
      items: [
        'Executive summary with loss ratio trend and strategic producer context.',
        'Loss detail for Omaha grain elevator and cold storage water claims.',
        'Recommended rate and limit posture with peer benchmark footnotes.',
      ],
      summary: 'Draft is ready for underwriter review — no bind release until memo is approved.',
      actions: ['Open draft memo', 'Send to UW queue'],
      elapsedSeconds: 4.76,
    }
  }

  if (normalized.includes('similar accounts') || normalized.includes('zip cluster')) {
    return {
      heading: 'Peer renewal comparison',
      intro: `Accounts near ${insured} with loss ratios above 62% in the last 12 months:`,
      items: [
        'Midwest Grain Cooperative — renewed at +10.4% with roof mitigation completed.',
        'Plains Cold Storage LLC — renewed at +9.1% with deductible increase.',
        'Riverbend Logistics Inc. — referred; rate held pending inspection.',
      ],
      summary: 'Average peer increase for comparable property accounts: +9.8%.',
      actions: ['Export comparison', 'Add to referral memo'],
      elapsedSeconds: 3.92,
    }
  }

  if (normalized.includes('clearance') || normalized.includes('sanctions') || normalized.includes('false positive')) {
    return {
      heading: 'Compliance clearance path',
      intro: `Match score 0.71 on ${insured} is likely a false positive based on DOB and state mismatch.`,
      items: [
        'Document clearance with note — no prior flags on producer or insured.',
        'Attach OFAC screening screenshot and analyst rationale to the quote file.',
        'Release bind block once compliance approves (est. same-day).',
      ],
      summary: 'Recommended disposition: clear with annotation rather than escalate.',
      actions: ['Record clearance', 'Notify producer'],
      elapsedSeconds: 2.84,
    }
  }

  if (normalized.includes('reserve') || normalized.includes('claims')) {
    return {
      heading: 'Reserve recommendation',
      intro: `For claim tied to ${task.refNumber}, reserve exceeds UW authority and needs a coordinated update.`,
      items: [
        'Schedule UW–claims sync within 24 hours.',
        'Draft reserve memo citing authority threshold and open litigation.',
        'Update task status after reserve approval is logged.',
      ],
      summary: 'Copilot can pre-fill the reserve memo template with current file values.',
      actions: ['Generate reserve memo', 'Schedule sync'],
      elapsedSeconds: 4.11,
    }
  }

  if (normalized.includes('extension') || normalized.includes('producer')) {
    return {
      heading: 'Quote extension recommendation',
      intro: `Producer last viewed ${task.relatedEntities.quoteNumber ?? 'the quote'} 12 days ago with no bind activity.`,
      items: [
        '7-day extension is within AM authority for this status.',
        'Send nudge to producer with expiration date and outstanding items.',
        'Monitor competitor indication noted in producer comments.',
      ],
      summary: 'Extension reduces lapse risk without reopening underwriting review.',
      actions: ['Apply extension', 'Draft producer email'],
      elapsedSeconds: 3.45,
    }
  }

  return {
    heading: 'Recommendation summary',
    intro: `For ${task.taskName} (${task.refNumber}):`,
    items: [
      insight,
      `Next action on file: ${task.nextAction}`,
      `Assigned to ${task.assignedTo} · ${task.team}`,
    ],
    summary: 'I can take the next step on this task or draft supporting documentation on request.',
    actions: ['Summarize task', 'Draft follow-up'],
    elapsedSeconds: 3.2,
  }
}

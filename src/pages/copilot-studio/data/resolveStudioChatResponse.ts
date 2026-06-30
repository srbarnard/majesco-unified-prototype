export function resolveStudioChatResponse(prompt: string): { content: string; elapsedSeconds: number } {
  const normalized = prompt.toLowerCase()

  if (normalized.includes('billing') && (normalized.includes('policy') || normalized.includes('effective'))) {
    return {
      content:
        'The policy number you provided appears to be incomplete or invalid. Please provide the exact policy number so I can retrieve all billing terms and effective dates for you.',
      elapsedSeconds: 4.14,
    }
  }

  if (normalized.includes('claim')) {
    return {
      content:
        'Three open claims need attention: CLM-2026-004412 (reserve review), CLM-2026-003891 (awaiting estimate), and CLM-2026-003104 (litigation referral pending). I can summarize any of these in detail.',
      elapsedSeconds: 3.62,
    }
  }

  if (normalized.includes('renewal')) {
    return {
      content:
        'You have 14 renewals due in the next 60 days totaling $2.4M in premium. Four accounts show loss ratio increases above 10 points — I recommend prioritizing Atlantic Ridge Construction and Red Oak Hospitality Group.',
      elapsedSeconds: 5.08,
    }
  }

  return {
    content:
      'I received your request. In a connected environment, Copilot would retrieve the relevant policy, billing, and account data to complete this for you.',
    elapsedSeconds: 2.6 + Math.round(Math.random() * 20) / 10,
  }
}

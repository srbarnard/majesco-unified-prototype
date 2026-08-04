import type { QuoteWizardCopilotState, QuoteWizardFormData } from '../data/quoteWizardTypes'
import { COVERAGE_OPTIONS } from '../data/quoteWizardTypes'
import { estimatePremium } from './parseQuoteWizardInput'

function hasValue(value: string) {
  return value.trim().length > 0
}

function insuredFieldCount(form: QuoteWizardFormData) {
  return [form.name, form.email, form.address, form.industryNaics].filter(hasValue).length
}

function riskFieldCount(form: QuoteWizardFormData) {
  let count = 0
  if (hasValue(form.annualRevenue)) count += 1
  if (hasValue(form.employeeCount)) count += 1
  if (hasValue(form.payroll)) count += 1
  if (form.operationalExposures.length > 0) count += 1
  return count
}

function exposuresFieldCount(form: QuoteWizardFormData) {
  let count = 0
  if (hasValue(form.primaryLocation)) count += 1
  if (hasValue(form.annualRevenue)) count += 1
  if (hasValue(form.payroll)) count += 1
  return count
}

function insuredFieldStatuses(form: QuoteWizardFormData) {
  return [
    { label: 'Name', captured: hasValue(form.name) },
    { label: 'Email', captured: hasValue(form.email) },
    { label: 'Address', captured: hasValue(form.address) },
    { label: 'Industry / NAICS', captured: hasValue(form.industryNaics) },
  ]
}

export function computeWizardConfidence(
  stepIndex: number,
  form: QuoteWizardFormData,
  isParsingDocuments = false,
) {
  switch (stepIndex) {
    case 0: {
      if (isParsingDocuments && form.uploadedFiles.length > 0) {
        return 32 + Math.min(form.uploadedFiles.length * 3, 9)
      }
      const captured = insuredFieldCount(form)
      const docBoost = form.uploadedFiles.length > 0 ? Math.min(10 + form.uploadedFiles.length * 2, 16) : 0
      return Math.min(30 + captured * 17 + docBoost, captured === 4 ? 87 : 30 + captured * 14 + docBoost)
    }
    case 1: {
      const captured = riskFieldCount(form)
      return Math.min(30 + captured * 15, captured >= 4 ? 87 : 30 + captured * 13)
    }
    case 2: {
      const captured = exposuresFieldCount(form)
      return Math.min(30 + captured * 20, captured >= 3 ? 87 : 30 + captured * 17)
    }
    case 3:
      return form.selectedCoverages.length >= 3 ? 92 : 45 + form.selectedCoverages.length * 12
    case 4:
      return 100
    default:
      return 30
  }
}

function confidenceLabel(confidence: number, isParsingDocuments = false) {
  if (isParsingDocuments) return 'Extracting details'
  if (confidence >= 85) return 'Ready to proceed'
  if (confidence >= 60) return 'Nearly complete'
  if (confidence >= 45) return 'Building details'
  return 'Getting started'
}

function recommendedCoverages(form: QuoteWizardFormData) {
  // Commercial Auto is always recommended and preselected; remaining lines depend on risk signals.
  const ids = new Set<string>(['gl', 'ca'])
  if (hasValue(form.payroll) || hasValue(form.employeeCount)) ids.add('wc')
  if (form.operationalExposures.includes('equipment')) ids.add('im')
  if (Number(form.annualRevenue.replace(/[^\d.]/g, '')) > 500_000) ids.add('cp')
  return COVERAGE_OPTIONS.filter((option) => ids.has(option.id)).map((option) => option.id)
}

export function buildWizardCopilotState(
  stepIndex: number,
  form: QuoteWizardFormData,
  options?: { isParsingDocuments?: boolean },
): QuoteWizardCopilotState {
  const isParsingDocuments = options?.isParsingDocuments ?? false
  const confidence = computeWizardConfidence(stepIndex, form, isParsingDocuments)
  const statusLabel = confidenceLabel(confidence, isParsingDocuments)

  if (stepIndex === 0) {
    const captured = insuredFieldCount(form)
    const fieldStatuses = insuredFieldStatuses(form)
    const hasDocuments = form.uploadedFiles.length > 0

    if (isParsingDocuments && hasDocuments) {
      const docNames = form.uploadedFiles.map((file) => file.name).join(', ')
      return {
        confidence,
        statusLabel,
        headline: 'Parsing uploaded documents…',
        message: `Reviewing ${form.uploadedFiles.length} attachment${form.uploadedFiles.length === 1 ? '' : 's'} (${docNames}). Extracting insured details, locations, and exposure data from ACORDs and schedules.`,
        proTip: 'Fields with a green check were auto-filled from your documents. Manual edits always override Copilot.',
        fieldStatuses,
        actions: [],
        showContinue: false,
      }
    }

    if (captured === 0 && !hasDocuments) {
      return {
        confidence,
        statusLabel,
        headline: 'Assist with Submission',
        message:
          "Start by describing the insured or business — or drop ACORDs, schedules, and broker emails into the input area. I'll extract details and pre-fill the form.",
        proTip: 'Drop multiple files at once (ACORD 125, fleet schedule, loss runs). Copilot reconciles them into one submission.',
        fieldStatuses,
        actions: [
          {
            label: 'Use sample insured',
            field: 'applySample',
            apply: {
              name: 'Greenleaf Landscaping',
              address: 'Princeton, NJ',
              industryNaics: '561730 - Landscaping Services',
              aiFilledFields: ['name', 'address', 'industryNaics'],
            },
          },
        ],
        showContinue: false,
      }
    }

    if (hasDocuments && captured < 4) {
      const docNames = form.uploadedFiles.map((file) => file.name).join(', ')
      const extractedCount = form.aiFilledFields.length
      return {
        confidence,
        statusLabel,
        headline: extractedCount > 0 ? 'Document extraction complete' : 'Parsing uploaded documents…',
        message:
          extractedCount > 0
            ? `Extracted ${extractedCount} fields from ${form.uploadedFiles.length} file${form.uploadedFiles.length === 1 ? '' : 's'} (${docNames}). Review the highlighted fields below — edit anything that needs correction.`
            : `I found ${form.uploadedFiles.length} file${form.uploadedFiles.length === 1 ? '' : 's'} (${docNames}). Review the extracted fields below — edit anything that needs correction.`,
        proTip: 'Fields with a green check were auto-filled from your documents. Manual edits always override Copilot.',
        fieldStatuses,
        actions: extractedCount > 0
          ? []
          : [
              {
                label: 'Apply extracted details',
                field: 'applyFromDocuments',
              },
            ],
        showContinue: false,
      }
    }

    if (!hasValue(form.email)) {
      return {
        confidence,
        statusLabel,
        headline: 'Almost there. Add an email to continue.',
        message: `Great — I now have ${captured} of 4 key details captured.\n\nTo continue, I just need:\n• Contact email`,
        fieldStatuses,
        actions: [
          {
            label: 'Add email',
            field: 'email',
            apply: { email: 'bob.smith@greenleaf.com', aiFilledFields: ['email'] },
          },
        ],
        showContinue: false,
      }
    }

    if (confidence >= 85) {
      return {
        confidence,
        statusLabel,
        headline: "You're ready to continue to Risk Profile.",
        message: hasDocuments
          ? `Extracted details from ${form.uploadedFiles.length} document${form.uploadedFiles.length === 1 ? '' : 's'} and confirmed all key insured fields. You're ready to continue to Risk Profile.`
          : "All key details are captured. I've confirmed the business details and eligibility. You're ready to continue to Risk Profile.",
        fieldStatuses,
        actions: [{ label: 'Continue', field: 'continue' }, { label: 'Clear all', field: 'clear' }],
        showContinue: true,
      }
    }

    const missing: string[] = []
    if (!hasValue(form.address)) missing.push('Full business address')
    if (!hasValue(form.email)) missing.push('Contact email')

    return {
      confidence,
      statusLabel,
      headline: 'Almost there. Add more details to proceed.',
      message: `${captured} of 4 key details captured so far.\n\nThis appears to be a landscaping business based in Princeton, NJ.\n\nTo increase confidence, add:\n${missing.map((item) => `• ${item}`).join('\n')}`,
      fieldStatuses,
      actions: [
        ...(!hasValue(form.address)
          ? [
              {
                label: 'Update address',
                field: 'address' as const,
                apply: {
                  address: '123 Main St, Princeton, NJ 08540',
                  aiFilledFields: ['address'],
                },
              },
            ]
          : []),
        ...(!hasValue(form.email)
          ? [
              {
                label: 'Add email',
                field: 'email' as const,
                apply: { email: 'bob.smith@greenleaf.com', aiFilledFields: ['email'] },
              },
            ]
          : []),
      ],
      showContinue: false,
    }
  }

  if (stepIndex === 1) {
    const captured = riskFieldCount(form)
    if (captured === 0) {
      return {
        confidence,
        statusLabel,
        headline: 'Assist with Submission',
        message:
          "I've identified this as a landscaping business in Princeton, NJ. Let's refine a few key details to build an accurate risk profile.\n\nStart with workforce and payroll. Then confirm whether vehicles or specialized equipment are involved.",
        proTip: 'Adding vehicle and equipment details will improve recommendation accuracy.',
        actions: [
          { label: 'Add vehicle details', field: 'operationalExposures' },
          { label: 'Add equipment details', field: 'operationalExposures' },
        ],
        showContinue: false,
      }
    }

    if (confidence >= 85) {
      return {
        confidence,
        statusLabel,
        headline: 'Risk profile is ready. Choose coverage.',
        message: `Landscaping business in Princeton, NJ with about ${form.annualRevenue ? `$${Number(form.annualRevenue).toLocaleString()}` : '$1M'} in revenue, ${form.employeeCount || '10'} employees, and ${form.payroll ? `$${Number(form.payroll).toLocaleString()}` : '$600,000'} payroll. Copilot recommends a coverage bundle based on operational exposures.`,
        actions: [{ label: 'Continue', field: 'continue' }, { label: 'Clear all', field: 'clear' }],
        showContinue: true,
        showCoverageBundle: true,
      }
    }

    const missing: string[] = []
    if (!hasValue(form.annualRevenue)) missing.push('Annual revenue')
    if (!hasValue(form.payroll)) missing.push('Payroll')
    if (form.operationalExposures.length === 0) missing.push('Vehicle and equipment exposure')

    return {
      confidence,
      statusLabel,
      headline: 'Almost there. Just 3 more details.',
      message: `I've started building the submission. To improve accuracy, I need:\n${missing.map((item) => `• ${item}`).join('\n')}`,
      actions: [
        ...(!hasValue(form.annualRevenue) ? [{ label: 'Add revenue', field: 'annualRevenue' as const }] : []),
        ...(!hasValue(form.payroll) ? [{ label: 'Add payroll', field: 'payroll' as const }] : []),
      ],
      showContinue: false,
    }
  }

  if (stepIndex === 2) {
    if (!hasValue(form.primaryLocation)) {
      return {
        confidence,
        statusLabel,
        headline: 'Assist with Submission',
        message:
          "Confirm exposure and locations for this account. I'll use revenue, payroll, and location data to shape recommended coverage.",
        proTip: 'Adding vehicle and equipment details will improve recommendation accuracy.',
        actions: [
          { label: 'Add vehicle details', field: 'operationalExposures' },
          { label: 'Add equipment details', field: 'operationalExposures' },
        ],
        showContinue: false,
      }
    }

    if (confidence >= 85) {
      return {
        confidence,
        statusLabel,
        headline: 'Locations confirmed. Ready for coverages.',
        message:
          'Primary location and exposure details are captured. Continue to review recommended coverages and pricing.',
        actions: [{ label: 'Continue', field: 'continue' }],
        showContinue: true,
      }
    }

    return {
      confidence,
      statusLabel,
      headline: 'Almost there. Confirm payroll and revenue.',
      message: 'Approximate revenue and payroll help Copilot recommend accurate limits and pricing.',
      actions: [
        { label: 'Add revenue', field: 'annualRevenue' },
        { label: 'Add payroll', field: 'payroll' },
      ],
      showContinue: false,
    }
  }

  if (stepIndex === 3) {
    const premium = estimatePremium(form)
    const selected = form.selectedCoverages.length
    if (selected === 0) {
      const recommended = recommendedCoverages(form)
      return {
        confidence,
        statusLabel,
        headline: 'Choose your coverage bundle.',
        message: `Based on the risk profile, Copilot recommends ${recommended.length} lines. Select coverages to generate an indicative premium.`,
        actions: recommended.map((id) => ({
          label: `Add ${COVERAGE_OPTIONS.find((option) => option.id === id)?.label ?? id}`,
          field: 'selectedCoverages' as const,
        })),
        showContinue: false,
        showCoverageBundle: true,
      }
    }

    return {
      confidence,
      statusLabel,
      headline: `Indicative premium: $${premium.toLocaleString()}`,
      message: `${selected} coverage line${selected === 1 ? '' : 's'} selected. Continue to review the submission before submitting.`,
      actions: [{ label: 'Continue', field: 'continue' }],
      showContinue: true,
      showCoverageBundle: true,
    }
  }

  const premium = estimatePremium(form)
  return {
    confidence: 100,
    statusLabel: 'Ready to submit',
    headline: 'Review and submit your quote.',
    message: `${form.name || 'This account'} is ready for submission with ${form.selectedCoverages.length} coverage lines and an indicative premium of $${premium.toLocaleString()}.`,
    actions: [{ label: 'Submit quote', field: 'continue' }],
    showContinue: true,
  }
}

export function getRecommendedCoverageIds(form: QuoteWizardFormData) {
  return recommendedCoverages(form)
}

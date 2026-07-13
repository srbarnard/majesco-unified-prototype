import type { Theme } from '@mui/material/styles'

/** Green 85%+, amber 45–84%, blue 25–44%, red below 25. */
export function getCopilotConfidenceColor(theme: Theme, confidence: number) {
  if (confidence >= 85) return theme.palette.secondary.main
  if (confidence >= 45) return theme.palette.warning.main
  if (confidence >= 25) return theme.palette.primary.main
  return theme.palette.error.main
}

export function getCopilotConfidenceStatusLabel(confidence: number) {
  if (confidence >= 85) return 'Ready to proceed'
  if (confidence >= 60) return 'Nearly complete'
  if (confidence >= 45) return 'Building details'
  if (confidence >= 25) return 'Getting started'
  return 'Needs attention'
}

export type CopilotConfidenceTier = {
  min: number
  label: string
  detail: string
  rangeLabel: string
}

export const DEFAULT_COPILOT_CONFIDENCE_TIERS: CopilotConfidenceTier[] = [
  {
    min: 85,
    rangeLabel: '85%+',
    label: 'Ready to proceed',
    detail: 'Details are complete and consistent — safe to continue or finalize.',
  },
  {
    min: 45,
    rangeLabel: '45–84%',
    label: 'In progress',
    detail: 'Copilot is assembling or refining details from inputs and documents.',
  },
  {
    min: 25,
    rangeLabel: '25–44%',
    label: 'Getting started',
    detail: 'Early stage — add context, documents, or complete open fields.',
  },
  {
    min: 0,
    rangeLabel: 'Below 25%',
    label: 'Needs attention',
    detail: 'Important gaps remain before this flow can move forward confidently.',
  },
]

export type CopilotConfidenceModel = {
  confidence: number
  statusLabel: string
  popoverTitle: string
  popoverDescription: string
  tiers?: CopilotConfidenceTier[]
}

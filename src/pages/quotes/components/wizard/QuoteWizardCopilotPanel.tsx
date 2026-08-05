import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect, useRef } from 'react'
import { CopilotQuickActions } from '@/design-system/components'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { markAiFilled } from '@/pages/quotes/data/quoteWizardDefaults'
import {
  COVERAGE_OPTIONS,
  type QuoteWizardCopilotAction,
  type QuoteWizardFormData,
} from '@/pages/quotes/data/quoteWizardTypes'
import { applyDocumentExtraction } from '@/pages/quotes/utils/quoteWizardDocuments'
import {
  buildWizardCopilotState,
  getRecommendedCoverageIds,
} from '@/pages/quotes/utils/quoteWizardCopilotContent'
import { CopilotConfidenceIndicator } from '@/pages/policies/components/copilot/CopilotConfidenceIndicator'
import { CopilotDrawerShell } from '@/pages/policies/components/copilot/CopilotDrawerShell'
import { copilotSectionHeadingSx, copilotSubtitleSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'
import { useAnimatedConfidence } from '@/pages/policies/components/copilot/useAnimatedConfidence'

type QuoteWizardCopilotPanelProps = {
  stepIndex: number
  form: QuoteWizardFormData
  isParsingDocuments?: boolean
  onFieldFocus?: (field: QuoteWizardCopilotAction['field']) => void
  onUpdateForm: (updates: Partial<QuoteWizardFormData>) => void
  onContinue?: () => void
  onClose?: () => void
}

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function mergeApplyUpdates(form: QuoteWizardFormData, apply?: Partial<QuoteWizardFormData>) {
  if (!apply) return {}
  const { aiFilledFields: incomingAi, ...incomingRest } = apply
  return {
    ...incomingRest,
    aiFilledFields: incomingAi ? markAiFilled(form.aiFilledFields, ...incomingAi) : form.aiFilledFields,
  }
}

function wizardInsights(form: QuoteWizardFormData, copilot: ReturnType<typeof buildWizardCopilotState>) {
  const fieldInsights =
    copilot.fieldStatuses?.map((item) =>
      item.captured ? `${item.label} captured` : `${item.label} still needed`,
    ) ?? []

  if (form.uploadedFiles.length > 0) {
    return [
      `${form.uploadedFiles.length} document${form.uploadedFiles.length === 1 ? '' : 's'} attached for extraction`,
      ...fieldInsights,
    ]
  }

  return fieldInsights.length > 0 ? fieldInsights : [copilot.statusLabel]
}

export function QuoteWizardCopilotPanel({
  stepIndex,
  form,
  isParsingDocuments = false,
  onFieldFocus,
  onUpdateForm,
  onContinue,
  onClose,
}: QuoteWizardCopilotPanelProps) {
  const copilot = buildWizardCopilotState(stepIndex, form, { isParsingDocuments })
  const recommendedIds = getRecommendedCoverageIds(form)
  const insights = wizardInsights(form, copilot)
  const animatedConfidence = useAnimatedConfidence(copilot.confidence, stepIndex)
  const displayedConfidence = Math.round(animatedConfidence)
  const didPreselectCommercialAuto = useRef(false)

  useEffect(() => {
    if (!copilot.showCoverageBundle) {
      didPreselectCommercialAuto.current = false
      return
    }
    if (didPreselectCommercialAuto.current) return
    didPreselectCommercialAuto.current = true
    if (form.selectedCoverages.includes('ca')) return
    onUpdateForm({ selectedCoverages: [...form.selectedCoverages, 'ca'] })
  }, [copilot.showCoverageBundle, form.selectedCoverages, onUpdateForm])

  const handleAction = (action: QuoteWizardCopilotAction) => {
    if (action.field === 'continue') {
      onContinue?.()
      return
    }
    if (action.field === 'clear') {
      onUpdateForm({
        name: '',
        email: '',
        address: '',
        industryNaics: '',
        annualRevenue: '',
        employeeCount: '',
        payroll: '',
        operationalExposures: [],
        selectedCoverages: [],
        uploadedFiles: [],
        aiFilledFields: [],
      })
      return
    }
    if (action.field === 'applyFromDocuments') {
      onUpdateForm(applyDocumentExtraction(form, form.uploadedFiles))
      return
    }
    if (action.field === 'applySample' || action.apply) {
      onUpdateForm(mergeApplyUpdates(form, action.apply))
      return
    }
    if (action.field === 'selectedCoverages') {
      const next = new Set(form.selectedCoverages)
      recommendedIds.forEach((id) => next.add(id))
      onUpdateForm({ selectedCoverages: Array.from(next) })
      return
    }
    if (action.field) {
      if (action.apply) {
        onUpdateForm(mergeApplyUpdates(form, action.apply))
      }
      onFieldFocus?.(action.field)
    }
  }

  return (
    <CopilotDrawerShell
      onClose={onClose}
      composerPlaceholder="Ask about this submission…"
      chatFocusKey={String(stepIndex)}
      contentKey={`wizard-step:${stepIndex}`}
      headerTrailing={
        <CopilotConfidenceIndicator
          animatedValue={animatedConfidence}
          displayedValue={displayedConfidence}
          statusLabel={copilot.statusLabel}
          popoverTitle="Submission confidence"
          popoverDescription="Reflects how complete and consistent the submission is based on captured fields, extracted documents, and cross-step data."
        />
      }
      toolbarLeading={
        <Typography variant="subtitle2" sx={copilotSubtitleSx}>
          {copilot.headline}
        </Typography>
      }
    >
      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: copilot.proTip ? 1.5 : 2, whiteSpace: 'pre-line' }}>
        {copilot.message}
      </Typography>

      {copilot.proTip && (
        <Box
          sx={(theme) => ({
            mb: 2,
            px: 1.5,
            py: 1.25,
            borderRadius: `${layoutTokens.cardRadius}px`,
            bgcolor: surfaceMuted(theme),
          })}
        >
          <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, lineHeight: 1.55, fontSize: '0.8125rem' }}>
            {copilot.proTip}
          </Typography>
        </Box>
      )}

      <Typography variant="body2" sx={{ ...copilotSectionHeadingSx, mb: 1 }}>
        {copilot.fieldStatuses?.length ? 'At a glance' : 'Key insights'}
      </Typography>
      <Box component="ul" sx={{ m: 0, pl: 2.5, mb: 2 }}>
        {insights.map((insight) => (
          <Typography component="li" variant="body2" color="text.primary" key={insight} sx={{ ...bodySx, mb: 0.5 }}>
            {insight}
          </Typography>
        ))}
      </Box>

      {copilot.showCoverageBundle && (
        <>
          <Typography variant="body2" sx={{ ...copilotSectionHeadingSx, mb: 1 }}>
            Recommended coverage bundle
          </Typography>
          <Stack spacing={0.25} sx={{ mb: 2 }}>
            {COVERAGE_OPTIONS.filter((option) => recommendedIds.includes(option.id)).map((option) => (
              <FormControlLabel
                key={option.id}
                control={
                  <Checkbox
                    size="small"
                    checked={form.selectedCoverages.includes(option.id)}
                    onChange={(event) => {
                      const next = event.target.checked
                        ? [...form.selectedCoverages, option.id]
                        : form.selectedCoverages.filter((id) => id !== option.id)
                      onUpdateForm({ selectedCoverages: next })
                    }}
                  />
                }
                label={
                  <Typography variant="body2" color="text.primary" sx={bodySx}>
                    {option.label}
                  </Typography>
                }
                sx={{
                  ml: 0,
                  alignItems: 'center',
                  color: 'text.primary',
                  '& .MuiFormControlLabel-label': { color: 'text.primary' },
                }}
              />
            ))}
          </Stack>
        </>
      )}

      {copilot.actions.length > 0 && (
        <>
          <Divider sx={{ mb: 2 }} />
          <CopilotQuickActions
            actions={copilot.actions.map((action) => action.label)}
            onAction={(label) => {
              const action = copilot.actions.find((item) => item.label === label)
              if (action) handleAction(action)
            }}
          />
        </>
      )}
    </CopilotDrawerShell>
  )
}

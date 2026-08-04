import Box from '@mui/material/Box'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { layoutTokens } from '@/design-system/tokens/layout'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import { emptyQuoteWizardForm } from '@/pages/quotes/data/quoteWizardDefaults'
import type { QuoteWizardFormData, QuoteWizardUploadedFile } from '@/pages/quotes/data/quoteWizardTypes'
import { QuoteWizardFooter } from '@/pages/quotes/components/wizard/QuoteWizardFooter'
import { QuoteWizardPageHeader } from '@/pages/quotes/components/wizard/QuoteWizardStepper'
import { CoveragesPricingStep } from '@/pages/quotes/components/wizard/steps/CoveragesPricingStep'
import { ExposuresLocationsStep } from '@/pages/quotes/components/wizard/steps/ExposuresLocationsStep'
import { InsuredDetailsStep } from '@/pages/quotes/components/wizard/steps/InsuredDetailsStep'
import { ReviewSubmitStep } from '@/pages/quotes/components/wizard/steps/ReviewSubmitStep'
import { RiskProfileStep } from '@/pages/quotes/components/wizard/steps/RiskProfileStep'
import {
  applyWizardParseResult,
  parseWizardNaturalLanguage,
} from '@/pages/quotes/utils/parseQuoteWizardInput'
import { getRecommendedCoverageIds } from '@/pages/quotes/utils/quoteWizardCopilotContent'
import {
  applyDocumentExtraction,
  mergeUploadedFiles,
} from '@/pages/quotes/utils/quoteWizardDocuments'
import { QuoteWizardCopilotPanel } from '@/pages/quotes/components/wizard/QuoteWizardCopilotPanel'

const DOCUMENT_PARSE_DELAY_MS = 1100

function hasValue(value: string) {
  return value.trim().length > 0
}

function canAdvanceFromStep(stepIndex: number, form: QuoteWizardFormData) {
  switch (stepIndex) {
    case 0:
      return hasValue(form.name) && hasValue(form.email) && hasValue(form.address) && hasValue(form.industryNaics)
    case 1:
      return (
        hasValue(form.annualRevenue) &&
        hasValue(form.employeeCount) &&
        hasValue(form.payroll) &&
        form.operationalExposures.length > 0 &&
        form.selectedCoverages.length > 0
      )
    case 2:
      return hasValue(form.primaryLocation) && hasValue(form.annualRevenue) && hasValue(form.payroll)
    case 3:
      return form.selectedCoverages.length > 0
    case 4:
      return true
    default:
      return false
  }
}

export function NewQuoteWizardPage() {
  const navigate = useNavigate()
  const isDesktop = useIsDesktopLayout()
  const [activeStep, setActiveStep] = useState(0)
  const [form, setForm] = useState<QuoteWizardFormData>(emptyQuoteWizardForm)
  const [focusField, setFocusField] = useState<string | null>(null)
  const [copilotOpen, setCopilotOpen] = useState(true)
  const [isParsingDocuments, setIsParsingDocuments] = useState(false)
  const parseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const updateForm = useCallback((updates: Partial<QuoteWizardFormData>) => {
    setForm((current) => ({ ...current, ...updates }))
  }, [])

  const handleNaturalLanguageSubmit = useCallback(
    (text: string) => {
      setForm((current) => {
        const parsed = parseWizardNaturalLanguage(activeStep, text, current)
        return applyWizardParseResult(current, parsed)
      })
    },
    [activeStep],
  )

  const handleFilesAdd = useCallback((incoming: QuoteWizardUploadedFile[]) => {
    if (parseTimerRef.current) {
      clearTimeout(parseTimerRef.current)
    }

    setForm((current) => ({
      ...current,
      uploadedFiles: mergeUploadedFiles(current.uploadedFiles, incoming),
    }))
    setIsParsingDocuments(true)

    parseTimerRef.current = setTimeout(() => {
      setForm((current) => applyDocumentExtraction(current, current.uploadedFiles))
      setIsParsingDocuments(false)
      parseTimerRef.current = null
    }, DOCUMENT_PARSE_DELAY_MS)
  }, [])

  useEffect(() => {
    return () => {
      if (parseTimerRef.current) {
        clearTimeout(parseTimerRef.current)
      }
    }
  }, [])

  const handleFileRemove = useCallback((fileId: string) => {
    setForm((current) => {
      const uploadedFiles = current.uploadedFiles.filter((file) => file.id !== fileId)
      return { ...current, uploadedFiles }
    })
  }, [])

  const handleToggleCopilot = useCallback(() => {
    setCopilotOpen((current) => !current)
  }, [])

  const handleCloseCopilot = useCallback(() => {
    setCopilotOpen(false)
  }, [])

  useEffect(() => {
    if (!isDesktop && copilotOpen) {
      setCopilotOpen(false)
    }
  }, [isDesktop])

  useEffect(() => {
    if (activeStep === 3 && form.selectedCoverages.length === 0) {
      updateForm({ selectedCoverages: getRecommendedCoverageIds(form) })
    }
  }, [activeStep, form, updateForm])

  const canContinue = canAdvanceFromStep(activeStep, form)

  const continueLabel = useMemo(() => {
    if (activeStep === 4) return 'Submit quote'
    if (activeStep === 3) return 'Review submission'
    return 'Continue'
  }, [activeStep])

  const handleContinue = () => {
    if (activeStep === 4) {
      navigate('/quotes')
      return
    }
    if (!canContinue) return
    setActiveStep((step) => Math.min(step + 1, 4))
    setFocusField(null)
  }

  const handleBack = () => {
    setActiveStep((step) => Math.max(step - 1, 0))
    setFocusField(null)
  }

  const stepContent = useMemo(() => {
    const shared = {
      form,
      onChange: updateForm,
      onNaturalLanguageSubmit: handleNaturalLanguageSubmit,
      onFilesAdd: handleFilesAdd,
      onFileRemove: handleFileRemove,
      focusField,
    }

    switch (activeStep) {
      case 0:
        return <InsuredDetailsStep {...shared} />
      case 1:
        return <RiskProfileStep {...shared} />
      case 2:
        return <ExposuresLocationsStep {...shared} />
      case 3:
        return (
          <CoveragesPricingStep
            form={form}
            onChange={updateForm}
            onNaturalLanguageSubmit={handleNaturalLanguageSubmit}
            onFilesAdd={handleFilesAdd}
            onFileRemove={handleFileRemove}
          />
        )
      case 4:
        return (
          <ReviewSubmitStep
            form={form}
            onNaturalLanguageSubmit={handleNaturalLanguageSubmit}
            onFilesAdd={handleFilesAdd}
            onFileRemove={handleFileRemove}
          />
        )
      default:
        return null
    }
  }, [activeStep, focusField, form, handleFilesAdd, handleFileRemove, handleNaturalLanguageSubmit, updateForm])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, overflow: 'hidden' }}>
      <QuoteWizardPageHeader
        activeStep={activeStep}
        copilotOpen={copilotOpen}
        onToggleCopilot={handleToggleCopilot}
        onStepClick={(step) => {
          if (step <= activeStep) setActiveStep(step)
        }}
      />

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: `${layoutTokens.contentPaddingX}px`, py: 2.5 }}>
            {stepContent}
          </Box>
          <QuoteWizardFooter
            stepIndex={activeStep}
            onBack={handleBack}
            onContinue={handleContinue}
            continueLabel={continueLabel}
            continueDisabled={!canContinue && activeStep < 4}
            showContinue
          />
        </Box>

        {copilotOpen && (
          <ResizableRightPanel open={copilotOpen} variant="wide" onClose={handleCloseCopilot}>
            <QuoteWizardCopilotPanel
              stepIndex={activeStep}
              form={form}
              isParsingDocuments={isParsingDocuments}
              onUpdateForm={updateForm}
              onContinue={handleContinue}
              onFieldFocus={setFocusField}
              onClose={handleCloseCopilot}
            />
          </ResizableRightPanel>
        )}
      </Box>
    </Box>
  )
}

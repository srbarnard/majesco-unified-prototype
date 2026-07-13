import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import Box from '@mui/material/Box'
import Checkbox from '@mui/material/Checkbox'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { COVERAGE_OPTIONS, type QuoteWizardFormData } from '@/pages/quotes/data/quoteWizardTypes'
import { estimatePremium, formatCurrency } from '@/pages/quotes/utils/parseQuoteWizardInput'
import { getRecommendedCoverageIds } from '@/pages/quotes/utils/quoteWizardCopilotContent'
import { QuoteWizardStepHeading } from '../QuoteWizardFormField'

type StepProps = {
  form: QuoteWizardFormData
  onChange: (updates: Partial<QuoteWizardFormData>) => void
}

export function CoveragesPricingStep({ form, onChange }: StepProps) {
  const recommended = getRecommendedCoverageIds(form)
  const premium = estimatePremium(form)

  const toggleCoverage = (id: string) => {
    const next = form.selectedCoverages.includes(id)
      ? form.selectedCoverages.filter((item) => item !== id)
      : [...form.selectedCoverages, id]
    onChange({ selectedCoverages: next })
  }

  return (
    <Box>
      <QuoteWizardStepHeading>Choose coverages and pricing</QuoteWizardStepHeading>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Copilot recommends lines based on the risk profile. Select coverages to generate an indicative premium.
      </Typography>

      <Stack spacing={1.25}>
        {COVERAGE_OPTIONS.map((option) => {
          const selected = form.selectedCoverages.includes(option.id)
          const isRecommended = recommended.includes(option.id)
          return (
            <Box
              key={option.id}
              sx={{
                border: 1,
                borderColor: selected ? 'primary.main' : 'divider',
                borderRadius: `${10}px`,
                bgcolor: 'background.paper',
                px: 1.5,
                py: 1.25,
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <Checkbox checked={selected} onChange={() => toggleCoverage(option.id)} size="small" sx={{ mt: -0.25 }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" spacing={0.75}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {option.label}
                    </Typography>
                    {isRecommended && (
                      <Stack direction="row" alignItems="center" spacing={0.25} color="success.main">
                        <CheckCircleOutlineIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption">Recommended</Typography>
                      </Stack>
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                    {option.description}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          )
        })}
      </Stack>

      <Box
        sx={(theme) => ({
          mt: 2.5,
          p: 2,
          borderRadius: `${10}px`,
          bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : 'grey.50',
          border: 1,
          borderColor: 'divider',
        })}
      >
        <Typography variant="caption" color="text.secondary">
          Indicative premium
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 600, mt: 0.25 }}>
          {form.selectedCoverages.length > 0 ? formatCurrency(String(premium)) : '—'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
          Final premium will be calculated after rating. {form.selectedCoverages.length} line
          {form.selectedCoverages.length === 1 ? '' : 's'} selected.
        </Typography>
      </Box>
    </Box>
  )
}

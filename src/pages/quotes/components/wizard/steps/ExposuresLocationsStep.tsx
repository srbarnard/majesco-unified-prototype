import AddIcon from '@mui/icons-material/Add'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { TaskDetailAccordion } from '@/pages/tasks/components/TaskDetailSection'
import type { QuoteWizardFormData } from '@/pages/quotes/data/quoteWizardTypes'
import {
  QuoteWizardFormCard,
  QuoteWizardFormField,
  QuoteWizardStepHeading,
} from '../QuoteWizardFormField'
import { QuoteWizardNaturalLanguageInput } from '../QuoteWizardNaturalLanguageInput'

type StepProps = {
  form: QuoteWizardFormData
  onChange: (updates: Partial<QuoteWizardFormData>) => void
  onNaturalLanguageSubmit: (text: string) => void
  focusField?: string | null
}

function isAiFilled(form: QuoteWizardFormData, field: string) {
  return form.aiFilledFields.includes(field)
}

export function ExposuresLocationsStep({ form, onChange, onNaturalLanguageSubmit, focusField }: StepProps) {
  return (
    <Box>
      <QuoteWizardStepHeading>Confirm exposure and locations</QuoteWizardStepHeading>

      <QuoteWizardNaturalLanguageInput
        value=""
        placeholder="e.g., Primary location at 123 Main St, Princeton, NJ with $1M revenue"
        onChange={() => undefined}
        onSubmit={onNaturalLanguageSubmit}
        enableAttachments={false}
      />

      <QuoteWizardFormCard>
        <QuoteWizardFormField
          label="Estimated annual revenue"
          value={form.annualRevenue}
          onChange={(value) => onChange({ annualRevenue: value })}
          helperText="Approximate amount is acceptable"
          aiFilled={isAiFilled(form, 'annualRevenue')}
          autoFocus={focusField === 'annualRevenue'}
        />
        <QuoteWizardFormField
          label="Payroll"
          value={form.payroll}
          onChange={(value) => onChange({ payroll: value })}
          helperText="Required for Workers Compensation"
          aiFilled={isAiFilled(form, 'payroll')}
          autoFocus={focusField === 'payroll'}
        />
        <QuoteWizardFormField
          label="Primary location"
          value={form.primaryLocation}
          onChange={(value) =>
            onChange({
              primaryLocation: value,
              aiFilledFields: form.aiFilledFields.filter((f) => f !== 'primaryLocation'),
            })
          }
          helperText="Enter a city and state or select a full address"
          fullWidth
          aiFilled={isAiFilled(form, 'primaryLocation')}
        />
      </QuoteWizardFormCard>

      <TaskDetailAccordion
        title="Additional locations"
        subtitle={form.additionalLocations.length ? `${form.additionalLocations.length} added` : 'Optional secondary sites'}
      >
        <Stack spacing={1.5}>
          {form.additionalLocations.map((location, index) => (
            <QuoteWizardFormField
              key={index}
              label={`Location ${index + 2}`}
              value={location}
              onChange={(value) => {
                const next = [...form.additionalLocations]
                next[index] = value
                onChange({ additionalLocations: next })
              }}
              fullWidth
            />
          ))}
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <IconButton
              size="small"
              aria-label="Add location"
              onClick={() => onChange({ additionalLocations: [...form.additionalLocations, ''] })}
            >
              <AddIcon fontSize="small" />
            </IconButton>
            <Typography variant="body2" color="primary">
              Add locations
            </Typography>
          </Stack>
        </Stack>
      </TaskDetailAccordion>

      <TaskDetailAccordion title="Allocation details (optional)" subtitle="Split revenue or payroll by location">
        <QuoteWizardFormField
          label="Allocation notes"
          value={form.allocationDetails}
          onChange={(value) => onChange({ allocationDetails: value })}
          helperText="Optional breakdown for multi-location accounts"
          fullWidth
          multiline
        />
      </TaskDetailAccordion>
    </Box>
  )
}

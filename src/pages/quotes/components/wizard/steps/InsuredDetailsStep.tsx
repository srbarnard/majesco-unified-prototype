import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { TaskDetailAccordion } from '@/pages/tasks/components/TaskDetailSection'
import type { QuoteWizardFormData, QuoteWizardUploadedFile } from '@/pages/quotes/data/quoteWizardTypes'
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
  onFilesAdd?: (files: QuoteWizardUploadedFile[]) => void
  onFileRemove?: (fileId: string) => void
  focusField?: string | null
}

function isAiFilled(form: QuoteWizardFormData, field: string) {
  return form.aiFilledFields.includes(field)
}

export function InsuredDetailsStep({
  form,
  onChange,
  onNaturalLanguageSubmit,
  onFilesAdd,
  onFileRemove,
  focusField,
}: StepProps) {
  return (
    <Box>
      <QuoteWizardStepHeading>Who is being insured?</QuoteWizardStepHeading>

      <QuoteWizardNaturalLanguageInput
        value=""
        placeholder="e.g., GreenLeaf Landscaping in Princeton, NJ — or drop ACORDs and schedules here"
        files={form.uploadedFiles}
        onChange={() => undefined}
        onSubmit={onNaturalLanguageSubmit}
        onFilesAdd={onFilesAdd}
        onFileRemove={onFileRemove}
      />

      <QuoteWizardFormCard>
        <QuoteWizardFormField
          label="Name"
          value={form.name}
          onChange={(value) => onChange({ name: value, aiFilledFields: form.aiFilledFields.filter((f) => f !== 'name') })}
          helperText="Business or individual name"
          aiFilled={isAiFilled(form, 'name')}
          autoFocus={focusField === 'name'}
        />
        <QuoteWizardFormField
          label="Email"
          value={form.email}
          onChange={(value) => onChange({ email: value, aiFilledFields: form.aiFilledFields.filter((f) => f !== 'email') })}
          helperText="Used to help identify the insured"
          aiFilled={isAiFilled(form, 'email')}
          autoFocus={focusField === 'email'}
        />
        <QuoteWizardFormField
          label="Address"
          value={form.address}
          onChange={(value) => onChange({ address: value, aiFilledFields: form.aiFilledFields.filter((f) => f !== 'address') })}
          helperText="Enter a city and state or select a full address"
          placeholder="Start typing address…"
          fullWidth
          aiFilled={isAiFilled(form, 'address')}
          autoFocus={focusField === 'address'}
        />
        <Box sx={{ gridColumn: '1 / -1' }}>
          <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
            Industry / NAICS
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={form.industryNaics}
            onChange={(event) =>
              onChange({
                industryNaics: event.target.value,
                aiFilledFields: form.aiFilledFields.filter((f) => f !== 'industryNaics'),
              })
            }
          >
            <MenuItem value="">Search industry or describe the business</MenuItem>
            <MenuItem value="561730 - Landscaping Services">561730 - Landscaping Services</MenuItem>
            <MenuItem value="238220 - Plumbing, Heating, and Air-Conditioning Contractors">
              238220 - Plumbing, Heating, and Air-Conditioning Contractors
            </MenuItem>
            <MenuItem value="722511 - Full-Service Restaurants">722511 - Full-Service Restaurants</MenuItem>
          </TextField>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            Used to classify the insured&apos;s business
          </Typography>
        </Box>
      </QuoteWizardFormCard>

      <TaskDetailAccordion
        title="Additional details (optional)"
        defaultExpanded={form.showAdditionalDetails}
        subtitle={form.showAdditionalDetails ? 'Expanded' : 'Phone, tax ID, customer and broker numbers'}
      >
        <Stack spacing={2}>
          <QuoteWizardFormField
            label="Phone"
            value={form.phone}
            onChange={(value) => onChange({ phone: value })}
            helperText="Optional contact number"
          />
          <QuoteWizardFormField
            label="Tax ID"
            value={form.taxId}
            onChange={(value) => onChange({ taxId: value })}
            helperText="EIN or SSN (if available)"
          />
          <QuoteWizardFormField
            label="Customer #"
            value={form.customerNumber}
            onChange={(value) => onChange({ customerNumber: value })}
            helperText="Existing customer identifier"
          />
          <QuoteWizardFormField
            label="Broker #"
            value={form.brokerNumber}
            onChange={(value) => onChange({ brokerNumber: value })}
            helperText="Associated broker or agent ID"
          />
        </Stack>
      </TaskDetailAccordion>
    </Box>
  )
}

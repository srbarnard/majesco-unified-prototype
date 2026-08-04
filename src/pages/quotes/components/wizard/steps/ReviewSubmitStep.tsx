import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  COVERAGE_OPTIONS,
  type QuoteWizardFormData,
  type QuoteWizardUploadedFile,
} from '@/pages/quotes/data/quoteWizardTypes'
import { estimatePremium, formatCurrency } from '@/pages/quotes/utils/parseQuoteWizardInput'
import { TaskDetailAccordion } from '@/pages/tasks/components/TaskDetailSection'
import { QuoteWizardStepHeading } from '../QuoteWizardFormField'
import { QuoteWizardNaturalLanguageInput } from '../QuoteWizardNaturalLanguageInput'

type StepProps = {
  form: QuoteWizardFormData
  onNaturalLanguageSubmit: (text: string) => void
  onFilesAdd?: (files: QuoteWizardUploadedFile[]) => void
  onFileRemove?: (fileId: string) => void
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  if (!value) return null
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ py: 0.75 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>
        {value}
      </Typography>
    </Stack>
  )
}

export function ReviewSubmitStep({ form, onNaturalLanguageSubmit, onFilesAdd, onFileRemove }: StepProps) {
  const premium = estimatePremium(form)
  const coverageLabels = COVERAGE_OPTIONS.filter((option) => form.selectedCoverages.includes(option.id)).map(
    (option) => option.label,
  )

  return (
    <Box>
      <QuoteWizardStepHeading>Review and submit</QuoteWizardStepHeading>

      <QuoteWizardNaturalLanguageInput
        value=""
        placeholder="Drop any final documents here — ACORDs, schedules, loss runs, or endorsements"
        files={form.uploadedFiles}
        onChange={() => undefined}
        onSubmit={onNaturalLanguageSubmit}
        onFilesAdd={onFilesAdd}
        onFileRemove={onFileRemove}
      />

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Confirm the submission details below. Copilot has pre-filled fields where confidence was high — you can go back
        to any step to override.
      </Typography>

      <TaskDetailAccordion title="Insured details" defaultExpanded>
        <ReviewRow label="Name" value={form.name} />
        <ReviewRow label="Email" value={form.email} />
        <ReviewRow label="Address" value={form.address} />
        <ReviewRow label="Industry" value={form.industryNaics} />
      </TaskDetailAccordion>

      <TaskDetailAccordion title="Risk profile" defaultExpanded>
        <ReviewRow label="Annual revenue" value={form.annualRevenue ? formatCurrency(form.annualRevenue) : ''} />
        <ReviewRow label="Employees" value={form.employeeCount} />
        <ReviewRow label="Payroll" value={form.payroll ? formatCurrency(form.payroll) : ''} />
        <ReviewRow
          label="Exposures"
          value={form.operationalExposures.map((item) => (item === 'vehicles' ? 'Vehicles' : 'Equipment')).join(', ')}
        />
      </TaskDetailAccordion>

      <TaskDetailAccordion title="Locations" defaultExpanded={false}>
        <ReviewRow label="Primary location" value={form.primaryLocation} />
        {form.additionalLocations.filter(Boolean).map((location, index) => (
          <ReviewRow key={index} label={`Location ${index + 2}`} value={location} />
        ))}
      </TaskDetailAccordion>

      <TaskDetailAccordion title="Coverages & pricing" defaultExpanded>
        <ReviewRow label="Selected lines" value={coverageLabels.join(', ')} />
        <Divider sx={{ my: 1 }} />
        <Stack direction="row" justifyContent="space-between" alignItems="baseline">
          <Typography variant="subtitle2">Indicative premium</Typography>
          <Typography variant="h6" color="primary.main" sx={{ fontWeight: 600 }}>
            {formatCurrency(String(premium))}
          </Typography>
        </Stack>
      </TaskDetailAccordion>
    </Box>
  )
}

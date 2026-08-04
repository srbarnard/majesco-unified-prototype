import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { TaskDetailAccordion } from '@/pages/tasks/components/TaskDetailSection'
import type {
  OperationalExposure,
  QuoteWizardFormData,
  QuoteWizardUploadedFile,
} from '@/pages/quotes/data/quoteWizardTypes'
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

function toggleExposure(
  form: QuoteWizardFormData,
  exposure: OperationalExposure,
  onChange: StepProps['onChange'],
) {
  const next = form.operationalExposures.includes(exposure)
    ? form.operationalExposures.filter((item) => item !== exposure)
    : [...form.operationalExposures, exposure]
  onChange({ operationalExposures: next })
}

export function RiskProfileStep({
  form,
  onChange,
  onNaturalLanguageSubmit,
  onFilesAdd,
  onFileRemove,
  focusField,
}: StepProps) {
  return (
    <Box>
      <QuoteWizardStepHeading>Let&apos;s refine the risk profile</QuoteWizardStepHeading>

      <QuoteWizardNaturalLanguageInput
        value=""
        placeholder="e.g., Estimated revenue of $850,000 with 25 employees — or drop payroll and exposure docs here"
        files={form.uploadedFiles}
        onChange={() => undefined}
        onSubmit={onNaturalLanguageSubmit}
        onFilesAdd={onFilesAdd}
        onFileRemove={onFileRemove}
      />

      <QuoteWizardFormCard>
        <QuoteWizardFormField
          label="Estimated annual revenue"
          value={form.annualRevenue}
          onChange={(value) =>
            onChange({ annualRevenue: value, aiFilledFields: form.aiFilledFields.filter((f) => f !== 'annualRevenue') })
          }
          helperText="Approximate amount is acceptable"
          aiFilled={isAiFilled(form, 'annualRevenue')}
          autoFocus={focusField === 'annualRevenue'}
        />
        <QuoteWizardFormField
          label="Estimated number of employees"
          value={form.employeeCount}
          onChange={(value) =>
            onChange({ employeeCount: value, aiFilledFields: form.aiFilledFields.filter((f) => f !== 'employeeCount') })
          }
          helperText="Total full-time and part-time employees"
          aiFilled={isAiFilled(form, 'employeeCount')}
        />
        <QuoteWizardFormField
          label="Payroll"
          value={form.payroll}
          onChange={(value) =>
            onChange({ payroll: value, aiFilledFields: form.aiFilledFields.filter((f) => f !== 'payroll') })
          }
          helperText="Required for Workers Compensation"
          aiFilled={isAiFilled(form, 'payroll')}
          autoFocus={focusField === 'payroll'}
        />
        <Box>
          <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', mb: 0.75 }}>
            Operational exposures
          </Typography>
          <Stack direction="row" spacing={1}>
            {(['vehicles', 'equipment'] as const).map((exposure) => {
              const selected = form.operationalExposures.includes(exposure)
              return (
                <Chip
                  key={exposure}
                  label={exposure === 'vehicles' ? 'Vehicles' : 'Equipment'}
                  clickable
                  color={selected ? 'primary' : 'default'}
                  variant={selected ? 'filled' : 'outlined'}
                  onClick={() => toggleExposure(form, exposure, onChange)}
                />
              )
            })}
          </Stack>
        </Box>
      </QuoteWizardFormCard>

      {(form.operationalExposures.includes('vehicles') || form.operationalExposures.includes('equipment')) && (
        <TaskDetailAccordion
          title="Exposure details"
          defaultExpanded
          subtitle="Vehicles and equipment used in operations"
        >
          <Stack spacing={2}>
            {form.operationalExposures.includes('vehicles') && (
              <>
                <QuoteWizardFormField
                  label="Number of vehicles"
                  value={form.vehicleCount}
                  onChange={(value) => onChange({ vehicleCount: value })}
                />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', mb: 0.5 }}>
                    Type of vehicles
                  </Typography>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    value={form.vehicleType}
                    onChange={(event) => onChange({ vehicleType: event.target.value })}
                  >
                    <MenuItem value="">Select vehicle type</MenuItem>
                    <MenuItem value="light">Light trucks & vans</MenuItem>
                    <MenuItem value="medium">Medium trucks</MenuItem>
                    <MenuItem value="heavy">Heavy trucks</MenuItem>
                  </TextField>
                </Box>
              </>
            )}
            {form.operationalExposures.includes('equipment') && (
              <>
                <QuoteWizardFormField
                  label="Estimated equipment value"
                  value={form.equipmentValue}
                  onChange={(value) => onChange({ equipmentValue: value })}
                />
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 500, display: 'block', mb: 0.75 }}>
                    Equipment types
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={0.75}>
                    {['Transported', 'Stationary', 'Mobile'].map((type) => {
                      const selected = form.equipmentTypes.includes(type)
                      return (
                        <Chip
                          key={type}
                          label={type}
                          clickable
                          color={selected ? 'primary' : 'default'}
                          variant={selected ? 'filled' : 'outlined'}
                          onClick={() => {
                            const next = selected
                              ? form.equipmentTypes.filter((item) => item !== type)
                              : [...form.equipmentTypes, type]
                            onChange({ equipmentTypes: next })
                          }}
                        />
                      )
                    })}
                  </Stack>
                </Box>
              </>
            )}
          </Stack>
        </TaskDetailAccordion>
      )}
    </Box>
  )
}

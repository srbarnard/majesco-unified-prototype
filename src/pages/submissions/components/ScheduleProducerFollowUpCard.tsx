import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { Button } from '@/design-system/components'
import { filterChipSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import {
  COPILOT_REVEAL_ACTIONS_ATTR,
  COPILOT_REVEAL_ATTR,
} from '@/pages/policies/components/copilot/copilotReveal'
import type { SubmissionListRecord } from '@/pages/submissions/data/mockSubmissions'
import { SUBMISSIONS_CURRENT_USER } from '@/pages/submissions/data/producerRequestEmail'
import { SUBMISSION_ASSIGNEE_OPTIONS } from '@/pages/submissions/filters/submissionsListFilterTypes'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

export type FollowUpPriority = 'Low' | 'Normal' | 'High'
export type FollowUpDuePreset = 'tomorrow' | '2days' | 'eow' | 'custom'

const PRIORITY_OPTIONS: FollowUpPriority[] = ['Low', 'Normal', 'High']

const DUE_OPTIONS: Array<{ id: FollowUpDuePreset; label: string }> = [
  { id: 'tomorrow', label: 'Tomorrow' },
  { id: '2days', label: 'In 2 days' },
  { id: 'eow', label: 'End of week' },
  { id: 'custom', label: 'Custom date…' },
]

function startOfDay(date: Date) {
  const next = new Date(date)
  next.setHours(0, 0, 0, 0)
  return next
}

function addDays(date: Date, days: number) {
  const next = new Date(date)
  next.setDate(next.getDate() + days)
  return startOfDay(next)
}

/** Friday of the current week (or today if already Friday). */
function endOfWeek(from = new Date()) {
  const day = from.getDay() // 0 Sun … 5 Fri
  const daysUntilFriday = (5 - day + 7) % 7
  return addDays(from, daysUntilFriday)
}

function toInputDateValue(date: Date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseInputDateValue(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [y, m, d] = value.split('-').map(Number)
  const date = new Date(y, m - 1, d)
  return Number.isNaN(date.getTime()) ? null : startOfDay(date)
}

export function resolveFollowUpDueDate(
  preset: FollowUpDuePreset,
  customValue: string,
  from = new Date(),
): Date | null {
  if (preset === 'tomorrow') return addDays(from, 1)
  if (preset === '2days') return addDays(from, 2)
  if (preset === 'eow') return endOfWeek(from)
  return parseInputDateValue(customValue)
}

export function formatFollowUpDueLabel(date: Date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function buildProducerFollowUpTaskName(submission: SubmissionListRecord) {
  return `Follow up with producer · ${submission.insuredName} · ${submission.submissionNumber}`
}

export function buildProducerFollowUpNotesPrefill(
  submission: SubmissionListRecord,
  quoteSummaryLine?: string,
) {
  if (quoteSummaryLine?.trim()) {
    return quoteSummaryLine.trim().split('\n')[0]!.replace(/\.$/, '')
  }
  const sent = submission.quotePackageSent
  if (sent) {
    return `Quote options sent · Recommended ${sent.recommendedLabel}`
  }
  return `Follow up on quote for ${submission.submissionNumber}`
}

export type ScheduleProducerFollowUpCardProps = {
  submission?: SubmissionListRecord | null
  /** Used when `submission` is omitted (e.g. Notes on a policy). */
  defaultTaskName?: string
  notesPrefill: string
  onCancel: () => void
  onCreate: (task: {
    name: string
    assignee: string
    priority: FollowUpPriority
    due: Date
    notes: string
  }) => void
}

/** In-thread create-task mini-form (Chat / Notes follow-up). */
export function ScheduleProducerFollowUpCard({
  submission = null,
  defaultTaskName,
  notesPrefill,
  onCancel,
  onCreate,
}: ScheduleProducerFollowUpCardProps) {
  const [taskName, setTaskName] = useState(
    () =>
      defaultTaskName ??
      (submission ? buildProducerFollowUpTaskName(submission) : 'Follow-up task'),
  )
  const [assignee, setAssignee] = useState<string | null>(SUBMISSIONS_CURRENT_USER)
  const [priority, setPriority] = useState<FollowUpPriority>('Normal')
  const [duePreset, setDuePreset] = useState<FollowUpDuePreset>('tomorrow')
  const [customDue, setCustomDue] = useState(() => toInputDateValue(addDays(new Date(), 1)))
  const [notes, setNotes] = useState(notesPrefill)

  const dueDate = useMemo(
    () => resolveFollowUpDueDate(duePreset, customDue),
    [duePreset, customDue],
  )

  const canCreate = Boolean(taskName.trim() && assignee && dueDate)

  return (
    <Box
      {...{ [COPILOT_REVEAL_ATTR]: '' }}
      sx={(theme) => ({
        p: 2,
        borderRadius: `${layoutTokens.cardRadius}px`,
        bgcolor: getFigmaColors(theme.palette.mode).primary.hover,
      })}
    >
      <Stack spacing={1.25}>
        <Box>
          <Typography
            variant="caption"
            sx={{ ...bodySx, fontWeight: 500, color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Task name
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={2}
            value={taskName}
            onChange={(event) => setTaskName(event.target.value)}
            inputProps={{ 'aria-label': 'Task name' }}
          />
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{ ...bodySx, fontWeight: 500, color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Assigned to
          </Typography>
          <Autocomplete
            size="small"
            options={[...SUBMISSION_ASSIGNEE_OPTIONS]}
            value={assignee}
            onChange={(_, next) => setAssignee(next)}
            renderInput={(params) => (
              <TextField {...params} size="small" placeholder="Assignee" />
            )}
          />
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{ ...bodySx, fontWeight: 500, color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Priority
          </Typography>
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
            {PRIORITY_OPTIONS.map((option) => {
              const selected = priority === option
              return (
                <Chip
                  key={option}
                  size="small"
                  label={option}
                  onClick={() => setPriority(option)}
                  sx={{
                    ...filterChipSx,
                    ...(selected
                      ? {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': { bgcolor: 'primary.dark' },
                        }
                      : null),
                  }}
                />
              )
            })}
          </Stack>
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{ ...bodySx, fontWeight: 500, color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Due
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={duePreset}
            onChange={(event) => setDuePreset(event.target.value as FollowUpDuePreset)}
            inputProps={{ 'aria-label': 'Due date' }}
            sx={{ mb: duePreset === 'custom' ? 1 : 0 }}
          >
            {DUE_OPTIONS.map((option) => (
              <MenuItem key={option.id} value={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          {duePreset === 'custom' ? (
            <TextField
              fullWidth
              size="small"
              type="date"
              value={customDue}
              onChange={(event) => setCustomDue(event.target.value)}
              inputProps={{ 'aria-label': 'Custom due date' }}
            />
          ) : null}
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{ ...bodySx, fontWeight: 500, color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Description
          </Typography>
          <TextField
            fullWidth
            size="small"
            multiline
            minRows={2}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Optional"
            inputProps={{ 'aria-label': 'Task description' }}
          />
        </Box>

        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ pt: 0.25 }}
          {...{ [COPILOT_REVEAL_ACTIONS_ATTR]: '' }}
        >
          <Button size="small" variant="text" color="primary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="small"
            variant="contained"
            color="primary"
            disabled={!canCreate}
            onClick={() => {
              if (!assignee || !dueDate || !taskName.trim()) return
              onCreate({
                name: taskName.trim(),
                assignee,
                priority,
                due: dueDate,
                notes: notes.trim(),
              })
            }}
          >
            Create task
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

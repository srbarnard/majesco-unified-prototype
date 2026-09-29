import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
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
import { sortBlockedForAssign } from '@/pages/submissions/components/assignBlockedCompose'
import type { SubmissionListRecord } from '@/pages/submissions/data/mockSubmissions'
import { SUBMISSION_ASSIGNEE_OPTIONS } from '@/pages/submissions/filters/submissionsListFilterTypes'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function submissionOptionLabel(row: SubmissionListRecord) {
  const lob = row.linesOfBusiness.join(', ')
  return `${row.submissionNumber} · ${row.insuredName} · ${lob} · ${row.assignedTo}`
}

function submissionChipLabel(row: SubmissionListRecord) {
  return `${row.submissionNumber} · ${row.insuredName}`
}

export type AssignBlockedComposeCardProps = {
  blockedOptions: SubmissionListRecord[]
  initialSelected: SubmissionListRecord[]
  onCancel: () => void
  onAssign: (submissions: SubmissionListRecord[], assignee: string, note: string) => void
}

/** Compact Copilot-reply form — thread chrome lives outside this card. */
export function AssignBlockedComposeCard({
  blockedOptions,
  initialSelected,
  onCancel,
  onAssign,
}: AssignBlockedComposeCardProps) {
  const sortedOptions = useMemo(() => sortBlockedForAssign(blockedOptions), [blockedOptions])
  const optionIds = useMemo(() => new Set(sortedOptions.map((row) => row.id)), [sortedOptions])
  const [selected, setSelected] = useState<SubmissionListRecord[]>(() =>
    sortBlockedForAssign(initialSelected).filter((row) => optionIds.has(row.id)),
  )
  const [assignee, setAssignee] = useState<string | null>(null)
  const [note, setNote] = useState('')

  const canAssign = selected.length > 0 && Boolean(assignee)

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
            Submission(s)
          </Typography>
          <Autocomplete
            multiple
            size="small"
            options={sortedOptions}
            value={selected}
            onChange={(_, next) => setSelected(next)}
            getOptionLabel={submissionOptionLabel}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            filterSelectedOptions
            renderTags={(value, getTagProps) =>
              value.map((option, index) => {
                const { key, ...tagProps } = getTagProps({ index })
                return (
                  <Chip
                    key={key}
                    size="small"
                    label={submissionChipLabel(option)}
                    {...tagProps}
                    sx={filterChipSx}
                  />
                )
              })
            }
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ ...bodySx, fontWeight: 600 }}>
                    {option.submissionNumber} · {option.insuredName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block" sx={bodySx}>
                    {option.linesOfBusiness.join(', ')} · {option.assignedTo}
                  </Typography>
                </Box>
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                placeholder={selected.length === 0 ? 'Select blocked submission(s)' : undefined}
              />
            )}
          />
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{ ...bodySx, fontWeight: 500, color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Assign to
          </Typography>
          <Autocomplete
            size="small"
            options={[...SUBMISSION_ASSIGNEE_OPTIONS]}
            value={assignee}
            onChange={(_, next) => setAssignee(next)}
            renderInput={(params) => (
              <TextField {...params} size="small" placeholder="Assignee or queue" />
            )}
          />
        </Box>

        <Box>
          <Typography
            variant="caption"
            sx={{ ...bodySx, fontWeight: 500, color: 'text.secondary', display: 'block', mb: 0.5 }}
          >
            Note
          </Typography>
          <TextField
            fullWidth
            size="small"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional"
            inputProps={{ 'aria-label': 'Assignment note' }}
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
            disabled={!canAssign}
            onClick={() => {
              if (!assignee || selected.length === 0) return
              onAssign(selected, assignee, note.trim())
            }}
          >
            Assign
          </Button>
        </Stack>
      </Stack>
    </Box>
  )
}

import Autocomplete from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/design-system/components'
import { filterChipSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { getFigmaColors } from '@/design-system/tokens/figma-colors'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { SubmissionListRecord } from '@/pages/submissions/data/mockSubmissions'
import { SUBMISSION_ASSIGNEE_OPTIONS } from '@/pages/submissions/filters/submissionsListFilterTypes'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

/** Blocked-only options: Underwriting Queue first, then oldest Sub #. */
export function sortBlockedForAssign(rows: SubmissionListRecord[]) {
  return [...rows]
    .filter((row) => row.status === 'Blocked')
    .sort((a, b) => {
      const aQueue = a.assignedTo === 'Underwriting Queue' ? 0 : 1
      const bQueue = b.assignedTo === 'Underwriting Queue' ? 0 : 1
      if (aQueue !== bQueue) return aQueue - bQueue
      return a.submissionNumber.localeCompare(b.submissionNumber)
    })
}

function submissionOptionLabel(row: SubmissionListRecord) {
  const lob = row.linesOfBusiness.join(', ')
  return `${row.submissionNumber} · ${row.insuredName} · ${lob} · ${row.assignedTo}`
}

function submissionChipLabel(row: SubmissionListRecord) {
  return `${row.submissionNumber} · ${row.insuredName}`
}

export type AssignThreadTurn = {
  id: string
  role: 'user' | 'copilot'
  text: string
  at: number
}

export type AssignComposeSession = {
  selectedIds: string[]
  focusAssignee: boolean
  openedAt: number
  userTurnId: string
}

export type AssignBlockedPromptSession = {
  nonBlockedCount: number
  totalCount: number
  blockedIds: string[]
  openedAt: number
  userTurnId: string
}

export function formatAssignTurnTime(at: number) {
  return new Date(at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export function buildAssignReceiptText(
  submissions: Pick<SubmissionListRecord, 'submissionNumber'>[],
  assignee: string,
  note: string,
) {
  const notePart = note ? ` Note: ${note}` : ''
  if (submissions.length === 1) {
    return `Assigned ${submissions[0]!.submissionNumber} to ${assignee}.${notePart}`
  }
  return `${submissions.length} submissions assigned to ${assignee}.${notePart}`
}

export type AssignBlockedComposeCardProps = {
  blockedOptions: SubmissionListRecord[]
  initialSelected: SubmissionListRecord[]
  focusAssignee?: boolean
  onCancel: () => void
  onAssign: (submissions: SubmissionListRecord[], assignee: string, note: string) => void
}

/** Compact Copilot-reply form — thread chrome lives outside this card. */
export function AssignBlockedComposeCard({
  blockedOptions,
  initialSelected,
  focusAssignee = false,
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
  const assigneeInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!focusAssignee) return
    const timer = window.setTimeout(() => assigneeInputRef.current?.focus(), 50)
    return () => window.clearTimeout(timer)
  }, [focusAssignee])

  const canAssign = selected.length > 0 && Boolean(assignee)

  return (
    <Box
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
              <TextField
                {...params}
                size="small"
                placeholder="Assignee or queue"
                inputRef={assigneeInputRef}
              />
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

        <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ pt: 0.25 }}>
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

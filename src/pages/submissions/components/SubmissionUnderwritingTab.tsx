import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import BlockIcon from '@mui/icons-material/Block'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { TaskDetailSection, TaskEntityRow } from '@/pages/tasks/components/TaskDetailSection'
import {
  isSubmissionAssignmentQueue,
  type SubmissionDetailsRecord,
} from '@/pages/submissions/data/resolveSubmissionContext'
import { resolvePremiumStructureOptions } from '@/pages/submissions/data/mockSubmissions'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

type SubmissionUnderwritingTabProps = {
  submission: SubmissionDetailsRecord
  onAssign?: () => void
}

export function SubmissionUnderwritingTab({ submission, onAssign }: SubmissionUnderwritingTabProps) {
  const assignedIsQueue = isSubmissionAssignmentQueue(submission.assignedTo)
  const openBlockers = submission.issues.filter(
    (issue) => issue.severity === 'blocking' && !issue.resolvedAt,
  )
  const structureOptions = resolvePremiumStructureOptions(submission.premiumEstimates, {
    linesOfBusiness: submission.linesOfBusiness,
    confidence: submission.confidence,
  })
  const recommended =
    structureOptions.find((option) => option.recommended) ?? structureOptions[0] ?? null

  const hasStructureReview =
    (submission.status === 'Ready' && recommended != null) ||
    (submission.status === 'Blocked' && openBlockers.length > 0)

  if (!hasStructureReview) {
    return (
      <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 480 }}>
        <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, fontSize: '0.875rem' }}>
          No structure review yet
        </Typography>
        <Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AssignmentIndOutlinedIcon sx={{ fontSize: 18 }} />}
            onClick={onAssign}
            sx={{
              textTransform: 'none',
              fontFamily: figmaFontFamilyStack.body,
              fontWeight: 500,
            }}
          >
            Assign
          </Button>
        </Box>
      </Stack>
    )
  }

  return (
    <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 560 }}>
      <TaskDetailSection title="Assignment">
        <TaskEntityRow
          label={assignedIsQueue ? 'Queue' : 'Underwriter'}
          value={submission.assignedTo}
        />
      </TaskDetailSection>

      {submission.status === 'Ready' && recommended ? (
        <TaskDetailSection title="Structure recommendation">
          <TaskEntityRow
            label={`${recommended.label}${recommended.recommended ? ' · Recommended' : ''}${
              submission.approvedPremiumLabel === recommended.label ? ' · Approved' : ''
            }`}
            value={recommended.range}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ...bodySx, fontSize: '0.8125rem', mt: 0.75 }}
          >
            {recommended.rationale}
          </Typography>
        </TaskDetailSection>
      ) : null}

      {submission.status === 'Blocked' && openBlockers.length > 0 ? (
        <TaskDetailSection title="Blocks structure">
          <Stack spacing={1}>
            {openBlockers.map((issue) => (
              <Stack key={issue.id} direction="row" spacing={1} alignItems="flex-start">
                <BlockIcon sx={{ fontSize: 18, color: 'error.main', mt: 0.125 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.8125rem' }}>
                    {issue.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ...bodySx, fontSize: '0.75rem' }}
                  >
                    {issue.summary}
                  </Typography>
                </Box>
              </Stack>
            ))}
          </Stack>
        </TaskDetailSection>
      ) : null}
    </Stack>
  )
}

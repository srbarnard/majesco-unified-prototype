import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined'
import BlockIcon from '@mui/icons-material/Block'
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import NoteAddOutlinedIcon from '@mui/icons-material/NoteAddOutlined'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import type { SvgIconComponent } from '@mui/icons-material'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router'
import type { RecentActivityItem } from '@/app/data/homeMock'
import { ActivityRail } from '@/app/pages/home/ActivityRail'
import { accentSubtleHover, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { OverviewQuickAction } from '@/pages/policies/data/mockOverview'
import { TaskDetailSection, TaskEntityRow } from '@/pages/tasks/components/TaskDetailSection'
import { getSubmissionActivity } from '@/pages/submissions/data/mockSubmissionActivity'
import type { SubmissionDetailsRecord } from '@/pages/submissions/data/resolveSubmissionContext'

const GUTTER = 3.125

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const sectionTitleSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
  fontSize: '0.8125rem',
  color: 'text.secondary',
  letterSpacing: '0.01em',
} as const

export const submissionOverviewQuickActions: OverviewQuickAction[] = [
  { id: 'documents', label: 'Request missing docs' },
  { id: 'assign', label: 'Assign' },
  { id: 'note', label: 'Add note' },
  { id: 'email', label: 'Send email' },
]

function submissionActivitySubtitle(item: RecentActivityItem) {
  const who = item.performedBy.split(' · ')[0]?.trim()
  return who ? `${who} · ${item.detail}` : item.detail
}

function QuickActionsList({
  actions,
  onQuickAction,
}: {
  actions: OverviewQuickAction[]
  onQuickAction?: (actionId: string) => void
}) {
  const actionIcons: Record<string, SvgIconComponent> = {
    documents: DescriptionOutlinedIcon,
    assign: AssignmentIndOutlinedIcon,
    note: NoteAddOutlinedIcon,
    email: EmailOutlinedIcon,
  }

  return (
    <TaskDetailSection title="Quick actions">
      <Stack spacing={0.125} alignItems="stretch">
        {actions.map((action) => {
          const Icon = actionIcons[action.id] ?? DescriptionOutlinedIcon

          return (
            <Box
              key={action.id}
              component="button"
              type="button"
              onClick={() => onQuickAction?.(action.id)}
              sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                border: 0,
                bgcolor: 'transparent',
                cursor: 'pointer',
                px: 0.75,
                py: 0.75,
                ml: -0.75,
                borderRadius: 1.5,
                textAlign: 'left',
                transition: 'background-color 0.15s ease',
                '&:hover': {
                  bgcolor: accentSubtleHover(theme),
                },
              })}
            >
              <Box
                sx={(theme) => ({
                  width: 28,
                  height: 28,
                  borderRadius: 1.25,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  bgcolor: surfaceSubtle(theme),
                  color: 'text.secondary',
                })}
              >
                <Icon sx={{ fontSize: 16 }} />
              </Box>
              <Typography
                variant="body2"
                sx={{
                  ...bodySx,
                  flex: 1,
                  fontSize: '0.8125rem',
                  lineHeight: 1.35,
                  color: 'text.primary',
                }}
              >
                {action.label}
              </Typography>
            </Box>
          )
        })}
      </Stack>
    </TaskDetailSection>
  )
}

function WorkList({ submission }: { submission: SubmissionDetailsRecord }) {
  const openIssues = submission.issues.filter((issue) => !issue.resolvedAt)
  const isReady = submission.status === 'Ready'
  const title = isReady ? 'Readiness' : 'Open issues'

  return (
    <TaskDetailSection title={title}>
      {isReady && (submission.premiumEstimates?.length ?? 0) > 0 ? (
        <Stack spacing={1}>
          {submission.premiumEstimates?.map((estimate) => (
            <TaskEntityRow
              key={estimate.label}
              label={`${estimate.label}${estimate.recommended ? ' · Recommended' : ''}${
                submission.approvedPremiumLabel === estimate.label ? ' · Approved' : ''
              }`}
              value={estimate.range}
            />
          ))}
          {(submission.readyInsights ?? [])
            .filter((insight) => insight.severity === 'warning')
            .map((insight) => (
              <Stack key={insight.id} direction="row" spacing={1} alignItems="flex-start" sx={{ pt: 0.25 }}>
                <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: 'warning.main', mt: 0.125 }} />
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.8125rem' }}>
                    {insight.title}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ...bodySx, fontSize: '0.75rem' }}
                  >
                    {insight.summary}
                  </Typography>
                </Box>
              </Stack>
            ))}
        </Stack>
      ) : openIssues.length > 0 ? (
        <Stack spacing={1}>
          {openIssues.map((issue) => (
            <Stack key={issue.id} direction="row" spacing={1} alignItems="flex-start">
              {issue.severity === 'blocking' ? (
                <BlockIcon sx={{ fontSize: 18, color: 'error.main', mt: 0.125 }} />
              ) : (
                <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: 'warning.main', mt: 0.125 }} />
              )}
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.8125rem' }}>
                  {issue.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ ...bodySx, fontSize: '0.75rem', fontStyle: 'italic' }}
                >
                  {issue.summary}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      ) : (
        <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
          No open issues.
        </Typography>
      )}
    </TaskDetailSection>
  )
}

function SubmissionOverviewActivity({ submission }: { submission: SubmissionDetailsRecord }) {
  const items = getSubmissionActivity(submission)
  const viewAllTo = `/activity?account=${encodeURIComponent(submission.insuredName)}`

  return (
    <Stack spacing={1} sx={{ width: '100%', maxWidth: 720 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Typography variant="subtitle2" sx={sectionTitleSx}>
          Activity
        </Typography>
        <Typography
          component={Link}
          to={viewAllTo}
          variant="body2"
          color="primary"
          sx={{
            fontFamily: figmaFontFamilyStack.body,
            textDecoration: 'none',
            fontSize: '0.8125rem',
            flexShrink: 0,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          View all
        </Typography>
      </Stack>
      <ActivityRail items={items} getSubtitle={submissionActivitySubtitle} />
    </Stack>
  )
}

type SubmissionOverviewTabProps = {
  submission: SubmissionDetailsRecord
  onQuickAction?: (actionId: string) => void
}

export function SubmissionOverviewTab({ submission, onQuickAction }: SubmissionOverviewTabProps) {
  return (
    <Stack spacing={GUTTER} sx={{ width: '100%' }}>
      <Stack spacing={0.75}>
        <TaskEntityRow label="Lines of business" value={submission.linesOfBusiness.join(', ')} />
        <TaskEntityRow label="Producer" value={submission.producer} />
        <TaskEntityRow label="Underwriter" value={submission.underwriter} />
        <TaskEntityRow label="Target effective" value={submission.effectiveTarget} />
      </Stack>

      <Grid container spacing={GUTTER} alignItems="flex-start">
        <Grid size={{ xs: 12, md: 7, lg: 8 }}>
          <WorkList submission={submission} />
        </Grid>
        <Grid size={{ xs: 12, md: 5, lg: 4 }}>
          <QuickActionsList actions={submissionOverviewQuickActions} onQuickAction={onQuickAction} />
        </Grid>
      </Grid>

      <SubmissionOverviewActivity submission={submission} />
    </Stack>
  )
}

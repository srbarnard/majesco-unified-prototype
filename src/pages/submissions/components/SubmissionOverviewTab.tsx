import BlockIcon from '@mui/icons-material/Block'
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import type { AppTheme } from '@/design-system/theme'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { OverviewStat } from '@/pages/policies/data/mockOverview'
import { EntityStatGrid, entityDetailCardSx } from '@/pages/shared/components/EntityStatGrid'
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

function DetailCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box
      sx={(theme) => ({
        ...entityDetailCardSx(theme as AppTheme),
        overflow: 'hidden',
        height: '100%',
      })}
    >
      <Box sx={{ px: 2, pt: 1.5, pb: 0 }}>
        <Typography variant="subtitle1" sx={{ ...headingSx, fontSize: '0.9375rem' }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ px: 2, pb: 2, pt: 0.75 }}>{children}</Box>
    </Box>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ py: 0.5 }}>
      <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, fontSize: '0.8125rem' }}>
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{ ...bodySx, fontSize: '0.8125rem', fontWeight: 500, textAlign: 'right' }}
      >
        {value}
      </Typography>
    </Stack>
  )
}

type SubmissionOverviewTabProps = {
  submission: SubmissionDetailsRecord
  stats: OverviewStat[]
}

export function SubmissionOverviewTab({ submission, stats }: SubmissionOverviewTabProps) {
  const openIssues = submission.issues.filter((issue) => !issue.resolvedAt)

  return (
    <Stack spacing={GUTTER}>
      <EntityStatGrid stats={stats} />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <DetailCard title="Submission summary">
            <Stack spacing={0.25}>
              <DetailRow label="Submission #" value={submission.submissionNumber} />
              <DetailRow label="LOB" value={submission.linesOfBusiness.join(', ')} />
              <DetailRow label="Assigned to" value={submission.assignedTo} />
              <DetailRow label="Producer" value={submission.producer} />
              <DetailRow label="Underwriter" value={submission.underwriter} />
              <DetailRow label="Submitted" value={submission.submittedAtLabel} />
              <DetailRow label="Target effective" value={submission.effectiveTarget} />
            </Stack>
          </DetailCard>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <DetailCard title={submission.status === 'Ready' ? 'Readiness' : 'Open issues'}>
            {submission.status === 'Ready' && (submission.premiumEstimates?.length ?? 0) > 0 ? (
              <Stack spacing={1}>
                {submission.premiumEstimates?.map((estimate) => (
                  <DetailRow
                    key={estimate.label}
                    label={`${estimate.label}${estimate.recommended ? ' · Recommended' : ''}${submission.approvedPremiumLabel === estimate.label ? ' · Approved' : ''}`}
                    value={estimate.range}
                  />
                ))}
                {(submission.readyInsights ?? [])
                  .filter((insight) => insight.severity === 'warning')
                  .map((insight) => (
                    <Stack key={insight.id} direction="row" spacing={1} alignItems="flex-start" sx={{ pt: 0.5 }}>
                      <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: 'warning.main', mt: 0.125 }} />
                      <Box>
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
                    <Box>
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
                No open issues. Use Copilot to review premium ranges and appetite notes.
              </Typography>
            )}
          </DetailCard>
        </Grid>
      </Grid>
    </Stack>
  )
}

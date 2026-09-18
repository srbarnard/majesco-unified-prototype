import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useNavigate } from 'react-router'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { homeDailySummaryBeats } from '@/app/data/homeMock'
import { CopilotQuickActions } from '@/design-system/components'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { copilotSubtitleSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function SuggestedActions({
  actions,
  label = 'Suggested actions',
  onAction,
}: {
  actions: string[]
  label?: string | null
  onAction?: (action: string) => void
}) {
  return <CopilotQuickActions actions={actions} label={label} onAction={onAction} />
}

type ResultItem = {
  title: string
  subtitle: string
  detail?: string
}

type AgenticSearchContent = {
  heading: string
  items: ResultItem[]
  summary: string
  actions: string[]
  elapsedSeconds?: number
}

function resolveAgenticContent(prompt: string): AgenticSearchContent {
  const normalized = prompt.toLowerCase()

  if (normalized.includes('high risk') || normalized.includes('risk account')) {
    return {
      heading: 'Priority Accounts',
      items: [
        {
          title: 'Atlantic Ridge Construction, LLC',
          subtitle: 'Policy #01-CA-000100005-0',
          detail: 'High claims frequency · 2 open claims · Loss ratio 78%',
        },
        {
          title: 'Red Oak Hospitality Group',
          subtitle: 'Policy #01-CP-000017810-0',
          detail: 'Elevated loss ratio · Premium increase pending review',
        },
        {
          title: 'Monarch Office Solutions',
          subtitle: 'Policy #01-BP-000028512-0',
          detail: 'Recent large claim · Missing updated loss runs',
        },
      ],
      summary: '3 accounts flagged for immediate underwriting review.',
      actions: ['Create follow-up task', 'View account risk'],
      elapsedSeconds: 6.42,
    }
  }

  if (normalized.includes('renewal')) {
    return {
      heading: 'Upcoming Renewals',
      items: [
        {
          title: 'Atlantic Ridge Construction, LLC',
          subtitle: 'Renews Jul 1 · Commercial Auto',
          detail: 'Premium +8% · No open claims blockers',
        },
        {
          title: 'Summit Outdoor Equipment, Inc.',
          subtitle: 'Renews Jun 28 · Commercial Auto',
          detail: 'Quoted · Awaiting producer response',
        },
        {
          title: 'Horizon Fleet Services, LLC',
          subtitle: 'Renews Jun 30 · Commercial Auto',
          detail: 'In review · Endorsement pending',
        },
      ],
      summary: '18 policies renewing in the next 90 days · 6 need quotes started.',
      actions: ['Start renewal quotes', 'Review overdue items'],
      elapsedSeconds: 5.87,
    }
  }

  if (normalized.includes('claim')) {
    return {
      heading: 'High Priority',
      items: [
        {
          title: 'CL-2026-4781 · Atlantic Ridge Construction',
          subtitle: '$142,500 reserve · Missing docs',
          detail: 'Insured unhappy · Adjuster follow-up overdue',
        },
        {
          title: 'CL-2026-4720 · Red Oak Hospitality Group',
          subtitle: '$89,200 reserve · Coverage dispute',
          detail: 'Legal review requested',
        },
        {
          title: 'CL-2026-4698 · Northshore Medical Group',
          subtitle: '$56,800 reserve · Awaiting inspection',
          detail: 'Third-party liability · Due today',
        },
        {
          title: 'CL-2026-4655 · Maple Grove Property Mgmt',
          subtitle: '$31,400 reserve · New assignment',
          detail: 'Unassigned adjuster',
        },
      ],
      summary: '4 claims need immediate action.',
      actions: ['Create follow-up task', 'View all claims'],
      elapsedSeconds: 7.18,
    }
  }

  return {
    heading: 'Recent Activity',
    items: [
      {
        title: 'Atlantic Ridge Construction, LLC',
        subtitle: 'Renewal quote generated · 2 min ago',
        detail: 'Policy #01-CA-000100005-0 · $1.24M TWP',
      },
      {
        title: 'Red Oak Hospitality Group',
        subtitle: 'Endorsement issued · 18 min ago',
        detail: 'Policy #01-CP-000017810-0',
      },
      {
        title: 'Horizon Fleet Services, LLC',
        subtitle: 'Billing notice sent · 1 hr ago',
        detail: 'Policy #01-CA-000100012-0',
      },
    ],
    summary: '12 policies with activity in the last 24 hours.',
    actions: ['View activity feed', 'Create follow-up task'],
    elapsedSeconds: 4.95,
  }
}

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

type AgenticSearchResultsProps = {
  prompt: string
}

export function AgenticSearchResults({ prompt }: AgenticSearchResultsProps) {
  const content = resolveAgenticContent(prompt)

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={bodySx} display="block">
          Search results
        </Typography>
        <Typography variant="body2" sx={{ ...bodySx, mt: 0.25, fontStyle: 'italic' }}>
          &ldquo;{prompt}&rdquo;
        </Typography>
      </Box>

      <Typography variant="subtitle2" sx={copilotSubtitleSx}>
        {content.heading}
      </Typography>

      <Stack spacing={1.25}>
        {content.items.map((item) => (
          <Box
            key={item.title}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme) => surfaceMuted(theme),
              border: 1,
              borderColor: 'divider',
            }}
          >
            <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.875rem' }}>
              {item.title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, fontSize: '0.8125rem', mt: 0.25 }}>
              {item.subtitle}
            </Typography>
            {item.detail && (
              <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mt: 0.5 }}>
                {item.detail}
              </Typography>
            )}
          </Box>
        ))}
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={bodySx}>
        {content.summary}
        {content.elapsedSeconds != null && (
          <> · Processed in {content.elapsedSeconds.toFixed(2)}s</>
        )}
      </Typography>

      <SuggestedActions actions={content.actions} label="Suggested actions" />
    </Stack>
  )
}

export function DailySummaryContent({
  onQuickAction,
}: {
  onQuickAction?: (action: string) => void
}) {
  const navigate = useNavigate()
  const { openTool } = useRightTool()

  const handleRecordLink = (to: string) => {
    navigate(to)
    // Keep the Copilot drawer open after navigating to the matched record/list.
    openTool('copilot')
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary" sx={bodySx}>
        Here&apos;s what needs your attention today.
      </Typography>

      <Stack component="ul" spacing={1.25} sx={{ m: 0, pl: 2.25 }}>
        {homeDailySummaryBeats.bullets.map((bullet) => (
          <Typography key={bullet.id} component="li" variant="body2" sx={{ ...bodySx, lineHeight: 1.55 }}>
            {bullet.parts.map((part, index) =>
              part.to ? (
                <Link
                  key={`${bullet.id}-${index}`}
                  component="button"
                  type="button"
                  onClick={() => handleRecordLink(part.to!)}
                  underline="hover"
                  sx={{
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    fontWeight: 500,
                    color: 'primary.main',
                    verticalAlign: 'baseline',
                    p: 0,
                    border: 0,
                    bgcolor: 'transparent',
                    cursor: 'pointer',
                  }}
                >
                  {part.text}
                </Link>
              ) : (
                <Box key={`${bullet.id}-${index}`} component="span" sx={{ color: 'text.primary' }}>
                  {part.text}
                </Box>
              ),
            )}
          </Typography>
        ))}
      </Stack>

      <Divider sx={{ my: 0 }} />

      <SuggestedActions
        actions={[
          'Summarize blocked submissions',
          'Which renewals need pricing approval?',
          'What can wait until tomorrow?',
        ]}
        onAction={onQuickAction}
      />
    </Stack>
  )
}

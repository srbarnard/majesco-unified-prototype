import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Button } from '@/design-system/components'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { accentSubtle, surfaceMuted } from '@/design-system/theme/themeSurfaces'

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

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
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

      <Typography variant="subtitle2" sx={headingSx}>
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

      <Stack direction="row" flexWrap="wrap" gap={1}>
        {content.actions.map((action) => (
          <Button key={action} variant="outlined" size="small" color="primary">
            {action}
          </Button>
        ))}
      </Stack>
    </Stack>
  )
}

export function DailySummaryContent() {
  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: (theme) => accentSubtle(theme),
            color: 'primary.main',
            fontSize: '1rem',
          }}
        >
          ☀
        </Box>
        <Typography variant="subtitle2" sx={headingSx}>
          Daily summary
        </Typography>
      </Stack>

      <Box>
        <Typography variant="caption" color="error.main" sx={{ ...headingSx, display: 'block', mb: 0.5 }}>
          Overdue (2)
        </Typography>
        <Typography variant="body2" sx={bodySx}>
          Approve endorsement · Atlantic Ridge Construction
        </Typography>
        <Typography variant="body2" sx={bodySx}>
          Finalize proposal · Midwest Fabrication Inc.
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" color="warning.main" sx={{ ...headingSx, display: 'block', mb: 0.5 }}>
          Due Today (2)
        </Typography>
        <Typography variant="body2" sx={bodySx}>
          Start renewal quote · Summit Outdoor Equipment
        </Typography>
        <Typography variant="body2" sx={bodySx}>
          Review loss runs · Policy renewal batch
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ ...headingSx, display: 'block', mb: 0.5 }}>
          Business Risk
        </Typography>
        <Typography variant="body2" sx={bodySx}>
          3 policies expiring within 14 days
        </Typography>
        <Typography variant="body2" sx={bodySx}>
          4 claims need immediate action
        </Typography>
      </Box>

      <Stack direction="row" flexWrap="wrap" gap={1}>
        <Button variant="outlined" size="small" color="primary">
          Start renewal quotes
        </Button>
        <Button variant="outlined" size="small" color="primary">
          Review overdue items
        </Button>
      </Stack>
    </Stack>
  )
}

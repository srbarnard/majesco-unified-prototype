import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Avatar from '@mui/material/Avatar'
import { useLayoutEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { homeDailySummaryBeats } from '@/app/data/homeMock'
import { resolveDailySummaryQuickActionAnswer } from '@/app/data/resolveDailySummaryQuickAction'
import { CopilotQuickActions } from '@/design-system/components'
import { chatAuthorAvatarSx, chatBubbleIncoming, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { copilotSectionHeadingSx, copilotSubtitleSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'
import {
  COPILOT_REVEAL_ACTIONS_ATTR,
  COPILOT_REVEAL_ATTR,
} from '@/pages/policies/components/copilot/copilotReveal'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

/** Real ul/li with outside bullets so wraps hang under the text, not the glyph. */
const hangingListSx = {
  m: 0,
  pl: 2.5,
  listStyleType: 'disc',
  listStylePosition: 'outside',
} as const

const hangingListItemSx = {
  ...bodySx,
  display: 'list-item',
  lineHeight: 1.55,
  pl: 0.25,
  mb: 1.25,
  '&:last-child': { mb: 0 },
} as const

const DAILY_SUMMARY_ACTIONS = [
  'Summarize blocked submissions',
  'Which renewals need pricing approval?',
  'What can wait until tomorrow?',
] as const

type DailySummaryTurn =
  | {
      id: string
      role: 'user'
      content: string
    }
  | {
      id: string
      role: 'assistant'
      title: string
      items: string[]
      footer: string
      elapsedSeconds?: number
    }

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
  onRequestReveal,
}: {
  onRequestReveal?: () => void
}) {
  const navigate = useNavigate()
  const { openTool } = useRightTool()
  const [threadTurns, setThreadTurns] = useState<DailySummaryTurn[]>([])
  const [usedActions, setUsedActions] = useState<string[]>([])

  useLayoutEffect(() => {
    if (threadTurns.length === 0) return
    onRequestReveal?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reveal once per appended turn batch
  }, [threadTurns[threadTurns.length - 1]?.id])

  const handleRecordLink = (to: string) => {
    navigate(to)
    // Keep the Copilot drawer open after navigating to the matched record/list.
    openTool('copilot')
  }

  const remainingActions = DAILY_SUMMARY_ACTIONS.filter((action) => !usedActions.includes(action))

  const handleQuickAction = (action: string) => {
    const answer = resolveDailySummaryQuickActionAnswer(action)
    if (!answer) return

    const at = Date.now()
    setUsedActions((current) => (current.includes(action) ? current : [...current, action]))
    setThreadTurns((current) => [
      ...current,
      { id: `daily-user-${at}`, role: 'user', content: action },
      {
        id: `daily-assistant-${at}`,
        role: 'assistant',
        title: answer.title,
        items: answer.items,
        footer: answer.footer,
        elapsedSeconds: answer.elapsedSeconds,
      },
    ])
    onRequestReveal?.()
  }

  const lastTurnId = threadTurns[threadTurns.length - 1]?.id
  const showActionsAfterThread = threadTurns.length > 0 && remainingActions.length > 0

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary" sx={bodySx}>
        Here&apos;s what needs your attention today.
      </Typography>

      <Box component="ul" sx={hangingListSx}>
        {homeDailySummaryBeats.bullets.map((bullet) => (
          <Typography
            key={bullet.id}
            component="li"
            variant="body2"
            color="text.primary"
            sx={hangingListItemSx}
          >
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
                <Box key={`${bullet.id}-${index}`} component="span">
                  {part.text}
                </Box>
              ),
            )}
          </Typography>
        ))}
      </Box>

      {threadTurns.length === 0 ? (
        <>
          <Divider sx={{ my: 0 }} />
          <SuggestedActions actions={[...DAILY_SUMMARY_ACTIONS]} onAction={handleQuickAction} />
        </>
      ) : (
        <Stack spacing={0}>
          {threadTurns.map((turn) => {
            const isLatest = turn.id === lastTurnId
            const markReveal = isLatest && !showActionsAfterThread
            if (turn.role === 'user') {
              return (
                <Box
                  key={turn.id}
                  {...(markReveal ? { [COPILOT_REVEAL_ATTR]: '' } : {})}
                  sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}
                >
                  <Box
                    sx={{
                      maxWidth: '85%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                      <Avatar sx={(theme) => chatAuthorAvatarSx(theme)}>CR</Avatar>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: figmaFontFamilyStack.heading,
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                        }}
                      >
                        You
                      </Typography>
                    </Stack>
                    <Box
                      sx={(theme) => ({
                        px: 1.75,
                        py: 1.25,
                        borderRadius: 2,
                        bgcolor: chatBubbleIncoming(theme),
                      })}
                    >
                      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.55 }}>
                        {turn.content}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )
            }

            return (
              <Box
                key={turn.id}
                {...(markReveal ? { [COPILOT_REVEAL_ATTR]: '' } : {})}
                sx={{ mb: 2.5 }}
              >
                <Typography variant="body2" sx={{ ...copilotSectionHeadingSx, mb: 1 }}>
                  {turn.title}
                </Typography>
                <Box component="ul" sx={{ ...hangingListSx, mb: 1.5 }}>
                  {turn.items.map((item) => (
                    <Typography
                      key={item}
                      component="li"
                      variant="body2"
                      color="text.primary"
                      sx={hangingListItemSx}
                    >
                      {item}
                    </Typography>
                  ))}
                </Box>
                <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.55, mb: 1 }}>
                  {turn.footer}
                </Typography>
                {turn.elapsedSeconds != null ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={bodySx}
                  >
                    {turn.elapsedSeconds.toFixed(2)}s
                  </Typography>
                ) : null}
              </Box>
            )
          })}

          {showActionsAfterThread ? (
            <Box {...{ [COPILOT_REVEAL_ATTR]: '', [COPILOT_REVEAL_ACTIONS_ATTR]: '' }}>
              <Divider sx={{ mb: 2 }} />
              <SuggestedActions actions={remainingActions} onAction={handleQuickAction} />
            </Box>
          ) : null}
        </Stack>
      )}
    </Stack>
  )
}

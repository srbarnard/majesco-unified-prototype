import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CloseIcon from '@mui/icons-material/Close'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import MuiButton from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useLayoutEffect, useMemo, useState } from 'react'
import { Link as RouterLink } from 'react-router'
import { useRightTool } from '@/app/contexts/RightToolContext'
import {
  Button,
  CopilotQuickActions,
  InsightCallout,
} from '@/design-system/components'
import { filterFooterButtonSx } from '@/design-system/components/ListFilterPanel/filterPanelPrimitives'
import { chatAuthorAvatarSx, chatBubbleIncoming } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { motionTokens } from '@/design-system/tokens/motion'
import { CopilotContentTransition } from '@/pages/policies/components/copilot/CopilotContentTransition'
import {
  COPILOT_REVEAL_ACTIONS_ATTR,
  COPILOT_REVEAL_ATTR,
} from '@/pages/policies/components/copilot/copilotReveal'
import {
  copilotDrawerHeadingSx,
  copilotSectionHeadingSx,
  copilotSubtitleSx,
} from '@/pages/policies/components/copilot/copilotDrawerStyles'
import {
  TaskDetailSection,
  TaskDetailText,
  TaskEntityRow,
} from '@/pages/tasks/components/TaskDetailSection'
import { TaskPriorityIndicator } from '@/pages/tasks/components/TaskPriorityIndicator'
import type { TaskDocument, TaskRecord } from '@/pages/tasks/data/mockTasks'
import { getTaskDocumentHref, getTaskRelatedEntityRoute } from '@/pages/tasks/data/mockTasks'
import { formatTaskDocumentChipLabel } from '@/pages/tasks/utils/taskDisplayUtils'

const GUTTER = layoutTokens.contentPaddingX / 8
/** Match CopilotDrawerShell chat content inset (`px: 2`). */
const panelPx = 2

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
  fontSize: '0.875rem',
  lineHeight: 1.55,
} as const

const motionSafe = '@media (prefers-reduced-motion: no-preference)'

const documentChipSx = {
  maxWidth: '100%',
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.75rem',
  cursor: 'pointer',
  position: 'relative',
  transition: `transform ${motionTokens.durationFastMs}ms ${motionTokens.easing}, color 0.15s ease`,
  '& .MuiChip-label': {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    transition: 'color 0.15s ease',
  },
  '&:hover': {
    '& .MuiChip-label': { color: 'primary.main' },
  },
  [motionSafe]: {
    '&:hover': {
      transform: `translateY(${motionTokens.cardHoverTranslateY}px) scale(${motionTokens.cardHoverScale})`,
      zIndex: 1,
    },
  },
} as const

const VIEW_NOTES_ACTION = 'View notes (related to this task)'
const ADD_NOTE_ACTION = 'Add note'

type TaskThreadTurn =
  | { id: string; role: 'user'; content: string }
  | { id: string; role: 'assistant'; title: string; text: string; elapsedSeconds: number }

function TaskAttachmentChip({ task, doc }: { task: TaskRecord; doc: TaskDocument }) {
  return (
    <Chip
      component={RouterLink}
      to={getTaskDocumentHref(task, doc)}
      clickable
      size="small"
      variant="filled"
      color="default"
      label={formatTaskDocumentChipLabel(doc)}
      sx={documentChipSx}
    />
  )
}

type TaskDetailsPanelProps = {
  task: TaskRecord
  onClose?: () => void
  /** Return to the Chat summary without closing the right panel. */
  onBack?: () => void
  onMarkComplete?: (task: TaskRecord) => void
}

/** Card-style relative due text (e.g. Due in 3 days, Past due, Due today). */
function getDueTimingLabel(task: TaskRecord) {
  const due = task.dueLabel.trim()
  if (/^(past due|due\b)/i.test(due)) return due
  if (/^today$/i.test(due)) return 'Due today'
  return task.ageIndicator
}

function getDueTimingIconColor(task: TaskRecord) {
  if (task.isPastDue || task.ageIndicator.toLowerCase().includes('past due')) {
    return 'error.main' as const
  }
  return 'text.secondary' as const
}

export function TaskDetailsPanel({
  task,
  onClose,
  onBack,
  onMarkComplete,
}: TaskDetailsPanelProps) {
  const { openTool } = useRightTool()
  const relatedRoute = getTaskRelatedEntityRoute(task)
  const { relatedEntities } = task

  const [threadTurns, setThreadTurns] = useState<TaskThreadTurn[]>([])
  const [usedActions, setUsedActions] = useState<string[]>([])

  useLayoutEffect(() => {
    setThreadTurns([])
    setUsedActions([])
  }, [task.id])

  const suggestedActions = useMemo(() => {
    const actions = [task.nextAction, ADD_NOTE_ACTION]
    if (task.notes) actions.push(VIEW_NOTES_ACTION)
    return actions
  }, [task.nextAction, task.notes])

  const remainingActions = suggestedActions.filter((action) => !usedActions.includes(action))

  const handleSuggestedAction = (action: string) => {
    if (action === ADD_NOTE_ACTION) {
      setUsedActions((current) => (current.includes(action) ? current : [...current, action]))
      openTool('notes')
      return
    }

    const at = Date.now()
    setUsedActions((current) => (current.includes(action) ? current : [...current, action]))

    if (action === VIEW_NOTES_ACTION && task.notes) {
      setThreadTurns((current) => [
        ...current,
        { id: `task-user-${at}`, role: 'user', content: action },
        {
          id: `task-assistant-${at}`,
          role: 'assistant',
          title: 'Notes on this task',
          text: task.notes!,
          elapsedSeconds: 0.86,
        },
      ])
      return
    }

    // Next action — acknowledge in-thread (same Daily summary / Summarize pattern).
    setThreadTurns((current) => [
      ...current,
      { id: `task-user-${at}`, role: 'user', content: action },
      {
        id: `task-assistant-${at}`,
        role: 'assistant',
        title: 'Next action',
        text: `Got it — next step on file: ${task.nextAction}`,
        elapsedSeconds: 0.74,
      },
    ])
  }

  const lastTurnId = threadTurns[threadTurns.length - 1]?.id
  const showActionsAfterThread = threadTurns.length > 0 && remainingActions.length > 0

  return (
    <Box
      sx={{
        flex: 1,
        alignSelf: 'stretch',
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: panelPx,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: 0,
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle1" component="h2" sx={copilotDrawerHeadingSx}>
            Task
          </Typography>
          {onClose && (
            <IconButton size="small" onClick={onClose} aria-label="Close task details">
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Box>

      <Box
        sx={{
          px: panelPx,
          pt: 2,
          pb: GUTTER,
          flex: 1,
          minHeight: 0,
          overflowX: 'hidden',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
        }}
      >
        <Box sx={{ mb: 1.5 }}>
          {onBack ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'auto minmax(0, 1fr)',
                columnGap: 0.5,
                alignItems: 'center',
              }}
            >
              <IconButton
                size="small"
                onClick={onBack}
                aria-label="Back to Assistant"
                sx={{ ml: -0.75, gridRow: 1, gridColumn: 1 }}
              >
                <ArrowBackIcon fontSize="small" />
              </IconButton>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{ ...copilotSubtitleSx, gridRow: 1, gridColumn: 2, minWidth: 0 }}
              >
                {task.taskName}
              </Typography>
            </Box>
          ) : (
            <Typography variant="subtitle2" sx={copilotSubtitleSx}>
              {task.taskName}
            </Typography>
          )}
          <Stack
            direction="row"
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            spacing={0.75}
            sx={{ rowGap: 0.5, mt: 0.75 }}
          >
            <TaskPriorityIndicator priority={task.priority} size="card" />
            <Typography
              component="span"
              variant="caption"
              color="text.secondary"
              sx={{ fontFamily: figmaFontFamilyStack.body, userSelect: 'none' }}
            >
              ·
            </Typography>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <AccessTimeOutlinedIcon sx={{ fontSize: 14, color: getDueTimingIconColor(task) }} />
              <Typography
                variant="caption"
                sx={{
                  fontFamily: figmaFontFamilyStack.body,
                  fontSize: '0.6875rem',
                  fontWeight: task.isPastDue ? 600 : 400,
                  color: getDueTimingIconColor(task),
                }}
              >
                {getDueTimingLabel(task)}
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <CopilotContentTransition contentKey={task.id}>
          <Stack spacing={GUTTER}>
            {task.blockingIssues && (
              <InsightCallout variant="error" title="Blocking issue">
                <TaskDetailText>{task.blockingIssues}</TaskDetailText>
              </InsightCallout>
            )}

            <Typography variant="body2" color="text.primary" sx={bodySx}>
              {task.description}
            </Typography>

            <TaskDetailSection title="Related entities">
              <Stack spacing={0.75}>
                <TaskEntityRow label="Insured" value={relatedEntities.insuredName} />
                <TaskEntityRow label="Policy #" value={relatedEntities.policyNumber} />
                <TaskEntityRow label="Quote #" value={relatedEntities.quoteNumber} />
                <TaskEntityRow label="Claim #" value={relatedEntities.claimNumber} />
                <TaskEntityRow label="Submission" value={relatedEntities.submissionId} />
                <TaskEntityRow label="Producer" value={relatedEntities.producer} />
              </Stack>
            </TaskDetailSection>

            {task.documents.length > 0 ? (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontFamily: figmaFontFamilyStack.heading,
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    color: 'text.primary',
                    letterSpacing: '0.01em',
                    mb: 0.75,
                  }}
                >
                  Attachments
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ overflow: 'visible' }}>
                  {task.documents.map((doc) => (
                    <TaskAttachmentChip key={doc.id} task={task} doc={doc} />
                  ))}
                </Stack>
              </Box>
            ) : null}

            {threadTurns.length === 0 ? (
              <>
                <Divider sx={{ my: 0 }} />
                <CopilotQuickActions actions={suggestedActions} onAction={handleSuggestedAction} />
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
                      <Typography variant="body2" color="text.primary" sx={{ ...bodySx, mb: 1 }}>
                        {turn.text}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={bodySx}>
                        {turn.elapsedSeconds.toFixed(2)}s
                      </Typography>
                    </Box>
                  )
                })}

                {showActionsAfterThread ? (
                  <Box {...{ [COPILOT_REVEAL_ATTR]: '', [COPILOT_REVEAL_ACTIONS_ATTR]: '' }}>
                    <Divider sx={{ mb: 2 }} />
                    <CopilotQuickActions
                      actions={remainingActions}
                      onAction={handleSuggestedAction}
                    />
                  </Box>
                ) : null}
              </Stack>
            )}
          </Stack>
        </CopilotContentTransition>
      </Box>

      <Box
        sx={{
          px: panelPx,
          py: GUTTER,
          bgcolor: 'background.paper',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="stretch">
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => onMarkComplete?.(task)}
            sx={filterFooterButtonSx}
          >
            Mark complete
          </Button>
          {relatedRoute ? (
            <MuiButton
              component={RouterLink}
              to={relatedRoute.to}
              variant="outlined"
              color="primary"
              fullWidth
              disableElevation
              sx={{
                ...filterFooterButtonSx,
                borderWidth: 2,
                '&:hover': { borderWidth: 2 },
              }}
            >
              {relatedRoute.label}
            </MuiButton>
          ) : (
            <Button variant="outlined" color="primary" disabled fullWidth sx={filterFooterButtonSx}>
              No link
            </Button>
          )}
        </Stack>
      </Box>
    </Box>
  )
}

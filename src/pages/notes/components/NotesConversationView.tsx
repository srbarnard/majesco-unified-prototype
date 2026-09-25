import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import { CopilotQuickActions } from '@/design-system/components'
import {
  chatAuthorAvatarSx,
  chatBubbleIncoming,
  chatPeerAuthorAvatarSx,
  chatPeerBubble,
} from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { copilotSubtitleSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'
import type { NoteEmptyStarter } from '@/pages/notes/data/noteEmptyStarters'
import { HOME_NOTE_EMPTY_BODY as HOME_NOTE_EMPTY_BODY_FALLBACK } from '@/pages/notes/data/noteEmptyStarters'
import type {
  NoteAttachment,
  NoteAuthor,
  NoteFollowUpTask,
  NoteThreadMessage,
} from '@/pages/notes/data/noteTypes'
import {
  ScheduleProducerFollowUpCard,
  type FollowUpPriority,
} from '@/pages/submissions/components/ScheduleProducerFollowUpCard'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

function isCurrentUser(author: NoteAuthor) {
  return author.name === 'You'
}

function authorKey(author: NoteAuthor) {
  return `${author.initials}|${author.name}`.toLowerCase()
}

function YouBubble({ author, text }: { author: NoteAuthor; text: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
      <Box
        sx={{
          maxWidth: '85%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
          <Avatar sx={(theme) => chatAuthorAvatarSx(theme)}>{author.initials}</Avatar>
          <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.8125rem' }}>
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
          <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
            {text}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

function PeerBubble({ author, text }: { author: NoteAuthor; text: string }) {
  const key = authorKey(author)
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
      <Box
        sx={{
          maxWidth: '85%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
          <Avatar sx={(theme) => chatPeerAuthorAvatarSx(theme, key)}>{author.initials}</Avatar>
          <Typography variant="body2" sx={{ ...headingSx, fontSize: '0.8125rem' }}>
            {author.name}
          </Typography>
        </Stack>
        <Box
          sx={(theme) => ({
            px: 1.75,
            py: 1.25,
            borderRadius: 2,
            bgcolor: chatPeerBubble(theme),
          })}
        >
          <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>
            {text}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

function AssistantBlock({
  text,
  missingFields,
  actions,
  onAction,
}: {
  text: string
  missingFields?: string[]
  actions?: string[]
  onAction?: (action: string) => void
}) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 0.5, whiteSpace: 'pre-line' }}>
        {text}
      </Typography>
      {missingFields && missingFields.length > 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, lineHeight: 1.55, mb: 1 }}>
          {missingFields.join(' and ')} aren’t in what you typed — add them or skip.
        </Typography>
      ) : null}
      {actions && actions.length > 0 ? (
        <Box sx={{ mt: 1 }}>
          <Divider sx={{ mb: 2 }} />
          <CopilotQuickActions actions={actions} onAction={onAction} label="Suggested actions" />
        </Box>
      ) : null}
    </Box>
  )
}

function NotesEmptyIntro({
  body,
  starters,
  onStarter,
}: {
  body: string
  starters: NoteEmptyStarter[]
  onStarter?: (starter: NoteEmptyStarter) => void
}) {
  const actionLabels = starters.map((starter) => starter.label)

  return (
    <Box sx={{ mb: 1 }}>
      <Typography variant="subtitle1" sx={{ ...copilotSubtitleSx, lineHeight: 1.35, mb: 0.75 }}>
        Start a note
      </Typography>
      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 2, color: 'text.primary' }}>
        {body}
      </Typography>
      {actionLabels.length > 0 ? (
        <>
          <Divider sx={{ mb: 2 }} />
          <CopilotQuickActions
            actions={actionLabels}
            onAction={(label) => {
              const starter = starters.find((item) => item.label === label)
              if (starter) onStarter?.(starter)
            }}
            label="Suggested actions"
          />
        </>
      ) : null}
    </Box>
  )
}

type NotesConversationViewProps = {
  messages: NoteThreadMessage[]
  attachments?: NoteAttachment[]
  showEmptyHelper?: boolean
  emptyBody?: string
  emptyStarters?: NoteEmptyStarter[]
  taskCardOpen?: boolean
  followUpTask?: NoteFollowUpTask | null
  followUpTaskName?: string
  followUpNotesPrefill?: string
  onAction?: (action: string) => void
  onStarter?: (starter: NoteEmptyStarter) => void
  onCreateTask?: (task: {
    name: string
    assignee: string
    priority: FollowUpPriority
    due: Date
    notes: string
  }) => void
  onCancelTask?: () => void
  onAttachCurrentDocument?: (() => void) | null
}

export function NotesConversationView({
  messages,
  attachments = [],
  showEmptyHelper = false,
  emptyBody = HOME_NOTE_EMPTY_BODY_FALLBACK,
  emptyStarters = [],
  taskCardOpen = false,
  followUpTask = null,
  followUpTaskName = 'Follow-up task',
  followUpNotesPrefill = '',
  onAction,
  onStarter,
  onCreateTask,
  onCancelTask,
  onAttachCurrentDocument,
}: NotesConversationViewProps) {
  return (
    <Box>
      {showEmptyHelper && messages.length === 0 ? (
        <NotesEmptyIntro body={emptyBody} starters={emptyStarters} onStarter={onStarter} />
      ) : null}

      {messages.map((message) => {
        if (message.kind === 'user') {
          const author = message.author ?? { initials: 'CR', name: 'You' }
          return isCurrentUser(author) ? (
            <YouBubble key={message.id} author={author} text={message.text} />
          ) : (
            <PeerBubble key={message.id} author={author} text={message.text} />
          )
        }
        return (
          <AssistantBlock
            key={message.id}
            text={message.text}
            missingFields={message.missingFields}
            actions={message.suggestedActions}
            onAction={onAction}
          />
        )
      })}

      {taskCardOpen && onCreateTask && onCancelTask ? (
        <Box sx={{ mb: 2.5 }}>
          <ScheduleProducerFollowUpCard
            defaultTaskName={followUpTaskName}
            notesPrefill={followUpNotesPrefill}
            onCancel={onCancelTask}
            onCreate={onCreateTask}
          />
        </Box>
      ) : null}

      {followUpTask && !taskCardOpen ? (
        <Chip
          size="small"
          icon={<TaskAltOutlinedIcon sx={{ fontSize: '16px !important' }} />}
          label={`${followUpTask.name ?? 'Follow-up'} · ${followUpTask.assignee} · ${followUpTask.dueLabel}`}
          sx={{
            mb: 2,
            maxWidth: '100%',
            fontFamily: figmaFontFamilyStack.body,
            fontSize: '0.75rem',
            bgcolor: (t) => t.figmaPalette.blue[50],
            color: 'primary.main',
            '& .MuiChip-label': { overflow: 'hidden', textOverflow: 'ellipsis' },
          }}
        />
      ) : null}

      {attachments.length > 0 ? (
        <Stack direction="row" flexWrap="wrap" useFlexGap spacing={0.75} sx={{ mb: 1.5 }}>
          {attachments.map((file) => (
            <Chip
              key={file.id}
              size="small"
              label={file.fileName}
              sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.75rem' }}
            />
          ))}
        </Stack>
      ) : null}

      {onAttachCurrentDocument ? (
        <Box sx={{ mb: 1 }}>
          <CopilotQuickActions
            actions={['Attach current document']}
            onAction={() => onAttachCurrentDocument()}
            label={null}
          />
        </Box>
      ) : null}
    </Box>
  )
}

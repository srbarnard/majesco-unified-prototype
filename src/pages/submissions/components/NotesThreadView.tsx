import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  chatAuthorAvatarSx,
  chatBubbleIncoming,
  chatBubbleOutgoing,
  chatPeerAuthorAvatarSx,
} from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CopilotDrawerSubHeader } from '@/pages/policies/components/copilot/CopilotDrawerSubHeader'
import type { NoteMessage, SubmissionNoteThread } from '@/pages/submissions/data/mockSubmissionNotes'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function isCurrentUser(message: NoteMessage) {
  return message.author.initials === 'SB' || message.author.name === 'You'
}

function authorKey(message: NoteMessage) {
  return message.author.initials || message.author.name
}

function NoteBubble({ message, side }: { message: NoteMessage; side: 'left' | 'right' }) {
  const isRight = side === 'right'
  const isYou = isCurrentUser(message)

  return (
    <Box sx={{ display: 'flex', justifyContent: isRight ? 'flex-end' : 'flex-start', mb: 2 }}>
      <Box
        sx={{
          maxWidth: '85%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
          <Avatar sx={(theme) => (isYou ? chatAuthorAvatarSx(theme) : chatPeerAuthorAvatarSx(theme))}>
            {message.author.initials}
          </Avatar>
          <Typography
            variant="body2"
            sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.8125rem' }}
          >
            {message.author.name}
          </Typography>
        </Stack>
        <Box
          sx={(theme) => ({
            px: 1.75,
            py: 1.25,
            borderRadius: 2,
            bgcolor: isRight ? chatBubbleOutgoing(theme) : chatBubbleIncoming(theme),
            color: 'text.primary',
          })}
        >
          <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.55 }}>
            {message.text}
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, mt: 0.5 }}>
          {message.createdAt}
        </Typography>
      </Box>
    </Box>
  )
}

type NotesThreadViewProps = {
  thread: SubmissionNoteThread
  onBack: () => void
}

export function NotesThreadView({ thread, onBack }: NotesThreadViewProps) {
  const root: NoteMessage = {
    id: thread.id,
    author: thread.author,
    text: thread.preview,
    createdAt: thread.createdAt,
  }
  const messages = [root, ...thread.replies]
  const currentUserInThread = messages.some(isCurrentUser)
  const sideByAuthor = new Map<string, 'left' | 'right'>()
  messages.forEach((message) => {
    const key = authorKey(message)
    if (sideByAuthor.has(key)) return
    if (isCurrentUser(message) || currentUserInThread) {
      sideByAuthor.set(key, isCurrentUser(message) ? 'right' : 'left')
      return
    }
    sideByAuthor.set(key, sideByAuthor.size % 2 === 0 ? 'left' : 'right')
  })

  return (
    <Box>
      <CopilotDrawerSubHeader title={thread.typeLabel} detail={thread.preview} onBack={onBack} />
      <Box sx={{ mt: 1 }}>
        {messages.map((message) => (
          <NoteBubble
            key={message.id}
            message={message}
            side={sideByAuthor.get(authorKey(message)) ?? 'left'}
          />
        ))}
      </Box>
    </Box>
  )
}

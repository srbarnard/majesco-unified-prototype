import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import { chatAuthorAvatarSx, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CopilotDrawerSubHeader } from './CopilotDrawerSubHeader'
import { copilotHistoryKindLabel, type CopilotHistoryEntry, type CopilotHistoryMessage } from './copilotDrawerData'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function UserMessage({ message }: { message: CopilotHistoryMessage }) {
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
          <Avatar sx={(theme) => chatAuthorAvatarSx(theme)}>
            SB
          </Avatar>
          <Typography
            variant="body2"
            sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.8125rem' }}
          >
            You
          </Typography>
        </Stack>
        <Box
          sx={(theme) => ({
            px: 1.75,
            py: 1.25,
            borderRadius: 2,
            bgcolor: surfaceMuted(theme),
          })}
        >
          <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.55 }}>
            {message.content}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

function AssistantMessage({ message }: { message: CopilotHistoryMessage }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 0.5, whiteSpace: 'pre-line' }}>
        {message.content}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton size="small" aria-label="Copy response" sx={{ ml: -0.75 }}>
          <ContentCopyOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        </IconButton>
        {message.elapsedSeconds !== undefined && (
          <Typography variant="caption" color="text.secondary" sx={bodySx}>
            {message.elapsedSeconds.toFixed(2)}s
          </Typography>
        )}
      </Stack>
    </Box>
  )
}

type CopilotConversationViewProps = {
  entry: CopilotHistoryEntry
  onBack: () => void
  /** Overrides the subheader type label (e.g. "Daily summary" for launched quick actions). */
  backLabel?: string
}

export function CopilotConversationView({ entry, onBack, backLabel }: CopilotConversationViewProps) {
  return (
    <Box>
      <CopilotDrawerSubHeader
        title={backLabel ?? copilotHistoryKindLabel(entry.kind)}
        detail={entry.title}
        onBack={onBack}
      />

      <Box>
        {entry.messages.map((message) =>
          message.role === 'user' ? (
            <UserMessage key={message.id} message={message} />
          ) : (
            <AssistantMessage key={message.id} message={message} />
          ),
        )}
      </Box>
    </Box>
  )
}

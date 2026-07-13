import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CopilotIcon } from '@/design-system/components'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { copilotSubtitleSx } from './copilotDrawerStyles'
import type { CopilotHistoryEntry, CopilotHistoryMessage } from './copilotDrawerData'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

function UserMessage({ message }: { message: CopilotHistoryMessage }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
      <Box
        sx={(theme) => ({
          maxWidth: '85%',
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
  )
}

function AssistantMessage({ message }: { message: CopilotHistoryMessage }) {
  return (
    <Box sx={{ mb: 2.5 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
        <CopilotIcon size={18} />
        <Typography
          variant="body2"
          sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.8125rem' }}
        >
          Assistant
        </Typography>
      </Stack>
      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 0.5 }}>
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
}

export function CopilotConversationView({ entry, onBack }: CopilotConversationViewProps) {
  return (
    <Box>
      <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 1.5 }}>
        <IconButton size="small" onClick={onBack} aria-label="Back to history" sx={{ ml: -0.75 }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="subtitle2" noWrap sx={{ ...copilotSubtitleSx, minWidth: 0 }}>
          {entry.title}
        </Typography>
      </Stack>

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

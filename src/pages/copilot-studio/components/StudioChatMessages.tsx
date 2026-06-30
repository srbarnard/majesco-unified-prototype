import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CopilotIcon } from '@/design-system/components'
import type { StudioChatMessage } from '@/pages/copilot-studio/data/mockCopilotStudio'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

function UserMessage({ message }: { message: StudioChatMessage }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
      <Box
        sx={(theme) => ({
          maxWidth: '85%',
          px: 2,
          py: 1.5,
          borderRadius: 2,
          bgcolor: surfaceMuted(theme),
        })}
      >
        <Typography
          variant="body2"
          sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.875rem', lineHeight: 1.55 }}
        >
          {message.content}
        </Typography>
      </Box>
    </Box>
  )
}

function AssistantMessage({ message }: { message: StudioChatMessage }) {
  return (
    <Box sx={{ mb: 3 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
        <CopilotIcon size={18} />
        <Typography
          variant="body2"
          sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.8125rem' }}
        >
          Assistant
        </Typography>
      </Stack>
      <Typography
        variant="body2"
        sx={{
          fontFamily: figmaFontFamilyStack.body,
          fontSize: '0.875rem',
          lineHeight: 1.6,
          color: 'text.primary',
          mb: 1,
        }}
      >
        {message.content}
      </Typography>
      <Stack direction="row" spacing={1} alignItems="center">
        <IconButton size="small" aria-label="Copy response" sx={{ ml: -0.75 }}>
          <ContentCopyOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        </IconButton>
        {message.elapsedSeconds !== undefined && (
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
            {message.elapsedSeconds.toFixed(2)}s
          </Typography>
        )}
      </Stack>
    </Box>
  )
}

type StudioChatMessagesProps = {
  messages: StudioChatMessage[]
}

export function StudioChatMessages({ messages }: StudioChatMessagesProps) {
  return (
    <Box sx={{ width: '100%' }}>
      {messages.map((message) =>
        message.role === 'user' ? (
          <UserMessage key={message.id} message={message} />
        ) : (
          <AssistantMessage key={message.id} message={message} />
        ),
      )}
    </Box>
  )
}

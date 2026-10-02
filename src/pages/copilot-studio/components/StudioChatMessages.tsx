import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import type { StudioChatMessage } from '@/pages/copilot-studio/data/mockCopilotStudio'
import { chatAuthorAvatarSx, chatBubbleIncoming } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

export type StudioUserMessageProps = {
  children: ReactNode
  /** Clock / duration label in Studio meta caption treatment. */
  timeLabel?: string
}

/** Right-aligned user turn — avatar + You + teal bubble (Studio). */
export function StudioUserMessage({ children, timeLabel }: StudioUserMessageProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2.5 }}>
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
            sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.8125rem' }}
          >
            You
          </Typography>
          {timeLabel ? (
            <Typography variant="caption" color="text.secondary" sx={bodySx}>
              {timeLabel}
            </Typography>
          ) : null}
        </Stack>
        <Box
          sx={(theme) => ({
            px: 2,
            py: 1.5,
            borderRadius: 2,
            bgcolor: chatBubbleIncoming(theme),
          })}
        >
          <Typography variant="body2" component="div" sx={{ ...bodySx, fontSize: '0.875rem', lineHeight: 1.55 }}>
            {children}
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export type StudioAssistantMessageProps = {
  children: ReactNode
  /** Clock / duration label beside copy — same meta row as Studio. */
  timeLabel?: string
  showCopy?: boolean
}

/** Left-aligned Chat turn — plain content, optional copy + meta caption. */
export function StudioAssistantMessage({
  children,
  timeLabel,
  showCopy = true,
}: StudioAssistantMessageProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          ...bodySx,
          fontSize: '0.875rem',
          lineHeight: 1.6,
          color: 'text.primary',
          mb: showCopy || timeLabel ? 1 : 0,
        }}
      >
        {typeof children === 'string' ? (
          <Typography variant="body2" sx={{ ...bodySx, fontSize: '0.875rem', lineHeight: 1.6 }}>
            {children}
          </Typography>
        ) : (
          children
        )}
      </Box>
      {(showCopy || timeLabel) && (
        <Stack direction="row" spacing={1} alignItems="center">
          {showCopy ? (
            <IconButton size="small" aria-label="Copy response" sx={{ ml: -0.75 }}>
              <ContentCopyOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </IconButton>
          ) : null}
          {timeLabel ? (
            <Typography variant="caption" color="text.secondary" sx={bodySx}>
              {timeLabel}
            </Typography>
          ) : null}
        </Stack>
      )}
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
          <StudioUserMessage key={message.id}>{message.content}</StudioUserMessage>
        ) : (
          <StudioAssistantMessage
            key={message.id}
            timeLabel={
              message.elapsedSeconds !== undefined ? `${message.elapsedSeconds.toFixed(2)}s` : undefined
            }
          >
            {message.content}
          </StudioAssistantMessage>
        ),
      )}
    </Box>
  )
}

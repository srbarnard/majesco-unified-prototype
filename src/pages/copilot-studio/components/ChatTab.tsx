import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { CopilotIcon } from '@/design-system/components'
import { CopilotComposer } from '@/pages/policies/components/CopilotComposer'
import { StudioChatMessages } from '@/pages/copilot-studio/components/StudioChatMessages'
import type { StudioChatMessage } from '@/pages/copilot-studio/data/mockCopilotStudio'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

const contentPx = `${layoutTokens.contentPaddingX}px`
const composerMaxWidth = 720

type ChatTabProps = {
  messages: StudioChatMessage[]
  onSend: (message: string) => void
}

export function ChatTab({ messages, onSend }: ChatTabProps) {
  const hasConversation = messages.length > 0

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.35,
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(13,148,136,0.12) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(37,99,235,0.1) 0%, transparent 40%)',
        }}
      />

      {hasConversation ? (
        <>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              px: contentPx,
              py: 3,
              position: 'relative',
            }}
          >
            <Box sx={{ maxWidth: composerMaxWidth, mx: 'auto', width: '100%' }}>
              <StudioChatMessages messages={messages} />
            </Box>
          </Box>

          <Box
            sx={{
              flexShrink: 0,
              px: contentPx,
              pb: 2,
              pt: 1,
              position: 'relative',
            }}
          >
            <Box sx={{ maxWidth: composerMaxWidth, mx: 'auto', width: '100%' }}>
              <CopilotComposer padded={false} minRows={2} onSubmit={onSend} />
            </Box>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            px: contentPx,
            pt: { xs: '10vh', md: '14vh' },
            pb: 4,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Stack
            spacing={1.5}
            alignItems="center"
            sx={{ position: 'relative', maxWidth: 640, textAlign: 'center', mb: 4 }}
          >
            <CopilotIcon size={32} />
            <Typography
              variant="h5"
              sx={{
                fontFamily: figmaFontFamilyStack.heading,
                fontWeight: 600,
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                lineHeight: 1.35,
                color: 'secondary.main',
              }}
            >
              Your intelligent workspace to get more done, faster
            </Typography>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontFamily: figmaFontFamilyStack.body, lineHeight: 1.6 }}
            >
              Easily summarize information, create notes or tasks, generate quotes, submit invoices, and handle more
              workflows — all in one place.
            </Typography>
          </Stack>

          <Box sx={{ width: '100%', maxWidth: composerMaxWidth, position: 'relative' }}>
            <CopilotComposer padded={false} minRows={3} onSubmit={onSend} />
          </Box>
        </Box>
      )}
    </Box>
  )
}

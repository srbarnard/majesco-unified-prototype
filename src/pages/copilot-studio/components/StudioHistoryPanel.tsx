import AddIcon from '@mui/icons-material/Add'
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined'
import CloseIcon from '@mui/icons-material/Close'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { studioChatThreadsMock, type StudioChatThread } from '@/pages/copilot-studio/data/mockCopilotStudio'
import {
  accentSubtle,
  accentSubtleHover,
  isDarkMode,
  surfaceMuted,
  surfacePanel,
} from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { copilotDrawerHeadingSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'

type StudioHistoryPanelProps = {
  onClose: () => void
  activeThreadId?: string | null
  onThreadSelect?: (thread: StudioChatThread) => void
  onNewChat?: () => void
}

/** Chat history list for Copilot Studio — shown in the left history drawer. */
export function StudioHistoryPanel({
  onClose,
  activeThreadId,
  onThreadSelect,
  onNewChat,
}: StudioHistoryPanelProps) {
  const [chatSearch, setChatSearch] = useState('')

  const threads = studioChatThreadsMock.filter((thread) => {
    const normalized = chatSearch.trim().toLowerCase()
    return !normalized || thread.title.toLowerCase().includes(normalized)
  })

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: (theme) => surfacePanel(theme),
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.5, flexShrink: 0 }}
      >
        <Typography variant="subtitle1" component="h2" sx={copilotDrawerHeadingSx}>
          History
        </Typography>
        <IconButton size="small" onClick={onClose} aria-label="Close history">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Box sx={{ px: 2, py: 1.5, flexShrink: 0 }}>
        <Box
          component="button"
          type="button"
          onClick={onNewChat}
          sx={{
            width: '100%',
            border: 'none',
            borderRadius: 2,
            py: 1,
            px: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.75,
            bgcolor: (theme) => accentSubtle(theme),
            color: 'primary.main',
            cursor: 'pointer',
            fontFamily: figmaFontFamilyStack.body,
            fontWeight: 600,
            fontSize: '0.8125rem',
            '&:hover': { bgcolor: (theme) => accentSubtleHover(theme) },
          }}
        >
          <AddIcon sx={{ fontSize: 18 }} />
          New chat
        </Box>
      </Box>

      <Box sx={{ px: 2, pb: 1, flexShrink: 0 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search by title"
          value={chatSearch}
          onChange={(event) => setChatSearch(event.target.value)}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              fontFamily: figmaFontFamilyStack.body,
              fontSize: '0.8125rem',
              bgcolor: 'background.paper',
            },
          }}
        />
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ px: 2, pb: 0.75, fontFamily: figmaFontFamilyStack.body, fontWeight: 600, flexShrink: 0 }}
      >
        Today
      </Typography>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: 1, pb: 1 }}>
        <Stack spacing={0.25}>
          {threads.map((thread) => {
            const isActive = activeThreadId === thread.id

            return (
              <Stack
                key={thread.id}
                component="button"
                type="button"
                direction="row"
                spacing={1}
                alignItems="flex-start"
                onClick={() => onThreadSelect?.(thread)}
                sx={(theme) => ({
                  width: '100%',
                  border: 'none',
                  // Panel is grey[100] (#F2F2F2); A200 (#EEEEEE) is a lighter step than grey[200].
                  bgcolor: isActive
                    ? isDarkMode(theme)
                      ? 'rgba(255, 255, 255, 0.28)'
                      : theme.figmaPalette.grey.A200
                    : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: 1.5,
                  px: 1,
                  py: 1,
                  '&:hover': {
                    bgcolor: isActive
                      ? isDarkMode(theme)
                        ? 'rgba(255, 255, 255, 0.28)'
                        : theme.figmaPalette.grey.A200
                      : surfaceMuted(theme),
                  },
                })}
              >
                <Box
                  sx={{
                    width: 16,
                    height: 16,
                    minWidth: 16,
                    minHeight: 16,
                    mt: 0.25,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {thread.agentRun ? (
                    <SmartToyOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  ) : (
                    <ChatBubbleOutlineOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  )}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: figmaFontFamilyStack.body,
                    fontSize: '0.8125rem',
                    fontWeight: 400,
                    color: 'text.primary',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {thread.title}
                </Typography>
              </Stack>
            )
          })}
        </Stack>
      </Box>
    </Box>
  )
}

import AddIcon from '@mui/icons-material/Add'
import CloseIcon from '@mui/icons-material/Close'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { useState } from 'react'
import { CopilotIcon } from '@/design-system/components'
import { studioChatThreadsMock, type StudioChatThread } from '@/pages/copilot-studio/data/mockCopilotStudio'
import { accentSubtle, accentSubtleHover, surfaceMuted, surfacePanel } from '@/design-system/theme/themeSurfaces'
import {
  drawerTransitionDuration,
  drawerTransitionEasing,
  panelSlideInFromLeftSx,
} from '@/design-system/tokens/motion'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type StudioChatDrawerProps = {
  open: boolean
  onClose: () => void
  activeThreadId?: string | null
  onThreadSelect?: (thread: StudioChatThread) => void
  onNewChat?: () => void
}

function ChatDrawerContent({
  onClose,
  activeThreadId,
  onThreadSelect,
  onNewChat,
}: {
  onClose: () => void
  activeThreadId?: string | null
  onThreadSelect?: (thread: StudioChatThread) => void
  onNewChat?: () => void
}) {
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
        sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Typography variant="subtitle1" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
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
                sx={{
                  width: '100%',
                  border: 'none',
                  bgcolor: isActive ? (theme) => accentSubtle(theme) : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderRadius: 1.5,
                  px: 1,
                  py: 1,
                  '&:hover': {
                    bgcolor: (theme) => (isActive ? accentSubtleHover(theme) : surfaceMuted(theme)),
                  },
                }}
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
                    <CopilotIcon size={16} />
                  )}
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: figmaFontFamilyStack.body,
                    fontSize: '0.8125rem',
                    fontWeight: isActive ? 600 : 400,
                    color: isActive ? 'primary.main' : 'text.primary',
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

export function StudioChatDrawer({
  open,
  onClose,
  activeThreadId,
  onThreadSelect,
  onNewChat,
}: StudioChatDrawerProps) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'))

  if (!open) return null

  const drawerContent = (
    <ChatDrawerContent
      onClose={onClose}
      activeThreadId={activeThreadId}
      onThreadSelect={onThreadSelect}
      onNewChat={onNewChat}
    />
  )

  if (!isDesktop) {
    return (
      <Drawer
        anchor="left"
        open={open}
        variant="temporary"
        onClose={onClose}
        transitionDuration={drawerTransitionDuration}
        slotProps={{
          transition: {
            easing: drawerTransitionEasing,
          },
        }}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            width: layoutTokens.secondaryPanelWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawerContent}
      </Drawer>
    )
  }

  return (
    <Box
      sx={{
        width: layoutTokens.secondaryPanelWidth,
        flexShrink: 0,
        height: '100%',
        minHeight: 0,
        borderRight: 1,
        borderColor: 'divider',
        overflow: 'hidden',
        display: { xs: 'none', lg: 'flex' },
        flexDirection: 'column',
        ...panelSlideInFromLeftSx(),
      }}
    >
      {drawerContent}
    </Box>
  )
}

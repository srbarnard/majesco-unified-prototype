import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined'
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import { layoutTokens } from '@/design-system/tokens/layout'

export type DocumentViewerAction = 'note' | 'task' | 'email' | 'download'

type DocumentViewerHoverActionsProps = {
  visible: boolean
  onAction?: (action: DocumentViewerAction) => void
}

const actions: { id: DocumentViewerAction; label: string; Icon: typeof StickyNote2OutlinedIcon }[] = [
  { id: 'note', label: 'Add Note', Icon: StickyNote2OutlinedIcon },
  { id: 'task', label: 'Create Task', Icon: TaskAltOutlinedIcon },
  { id: 'email', label: 'Attach to Email', Icon: EmailOutlinedIcon },
  { id: 'download', label: 'Download', Icon: DownloadOutlinedIcon },
]

export function DocumentViewerHoverActions({ visible, onAction }: DocumentViewerHoverActionsProps) {
  return (
    <Box
      sx={{
        position: 'absolute',
        left: '100%',
        top: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        transition: 'opacity 0.2s ease',
      }}
    >
      <Paper
        elevation={0}
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 0.25,
          py: 0.75,
          px: 0.5,
          borderRadius: `${layoutTokens.cardRadius}px`,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: theme.palette.mode === 'dark' ? theme.shadows[4] : '0 2px 12px rgba(0, 0, 0, 0.08)',
        })}
      >
        {actions.map(({ id, label, Icon }) => (
          <Tooltip key={id} title={label} placement="left" enterDelay={280}>
            <IconButton
              size="small"
              aria-label={label}
              onClick={() => onAction?.(id)}
              sx={{
                color: 'primary.main',
                borderRadius: 1.25,
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <Icon sx={{ fontSize: 20 }} />
            </IconButton>
          </Tooltip>
        ))}
      </Paper>
    </Box>
  )
}

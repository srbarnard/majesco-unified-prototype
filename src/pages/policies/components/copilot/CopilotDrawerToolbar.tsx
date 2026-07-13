import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined'
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import type { ReactNode } from 'react'

type CopilotDrawerToolbarProps = {
  leading?: ReactNode
  onOpenPrompts: () => void
  onOpenAgents: () => void
}

export function CopilotDrawerToolbar({ leading, onOpenPrompts, onOpenAgents }: CopilotDrawerToolbarProps) {
  return (
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
      {leading ?? <span />}
      <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0, ml: leading ? 1 : 0 }}>
        <Tooltip title="Prompts">
          <IconButton size="small" aria-label="Prompts" onClick={onOpenPrompts}>
            <PostAddOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Agents">
          <IconButton size="small" aria-label="Agents" onClick={onOpenAgents}>
            <SmartToyOutlinedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Stack>
    </Stack>
  )
}

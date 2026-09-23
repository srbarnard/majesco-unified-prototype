import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined'
import Box from '@mui/material/Box'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { SearchField } from '@/design-system/components'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CopilotDrawerSubHeader } from './CopilotDrawerSubHeader'
import {
  copilotDrawerAgentGroups,
  type CopilotDrawerAgent,
} from './copilotDrawerData'

type CopilotAgentsViewProps = {
  onBack: () => void
  onSelectAgent: (agent: CopilotDrawerAgent) => void
  onOpenPrompts: () => void
}

export function CopilotAgentsView({ onBack, onSelectAgent, onOpenPrompts }: CopilotAgentsViewProps) {
  const [search, setSearch] = useState('')
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    copilotDrawerAgentGroups.forEach((group) => {
      group.agents.forEach((agent) => {
        initial[agent.id] = agent.favorite
      })
    })
    return initial
  })
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({ inactive: true })
  const [menuState, setMenuState] = useState<{ anchor: HTMLElement; agentId: string } | null>(null)

  const groups = useMemo(() => {
    const normalized = search.trim().toLowerCase()
    if (!normalized) return copilotDrawerAgentGroups
    return copilotDrawerAgentGroups
      .map((group) => ({
        ...group,
        agents: group.agents.filter((agent) => agent.title.toLowerCase().includes(normalized)),
      }))
      .filter((group) => group.agents.length > 0)
  }, [search])

  const toggleFavorite = (agentId: string) => {
    setFavorites((current) => ({ ...current, [agentId]: !current[agentId] }))
  }

  const toggleCollapsed = (groupId: string) => {
    setCollapsed((current) => ({ ...current, [groupId]: !current[groupId] }))
  }

  return (
    <Box>
      <CopilotDrawerSubHeader
        title="Agents"
        onBack={onBack}
        actions={
          <Tooltip title="Prompts">
            <IconButton size="small" aria-label="Prompts" onClick={onOpenPrompts}>
              <PostAddOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        }
      />

      <SearchField
        fullWidth
        placeholder="Search agents"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 1 }}
      />

      <Stack sx={{ mx: -2 }}>
        {groups.map((group) => {
          const isCollapsed = collapsed[group.id] ?? false
          return (
            <Box key={group.id} sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Box
                component="button"
                type="button"
                onClick={() => toggleCollapsed(group.id)}
                sx={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 2,
                  py: 1.25,
                  border: 'none',
                  bgcolor: 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {isCollapsed ? (
                  <KeyboardArrowRightIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                ) : (
                  <ExpandMoreIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                )}
                <Typography
                  variant="body2"
                  sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}
                >
                  {group.label}
                </Typography>
              </Box>

              <Collapse in={!isCollapsed}>
                <Stack sx={{ pb: 0.5 }}>
                  {group.agents.map((agent) => (
                    <Stack
                      key={agent.id}
                      direction="row"
                      alignItems="center"
                      spacing={0.5}
                      sx={{
                        pl: 4,
                        pr: 1.5,
                        py: 0.75,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Box
                        component="button"
                        type="button"
                        onClick={() => onSelectAgent(agent)}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          border: 'none',
                          bgcolor: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          p: 0,
                        }}
                      >
                        <Typography
                          variant="body2"
                          noWrap
                          sx={{ fontFamily: figmaFontFamilyStack.body }}
                        >
                          {agent.title}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        aria-label={favorites[agent.id] ? 'Remove favorite' : 'Add favorite'}
                        onClick={() => toggleFavorite(agent.id)}
                      >
                        {favorites[agent.id] ? (
                          <FavoriteIcon fontSize="small" sx={{ color: 'error.main' }} />
                        ) : (
                          <FavoriteBorderIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                        )}
                      </IconButton>
                      <IconButton
                        size="small"
                        aria-label={`More options for ${agent.title}`}
                        onClick={(event) => setMenuState({ anchor: event.currentTarget, agentId: agent.id })}
                      >
                        <MoreVertIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </IconButton>
                    </Stack>
                  ))}
                </Stack>
              </Collapse>
            </Box>
          )
        })}

        {groups.length === 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: figmaFontFamilyStack.body, textAlign: 'center', py: 4, px: 2 }}
          >
            No agents match your search.
          </Typography>
        )}
      </Stack>

      <Menu
        anchorEl={menuState?.anchor ?? null}
        open={Boolean(menuState)}
        onClose={() => setMenuState(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => setMenuState(null)}>Run agent</MenuItem>
        <MenuItem onClick={() => setMenuState(null)}>View details</MenuItem>
      </Menu>
    </Box>
  )
}

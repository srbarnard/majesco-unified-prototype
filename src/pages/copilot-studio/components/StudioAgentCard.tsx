import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined'
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import SellOutlinedIcon from '@mui/icons-material/SellOutlined'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { StatusChip } from '@/design-system/components'
import { getAgentVisual } from '@/pages/copilot-studio/data/agentVisuals'
import type { StudioAgent } from '@/pages/copilot-studio/data/mockCopilotStudio'
import { studioSelectableCardSx } from '@/pages/copilot-studio/data/studioCardStyles'
import { surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type StudioAgentCardProps = {
  agent: StudioAgent
  selected?: boolean
  onSelect?: (agent: StudioAgent) => void
  onToggleFavorite?: (agent: StudioAgent) => void
}

function statusVariant(status: StudioAgent['status']) {
  if (status === 'Active') return 'success' as const
  if (status === 'Draft') return 'warning' as const
  return 'default' as const
}

function TagMetaLine({ label }: { label: string }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center">
      <SellOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary', flexShrink: 0 }} />
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontFamily: figmaFontFamilyStack.body,
          fontSize: '0.8125rem',
          lineHeight: 1.4,
        }}
      >
        {label}
      </Typography>
    </Stack>
  )
}

export function StudioAgentCard({ agent, selected = false, onSelect, onToggleFavorite }: StudioAgentCardProps) {
  const { Icon, color, bgcolor } = getAgentVisual(agent.category, agent.kind)

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect?.(agent)}
      aria-pressed={selected}
      sx={(theme) => ({
        ...studioSelectableCardSx(theme, selected),
        width: '100%',
        p: 2,
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 228,
      })}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.25 }}>
        <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ minWidth: 0 }}>
          <StatusChip label={agent.status} status={statusVariant(agent.status)} />
          <Chip
            label={agent.category}
            size="small"
            sx={(theme) => ({
              height: 24,
              fontFamily: figmaFontFamilyStack.body,
              fontSize: '0.75rem',
              fontWeight: 500,
              bgcolor: surfaceSubtle(theme),
              color: 'text.secondary',
              border: 'none',
              '& .MuiChip-label': { px: 1 },
            })}
          />
        </Stack>
        <IconButton
          size="small"
          aria-label={agent.favorite ? 'Remove from favorites' : 'Add to favorites'}
          onClick={(event) => {
            event.stopPropagation()
            onToggleFavorite?.(agent)
          }}
          sx={{
            mt: -0.5,
            mr: -0.5,
            color: agent.favorite ? 'error.main' : 'text.secondary',
            '&:hover': { color: 'error.main' },
          }}
        >
          {agent.favorite ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>
      </Stack>

      <Box
        sx={(theme) => ({
          width: 48,
          height: 48,
          borderRadius: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          bgcolor: bgcolor(theme),
          color: color(theme),
          mb: 1.25,
        })}
      >
        <Icon sx={{ fontSize: 26 }} />
      </Box>

      <Typography
        variant="subtitle2"
        sx={{
          fontFamily: figmaFontFamilyStack.heading,
          fontWeight: 600,
          fontSize: '0.9375rem',
          lineHeight: 1.35,
          color: 'text.primary',
          mb: 0.75,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {agent.title}
      </Typography>

      <Box sx={{ mb: 1.25 }}>
        <TagMetaLine label={agent.version} />
      </Box>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontFamily: figmaFontFamilyStack.body,
          fontSize: '0.8125rem',
          lineHeight: 1.5,
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {agent.description}
      </Typography>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: 'divider' }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
          <CalendarTodayOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
            Last updated: {agent.lastRun}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ flexShrink: 0 }}>
          <BarChartOutlinedIcon sx={{ fontSize: 15, color: 'text.secondary' }} />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontWeight: 600 }}
          >
            {agent.interactionCount.toLocaleString()}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  )
}

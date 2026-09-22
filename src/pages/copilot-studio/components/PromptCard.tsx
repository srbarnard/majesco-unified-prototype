import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import {
  getAnalyticsSurfaceToneStyles,
  type AnalyticsSurfaceTone,
} from '@/design-system/components/analytics/AnalyticsSurfaceCard'
import type { AppTheme } from '@/design-system/theme'
import { surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { motionTokens } from '@/design-system/tokens/motion'
import type { StudioPrompt } from '@/pages/copilot-studio/data/mockCopilotStudio'

const motionSafe = '@media (prefers-reduced-motion: no-preference)'
const RAIL_WIDTH = 4
const CARD_INNER_PADDING = 16

type PromptCardProps = {
  prompt: StudioPrompt
  selected?: boolean
  onSelect?: (prompt: StudioPrompt) => void
}

function getPromptTone(prompt: StudioPrompt): AnalyticsSurfaceTone {
  if (prompt.type === 'action') return 'warning'
  if (prompt.category === 'Help') return 'success'
  if (prompt.category === 'Information') return 'info'
  if (prompt.category === 'Other') return 'neutral'
  return 'info'
}

export function PromptCard({ prompt, selected = false, onSelect }: PromptCardProps) {
  const theme = useTheme() as AppTheme
  const tone = getPromptTone(prompt)
  const toneStyles = getAnalyticsSurfaceToneStyles(tone, theme)
  const typeLabel = prompt.type === 'action' ? 'Action' : 'Prompt'

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect?.(prompt)}
      aria-pressed={selected}
      sx={(t) => ({
        width: '100%',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: `${layoutTokens.cardRadius}px`,
        bgcolor: selected ? surfaceSubtle(t) : surfaceMuted(t),
        border: 'none',
        boxShadow: 'none',
        textAlign: 'left',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 168,
        cursor: 'pointer',
        p: 0,
        pl: `${RAIL_WIDTH + CARD_INNER_PADDING}px`,
        pr: `${CARD_INNER_PADDING}px`,
        pt: `${CARD_INNER_PADDING}px`,
        pb: `${CARD_INNER_PADDING}px`,
        transition: `background-color 0.15s ease, transform ${motionTokens.durationFastMs}ms ${motionTokens.easing}`,
        '& [data-prompt-title]': { transition: 'color 0.15s ease' },
        '&:hover': {
          bgcolor: surfaceSubtle(t),
          '& [data-prompt-title]': { color: 'primary.main' },
        },
        [motionSafe]: {
          '&:hover': {
            transform: `translateY(${motionTokens.cardHoverTranslateY}px) scale(${motionTokens.cardHoverScale})`,
            zIndex: 1,
          },
        },
        '&:focus-visible': {
          outline: 2,
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      })}
    >
      <Box
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: RAIL_WIDTH,
          bgcolor: toneStyles.accent,
          borderRadius: '2px 0 0 2px',
        }}
      />

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: toneStyles.value,
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{
              fontFamily: figmaFontFamilyStack.body,
              fontSize: '0.6875rem',
              color: 'text.secondary',
            }}
          >
            {typeLabel}
            {prompt.category !== 'Actions' ? ` · ${prompt.category}` : ''}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.25} alignItems="center" sx={{ mr: -0.5, mt: -0.5 }}>
          <IconButton
            size="small"
            aria-label={prompt.favorite ? 'Remove favorite' : 'Add favorite'}
            onClick={(event) => event.stopPropagation()}
            sx={{ color: prompt.favorite ? 'error.main' : 'text.secondary' }}
          >
            {prompt.favorite ? <FavoriteIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
          </IconButton>
          <IconButton
            size="small"
            aria-label="Prompt options"
            onClick={(event) => event.stopPropagation()}
          >
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Stack>

      <Typography
        data-prompt-title
        variant="subtitle2"
        sx={{
          fontFamily: figmaFontFamilyStack.heading,
          fontWeight: 600,
          fontSize: '0.875rem',
          lineHeight: 1.4,
          color: selected ? 'primary.main' : 'text.primary',
          mb: 0.75,
        }}
      >
        {prompt.title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{
          fontFamily: figmaFontFamilyStack.body,
          fontSize: '0.8125rem',
          lineHeight: 1.5,
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {prompt.description}
      </Typography>
    </Box>
  )
}

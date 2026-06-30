import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import FavoriteIcon from '@mui/icons-material/Favorite'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { StudioPrompt } from '@/pages/copilot-studio/data/mockCopilotStudio'
import { studioSelectableCardSx } from '@/pages/copilot-studio/data/studioCardStyles'
import { surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type PromptCardProps = {
  prompt: StudioPrompt
  selected?: boolean
  onSelect?: (prompt: StudioPrompt) => void
}

export function PromptCard({ prompt, selected = false, onSelect }: PromptCardProps) {
  const typeLabel = prompt.type.charAt(0).toUpperCase() + prompt.type.slice(1)

  return (
    <Box
      component="button"
      type="button"
      onClick={() => onSelect?.(prompt)}
      aria-pressed={selected}
      sx={(theme) => ({
        ...studioSelectableCardSx(theme, selected),
        width: '100%',
        p: 2,
        textAlign: 'left',
        minHeight: 168,
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.25 }}>
        <Chip
          label={typeLabel}
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
        <Stack direction="row" spacing={0.25} alignItems="center">
          <IconButton size="small" aria-label="Favorite prompt" sx={{ color: prompt.favorite ? 'error.main' : 'text.secondary' }}>
            {prompt.favorite ? <FavoriteIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
          </IconButton>
          <IconButton size="small" aria-label="Prompt options">
            <MoreVertIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Stack>
      </Stack>

      <Typography
        variant="subtitle2"
        sx={{
          fontFamily: figmaFontFamilyStack.heading,
          fontWeight: 600,
          fontSize: '0.875rem',
          lineHeight: 1.4,
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

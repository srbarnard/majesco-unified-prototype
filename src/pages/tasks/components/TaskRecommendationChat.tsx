import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined'
import OpenInFullIcon from '@mui/icons-material/OpenInFull'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Button } from '@/design-system/components'
import { accentSubtle, accentSubtleHover } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'
import { resolveTaskRecommendationResponse } from '@/pages/tasks/utils/resolveTaskRecommendationResponse'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

const suggestedActionChipSx = {
  textTransform: 'none',
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
  fontSize: '0.75rem',
  lineHeight: 1.3,
  borderRadius: '30px',
  border: 'none',
  boxShadow: 'none',
  color: 'primary.main',
  bgcolor: (theme: Parameters<typeof accentSubtle>[0]) => accentSubtle(theme),
  px: 1.25,
  py: 0.5,
  minHeight: 'auto',
  '&:hover': {
    bgcolor: (theme: Parameters<typeof accentSubtle>[0]) => accentSubtleHover(theme),
    boxShadow: 'none',
  },
} as const

type TaskRecommendationChatProps = {
  insight: string
  task: TaskRecord
  backLabel?: string
  onBack: () => void
}

export function TaskRecommendationChat({
  insight,
  task,
  backLabel = 'Task details',
  onBack,
}: TaskRecommendationChatProps) {
  const content = resolveTaskRecommendationResponse(insight, task)

  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={0.25} sx={{ minWidth: 0 }}>
          <IconButton size="small" onClick={onBack} aria-label={`Back to ${backLabel}`} sx={{ flexShrink: 0 }}>
            <ArrowBackIcon fontSize="small" sx={{ color: 'secondary.main' }} />
          </IconButton>
          <Typography
            component="button"
            type="button"
            variant="body2"
            onClick={onBack}
            sx={{
              ...headingSx,
              fontSize: '0.9375rem',
              color: 'secondary.main',
              border: 0,
              bgcolor: 'transparent',
              cursor: 'pointer',
              p: 0,
              textAlign: 'left',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            {backLabel}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
          <IconButton size="small" aria-label="Copy response">
            <ContentCopyOutlinedIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Expand response">
            <OpenInFullIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, color: 'text.primary' }}>
        {insight}
      </Typography>

      <Box>
        <Typography variant="subtitle2" sx={{ ...headingSx, fontSize: '0.9375rem', mb: 1 }}>
          {content.heading}
        </Typography>
        {content.intro && (
          <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6, mb: 1.25 }}>
            {content.intro}
          </Typography>
        )}
        <Stack component="ol" spacing={1} sx={{ m: 0, pl: 2.25, mb: 1.25 }}>
          {content.items.map((item) => (
            <Typography
              key={item}
              component="li"
              variant="body2"
              sx={{ ...bodySx, lineHeight: 1.55, fontSize: '0.875rem' }}
            >
              {item}
            </Typography>
          ))}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, lineHeight: 1.55 }}>
          {content.summary}
          {' · '}
          Processed in {content.elapsedSeconds.toFixed(2)}s
        </Typography>
      </Box>

      <Box>
        <Typography variant="caption" color="text.secondary" display="block" sx={{ ...bodySx, mb: 1 }}>
          Suggested actions
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {content.actions.map((action) => (
            <Button key={action} size="small" variant="text" disableRipple sx={suggestedActionChipSx}>
              {action}
            </Button>
          ))}
        </Stack>
      </Box>
    </Stack>
  )
}

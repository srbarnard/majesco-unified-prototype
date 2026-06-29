import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useState } from 'react'
import { CopilotIcon } from '@/design-system/components'
import { accentSubtle, isDarkMode } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

type DocumentStoryCardProps = {
  summary: string
  syncedAt: string
}

export function DocumentStoryCard({ summary, syncedAt }: DocumentStoryCardProps) {
  const [expanded, setExpanded] = useState(true)

  return (
    <Box
      sx={(theme) => ({
        borderRadius: `${layoutTokens.cardRadius}px`,
        bgcolor: accentSubtle(theme),
        border: 1,
        borderColor: 'divider',
        boxShadow: isDarkMode(theme) ? 'none' : layoutTokens.cardShadow,
        overflow: 'hidden',
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.25 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CopilotIcon size={20} active />
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.875rem' }}
            >
              Document Story
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
              Synced {syncedAt}
            </Typography>
          </Box>
        </Stack>
        <Button
          size="small"
          color="inherit"
          onClick={() => setExpanded((prev) => !prev)}
          endIcon={expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          sx={{
            color: 'text.secondary',
            textTransform: 'none',
            fontWeight: 400,
            fontFamily: figmaFontFamilyStack.body,
            fontSize: '0.8125rem',
          }}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </Stack>
      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 1.5 }}>
          <Typography variant="body2" color="text.primary" sx={{ fontFamily: figmaFontFamilyStack.body, lineHeight: 1.6 }}>
            {summary}
          </Typography>
        </Box>
      </Collapse>
    </Box>
  )
}

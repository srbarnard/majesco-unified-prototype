import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Popover from '@mui/material/Popover'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, keyframes } from '@mui/material/styles'
import { useState } from 'react'
import {
  DEFAULT_COPILOT_CONFIDENCE_TIERS,
  getCopilotConfidenceColor,
  type CopilotConfidenceTier,
} from '@/pages/policies/components/copilot/copilotConfidence'
import { isDarkMode, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

const INDICATOR_SIZE = 22
const INDICATOR_THICKNESS = 5

const confidenceTrackPulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
`

const confidenceHoverBounce = keyframes`
  0% { transform: scale(1); }
  45% { transform: scale(1.5); }
  62% { transform: scale(1.24); }
  78% { transform: scale(1.38); }
  90% { transform: scale(1.32); }
  100% { transform: scale(1.35); }
`

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const headingSx = {
  fontFamily: figmaFontFamilyStack.heading,
  fontWeight: 600,
} as const

function getConfidenceTrackColor(theme: Parameters<typeof getCopilotConfidenceColor>[0], confidence: number) {
  const main = getCopilotConfidenceColor(theme, confidence)
  return alpha(main, isDarkMode(theme) ? 0.3 : 0.22)
}

type CopilotConfidenceIndicatorProps = {
  animatedValue: number
  displayedValue: number
  statusLabel: string
  popoverTitle?: string
  popoverDescription?: string
  tiers?: CopilotConfidenceTier[]
}

export function CopilotConfidenceIndicator({
  animatedValue,
  displayedValue,
  statusLabel,
  popoverTitle = 'Chat confidence',
  popoverDescription = 'Reflects how complete and consistent the current flow is based on captured fields, documents, and cross-checks.',
  tiers = DEFAULT_COPILOT_CONFIDENCE_TIERS,
}: CopilotConfidenceIndicatorProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  return (
    <>
      <Tooltip title={`${displayedValue}% confidence · ${statusLabel}`} placement="bottom" enterDelay={200}>
        <IconButton
          size="small"
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label={`${popoverTitle} ${displayedValue} percent — ${statusLabel}. Show details.`}
          sx={{
            p: 0.125,
            ml: 0.75,
            bgcolor: 'transparent',
            transform: 'scale(1)',
            transformOrigin: 'center',
            transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
            '@media (hover: hover)': {
              '&:hover': {
                bgcolor: 'transparent',
                animation: `${confidenceHoverBounce} 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
              },
            },
          }}
        >
          <Box
            sx={{
              position: 'relative',
              display: 'inline-flex',
              width: INDICATOR_SIZE,
              height: INDICATOR_SIZE,
            }}
          >
            <CircularProgress
              variant="determinate"
              value={100}
              size={INDICATOR_SIZE}
              thickness={INDICATOR_THICKNESS}
              sx={(theme) => ({
                color: getConfidenceTrackColor(theme, displayedValue),
                animation: `${confidenceTrackPulse} 2.5s ease-in-out infinite`,
                transition: 'color 0.45s ease',
              })}
            />
            <CircularProgress
              variant="determinate"
              value={animatedValue}
              size={INDICATOR_SIZE}
              thickness={INDICATOR_THICKNESS}
              sx={(theme) => ({
                color: getCopilotConfidenceColor(theme, displayedValue),
                position: 'absolute',
                left: 0,
                transition: 'color 0.45s ease',
                '& .MuiCircularProgress-circle': {
                  transition: 'stroke-dashoffset 0.1s linear',
                },
              })}
            />
          </Box>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{
          paper: {
            sx: {
              mt: 0.75,
              width: 280,
              borderRadius: `${layoutTokens.cardRadius}px`,
              boxShadow: 3,
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.75 }}>
          <Typography variant="subtitle2" sx={{ ...headingSx, fontSize: '0.875rem', mb: 0.5 }}>
            {popoverTitle}
          </Typography>
          <Typography
            variant="body2"
            sx={(theme) => ({
              ...bodySx,
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: getCopilotConfidenceColor(theme, displayedValue),
              mb: 1,
            })}
          >
            {displayedValue}% · {statusLabel}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ ...bodySx, fontSize: '0.8125rem', lineHeight: 1.55, mb: 1.5 }}>
            {popoverDescription}
          </Typography>
          <Stack
            spacing={1}
            sx={(theme) => ({
              px: 1.25,
              py: 1.25,
              borderRadius: 1,
              bgcolor: surfaceMuted(theme),
            })}
          >
            {tiers.map((tier) => (
              <Box key={tier.label}>
                <Typography
                  variant="caption"
                  sx={(theme) => ({
                    ...headingSx,
                    display: 'block',
                    fontSize: '0.75rem',
                    color: getCopilotConfidenceColor(theme, tier.min),
                  })}
                >
                  {tier.rangeLabel} — {tier.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, fontSize: '0.6875rem', lineHeight: 1.45 }}>
                  {tier.detail}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Popover>
    </>
  )
}

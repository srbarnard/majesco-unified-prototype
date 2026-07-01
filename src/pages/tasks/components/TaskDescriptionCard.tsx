import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { CopilotIcon } from '@/design-system/components'
import {
  accentSubtle,
  accentSubtleHover,
  accentSurfaceCardSx,
  surfaceMuted,
} from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

const cardPaddingX = layoutTokens.contentPaddingX / 8

function getFirstSentence(text: string) {
  const match = text.match(/^[^.!?]+[.!?]/)
  return match ? match[0].trim() : text
}

const recommendationTextSx = {
  fontFamily: figmaFontFamilyStack.body,
  fontSize: '0.75rem',
  lineHeight: 1.5,
  color: 'text.primary',
} as const

type TaskDescriptionCardProps = {
  description: string
  copilotInsights?: string[]
  onRecommendationClick?: (insight: string) => void
}

export function TaskDescriptionCard({
  description,
  copilotInsights = [],
  onRecommendationClick,
}: TaskDescriptionCardProps) {
  const [expanded, setExpanded] = useState(false)
  const firstSentence = useMemo(() => getFirstSentence(description), [description])
  const canExpand = description.trim().length > firstSentence.length
  const hasInsights = copilotInsights.length > 0

  return (
    <Box
      sx={(theme) => ({
        ...accentSurfaceCardSx(theme),
        overflow: 'hidden',
        bgcolor: 'transparent',
      })}
    >
      <Box
        sx={(theme) => ({
          bgcolor: surfaceMuted(theme),
          px: cardPaddingX,
          pt: 1.25,
          pb: hasInsights ? 1.75 : 1.25,
        })}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ pb: canExpand ? 0.75 : 0 }}
        >
          <Typography
            variant="subtitle2"
            sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.875rem' }}
          >
            Description
          </Typography>
          {canExpand && (
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
                flexShrink: 0,
                minWidth: 0,
              }}
            >
              {expanded ? 'Less' : 'More'}
            </Button>
          )}
        </Stack>

        <Typography
          variant="body2"
          color="text.primary"
          sx={{ fontFamily: figmaFontFamilyStack.body, lineHeight: 1.6, fontSize: '0.875rem' }}
        >
          {expanded || !canExpand ? description : firstSentence}
        </Typography>
      </Box>

      {hasInsights && (
        <Box
          sx={(theme) => ({
            bgcolor: accentSubtle(theme),
            borderTop: '2px solid',
            borderColor: theme.palette.common.white,
            px: cardPaddingX,
            pt: 1.75,
            pb: 1.75,
          })}
        >
          <Stack direction="row" spacing={0.625} alignItems="center" sx={{ mb: 0.5 }}>
            <CopilotIcon size={14} />
            <Typography
              variant="caption"
              sx={{
                fontFamily: figmaFontFamilyStack.heading,
                fontWeight: 600,
                fontSize: '0.75rem',
                color: 'text.secondary',
                letterSpacing: '0.01em',
              }}
            >
              Copilot recommends
            </Typography>
          </Stack>
          <Stack component="ul" spacing={0.75} sx={{ listStyle: 'none', m: 0, p: 0 }}>
            {copilotInsights.map((insight) => (
              <Box component="li" key={insight}>
                <Box
                  component="button"
                  type="button"
                  onClick={() => onRecommendationClick?.(insight)}
                  sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 1,
                    width: '100%',
                    border: 0,
                    bgcolor: 'transparent',
                    cursor: onRecommendationClick ? 'pointer' : 'default',
                    p: 0.5,
                    mx: -0.5,
                    borderRadius: 1.25,
                    textAlign: 'left',
                    transition: 'background-color 0.15s ease',
                    ...(onRecommendationClick && {
                      '&:hover': {
                        bgcolor: accentSubtleHover(theme),
                        '& .copilot-recommendation-arrow': {
                          bgcolor: 'background.paper',
                          color: 'primary.main',
                        },
                      },
                    }),
                  })}
                >
                  <Box
                    className="copilot-recommendation-arrow"
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      mt: 0.0625,
                      bgcolor: 'background.paper',
                      color: 'text.secondary',
                      transition: 'background-color 0.15s ease, color 0.15s ease',
                    }}
                  >
                    <ArrowOutwardIcon sx={{ fontSize: 13 }} />
                  </Box>
                  <Typography variant="body2" sx={recommendationTextSx}>
                    {insight}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  )
}

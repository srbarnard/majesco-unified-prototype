import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Collapse from '@mui/material/Collapse'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useMemo, useState } from 'react'
import { CopilotIcon } from '@/design-system/components'
import { accentSurfaceCardSx } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { DocumentStoryStats } from '@/pages/policies/data/documentStoryUtils'

export type DocumentStoryHighlight = {
  label: string
  date: string
}

type DocumentStoryCardProps = {
  summary: string
  syncedAt: string
  highlights?: DocumentStoryHighlight[]
  stats?: DocumentStoryStats
  remainingHighlightCount?: number
  impactLinkLabel?: string
  onShowImpact?: () => void
}

function getFirstSentence(text: string) {
  const match = text.match(/^[^.!?]+[.!?]/)
  return match ? match[0].trim() : text
}

const bulletListSx = {
  m: 0,
  pl: 2.5,
  listStyleType: 'disc',
  listStylePosition: 'outside',
  '& li': {
    fontFamily: figmaFontFamilyStack.body,
    fontSize: '0.8125rem',
    lineHeight: 1.55,
    color: 'text.primary',
    pl: 0.5,
    mb: 0.75,
    '&::marker': {
      color: 'text.primary',
    },
  },
  '& li:last-child': {
    mb: 0,
  },
} as const

export function DocumentStoryCard({
  summary,
  syncedAt,
  highlights = [],
  stats,
  remainingHighlightCount = 0,
  impactLinkLabel = 'Show how this impacts the policy',
  onShowImpact,
}: DocumentStoryCardProps) {
  const [expanded, setExpanded] = useState(false)
  const firstSentence = useMemo(() => getFirstSentence(summary), [summary])
  const showFilteredCount = stats && stats.visibleDocuments !== stats.totalDocuments

  return (
    <Box
      sx={(theme) => ({
        ...accentSurfaceCardSx(theme),
        overflow: 'hidden',
        flexShrink: 0,
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, py: 1.25 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
          <CopilotIcon size={20} active />
          <Box sx={{ minWidth: 0 }}>
            <Typography
              variant="subtitle2"
              sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600, fontSize: '0.875rem' }}
            >
              Document Story
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body }}>
              Synced {syncedAt}
              {stats ? ` · ${stats.totalDocuments} documents on file` : ''}
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
            flexShrink: 0,
          }}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </Stack>

      {stats && (
        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ px: 2, pb: 1 }}>
          <Chip
            size="small"
            label={`${stats.updatedThisWeek} this week`}
            variant="outlined"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.6875rem', height: 24 }}
          />
          <Chip
            size="small"
            label={`${stats.addedThisMonth} this month`}
            variant="outlined"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.6875rem', height: 24 }}
          />
          <Chip
            size="small"
            label={`${stats.endorsementCount} endorsements`}
            variant="outlined"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.6875rem', height: 24 }}
          />
          <Chip
            size="small"
            label={`Last activity ${stats.lastActivityRelative}`}
            variant="outlined"
            sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.6875rem', height: 24 }}
          />
          {showFilteredCount && (
            <Chip
              size="small"
              label={`${stats.visibleDocuments} matching filters`}
              color="info"
              variant="filled"
              sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.6875rem', height: 24 }}
            />
          )}
        </Stack>
      )}

      <Box sx={{ px: 2, pb: expanded ? 0 : 1.25 }}>
        <Typography
          variant="body2"
          color="text.primary"
          sx={{ fontFamily: figmaFontFamilyStack.body, lineHeight: 1.6 }}
        >
          {expanded ? summary : firstSentence}
        </Typography>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 1.5, pt: 0.25 }}>
          {highlights.length > 0 && (
            <>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mb: 0.75, fontWeight: 500 }}
              >
                Recent activity
              </Typography>
              <Box component="ul" sx={bulletListSx}>
                {highlights.map((item) => (
                  <Box component="li" key={`${item.label}-${item.date}`}>
                    {item.label}
                    <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 0.75 }}>
                      {item.date}
                    </Typography>
                  </Box>
                ))}
              </Box>
              {remainingHighlightCount > 0 && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontFamily: figmaFontFamilyStack.body, display: 'block', mt: 0.75 }}
                >
                  + {remainingHighlightCount} more document{remainingHighlightCount === 1 ? '' : 's'} in history
                </Typography>
              )}
            </>
          )}
          <Link
            component="button"
            variant="body2"
            underline="hover"
            onClick={onShowImpact}
            sx={{
              fontFamily: figmaFontFamilyStack.body,
              fontWeight: 500,
              fontSize: '0.8125rem',
              textAlign: 'left',
              mt: highlights.length > 0 ? 1 : 0,
            }}
          >
            {impactLinkLabel}
          </Link>
        </Box>
      </Collapse>
    </Box>
  )
}

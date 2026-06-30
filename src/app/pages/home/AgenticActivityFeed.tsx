import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router'
import { agenticActivityMock, type AgenticActivityItem } from '@/app/data/homeMock'
import type { AppTheme } from '@/design-system/theme'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { entityDetailCardSx } from '@/pages/shared/components/EntityStatGrid'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'

const AGENT_FEED_MAX_HEIGHT = { xs: 320, md: 380 }

type AgenticActivityFeedProps = {
  title?: string
  viewAllHref?: string
  maxHeight?: { xs: number; md: number }
}

/**
 * Agent-driven activity feed. Reserved for optional homepage or dashboard use
 * (e.g. agent insights). Not mounted on the homepage by default — see RecentActivityFeed.
 */
export function AgenticActivityFeed({
  title = 'Agentic agent activity',
  viewAllHref = '/activity',
  maxHeight = AGENT_FEED_MAX_HEIGHT,
}: AgenticActivityFeedProps) {
  return (
    <Box
      sx={(theme) => ({
        ...entityDetailCardSx(theme as AppTheme),
        display: 'flex',
        flexDirection: 'column',
        maxHeight,
        overflow: 'hidden',
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          px: 2,
          py: 1.5,
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Typography variant="subtitle1" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
          {title}
        </Typography>
        {viewAllHref && (
          <Typography
            component={Link}
            to={viewAllHref}
            variant="body2"
            color="primary"
            sx={{
              fontFamily: figmaFontFamilyStack.body,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            View all
          </Typography>
        )}
      </Stack>

      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        <AgenticActivityList items={agenticActivityMock} />
      </Box>
    </Box>
  )
}

/** Reusable agent activity rows — import where agent insights are needed. */
export function AgenticActivityList({ items }: { items: AgenticActivityItem[] }) {
  return (
    <Stack spacing={0} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider', mx: 2 }} />}>
      {items.map((item) => (
        <Stack
          key={item.id}
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            py: 1.5,
            px: 2,
            cursor: 'pointer',
            borderRadius: 1,
            transition: 'background-color 0.15s ease',
            '&:hover': { bgcolor: (theme) => surfaceMuted(theme) },
          }}
        >
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: `${item.accentColor}14`,
              color: item.accentColor,
              fontFamily: figmaFontFamilyStack.heading,
              fontWeight: 600,
              fontSize: '0.8125rem',
              flexShrink: 0,
            }}
          >
            {item.agentInitials}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
              {item.agentName} · {item.headline}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontFamily: figmaFontFamilyStack.body, mt: 0.25 }}>
              {item.description}
            </Typography>
          </Box>
          <ChevronRightIcon fontSize="small" color="action" />
        </Stack>
      ))}
    </Stack>
  )
}

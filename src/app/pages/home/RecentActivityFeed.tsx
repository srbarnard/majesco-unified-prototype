import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Link } from 'react-router'
import { ActivityFeedList } from '@/app/pages/home/ActivityFeedList'
import type { RecentActivityItem } from '@/app/data/homeMock'
import { recentActivityMock } from '@/app/data/homeMock'
import type { AppTheme } from '@/design-system/theme'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { entityDetailCardSx } from '@/pages/shared/components/EntityStatGrid'

type RecentActivityFeedProps = {
  activeActivityId?: string | null
  onActivitySelect?: (activity: RecentActivityItem) => void
}

export function RecentActivityFeed({ activeActivityId, onActivitySelect }: RecentActivityFeedProps) {
  return (
    <Box
      sx={(theme) => ({
        ...entityDetailCardSx(theme as AppTheme),
        display: 'flex',
        flexDirection: 'column',
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2, pt: 1.5, pb: 1, flexShrink: 0 }}
      >
        <Typography variant="subtitle1" sx={{ fontFamily: figmaFontFamilyStack.heading, fontWeight: 600 }}>
          Recent activity
        </Typography>
        <Typography
          component={Link}
          to="/activity"
          variant="body2"
          color="primary"
          sx={{
            fontFamily: figmaFontFamilyStack.body,
            textDecoration: 'none',
            fontSize: '0.8125rem',
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          View all
        </Typography>
      </Stack>

      <Box sx={{ px: 2, pb: 1.75 }}>
        <ActivityFeedList
          items={recentActivityMock}
          activeActivityId={activeActivityId}
          onActivitySelect={onActivitySelect}
          showFilters
          maxRows={8}
        />
      </Box>
    </Box>
  )
}

import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useCallback, useState } from 'react'
import type { RecentActivityItem } from '@/app/data/homeMock'
import { recentActivityMock } from '@/app/data/homeMock'
import { ActivityDetailsPanel } from '@/app/pages/home/ActivityDetailsPanel'
import { ActivityFeedList } from '@/app/pages/home/ActivityFeedList'
import { useGlobalSearch } from '@/app/contexts/GlobalSearchContext'
import { CopilotContentTransition } from '@/pages/policies/components/copilot/CopilotContentTransition'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import { layoutTokens } from '@/design-system/tokens/layout'
import { surfaceApp } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { entityDetailCardSx } from '@/pages/shared/components/EntityStatGrid'
import type { AppTheme } from '@/design-system/theme'

export function ActivityPage() {
  const isDesktop = useIsDesktopLayout()
  const { closeCopilot } = useGlobalSearch()
  const contentPx = `${layoutTokens.contentPaddingX}px`
  const [selectedActivity, setSelectedActivity] = useState<RecentActivityItem | null>(null)
  const [activityDetailOpen, setActivityDetailOpen] = useState(false)

  const handleOpenActivity = useCallback(
    (activity: RecentActivityItem) => {
      setSelectedActivity(activity)
      closeCopilot()
      setActivityDetailOpen(true)
    },
    [closeCopilot],
  )

  const handleCloseActivityDetail = useCallback(() => {
    setActivityDetailOpen(false)
    setSelectedActivity(null)
  }, [])

  const handleCloseRightPanel = useCallback(() => {
    if (activityDetailOpen) {
      handleCloseActivityDetail()
    }
  }, [activityDetailOpen, handleCloseActivityDetail])

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        bgcolor: (theme) => surfaceApp(theme),
      }}
    >
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ flexShrink: 0, px: contentPx, pt: layoutTokens.policyHeaderTopPadding, pb: 1.5 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontFamily: figmaFontFamilyStack.heading,
              fontWeight: 600,
              fontSize: { xs: '1.25rem', md: '1.375rem' },
              lineHeight: 1.3,
            }}
          >
            Activity
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontFamily: figmaFontFamilyStack.body, mt: 0.5 }}
          >
            Policy, submission, and task events across your book
          </Typography>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', px: contentPx, pb: contentPx }}>
          <Box
            sx={(theme) => ({
              ...entityDetailCardSx(theme as AppTheme),
              p: 2,
            })}
          >
            <ActivityFeedList
              items={recentActivityMock}
              activeActivityId={selectedActivity?.id}
              onActivitySelect={isDesktop ? handleOpenActivity : undefined}
              showFilters
            />
          </Box>
        </Box>
      </Box>

      {isDesktop && (
        <ResizableRightPanel open={activityDetailOpen} onClose={handleCloseRightPanel}>
          <CopilotContentTransition contentKey={activityDetailOpen ? 'section:activity' : 'empty'}>
            {activityDetailOpen && selectedActivity ? (
              <ActivityDetailsPanel
                activity={selectedActivity}
                onBack={handleCloseActivityDetail}
                onClose={handleCloseActivityDetail}
              />
            ) : null}
          </CopilotContentTransition>
        </ResizableRightPanel>
      )}
    </Box>
  )
}

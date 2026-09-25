import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useGlobalSearch } from '@/app/contexts/GlobalSearchContext'
import { useRightTool } from '@/app/contexts/RightToolContext'
import type { PriorityTaskCard, RecentActivityItem } from '@/app/data/homeMock'
import { resolvePriorityTaskRecord } from '@/app/data/resolvePriorityTask'
import { useRegisterRightToolCopilot } from '@/app/hooks/useRightToolRegistration'
import { layoutTokens } from '@/design-system/tokens/layout'
import { ActivityDetailsPanel } from '@/app/pages/home/ActivityDetailsPanel'
import { HomeGreetingSection } from '@/app/pages/home/HomeGreetingSection'
import { PriorityTasksCarousel } from '@/app/pages/home/PriorityTasksCarousel'
import { PulseModule } from '@/app/pages/home/PulseModule'
import { CopilotContentTransition } from '@/pages/policies/components/copilot/CopilotContentTransition'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import { TaskDetailsPanel } from '@/pages/tasks/components/TaskDetailsPanel'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardPage() {
  const { copilotOpen, copilotView, agenticPrompt, closeCopilot, openHomeCopilotDefault } = useGlobalSearch()
  const { openTool, activeTool } = useRightTool()
  const isDesktop = useIsDesktopLayout()
  const contentPx = `${layoutTokens.contentPaddingX}px`
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null)
  const [taskDetailOpen, setTaskDetailOpen] = useState(false)
  const [copilotTaskFocus, setCopilotTaskFocus] = useState<TaskRecord | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<RecentActivityItem | null>(null)
  const [activityDetailOpen, setActivityDetailOpen] = useState(false)
  const [focusedActivity, setFocusedActivity] = useState<RecentActivityItem | null>(null)
  /** Instant-unmount page panel when opening shell Copilot to avoid side-by-side flash. */
  const [skipDetailExitAnimation, setSkipDetailExitAnimation] = useState(false)

  const detailPanelOpen = taskDetailOpen || activityDetailOpen

  const rightPanelContentKey = taskDetailOpen
    ? 'section:task'
    : activityDetailOpen
      ? 'section:activity'
      : 'empty'

  const didInitCopilot = useRef(false)
  const wasDesktop = useRef(isDesktop)

  // Closing the mobile bottom sheet (or any tool dismiss) must clear rail selection.
  useEffect(() => {
    if (activeTool != null) return
    if (!focusedActivity && !copilotTaskFocus) return
    setFocusedActivity(null)
    setCopilotTaskFocus(null)
  }, [activeTool, focusedActivity, copilotTaskFocus])

  const handleCloseTaskDetail = useCallback(() => {
    setSkipDetailExitAnimation(false)
    setTaskDetailOpen(false)
    setSelectedTask(null)
  }, [])

  const handleCloseActivityDetail = useCallback(() => {
    setSkipDetailExitAnimation(false)
    setActivityDetailOpen(false)
    setSelectedActivity(null)
  }, [])

  const clearCopilotFocus = useCallback(() => {
    setCopilotTaskFocus(null)
    setFocusedActivity(null)
  }, [])

  const dismissDetailForCopilot = useCallback(() => {
    setSkipDetailExitAnimation(true)
    setTaskDetailOpen(false)
    setSelectedTask(null)
    setActivityDetailOpen(false)
    setSelectedActivity(null)
  }, [])

  const handleBackToCopilotSummary = useCallback(() => {
    dismissDetailForCopilot()
    clearCopilotFocus()
    openTool('copilot')
  }, [clearCopilotFocus, dismissDetailForCopilot, openTool])

  const handleOpenPriorityTask = useCallback(
    (card: PriorityTaskCard) => {
      setSkipDetailExitAnimation(false)
      setSelectedTask(resolvePriorityTaskRecord(card))
      clearCopilotFocus()
      closeCopilot()
      handleCloseActivityDetail()
      setTaskDetailOpen(true)
    },
    [clearCopilotFocus, closeCopilot, handleCloseActivityDetail],
  )

  const handleBackToDailySummary = useCallback(() => {
    clearCopilotFocus()
    openHomeCopilotDefault()
  }, [clearCopilotFocus, openHomeCopilotDefault])

  const handleActivityCopilot = useCallback(
    (activity: RecentActivityItem) => {
      // Toggle off → return to daily summary when this was the focused activity.
      if (focusedActivity?.id === activity.id) {
        handleBackToDailySummary()
        return
      }
      handleCloseTaskDetail()
      handleCloseActivityDetail()
      setCopilotTaskFocus(null)
      setFocusedActivity(activity)
      openTool('copilot')
    },
    [
      focusedActivity?.id,
      handleBackToDailySummary,
      handleCloseActivityDetail,
      handleCloseTaskDetail,
      openTool,
    ],
  )

  const handleCloseRightPanel = useCallback(() => {
    if (taskDetailOpen) {
      handleCloseTaskDetail()
      return
    }
    if (activityDetailOpen) {
      handleCloseActivityDetail()
    }
  }, [taskDetailOpen, activityDetailOpen, handleCloseTaskDetail, handleCloseActivityDetail])

  const hasEntityFocus = Boolean(copilotTaskFocus || focusedActivity)

  useRegisterRightToolCopilot(
    {
      context: copilotTaskFocus ? 'tasks' : 'global',
      globalView: hasEntityFocus ? null : copilotView,
      agenticPrompt: hasEntityFocus ? null : agenticPrompt,
      focusedTask: copilotTaskFocus,
      focusedActivity,
      onBackToSummary: focusedActivity ? handleBackToDailySummary : undefined,
      summaryBackLabel: 'Daily summary',
    },
    [
      agenticPrompt,
      copilotTaskFocus,
      copilotView,
      focusedActivity,
      handleBackToDailySummary,
      hasEntityFocus,
    ],
  )

  useEffect(() => {
    if (didInitCopilot.current) return
    didInitCopilot.current = true
    if (agenticPrompt || copilotView === 'agentic-search') return
    if (isDesktop) {
      openHomeCopilotDefault()
    }
  }, [agenticPrompt, copilotView, openHomeCopilotDefault, isDesktop])

  useEffect(() => {
    if (wasDesktop.current && !isDesktop && copilotOpen) {
      closeCopilot()
    }
    wasDesktop.current = isDesktop
  }, [isDesktop, copilotOpen, closeCopilot])

  return (
    <Box
      sx={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        bgcolor: 'background.paper',
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
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            flexShrink: 0,
            px: contentPx,
            pt: layoutTokens.policyHeaderTopPadding,
            pb: 1,
          }}
        >
          <HomeGreetingSection greeting={getGreeting()} />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            px: contentPx,
            pb: contentPx,
            width: '100%',
            bgcolor: 'background.paper',
          }}
        >
          <Stack spacing={0} sx={{ width: '100%', minWidth: 0, maxWidth: '100%' }}>
            <PriorityTasksCarousel onTaskOpen={handleOpenPriorityTask} />
            <Box sx={{ mt: 4, minWidth: 0 }}>
              <PulseModule
                onActivityCopilot={handleActivityCopilot}
                activeCopilotActivityId={
                  activeTool === 'copilot' ? (focusedActivity?.id ?? null) : null
                }
              />
            </Box>
          </Stack>
        </Box>
      </Box>

      <ResizableRightPanel
        open={detailPanelOpen}
        onClose={handleCloseRightPanel}
        skipExitAnimation={skipDetailExitAnimation}
      >
        <CopilotContentTransition fill contentKey={rightPanelContentKey}>
          {taskDetailOpen && selectedTask ? (
            <TaskDetailsPanel
              task={selectedTask}
              onBack={handleBackToCopilotSummary}
              onClose={handleCloseTaskDetail}
              onMarkComplete={handleCloseTaskDetail}
            />
          ) : activityDetailOpen && selectedActivity ? (
            <ActivityDetailsPanel
              activity={selectedActivity}
              onBack={handleBackToCopilotSummary}
              onClose={handleCloseActivityDetail}
            />
          ) : null}
        </CopilotContentTransition>
      </ResizableRightPanel>
    </Box>
  )
}

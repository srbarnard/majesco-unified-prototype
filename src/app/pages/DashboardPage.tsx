import MuiButton from '@mui/material/Button'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { CopilotIcon } from '@/design-system/components'
import { getPanelToggleButtonStyles } from '@/design-system/theme/themeSurfaces'
import { useGlobalSearch } from '@/app/contexts/GlobalSearchContext'
import type { PriorityTaskCard, RecentActivityItem } from '@/app/data/homeMock'
import { resolvePriorityTaskRecord } from '@/app/data/resolvePriorityTask'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { ActivityDetailsPanel } from '@/app/pages/home/ActivityDetailsPanel'
import { RecentActivityFeed } from '@/app/pages/home/RecentActivityFeed'
import { PriorityTasksCarousel } from '@/app/pages/home/PriorityTasksCarousel'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
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

function PanelToggleButton({
  label,
  icon,
  active,
  onClick,
}: {
  label: string
  icon: ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <MuiButton
      size="small"
      variant="text"
      disableRipple
      startIcon={icon}
      onClick={onClick}
      sx={(theme) => ({
        ...getPanelToggleButtonStyles(theme, active),
        fontFamily: figmaFontFamilyStack.body,
        '& .MuiButton-startIcon': {
          marginRight: { xs: 0, sm: 0.75 },
          overflow: 'visible',
          color: 'inherit',
        },
      })}
    >
      {label}
    </MuiButton>
  )
}

export function DashboardPage() {
  const { copilotOpen, copilotView, agenticPrompt, toggleCopilot, closeCopilot, openHomeCopilotDefault } =
    useGlobalSearch()
  const isDesktop = useIsDesktopLayout()
  const contentPx = `${layoutTokens.contentPaddingX}px`
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null)
  const [taskDetailOpen, setTaskDetailOpen] = useState(false)
  const [copilotTaskFocus, setCopilotTaskFocus] = useState<TaskRecord | null>(null)
  const [copilotSeedMessage, setCopilotSeedMessage] = useState<string | null>(null)
  const [returnToTask, setReturnToTask] = useState<TaskRecord | null>(null)
  const [selectedActivity, setSelectedActivity] = useState<RecentActivityItem | null>(null)
  const [activityDetailOpen, setActivityDetailOpen] = useState(false)

  const detailPanelOpen = taskDetailOpen || activityDetailOpen

  const didInitCopilot = useRef(false)
  const wasDesktop = useRef(isDesktop)

  const handleCloseTaskDetail = useCallback(() => {
    setTaskDetailOpen(false)
    setSelectedTask(null)
  }, [])

  const handleCloseActivityDetail = useCallback(() => {
    setActivityDetailOpen(false)
    setSelectedActivity(null)
  }, [])

  const handleOpenPriorityTask = useCallback(
    (card: PriorityTaskCard) => {
      setSelectedTask(resolvePriorityTaskRecord(card))
      setCopilotTaskFocus(null)
      setCopilotSeedMessage(null)
      setReturnToTask(null)
      closeCopilot()
      handleCloseActivityDetail()
      setTaskDetailOpen(true)
    },
    [closeCopilot, handleCloseActivityDetail],
  )

  const handleTaskRecommendation = useCallback(
    (insight: string) => {
      if (!selectedTask) return
      setReturnToTask(selectedTask)
      setCopilotTaskFocus(selectedTask)
      setCopilotSeedMessage(insight)
      setTaskDetailOpen(false)
      openHomeCopilotDefault()
    },
    [openHomeCopilotDefault, selectedTask],
  )

  const handleBackToTaskDetails = useCallback(() => {
    if (!returnToTask) return
    setSelectedTask(returnToTask)
    setTaskDetailOpen(true)
    setCopilotTaskFocus(null)
    setCopilotSeedMessage(null)
    setReturnToTask(null)
    closeCopilot()
  }, [closeCopilot, returnToTask])

  const handleCloseCopilotWithTask = useCallback(() => {
    setCopilotTaskFocus(null)
    setCopilotSeedMessage(null)
    setReturnToTask(null)
    closeCopilot()
  }, [closeCopilot])

  const handleOpenActivity = useCallback(
    (activity: RecentActivityItem) => {
      setSelectedActivity(activity)
      closeCopilot()
      handleCloseTaskDetail()
      setActivityDetailOpen(true)
    },
    [closeCopilot, handleCloseTaskDetail],
  )

  const handleCloseRightPanel = useCallback(() => {
    if (taskDetailOpen) {
      handleCloseTaskDetail()
      return
    }
    if (activityDetailOpen) {
      handleCloseActivityDetail()
      return
    }
    handleCloseCopilotWithTask()
  }, [taskDetailOpen, activityDetailOpen, handleCloseTaskDetail, handleCloseActivityDetail, handleCloseCopilotWithTask])

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
            pb: 1.5,
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
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
              {getGreeting()}, Chris
            </Typography>
            <PanelToggleButton
              label="Copilot"
              icon={<CopilotIcon size={18} active={copilotOpen} />}
              active={copilotOpen}
              onClick={toggleCopilot}
            />
          </Stack>
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            px: contentPx,
            pb: contentPx,
            width: '100%',
          }}
        >
          <Stack spacing={3.5} sx={{ width: '100%' }}>
            <PriorityTasksCarousel onTaskOpen={handleOpenPriorityTask} />
            <RecentActivityFeed
              activeActivityId={selectedActivity?.id}
              onActivitySelect={handleOpenActivity}
            />
          </Stack>
        </Box>
      </Box>

      <ResizableRightPanel
        open={copilotOpen || detailPanelOpen}
        variant={detailPanelOpen ? 'wide' : 'standard'}
        onClose={handleCloseRightPanel}
      >
        {taskDetailOpen && selectedTask && (
          <TaskDetailsPanel
            task={selectedTask}
            onClose={handleCloseTaskDetail}
            onMarkComplete={handleCloseTaskDetail}
            onRecommendationClick={handleTaskRecommendation}
          />
        )}
        {activityDetailOpen && selectedActivity && !taskDetailOpen && (
          <ActivityDetailsPanel activity={selectedActivity} onClose={handleCloseActivityDetail} />
        )}
        {copilotOpen && !detailPanelOpen && (
          <CopilotPanel
            context={copilotTaskFocus ? 'tasks' : 'global'}
            globalView={copilotTaskFocus ? null : copilotView}
            agenticPrompt={copilotTaskFocus ? null : agenticPrompt}
            focusedTask={copilotTaskFocus}
            seedComposerMessage={copilotSeedMessage}
            onBackToTaskDetails={copilotSeedMessage && returnToTask ? handleBackToTaskDetails : undefined}
            onClose={handleCloseCopilotWithTask}
          />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

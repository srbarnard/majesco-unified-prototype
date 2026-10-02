import Box from '@mui/material/Box'
import { useGridApiRef } from '@mui/x-data-grid-premium'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GridRowSelectionModel } from '@mui/x-data-grid-premium'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { useTasksStore } from '@/app/contexts/TasksContext'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolFilter,
} from '@/app/hooks/useRightToolRegistration'
import { layoutTokens } from '@/design-system/tokens/layout'
import { listPageContentOverflowSx } from '@/design-system/tokens/tableLayout'
import { useTasksLookupFromUrl } from '@/hooks/useLookupFromUrl'
import { useSearchQueryFromUrl } from '@/hooks/useSearchQueryFromUrl'
import { resolveTasksLookup } from '@/app/navigation/globalSearchConfig'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import { TaskDetailsPanel } from '@/pages/tasks/components/TaskDetailsPanel'
import { TasksActionBar } from '@/pages/tasks/components/TasksActionBar'
import { TasksAnalyticsTab } from '@/pages/tasks/components/TasksAnalyticsTab'
import { TasksDataGrid } from '@/pages/tasks/components/TasksDataGrid'
import { TasksFilterPanel } from '@/pages/tasks/components/TasksFilterPanel'
import { TasksHeader } from '@/pages/tasks/components/TasksHeader'
import { TeamStructureTab } from '@/pages/tasks/components/TeamStructureTab'
import type { TasksTab } from '@/pages/tasks/components/TasksTabs'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'
import { TASKS_NEXT_STEPS } from '@/pages/tasks/data/tasksNextSteps'
import { applyTasksFilters } from '@/pages/tasks/filters/applyTasksFilters'
import {
  emptyTasksFilters,
  type TasksFilters,
} from '@/pages/tasks/filters/tasksFilterTypes'

const LIST_SECTION_GAP = layoutTokens.listSectionVerticalGap

function matchesSearch(row: TaskRecord, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const fields = [
    row.taskName,
    row.assigner,
    row.refNumber,
    row.assignedTo,
    row.team,
    row.priority,
    row.status,
    row.displayStatus,
    row.relatedEntities.insuredName,
    row.relatedEntities.policyNumber,
    row.relatedEntities.quoteNumber,
  ]
  return fields.some((value) => value && String(value).toLowerCase().includes(normalized))
}

export function TasksPage() {
  const apiRef = useGridApiRef()
  const isDesktop = useIsDesktopLayout()
  const { activeTool, openTool, closeTool } = useRightTool()
  const [activeTab, setActiveTab] = useState<TasksTab>('all')
  const { taskRows, setTaskRows, pendingOpenTaskId, clearPendingOpenTask } = useTasksStore()
  const [copilotTaskFocus, setCopilotTaskFocus] = useState<TaskRecord | null>(null)
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null)
  const [taskDetailOpen, setTaskDetailOpen] = useState(false)
  const [skipTaskExitAnimation, setSkipTaskExitAnimation] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<TasksFilters>(emptyTasksFilters)
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])
  // Arriving with a drawer already open (New task, History → open task) skips the default Chat.
  const didInitCopilot = useRef(activeTool != null || pendingOpenTaskId != null)
  const wasDesktop = useRef(isDesktop)

  useEffect(() => {
    if (!pendingOpenTaskId) return
    const task = taskRows.find((row) => row.id === pendingOpenTaskId)
    clearPendingOpenTask()
    if (!task) return
    didInitCopilot.current = true
    setActiveTab('all')
    setAppliedFilters(emptyTasksFilters)
    setSearchQuery('')
    setCopilotTaskFocus(null)
    setSkipTaskExitAnimation(true)
    setSelectedTask(task)
    setTaskDetailOpen(true)
  }, [clearPendingOpenTask, pendingOpenTaskId, taskRows])

  useSearchQueryFromUrl(useCallback((query) => {
    setSearchQuery(query)
  }, []))

  const handleLookupApplied = useCallback(() => {
    setTaskDetailOpen(false)
    openTool('filter')
    setCopilotTaskFocus(null)
  }, [openTool])

  useTasksLookupFromUrl(setAppliedFilters, handleLookupApplied)

  useEffect(() => {
    // Wait until desktop layout is known, then open once with Tasks summary.
    if (!isDesktop || activeTab !== 'all') return
    if (didInitCopilot.current) return
    didInitCopilot.current = true
    openTool('copilot')
  }, [activeTab, isDesktop, openTool])

  useEffect(() => {
    if (wasDesktop.current && !isDesktop && activeTool === 'copilot') {
      closeTool()
    }
    wasDesktop.current = isDesktop
  }, [activeTool, closeTool, isDesktop])

  useEffect(() => {
    if (
      activeTool === 'filter' ||
      activeTool === 'newTask' ||
      activeTool === 'newCustomer' ||
      activeTool === 'newQuote'
    ) {
      setTaskDetailOpen(false)
    }
  }, [activeTool])

  const filteredRows = useMemo(() => {
    const withFilters = applyTasksFilters(taskRows, appliedFilters)
    return withFilters.filter((row) => matchesSearch(row, searchQuery))
  }, [appliedFilters, searchQuery, taskRows])

  const hasSelection = rowSelectionModel.length > 0

  const handleApplyFilters = useCallback((filters: TasksFilters) => {
    setAppliedFilters(filters)
  }, [])

  const handleCopilotQuickAction = useCallback(
    (action: string) => {
      const nextStep = TASKS_NEXT_STEPS.find((step) => step.label === action)
      if (nextStep) {
        const task = taskRows.find((row) => row.taskName === nextStep.taskName)
        if (!task) return
        setSkipTaskExitAnimation(false)
        setSelectedTask(task)
        setCopilotTaskFocus(null)
        closeTool()
        setTaskDetailOpen(true)
        return
      }
      const normalized = action.trim().toLowerCase()
      const lookupId =
        normalized === 'show high priority'
          ? 'tasks-high-priority'
          : normalized === 'show past due'
            ? 'tasks-overdue'
            : null
      if (!lookupId) return

      const patch = resolveTasksLookup(lookupId)
      if (!patch) return

      setAppliedFilters({ ...emptyTasksFilters, ...patch })
      setSkipTaskExitAnimation(true)
      setTaskDetailOpen(false)
      setSelectedTask(null)
      setCopilotTaskFocus(null)
      openTool('filter')
    },
    [closeTool, openTool, taskRows],
  )

  useRegisterRightToolCopilot(
    {
      context: 'tasks',
      focusedTask: copilotTaskFocus,
      onQuickAction: handleCopilotQuickAction,
      onBackToSummary: copilotTaskFocus
        ? () => {
            setCopilotTaskFocus(null)
          }
        : undefined,
      summaryBackLabel: 'Tasks workspace',
    },
    [copilotTaskFocus, handleCopilotQuickAction],
  )

  const showFilter = activeTab === 'all' || activeTab === 'team'

  useRegisterRightToolFilter(
    showFilter ? (
      <TasksFilterPanel
        appliedFilters={appliedFilters}
        onApply={handleApplyFilters}
        onClose={closeTool}
      />
    ) : null,
    [showFilter, appliedFilters, handleApplyFilters, closeTool],
  )

  const handleBackToCopilotSummary = useCallback(() => {
    setSkipTaskExitAnimation(true)
    setTaskDetailOpen(false)
    setSelectedTask(null)
    setCopilotTaskFocus(null)
    openTool('copilot')
  }, [openTool])

  const handleTaskCopilot = useCallback(
    (task: TaskRecord) => {
      setCopilotTaskFocus(task)
      setSkipTaskExitAnimation(true)
      setTaskDetailOpen(false)
      openTool('copilot')
    },
    [openTool],
  )

  const handleTaskOpen = useCallback(
    (task: TaskRecord) => {
      setSkipTaskExitAnimation(false)
      setSelectedTask(task)
      closeTool()
      setCopilotTaskFocus(null)
      setTaskDetailOpen(true)
    },
    [closeTool],
  )

  const handleCloseTaskDetail = useCallback(() => {
    setSkipTaskExitAnimation(false)
    setTaskDetailOpen(false)
    setSelectedTask(null)
  }, [])

  const handleOpenAddTask = useCallback(() => {
    setCopilotTaskFocus(null)
    setSkipTaskExitAnimation(true)
    setTaskDetailOpen(false)
    setSelectedTask(null)
    openTool('newTask')
  }, [openTool])

  const handleTeamMemberSelect = useCallback(
    (assignees: string[]) => {
      setAppliedFilters({ ...emptyTasksFilters, assignedTo: assignees })
      setSearchQuery('')
      setActiveTab('all')
      setTaskDetailOpen(false)
      setSelectedTask(null)
      setCopilotTaskFocus(null)
      openTool('filter')
    },
    [openTool],
  )

  const handleTaskComplete = useCallback((task: TaskRecord) => {
    void task
  }, [])

  const handleToggleAlert = useCallback((task: TaskRecord) => {
    setTaskRows((current) =>
      current.map((row) => (row.id === task.id ? { ...row, hasAlert: !row.hasAlert } : row)),
    )
  }, [])

  const handleTabChange = useCallback(
    (tab: TasksTab) => {
      setActiveTab(tab)
      if (tab === 'analytics') {
        closeTool()
        setCopilotTaskFocus(null)
        setTaskDetailOpen(false)
        setSelectedTask(null)
      }
    },
    [closeTool],
  )

  const isAllTasksTab = activeTab === 'all'
  const isTeamTab = activeTab === 'team'
  const contentPx = `${layoutTokens.contentPaddingX}px`
  const activeCopilotTaskId =
    activeTool === 'copilot' && copilotTaskFocus ? copilotTaskFocus.id : null

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
        <Box sx={{ flexShrink: 0 }}>
          <TasksHeader
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onAddTask={handleOpenAddTask}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            ...listPageContentOverflowSx(isAllTasksTab || isTeamTab),
            px: contentPx,
            pt: LIST_SECTION_GAP,
            pb: contentPx,
            width: '100%',
            bgcolor: 'background.paper',
          }}
        >
          {isAllTasksTab ? (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 0,
                width: '100%',
                gap: LIST_SECTION_GAP,
              }}
            >
              <Box sx={{ flexShrink: 0 }}>
                <TasksActionBar
                  apiRef={apiRef}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  hasSelection={hasSelection}
                />
              </Box>
              <Box
                sx={{
                  flex: 1,
                  minHeight: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                }}
              >
                <TasksDataGrid
                  apiRef={apiRef}
                  rows={filteredRows}
                  rowSelectionModel={rowSelectionModel}
                  onRowSelectionModelChange={setRowSelectionModel}
                  onTaskOpen={handleTaskOpen}
                  onTaskCopilot={handleTaskCopilot}
                  onTaskComplete={handleTaskComplete}
                  onToggleAlert={handleToggleAlert}
                  activeCopilotTaskId={activeCopilotTaskId}
                  activeTaskId={selectedTask?.id ?? null}
                />
              </Box>
            </Box>
          ) : isTeamTab ? (
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <TeamStructureTab onMemberSelect={handleTeamMemberSelect} />
            </Box>
          ) : (
            <TasksAnalyticsTab />
          )}
        </Box>
      </Box>

      <ResizableRightPanel
        open={taskDetailOpen}
        onClose={handleCloseTaskDetail}
        skipExitAnimation={skipTaskExitAnimation}
      >
        {taskDetailOpen && selectedTask ? (
          <TaskDetailsPanel
            task={selectedTask}
            onBack={handleBackToCopilotSummary}
            onClose={handleCloseTaskDetail}
            onMarkComplete={handleTaskComplete}
          />
        ) : null}
      </ResizableRightPanel>
    </Box>
  )
}

export default TasksPage

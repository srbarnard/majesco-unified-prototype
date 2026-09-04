import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useGridApiRef } from '@mui/x-data-grid-premium'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { GridRowSelectionModel } from '@mui/x-data-grid-premium'
import { useRightTool } from '@/app/contexts/RightToolContext'
import {
  useRegisterRightToolCopilot,
  useRegisterRightToolFilter,
} from '@/app/hooks/useRightToolRegistration'
import { layoutTokens } from '@/design-system/tokens/layout'
import { listPageContentOverflowSx } from '@/design-system/tokens/tableLayout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { useTasksLookupFromUrl } from '@/hooks/useLookupFromUrl'
import { useSearchQueryFromUrl } from '@/hooks/useSearchQueryFromUrl'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
import { TaskDetailsPanel } from '@/pages/tasks/components/TaskDetailsPanel'
import { TasksActionBar } from '@/pages/tasks/components/TasksActionBar'
import { TasksAnalyticsTab } from '@/pages/tasks/components/TasksAnalyticsTab'
import { TasksDataGrid } from '@/pages/tasks/components/TasksDataGrid'
import { TasksFilterPanel } from '@/pages/tasks/components/TasksFilterPanel'
import { TasksHeader } from '@/pages/tasks/components/TasksHeader'
import { TeamStructureTab } from '@/pages/tasks/components/TeamStructureTab'
import type { TasksTab } from '@/pages/tasks/components/TasksTabs'
import { TASKS_TOTAL_ROWS, tasksMock, type TaskRecord } from '@/pages/tasks/data/mockTasks'
import { applyTasksFilters } from '@/pages/tasks/filters/applyTasksFilters'
import {
  emptyTasksFilters,
  hasActiveTasksFilters,
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
  const { activeTool, openTool, closeTool } = useRightTool()
  const [activeTab, setActiveTab] = useState<TasksTab>('all')
  const [copilotTaskFocus, setCopilotTaskFocus] = useState<TaskRecord | null>(null)
  const [copilotSeedMessage, setCopilotSeedMessage] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null)
  const [taskDetailOpen, setTaskDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<TasksFilters>(emptyTasksFilters)
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])

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
    if (activeTool === 'filter') {
      setTaskDetailOpen(false)
    }
  }, [activeTool])

  const filteredRows = useMemo(() => {
    const withFilters = applyTasksFilters(tasksMock, appliedFilters)
    return withFilters.filter((row) => matchesSearch(row, searchQuery))
  }, [appliedFilters, searchQuery])

  const filtersActive = hasActiveTasksFilters(appliedFilters)
  const hasSelection = rowSelectionModel.length > 0

  const handleBackToTaskDetails = useCallback(() => {
    setCopilotSeedMessage(null)
    setCopilotTaskFocus(null)
    closeTool()
    setTaskDetailOpen(true)
  }, [closeTool])

  useRegisterRightToolCopilot(
    {
      context: 'tasks',
      focusedTask: copilotTaskFocus,
      seedComposerMessage: copilotSeedMessage,
      onBackToTaskDetails: copilotSeedMessage ? handleBackToTaskDetails : undefined,
      onBackToSummary:
        copilotTaskFocus && !copilotSeedMessage
          ? () => {
              setCopilotTaskFocus(null)
              setCopilotSeedMessage(null)
            }
          : undefined,
      summaryBackLabel: 'Tasks workspace',
    },
    [copilotSeedMessage, copilotTaskFocus, handleBackToTaskDetails],
  )

  const handleApplyFilters = useCallback((filters: TasksFilters) => {
    setAppliedFilters(filters)
  }, [])

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
    setTaskDetailOpen(false)
    setSelectedTask(null)
    setCopilotTaskFocus(null)
    setCopilotSeedMessage(null)
    openTool('copilot')
  }, [openTool])

  const handleTaskCopilot = useCallback(
    (task: TaskRecord) => {
      setCopilotTaskFocus(task)
      setCopilotSeedMessage(null)
      setTaskDetailOpen(false)
      openTool('copilot')
    },
    [openTool],
  )

  const handleTaskRecommendation = useCallback(
    (task: TaskRecord, insight: string) => {
      setSelectedTask(task)
      setCopilotTaskFocus(task)
      setCopilotSeedMessage(insight)
      setTaskDetailOpen(false)
      openTool('copilot')
    },
    [openTool],
  )

  const handleTaskOpen = useCallback(
    (task: TaskRecord) => {
      setSelectedTask(task)
      closeTool()
      setCopilotTaskFocus(null)
      setTaskDetailOpen(true)
    },
    [closeTool],
  )

  const handleCloseTaskDetail = useCallback(() => {
    setTaskDetailOpen(false)
    setSelectedTask(null)
  }, [])

  const handleTaskComplete = useCallback((task: TaskRecord) => {
    void task
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
          <TasksHeader activeTab={activeTab} onTabChange={handleTabChange} />
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
                  activeCopilotTaskId={activeCopilotTaskId}
                  activeTaskId={selectedTask?.id ?? null}
                />
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontFamily: figmaFontFamilyStack.body, textAlign: 'right', flexShrink: 0 }}
              >
                Total Rows: {filtersActive || searchQuery.trim() ? filteredRows.length : TASKS_TOTAL_ROWS}
              </Typography>
            </Box>
          ) : isTeamTab ? (
            <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
              <TeamStructureTab />
            </Box>
          ) : (
            <TasksAnalyticsTab />
          )}
        </Box>
      </Box>

      <ResizableRightPanel open={taskDetailOpen} onClose={handleCloseTaskDetail}>
        {taskDetailOpen && selectedTask ? (
          <TaskDetailsPanel
            task={selectedTask}
            onBack={handleBackToCopilotSummary}
            onClose={handleCloseTaskDetail}
            onMarkComplete={handleTaskComplete}
            onRecommendationClick={(insight) => handleTaskRecommendation(selectedTask, insight)}
          />
        ) : null}
      </ResizableRightPanel>
    </Box>
  )
}

export default TasksPage

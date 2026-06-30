import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useGridApiRef } from '@mui/x-data-grid-premium'
import { useCallback, useMemo, useState } from 'react'
import type { GridRowSelectionModel } from '@mui/x-data-grid-premium'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { useTasksLookupFromUrl } from '@/hooks/useLookupFromUrl'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
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
  const [activeTab, setActiveTab] = useState<TasksTab>('all')
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [copilotTaskFocus, setCopilotTaskFocus] = useState<TaskRecord | null>(null)
  const [selectedTask, setSelectedTask] = useState<TaskRecord | null>(null)
  const [taskDetailOpen, setTaskDetailOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<TasksFilters>(emptyTasksFilters)

  useTasksLookupFromUrl(setAppliedFilters, useCallback(() => {
    setFilterOpen(true)
    setCopilotOpen(false)
    setCopilotTaskFocus(null)
  }, []))
  const [rowSelectionModel, setRowSelectionModel] = useState<GridRowSelectionModel>([])

  const filteredRows = useMemo(() => {
    const withFilters = applyTasksFilters(tasksMock, appliedFilters)
    return withFilters.filter((row) => matchesSearch(row, searchQuery))
  }, [appliedFilters, searchQuery])

  const filtersActive = hasActiveTasksFilters(appliedFilters)
  const hasSelection = rowSelectionModel.length > 0

  const handleToggleFilter = useCallback(() => {
    setFilterOpen((current) => {
      if (!current) {
        setCopilotOpen(false)
        setCopilotTaskFocus(null)
        setTaskDetailOpen(false)
      }
      return !current
    })
  }, [])

  const handleCloseFilter = useCallback(() => {
    setFilterOpen(false)
  }, [])

  const handleApplyFilters = useCallback((filters: TasksFilters) => {
    setAppliedFilters(filters)
  }, [])

  const handleToggleCopilot = useCallback(() => {
    setCopilotOpen((current) => {
      if (current) {
        setCopilotTaskFocus(null)
        return false
      }
      setFilterOpen(false)
      setTaskDetailOpen(false)
      return true
    })
  }, [])

  const handleCloseCopilot = useCallback(() => {
    setCopilotOpen(false)
    setCopilotTaskFocus(null)
  }, [])

  const handleTaskCopilot = useCallback((task: TaskRecord) => {
    setCopilotTaskFocus(task)
    setFilterOpen(false)
    setTaskDetailOpen(false)
    setCopilotOpen(true)
  }, [])

  const handleTaskOpen = useCallback((task: TaskRecord) => {
    setSelectedTask(task)
    setFilterOpen(false)
    setCopilotOpen(false)
    setCopilotTaskFocus(null)
    setTaskDetailOpen(true)
  }, [])

  const handleCloseTaskDetail = useCallback(() => {
    setTaskDetailOpen(false)
    setSelectedTask(null)
  }, [])

  const handleTaskComplete = useCallback((task: TaskRecord) => {
    void task
  }, [])

  const handleTabChange = useCallback((tab: TasksTab) => {
    setActiveTab(tab)
    if (tab === 'analytics') {
      setCopilotOpen(false)
      setFilterOpen(false)
      setCopilotTaskFocus(null)
      setTaskDetailOpen(false)
      setSelectedTask(null)
    }
  }, [])

  const handleCloseMobileRightPanel = useCallback(() => {
    if (taskDetailOpen) {
      handleCloseTaskDetail()
      return
    }
    if (filterOpen) {
      handleCloseFilter()
      return
    }
    handleCloseCopilot()
  }, [taskDetailOpen, filterOpen, handleCloseTaskDetail, handleCloseFilter, handleCloseCopilot])

  const isAllTasksTab = activeTab === 'all'
  const isTeamTab = activeTab === 'team'
  const contentPx = `${layoutTokens.contentPaddingX}px`

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
            filterOpen={filterOpen}
            onToggleFilter={handleToggleFilter}
            copilotOpen={copilotOpen}
            onToggleCopilot={handleToggleCopilot}
          />
        </Box>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: isAllTasksTab || isTeamTab ? 'hidden' : 'auto',
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
                  activeCopilotTaskId={copilotTaskFocus?.id ?? null}
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

      <ResizableRightPanel
        open={filterOpen || copilotOpen || taskDetailOpen}
        variant={taskDetailOpen ? 'wide' : 'standard'}
        onClose={handleCloseMobileRightPanel}
      >
        {filterOpen && (
          <TasksFilterPanel
            appliedFilters={appliedFilters}
            onApply={handleApplyFilters}
            onClose={handleCloseFilter}
          />
        )}
        {taskDetailOpen && selectedTask && (
          <TaskDetailsPanel
            task={selectedTask}
            onClose={handleCloseTaskDetail}
            onMarkComplete={handleTaskComplete}
            onAskCopilot={handleTaskCopilot}
          />
        )}
        {copilotOpen && (
          <CopilotPanel
            context="tasks"
            focusedTask={copilotTaskFocus}
            onClose={handleCloseCopilot}
          />
        )}
      </ResizableRightPanel>
    </Box>
  )
}

export default TasksPage

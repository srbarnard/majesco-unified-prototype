import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { useCallback, useMemo, useState } from 'react'
import type { GridRowSelectionModel } from '@mui/x-data-grid-premium'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { CopilotPanel } from '@/pages/policies/components/CopilotPanel'
import { ResizableRightPanel } from '@/pages/policies/components/ResizableRightPanel'
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

const GUTTER = layoutTokens.contentPaddingX / 8

function matchesSearch(row: TaskRecord, query: string) {
  const normalized = query.trim().toLowerCase()
  if (!normalized) return true

  const fields = [row.taskName, row.assigner, row.refNumber, row.assignedTo, row.priority, row.status]
  return fields.some((value) => value.toLowerCase().includes(normalized))
}

export function TasksPage() {
  const [activeTab, setActiveTab] = useState<TasksTab>('all')
  const [copilotOpen, setCopilotOpen] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [copilotTaskFocus, setCopilotTaskFocus] = useState<TaskRecord | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [appliedFilters, setAppliedFilters] = useState<TasksFilters>(emptyTasksFilters)
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
    setCopilotOpen(true)
  }, [])

  const handleTabChange = useCallback((tab: TasksTab) => {
    setActiveTab(tab)
    if (tab === 'analytics') {
      setCopilotOpen(false)
      setFilterOpen(false)
      setCopilotTaskFocus(null)
    }
  }, [])

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
            pt: 1,
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
                gap: GUTTER,
              }}
            >
              <Box sx={{ flexShrink: 0 }}>
                <TasksActionBar
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
                  rows={filteredRows}
                  rowSelectionModel={rowSelectionModel}
                  onRowSelectionModelChange={setRowSelectionModel}
                  onTaskCopilot={handleTaskCopilot}
                  activeCopilotTaskId={copilotTaskFocus?.id ?? null}
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

      <ResizableRightPanel open={filterOpen || copilotOpen}>
        {filterOpen && (
          <TasksFilterPanel
            appliedFilters={appliedFilters}
            onApply={handleApplyFilters}
            onClose={handleCloseFilter}
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

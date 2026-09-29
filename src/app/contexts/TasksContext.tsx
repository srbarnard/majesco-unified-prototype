import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type {
  AddTaskHistoryEntry,
  AddTaskSavedState,
} from '@/pages/tasks/components/AddTaskPanel'
import { tasksMock, type TaskRecord } from '@/pages/tasks/data/mockTasks'

type TasksContextValue = {
  taskRows: TaskRecord[]
  setTaskRows: (update: (current: TaskRecord[]) => TaskRecord[]) => void
  createdTaskHistory: AddTaskHistoryEntry[]
  savedAddTask: AddTaskSavedState | null
  setSavedAddTask: (state: AddTaskSavedState | null) => void
  createTask: (task: TaskRecord) => void
  /** Task the Tasks page should open in its detail drawer on next render. */
  pendingOpenTaskId: string | null
  requestOpenTask: (taskId: string) => void
  clearPendingOpenTask: () => void
}

const TasksContext = createContext<TasksContextValue | null>(null)

export function TasksProvider({ children }: { children: ReactNode }) {
  const [taskRows, setTaskRowsState] = useState<TaskRecord[]>(() => tasksMock)
  const [createdTaskHistory, setCreatedTaskHistory] = useState<AddTaskHistoryEntry[]>([])
  const [savedAddTask, setSavedAddTask] = useState<AddTaskSavedState | null>(null)
  const [pendingOpenTaskId, setPendingOpenTaskId] = useState<string | null>(null)

  const setTaskRows = useCallback((update: (current: TaskRecord[]) => TaskRecord[]) => {
    setTaskRowsState(update)
  }, [])

  const createTask = useCallback((task: TaskRecord) => {
    setTaskRowsState((current) => [task, ...current])
    setCreatedTaskHistory((current) => [{ task, createdAt: new Date() }, ...current])
    setSavedAddTask(null)
  }, [])

  const requestOpenTask = useCallback((taskId: string) => setPendingOpenTaskId(taskId), [])
  const clearPendingOpenTask = useCallback(() => setPendingOpenTaskId(null), [])

  const value = useMemo(
    () => ({
      taskRows,
      setTaskRows,
      createdTaskHistory,
      savedAddTask,
      setSavedAddTask,
      createTask,
      pendingOpenTaskId,
      requestOpenTask,
      clearPendingOpenTask,
    }),
    [
      taskRows,
      setTaskRows,
      createdTaskHistory,
      savedAddTask,
      createTask,
      pendingOpenTaskId,
      requestOpenTask,
      clearPendingOpenTask,
    ],
  )

  return <TasksContext.Provider value={value}>{children}</TasksContext.Provider>
}

export function useTasksStore(): TasksContextValue {
  const context = useContext(TasksContext)
  if (!context) {
    throw new Error('useTasksStore must be used within TasksProvider')
  }
  return context
}

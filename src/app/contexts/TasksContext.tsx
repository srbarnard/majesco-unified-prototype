import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { useRightToolDispatch } from '@/app/contexts/RightToolContext'
import type {
  AddTaskHistoryEntry,
  AddTaskSavedState,
} from '@/pages/tasks/components/AddTaskPanel'
import type { AddTaskRelated } from '@/pages/tasks/data/addTaskDraft'
import { tasksMock, type TaskRecord } from '@/pages/tasks/data/mockTasks'

/** A row-menu "Add task" click: opens the New task drawer with Related prefilled. */
export type NewTaskRequest = {
  key: number
  related: AddTaskRelated
}

type TasksContextValue = {
  taskRows: TaskRecord[]
  setTaskRows: (update: (current: TaskRecord[]) => TaskRecord[]) => void
  createdTaskHistory: AddTaskHistoryEntry[]
  savedAddTask: AddTaskSavedState | null
  setSavedAddTask: (state: AddTaskSavedState | null) => void
  /** Reopen New task on the saved draft (e.g. after Email blocker), ignoring any grid prefill. */
  resumeAddTask: () => void
  resumeAddTaskPending: boolean
  clearResumeAddTask: () => void
  createTask: (task: TaskRecord) => void
  /** Task the Tasks page should open in its detail drawer on next render. */
  pendingOpenTaskId: string | null
  requestOpenTask: (taskId: string) => void
  clearPendingOpenTask: () => void
  newTaskRequest: NewTaskRequest | null
  openNewTask: (related: AddTaskRelated) => void
  clearNewTaskRequest: () => void
  /** The single row selected (or Chat-focused) on the current grid; prefills the rail's New task. */
  selectedRecord: AddTaskRelated | null
  setSelectedRecord: (record: AddTaskRelated | null) => void
}

const TasksContext = createContext<TasksContextValue | null>(null)

function relatedKey(record: AddTaskRelated | null) {
  return record ? `${record.kind}:${record.ref}` : ''
}

export function TasksProvider({ children }: { children: ReactNode }) {
  const { openTool } = useRightToolDispatch()
  const [taskRows, setTaskRowsState] = useState<TaskRecord[]>(() => tasksMock)
  const [createdTaskHistory, setCreatedTaskHistory] = useState<AddTaskHistoryEntry[]>([])
  const [savedAddTask, setSavedAddTask] = useState<AddTaskSavedState | null>(null)
  const [pendingOpenTaskId, setPendingOpenTaskId] = useState<string | null>(null)
  const [newTaskRequest, setNewTaskRequest] = useState<NewTaskRequest | null>(null)
  const [selectedRecord, setSelectedRecordState] = useState<AddTaskRelated | null>(null)

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

  const openNewTask = useCallback(
    (related: AddTaskRelated) => {
      setNewTaskRequest((current) => ({ key: (current?.key ?? 0) + 1, related }))
      openTool('newTask')
    },
    [openTool],
  )
  const clearNewTaskRequest = useCallback(() => setNewTaskRequest(null), [])

  const [resumeAddTaskPending, setResumeAddTaskPending] = useState(false)
  const resumeAddTask = useCallback(() => {
    setResumeAddTaskPending(true)
    openTool('newTask')
  }, [openTool])
  const clearResumeAddTask = useCallback(() => setResumeAddTaskPending(false), [])

  const setSelectedRecord = useCallback((record: AddTaskRelated | null) => {
    setSelectedRecordState((current) => (relatedKey(current) === relatedKey(record) ? current : record))
  }, [])

  const value = useMemo(
    () => ({
      taskRows,
      setTaskRows,
      createdTaskHistory,
      savedAddTask,
      setSavedAddTask,
      resumeAddTask,
      resumeAddTaskPending,
      clearResumeAddTask,
      createTask,
      pendingOpenTaskId,
      requestOpenTask,
      clearPendingOpenTask,
      newTaskRequest,
      openNewTask,
      clearNewTaskRequest,
      selectedRecord,
      setSelectedRecord,
    }),
    [
      taskRows,
      setTaskRows,
      createdTaskHistory,
      savedAddTask,
      resumeAddTask,
      resumeAddTaskPending,
      clearResumeAddTask,
      createTask,
      pendingOpenTaskId,
      requestOpenTask,
      clearPendingOpenTask,
      newTaskRequest,
      openNewTask,
      clearNewTaskRequest,
      selectedRecord,
      setSelectedRecord,
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

/** Grids report their selected row so the rail's New task opens with Related prefilled. */
export function useNewTaskSelection(record: AddTaskRelated | null) {
  const { setSelectedRecord } = useTasksStore()
  const key = relatedKey(record)
  const recordRef = useRef(record)
  recordRef.current = record

  useEffect(() => {
    setSelectedRecord(recordRef.current)
  }, [key, setSelectedRecord])

  useEffect(() => () => setSelectedRecord(null), [setSelectedRecord])
}

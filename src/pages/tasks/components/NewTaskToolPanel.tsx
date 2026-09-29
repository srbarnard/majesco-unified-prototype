import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { useTasksStore } from '@/app/contexts/TasksContext'
import { AddTaskPanel } from '@/pages/tasks/components/AddTaskPanel'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'

/** Global New task drawer — opens over whatever page is active. */
export function NewTaskToolPanel() {
  const { closeTool } = useRightTool()
  const { createdTaskHistory, savedAddTask, setSavedAddTask, createTask, requestOpenTask } =
    useTasksStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [session, setSession] = useState<{ key: number; tab: 'new' | 'history' }>({
    key: 0,
    tab: 'new',
  })
  const onTasksPage = location.pathname === '/tasks'

  const openTask = (taskId: string) => {
    requestOpenTask(taskId)
    closeTool()
    if (!onTasksPage) navigate('/tasks')
  }

  const handleCreate = (task: TaskRecord) => {
    createTask(task)
    if (onTasksPage) {
      openTask(task.id)
      return
    }
    // Stay on the current page; History confirms the task was created.
    setSession((current) => ({ key: current.key + 1, tab: 'history' }))
  }

  return (
    <AddTaskPanel
      key={session.key}
      initialState={savedAddTask}
      initialTab={session.tab}
      history={createdTaskHistory}
      onClose={closeTool}
      onSaveDraft={(state) => {
        setSavedAddTask(state)
        closeTool()
      }}
      onCreate={handleCreate}
      onOpenTask={openTask}
    />
  )
}

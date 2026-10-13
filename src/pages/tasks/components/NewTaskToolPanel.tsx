import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import { useRightTool } from '@/app/contexts/RightToolContext'
import { useTasksStore } from '@/app/contexts/TasksContext'
import { AddTaskPanel, type AddTaskBlockerEmail, type AddTaskSavedState } from '@/pages/tasks/components/AddTaskPanel'
import { draftDocument } from '@/pages/shared/data/draftDocuments'
import { suggestedRecipients } from '@/pages/shared/data/emailRecipients'
import { relatedLabel, resolveTaskPageContext, type AddTaskRelated } from '@/pages/tasks/data/addTaskDraft'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'

/** Global New task drawer — opens over whatever page is active. */
export function NewTaskToolPanel() {
  const { closeTool, openTool, setEmailAttachMode } = useRightTool()
  const {
    createdTaskHistory,
    savedAddTask,
    setSavedAddTask,
    resumeAddTask,
    resumeAddTaskPending,
    clearResumeAddTask,
    createTask,
    requestOpenTask,
    newTaskRequest,
    clearNewTaskRequest,
    selectedRecord,
  } = useTasksStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [session, setSession] = useState<{ key: number; tab: 'new' | 'history' }>({
    key: 0,
    tab: 'new',
  })
  // Captured when the drawer opens; a later row-menu click replaces it and restarts the draft.
  const [prefill, setPrefill] = useState<AddTaskRelated | null>(() =>
    resumeAddTaskPending ? null : (newTaskRequest?.related ?? selectedRecord),
  )
  const onTasksPage = location.pathname === '/tasks'
  const pageContext = useMemo(() => resolveTaskPageContext(location.pathname), [location.pathname])

  useEffect(() => {
    if (resumeAddTaskPending) clearResumeAddTask()
  }, [clearResumeAddTask, resumeAddTaskPending])

  useEffect(() => {
    if (!newTaskRequest) return
    setPrefill(newTaskRequest.related)
    setSession((current) => ({ key: current.key + 1, tab: 'new' }))
    clearNewTaskRequest()
  }, [clearNewTaskRequest, newTaskRequest])

  const openTask = (taskId: string) => {
    requestOpenTask(taskId)
    closeTool()
    if (!onTasksPage) navigate('/tasks')
  }

  const handleCreate = (task: TaskRecord) => {
    createTask(task)
    setPrefill(null)
    if (onTasksPage) {
      openTask(task.id)
      return
    }
    // Stay on the current page; History confirms the task was created.
    setSession((current) => ({ key: current.key + 1, tab: 'history' }))
  }

  const handleEmailBlocker = ({ subject, body, related }: AddTaskBlockerEmail, state: AddTaskSavedState) => {
    setSavedAddTask(state)
    setEmailAttachMode({
      target: 'email',
      documents: [],
      draft: {
        subject,
        body,
        title: 'Email blocker',
        subtitle: related ? `Related · ${relatedLabel(related)}` : undefined,
      },
      recipients: suggestedRecipients(related?.names[0]),
      returnTo: { label: 'Back to task', onReturn: resumeAddTask },
      onCancel: resumeAddTask,
      onSave: (sent) => {
        setSavedAddTask({
          ...state,
          draft: { ...state.draft, blockerEmail: { to: sent?.to.trim() ?? '', sentAt: new Date() } },
        })
      },
    })
    openTool('email')
  }

  return (
    <AddTaskPanel
      key={session.key}
      initialState={prefill ? null : savedAddTask}
      initialRelated={prefill}
      initialTab={session.tab}
      history={createdTaskHistory}
      onClose={closeTool}
      onSaveDraft={(state) => {
        setSavedAddTask(state)
        closeTool()
      }}
      onCreate={handleCreate}
      onOpenTask={openTask}
      pageContext={pageContext}
      onEmailBlocker={handleEmailBlocker}
      onOpenDocument={(file, state) => {
        setSavedAddTask(state)
        const document = draftDocument(`task-${file.id}`, file.name, {
          kind: 'Task',
          label: 'New task',
          recordTitle: state.draft.title || 'New task',
          recordSubtitle: state.draft.related ? relatedLabel(state.draft.related) : undefined,
          path: `${location.pathname}${location.search}`,
          reopen: resumeAddTask,
        })
        navigate(`/documents/${document.id}`)
      }}
    />
  )
}

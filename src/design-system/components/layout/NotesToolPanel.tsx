import { useRightTool } from '@/app/contexts/RightToolContext'
import { NotesWorkspacePanel } from '@/pages/notes/components/NotesWorkspacePanel'

/** Notes tool — same conversational panel everywhere (Home, policy, document viewer). */
export function NotesToolPanel() {
  const { recordContext, noteAttachMode, closeTool } = useRightTool()
  const seedDocuments =
    noteAttachMode?.target === 'note'
      ? noteAttachMode.documents.map((doc) => ({
          id: doc.id,
          fileName: doc.fileName,
        }))
      : []

  return (
    <NotesWorkspacePanel
      contextTitle={recordContext?.title}
      contextSubtitle={recordContext?.subtitle}
      seedDocuments={seedDocuments}
      onClose={closeTool}
    />
  )
}

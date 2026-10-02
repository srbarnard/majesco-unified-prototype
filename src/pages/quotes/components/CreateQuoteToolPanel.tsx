import { useRightTool } from '@/app/contexts/RightToolContext'
import { CreateQuotePanel, type CreateQuoteSavedState } from '@/pages/quotes/components/CreateQuotePanel'

// Survives the drawer unmounting between opens; cleared only by a new Save draft.
let savedQuoteDraft: CreateQuoteSavedState | null = null

/** Global Create quote drawer — opens from the rail, the Quotes header, or Create new → Quote. */
export function CreateQuoteToolPanel() {
  const { closeTool } = useRightTool()
  return (
    <CreateQuotePanel
      initialState={savedQuoteDraft}
      onClose={closeTool}
      onSaveDraft={(state) => {
        savedQuoteDraft = state
        closeTool()
      }}
    />
  )
}

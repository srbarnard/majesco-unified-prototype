import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useEffect, useState, type ReactNode } from 'react'
import { layoutTokens } from '@/design-system/tokens/layout'
import { CopilotComposer } from '@/pages/policies/components/CopilotComposer'
import { CopilotAgentsView } from '@/pages/policies/components/copilot/CopilotAgentsView'
import { CopilotConversationView } from '@/pages/policies/components/copilot/CopilotConversationView'
import { CopilotDrawerToolbar } from '@/pages/policies/components/copilot/CopilotDrawerToolbar'
import { CopilotHistoryView } from '@/pages/policies/components/copilot/CopilotHistoryView'
import { CopilotPromptsView } from '@/pages/policies/components/copilot/CopilotPromptsView'
import type { CopilotHistoryEntry } from '@/pages/policies/components/copilot/copilotDrawerData'
import { copilotDrawerHeadingSx, copilotDrawerTabsSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'

type CopilotDrawerShellProps = {
  onClose?: () => void
  composerPlaceholder?: string
  seedComposerMessage?: string | null
  hideComposer?: boolean
  /** When this value changes, the drawer returns to the default chat view. */
  chatFocusKey?: string | null
  /** Rendered inside scrollable chat content when on the default chat view. */
  banner?: ReactNode
  /** Optional slot beside the Copilot title in the drawer header. */
  headerTrailing?: ReactNode
  /** Optional leading slot in the prompts/agents toolbar row above chat content. */
  toolbarLeading?: ReactNode
  /** When false, hides the global prompts/agents toolbar above chat content. */
  showToolbar?: boolean
  onComposerSubmit?: (message: string) => void
  children: ReactNode
}

export function CopilotDrawerShell({
  onClose,
  composerPlaceholder = 'Select a prompt or ask me anything',
  seedComposerMessage = null,
  hideComposer = false,
  chatFocusKey = null,
  banner,
  headerTrailing,
  toolbarLeading,
  showToolbar = true,
  onComposerSubmit,
  children,
}: CopilotDrawerShellProps) {
  const [copilotTab, setCopilotTab] = useState<'chat' | 'history'>('chat')
  const [drawerView, setDrawerView] = useState<'prompts' | 'agents' | null>(null)
  const [activeConversation, setActiveConversation] = useState<CopilotHistoryEntry | null>(null)
  const [composerMessage, setComposerMessage] = useState('')

  useEffect(() => {
    if (seedComposerMessage) {
      setComposerMessage(seedComposerMessage)
    }
  }, [seedComposerMessage])

  useEffect(() => {
    if (chatFocusKey != null) {
      setCopilotTab('chat')
      setDrawerView(null)
      setActiveConversation(null)
    }
  }, [chatFocusKey])

  const handleTabChange = (_: unknown, value: 'chat' | 'history') => {
    setCopilotTab(value)
    setDrawerView(null)
    if (value === 'history') {
      setActiveConversation(null)
    }
  }

  const handleSelectHistoryEntry = (entry: CopilotHistoryEntry) => {
    setActiveConversation(entry)
    setDrawerView(null)
    setCopilotTab('chat')
  }

  const handlePromptSelected = (message: string) => {
    setComposerMessage(message)
    setDrawerView(null)
    setCopilotTab('chat')
  }

  const isDefaultChat = copilotTab === 'chat' && !drawerView && !activeConversation
  const showComposer = !hideComposer && !drawerView && copilotTab !== 'history'

  return (
    <Box
      sx={{
        height: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          px: 2,
          pt: layoutTokens.policyHeaderTopPadding,
          pb: 0,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" component="h2" sx={copilotDrawerHeadingSx}>
              Copilot
            </Typography>
            {headerTrailing}
          </Stack>
          {onClose && (
            <IconButton size="small" onClick={onClose} aria-label="Close Copilot">
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>

        <Tabs value={copilotTab} onChange={handleTabChange} sx={copilotDrawerTabsSx}>
          <Tab label="Chat" value="chat" />
          <Tab label="History" value="history" />
        </Tabs>
      </Box>

      <Box sx={{ px: 2, py: 2, flexGrow: 1, overflowY: 'auto', minHeight: 0 }}>
        {copilotTab === 'history' ? (
          <CopilotHistoryView onSelectEntry={handleSelectHistoryEntry} />
        ) : drawerView === 'prompts' ? (
          <CopilotPromptsView
            onBack={() => setDrawerView(null)}
            onSelectPrompt={(prompt) => handlePromptSelected(prompt.title)}
          />
        ) : drawerView === 'agents' ? (
          <CopilotAgentsView
            onBack={() => setDrawerView(null)}
            onSelectAgent={(agent) => handlePromptSelected(`Run ${agent.title}`)}
          />
        ) : activeConversation ? (
          <CopilotConversationView
            entry={activeConversation}
            onBack={() => {
              setActiveConversation(null)
              setCopilotTab('history')
            }}
          />
        ) : (
          <>
            {isDefaultChat && banner}
            {showToolbar && (
              <CopilotDrawerToolbar
                leading={toolbarLeading}
                onOpenPrompts={() => setDrawerView('prompts')}
                onOpenAgents={() => setDrawerView('agents')}
              />
            )}
            {children}
          </>
        )}
      </Box>

      {showComposer && (
        <CopilotComposer
          placeholder={activeConversation ? 'Continue the conversation…' : composerPlaceholder}
          value={composerMessage}
          onChange={setComposerMessage}
          onSubmit={onComposerSubmit}
        />
      )}
    </Box>
  )
}

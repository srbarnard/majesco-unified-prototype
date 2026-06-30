import Box from '@mui/material/Box'
import { useCallback, useEffect, useState } from 'react'
import { AgentsTab } from '@/pages/copilot-studio/components/AgentsTab'
import { ChatTab } from '@/pages/copilot-studio/components/ChatTab'
import { InsightsTab } from '@/pages/copilot-studio/components/InsightsTab'
import { PromptsTab } from '@/pages/copilot-studio/components/PromptsTab'
import { StudioChatDrawer } from '@/pages/copilot-studio/components/StudioChatDrawer'
import { StudioHeader } from '@/pages/copilot-studio/components/StudioHeader'
import type { StudioAgent, StudioChatMessage, StudioChatThread, StudioPrompt, StudioTab } from '@/pages/copilot-studio/data/mockCopilotStudio'
import { resolveStudioChatResponse } from '@/pages/copilot-studio/data/resolveStudioChatResponse'
import { useIsDesktopLayout } from '@/pages/policies/hooks/useIsDesktopLayout'
import { layoutTokens } from '@/design-system/tokens/layout'

const LIST_SECTION_GAP = layoutTokens.listSectionVerticalGap

export function CopilotStudioPage() {
  const isDesktop = useIsDesktopLayout()
  const contentPx = `${layoutTokens.contentPaddingX}px`
  const [activeTab, setActiveTab] = useState<StudioTab>('chat')
  const [chatDrawerOpen, setChatDrawerOpen] = useState(true)
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null)
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null)
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<StudioChatMessage[]>([])

  const isChatTab = activeTab === 'chat'
  const isExploreTab = activeTab === 'prompts' || activeTab === 'agents'
  const isFullBleedTab = isChatTab || isExploreTab || activeTab === 'insights'

  useEffect(() => {
    if (!isDesktop) {
      setChatDrawerOpen(false)
    }
  }, [isDesktop])

  const handleToggleChatDrawer = useCallback(() => {
    setChatDrawerOpen((current) => !current)
  }, [])

  const handleCloseChatDrawer = useCallback(() => {
    setChatDrawerOpen(false)
  }, [])

  const handleTabChange = useCallback((tab: StudioTab) => {
    setActiveTab(tab)
  }, [])

  const handleAgentSelect = useCallback((agent: StudioAgent) => {
    setSelectedAgentId((current) => (current === agent.id ? null : agent.id))
  }, [])

  const handlePromptSelect = useCallback((prompt: StudioPrompt) => {
    setSelectedPromptId((current) => (current === prompt.id ? null : prompt.id))
  }, [])

  const handleSendMessage = useCallback((text: string) => {
    const userMessage: StudioChatMessage = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: text,
    }
    const response = resolveStudioChatResponse(text)
    const assistantMessage: StudioChatMessage = {
      id: `msg-assistant-${Date.now()}`,
      role: 'assistant',
      content: response.content,
      elapsedSeconds: response.elapsedSeconds,
    }
    setActiveThreadId(null)
    setChatMessages((current) => [...current, userMessage, assistantMessage])
  }, [])

  const handleThreadSelect = useCallback((thread: StudioChatThread) => {
    setActiveThreadId(thread.id)
    setChatMessages(thread.messages ?? [])
    setActiveTab('chat')
  }, [])

  const handleNewChat = useCallback(() => {
    setActiveThreadId(null)
    setChatMessages([])
    setActiveTab('chat')
  }, [])

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
      <StudioChatDrawer
        open={chatDrawerOpen}
        onClose={handleCloseChatDrawer}
        activeThreadId={activeThreadId}
        onThreadSelect={handleThreadSelect}
        onNewChat={handleNewChat}
      />

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
        <StudioHeader
          activeTab={activeTab}
          onTabChange={handleTabChange}
          chatDrawerOpen={chatDrawerOpen}
          onToggleChatDrawer={handleToggleChatDrawer}
        />

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: isFullBleedTab ? 'hidden' : 'auto',
            px: isFullBleedTab ? 0 : contentPx,
            pt: isFullBleedTab ? 0 : LIST_SECTION_GAP,
            pb: isFullBleedTab ? 0 : contentPx,
            width: '100%',
          }}
        >
          {isChatTab && <ChatTab messages={chatMessages} onSend={handleSendMessage} />}
          {activeTab === 'prompts' && (
            <PromptsTab selectedPromptId={selectedPromptId} onPromptSelect={handlePromptSelect} />
          )}
          {activeTab === 'agents' && (
            <AgentsTab selectedAgentId={selectedAgentId} onAgentSelect={handleAgentSelect} />
          )}
          {activeTab === 'insights' && <InsightsTab />}
        </Box>
      </Box>
    </Box>
  )
}

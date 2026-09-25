import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useLayoutEffect, useState } from 'react'
import { CopilotQuickActions } from '@/design-system/components'
import { chatAuthorAvatarSx, chatBubbleIncoming, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import { layoutTokens } from '@/design-system/tokens/layout'
import { copilotSectionHeadingSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'
import {
  COPILOT_REVEAL_ACTIONS_ATTR,
  COPILOT_REVEAL_ATTR,
} from '@/pages/policies/components/copilot/copilotReveal'
import type { PolicyDocument } from '@/pages/policies/data/mockDocuments'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

const DOCUMENT_SUMMARIZE_ACTIONS = ['Extract text', 'Draft Email', 'Create Note'] as const

type DocumentSummarizeTurn =
  | { id: string; role: 'user'; content: string }
  | {
      id: string
      role: 'assistant'
      kind: 'extract'
      text: string
      elapsedSeconds: number
    }

function renderBoldSummary(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    const bold = part.match(/^\*\*([^*]+)\*\*$/)
    if (bold) {
      return (
        <Box key={index} component="span" sx={{ fontWeight: 600 }}>
          {bold[1]}
        </Box>
      )
    }
    return <Box key={index} component="span">{part}</Box>
  })
}

type DocumentSummarizeContentProps = {
  document: PolicyDocument
  summaryText: string
  insights: string[]
  extractedText: string
  /** Rail actions (Draft Email / Create Note) — Extract text stays in-thread. */
  onRailAction?: (action: string) => void
  onRequestReveal?: () => void
}

/**
 * Individual-document Summarize — same interaction model as Home Daily summary:
 * intro + insights + ↳ actions; choosing an action appends a thread turn.
 * Extracted text is not shown until the user asks via “Extract text”.
 */
export function DocumentSummarizeContent({
  document,
  summaryText,
  insights,
  extractedText,
  onRailAction,
  onRequestReveal,
}: DocumentSummarizeContentProps) {
  const [threadTurns, setThreadTurns] = useState<DocumentSummarizeTurn[]>([])
  const [usedActions, setUsedActions] = useState<string[]>([])

  useLayoutEffect(() => {
    if (threadTurns.length === 0) return
    onRequestReveal?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reveal once per appended turn batch
  }, [threadTurns[threadTurns.length - 1]?.id])

  // Reset when the open document changes.
  useLayoutEffect(() => {
    setThreadTurns([])
    setUsedActions([])
  }, [document.id])

  const remainingActions = DOCUMENT_SUMMARIZE_ACTIONS.filter(
    (action) => !usedActions.includes(action),
  )

  const handleQuickAction = (action: string) => {
    if (action === 'Extract text') {
      const at = Date.now()
      setUsedActions((current) => (current.includes(action) ? current : [...current, action]))
      setThreadTurns((current) => [
        ...current,
        { id: `doc-user-${at}`, role: 'user', content: action },
        {
          id: `doc-assistant-${at}`,
          role: 'assistant',
          kind: 'extract',
          text: extractedText.trim() || 'No extracted text available for this document.',
          elapsedSeconds: 1.18,
        },
      ])
      onRequestReveal?.()
      return
    }

    if (action === 'Draft Email' || action === 'Create Note') {
      setUsedActions((current) => (current.includes(action) ? current : [...current, action]))
      onRailAction?.(action)
    }
  }

  const lastTurnId = threadTurns[threadTurns.length - 1]?.id
  const showActionsAfterThread = threadTurns.length > 0 && remainingActions.length > 0

  return (
    <Stack spacing={2}>
      <Typography variant="caption" color="text.secondary" display="block" sx={bodySx}>
        {document.fileName}
      </Typography>

      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.6 }}>
        {renderBoldSummary(summaryText)}
      </Typography>

      <Box>
        <Typography variant="body2" sx={{ ...copilotSectionHeadingSx, mb: 1 }}>
          Key insights
        </Typography>
        <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
          {insights.map((insight) => (
            <Typography
              component="li"
              variant="body2"
              color="text.primary"
              key={insight}
              sx={{ ...bodySx, mb: 0.5, lineHeight: 1.55 }}
            >
              {insight}
            </Typography>
          ))}
        </Box>
      </Box>

      {threadTurns.length === 0 ? (
        <>
          <Divider sx={{ my: 0 }} />
          <CopilotQuickActions
            actions={[...DOCUMENT_SUMMARIZE_ACTIONS]}
            onAction={handleQuickAction}
          />
        </>
      ) : (
        <Stack spacing={0}>
          {threadTurns.map((turn) => {
            const isLatest = turn.id === lastTurnId
            const markReveal = isLatest && !showActionsAfterThread
            if (turn.role === 'user') {
              return (
                <Box
                  key={turn.id}
                  {...(markReveal ? { [COPILOT_REVEAL_ATTR]: '' } : {})}
                  sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}
                >
                  <Box
                    sx={{
                      maxWidth: '85%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                      <Avatar sx={(theme) => chatAuthorAvatarSx(theme)}>CR</Avatar>
                      <Typography
                        variant="body2"
                        sx={{
                          fontFamily: figmaFontFamilyStack.heading,
                          fontWeight: 600,
                          fontSize: '0.8125rem',
                        }}
                      >
                        You
                      </Typography>
                    </Stack>
                    <Box
                      sx={(theme) => ({
                        px: 1.75,
                        py: 1.25,
                        borderRadius: 2,
                        bgcolor: chatBubbleIncoming(theme),
                      })}
                    >
                      <Typography variant="body2" sx={{ ...bodySx, lineHeight: 1.55 }}>
                        {turn.content}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              )
            }

            return (
              <Box
                key={turn.id}
                {...(markReveal ? { [COPILOT_REVEAL_ATTR]: '' } : {})}
                sx={{ mb: 2.5 }}
              >
                <Typography variant="body2" sx={{ ...copilotSectionHeadingSx, mb: 1 }}>
                  Extracted text
                </Typography>
                <Box
                  sx={{
                    mb: 1,
                    px: 1.5,
                    py: 1.25,
                    borderRadius: `${layoutTokens.cardRadius}px`,
                    bgcolor: (theme) => surfaceMuted(theme),
                    maxHeight: 220,
                    overflowY: 'auto',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ...bodySx, lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '0.8125rem' }}
                  >
                    {turn.text}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" display="block" sx={bodySx}>
                  {turn.elapsedSeconds.toFixed(2)}s
                </Typography>
              </Box>
            )
          })}

          {showActionsAfterThread ? (
            <Box {...{ [COPILOT_REVEAL_ATTR]: '', [COPILOT_REVEAL_ACTIONS_ATTR]: '' }}>
              <Divider sx={{ mb: 2 }} />
              <CopilotQuickActions actions={remainingActions} onAction={handleQuickAction} />
            </Box>
          ) : null}
        </Stack>
      )}
    </Stack>
  )
}

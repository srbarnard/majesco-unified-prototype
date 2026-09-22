import CloseIcon from '@mui/icons-material/Close'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { layoutTokens } from '@/design-system/tokens/layout'
import { CopilotComposer, type CopilotAttachedFile } from '@/pages/policies/components/CopilotComposer'
import { CopilotAgentsView } from '@/pages/policies/components/copilot/CopilotAgentsView'
import { CopilotContentTransition } from '@/pages/policies/components/copilot/CopilotContentTransition'
import { CopilotConversationView } from '@/pages/policies/components/copilot/CopilotConversationView'
import { CopilotDrawerToolbar } from '@/pages/policies/components/copilot/CopilotDrawerToolbar'
import { CopilotHistoryView } from '@/pages/policies/components/copilot/CopilotHistoryView'
import { CopilotPromptsView } from '@/pages/policies/components/copilot/CopilotPromptsView'
import type { CopilotHistoryEntry } from '@/pages/policies/components/copilot/copilotDrawerData'
import { copilotDrawerHeadingSx, copilotDrawerTabsSx } from '@/pages/policies/components/copilot/copilotDrawerStyles'
import {
  COPILOT_REVEAL_ACTIONS_ATTR,
  COPILOT_REVEAL_ATTR,
} from '@/pages/policies/components/copilot/copilotReveal'

const REVEAL_PADDING_PX = 12
/** Soft ease-out for chat follow / reveal — long enough to read as intentional, not a jump. */
const REVEAL_SCROLL_MS = 420

type ScrollAnim = { raf: number; to: number }
const scrollAnims = new WeakMap<HTMLElement, ScrollAnim>()

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  )
}

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

function cancelScrollAnim(el: HTMLElement) {
  const existing = scrollAnims.get(el)
  if (!existing) return
  cancelAnimationFrame(existing.raf)
  scrollAnims.delete(el)
}

function animateScrollTop(el: HTMLElement, to: number, durationMs: number) {
  const max = Math.max(0, el.scrollHeight - el.clientHeight)
  const clamped = Math.max(0, Math.min(to, max))
  const from = el.scrollTop
  if (Math.abs(clamped - from) < 1) {
    el.scrollTop = clamped
    cancelScrollAnim(el)
    return
  }
  if (prefersReducedMotion()) {
    el.scrollTop = clamped
    cancelScrollAnim(el)
    return
  }

  cancelScrollAnim(el)
  const start = performance.now()
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs)
    el.scrollTop = from + (clamped - from) * easeOutCubic(t)
    if (t < 1) {
      const raf = requestAnimationFrame(tick)
      scrollAnims.set(el, { raf, to: clamped })
    } else {
      el.scrollTop = clamped
      scrollAnims.delete(el)
    }
  }
  const raf = requestAnimationFrame(tick)
  scrollAnims.set(el, { raf, to: clamped })
}

/** Desired scrollTop so actions sit just above the composer (and card top when it fits). */
function computeRevealScrollTop(scrollRoot: HTMLElement, target: HTMLElement) {
  const actions =
    target.querySelector<HTMLElement>(`[${COPILOT_REVEAL_ACTIONS_ATTR}]`) ?? target
  const rootRect = scrollRoot.getBoundingClientRect()
  const padding = REVEAL_PADDING_PX
  const idealBottom = rootRect.bottom - padding
  let nextTop = scrollRoot.scrollTop

  const actionsRect = actions.getBoundingClientRect()
  const actionsBottomDelta = actionsRect.bottom - idealBottom
  if (Math.abs(actionsBottomDelta) > 1) {
    nextTop += actionsBottomDelta
  }

  // Recompute as if we were at nextTop (approximate via delta on current rects).
  const appliedDelta = nextTop - scrollRoot.scrollTop
  const targetTop = target.getBoundingClientRect().top - appliedDelta
  const actionsTop = actions.getBoundingClientRect().top - appliedDelta
  const actionsBottom = actions.getBoundingClientRect().bottom - appliedDelta
  const topGap = targetTop - (rootRect.top + padding)
  if (topGap < -1) {
    const actionsRoom = idealBottom - actionsTop
    const targetNeeds = target.getBoundingClientRect().height
    if (targetNeeds <= scrollRoot.clientHeight - padding * 2) {
      nextTop += topGap
    } else if (actionsRoom > 48) {
      const maxPull = actionsBottom - idealBottom
      const pull = Math.max(topGap, maxPull)
      if (Math.abs(pull) > 1) nextTop += pull
    }
  }

  const max = Math.max(0, scrollRoot.scrollHeight - scrollRoot.clientHeight)
  return Math.max(0, Math.min(nextTop, max))
}

function scrollChatToBottom(scrollRoot: HTMLElement) {
  const max = Math.max(0, scrollRoot.scrollHeight - scrollRoot.clientHeight)
  const existing = scrollAnims.get(scrollRoot)
  if (existing && Math.abs(existing.to - max) < 4) return
  if (Math.abs(max - scrollRoot.scrollTop) <= 1) return
  animateScrollTop(scrollRoot, max, REVEAL_SCROLL_MS)
}

function scrollChatRevealTarget(scrollRoot: HTMLElement, target: HTMLElement) {
  const desired = computeRevealScrollTop(scrollRoot, target)
  const actions =
    target.querySelector<HTMLElement>(`[${COPILOT_REVEAL_ACTIONS_ATTR}]`) ?? target
  const rootRect = scrollRoot.getBoundingClientRect()
  const idealBottom = rootRect.bottom - REVEAL_PADDING_PX

  const existing = scrollAnims.get(scrollRoot)
  if (existing && Math.abs(existing.to - desired) < 4) {
    // Already easing toward this destination.
    return true
  }

  if (Math.abs(desired - scrollRoot.scrollTop) > 1) {
    animateScrollTop(scrollRoot, desired, REVEAL_SCROLL_MS)
  }

  // During animation, treat as pinned once destination is correct.
  if (scrollAnims.has(scrollRoot)) return true
  return actions.getBoundingClientRect().bottom <= idealBottom + 2
}

function focusRevealField(target: HTMLElement) {
  // Only auto-focus interactive reveal cards (assign form). Receipts / suggested actions
  // have no actions row — focusing into the thread can cause an abrupt native scroll.
  if (!target.querySelector(`[${COPILOT_REVEAL_ACTIONS_ATTR}]`)) return
  const focusable = target.querySelector<HTMLElement>(
    'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
  )
  focusable?.focus({ preventScroll: true })
}

type CopilotDrawerShellProps = {
  onClose?: () => void
  composerPlaceholder?: string
  seedComposerMessage?: string | null
  hideComposer?: boolean
  /** When this value changes, the drawer returns to the default chat view. */
  chatFocusKey?: string | null
  /**
   * When this value changes, the drawer body cross-fades (selection-driven chat content).
   * Tab / prompts / agents / history swaps always animate via the shell.
   */
  contentKey?: string | null
  /**
   * Bump only for user-initiated chat appends (suggested action / send).
   * Scrolls `[data-copilot-reveal]` into view above the composer.
   */
  revealKey?: number | string | null
  /** Launch a chat thread (e.g. Daily summary quick action) and clear the composer. */
  launchConversation?: CopilotHistoryEntry | null
  launchConversationKey?: number | string | null
  /** Rendered inside scrollable chat content when on the default chat view. */
  banner?: ReactNode
  /** Optional slot beside the Copilot title in the drawer header. */
  headerTrailing?: ReactNode
  /** Optional leading slot in the prompts/agents toolbar row above chat content. */
  toolbarLeading?: ReactNode
  /** When false, hides the global prompts/agents toolbar above chat content. */
  showToolbar?: boolean
  /** Change to open the composer file picker (guided upload actions). */
  attachRequestKey?: number | string | null
  onComposerSubmit?: (message: string, files?: CopilotAttachedFile[]) => void
  children: ReactNode
}

export function CopilotDrawerShell({
  onClose,
  composerPlaceholder = 'Select a prompt or ask me anything',
  seedComposerMessage = null,
  hideComposer = false,
  chatFocusKey = null,
  contentKey = null,
  revealKey = null,
  launchConversation = null,
  launchConversationKey = null,
  banner,
  headerTrailing,
  toolbarLeading,
  showToolbar = true,
  attachRequestKey = null,
  onComposerSubmit,
  children,
}: CopilotDrawerShellProps) {
  const [copilotTab, setCopilotTab] = useState<'chat' | 'history'>('chat')
  const [drawerView, setDrawerView] = useState<'prompts' | 'agents' | null>(null)
  const [activeConversation, setActiveConversation] = useState<CopilotHistoryEntry | null>(null)
  const [conversationSource, setConversationSource] = useState<'history' | 'launch' | null>(null)
  const [composerMessage, setComposerMessage] = useState('')
  const chatScrollRef = useRef<HTMLDivElement | null>(null)

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
      setConversationSource(null)
    }
  }, [chatFocusKey])

  useEffect(() => {
    if (!launchConversation || launchConversationKey == null) return
    setActiveConversation(launchConversation)
    setConversationSource('launch')
    setComposerMessage('')
    setCopilotTab('chat')
    setDrawerView(null)
  }, [launchConversation, launchConversationKey])

  useLayoutEffect(() => {
    if (revealKey == null || revealKey === 0) return
    if (copilotTab !== 'chat' || drawerView) return

    let cancelled = false
    const timers: number[] = []
    let resizeObserver: ResizeObserver | null = null
    let attempts = 0

    const runReveal = () => {
      if (cancelled) return false
      const root = chatScrollRef.current
      if (!root) return false
      // Prefer the innermost / latest reveal target (the interactive card).
      const targets = root.querySelectorAll<HTMLElement>(`[${COPILOT_REVEAL_ATTR}]`)
      const target = targets.length > 0 ? targets[targets.length - 1]! : null
      // Wait for the turn/card to mount — don't treat "missing" as done.
      if (!target) return false

      const pinned = scrollChatRevealTarget(root, target)
      focusRevealField(target)
      requestAnimationFrame(() => {
        if (cancelled) return
        scrollChatRevealTarget(root, target)
      })
      return pinned
    }

    const schedule = (delayMs: number) => {
      const timer = window.setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            runReveal()
          })
        })
      }, delayMs)
      timers.push(timer)
    }

    // Retry until actions sit above the composer or we exhaust attempts
    // (covers late layout / autocomplete focus).
    const poll = () => {
      if (cancelled || attempts > 16) return
      attempts += 1
      const pinned = runReveal()
      if (!pinned) {
        timers.push(window.setTimeout(poll, 50))
      }
    }

    schedule(0)
    timers.push(window.setTimeout(poll, 0))
    schedule(120)
    schedule(280)
    // After the ease finishes, re-pin (focus / late layout can nudge scroll).
    schedule(REVEAL_SCROLL_MS + 40)

    const observeTimer = window.setTimeout(() => {
      if (cancelled) return
      const root = chatScrollRef.current
      const targets = root?.querySelectorAll<HTMLElement>(`[${COPILOT_REVEAL_ATTR}]`)
      const target = targets && targets.length > 0 ? targets[targets.length - 1]! : null
      if (!root || !target || typeof ResizeObserver === 'undefined') return
      resizeObserver = new ResizeObserver(() => {
        if (cancelled) return
        runReveal()
      })
      resizeObserver.observe(target)
      resizeObserver.observe(root)
    }, 0)
    timers.push(observeTimer)

    return () => {
      cancelled = true
      timers.forEach((id) => window.clearTimeout(id))
      resizeObserver?.disconnect()
    }
  }, [revealKey, copilotTab, drawerView])

  // Ease the thread down when content grows and the user was already following a scrollable thread.
  // Skip when an interactive reveal card is present — the reveal effect owns that scroll.
  useEffect(() => {
    if (copilotTab !== 'chat' || drawerView) return
    const root = chatScrollRef.current
    if (!root || typeof ResizeObserver === 'undefined') return

    let prevScrollHeight = root.scrollHeight
    let prevClientHeight = root.clientHeight
    let prevScrollTop = root.scrollTop

    const onScroll = () => {
      if (scrollAnims.has(root)) return
      prevScrollTop = root.scrollTop
    }
    root.addEventListener('scroll', onScroll, { passive: true })

    const followGrowth = () => {
      const { scrollHeight, clientHeight } = root
      const grew = scrollHeight > prevScrollHeight + 1
      const hadOverflow = prevScrollHeight > prevClientHeight + 8
      const distanceFromBottom = prevScrollHeight - prevClientHeight - prevScrollTop
      const wasFollowing = hadOverflow && distanceFromBottom < 96

      prevScrollHeight = scrollHeight
      prevClientHeight = clientHeight

      if (!grew || !wasFollowing) return

      // Interactive cards (assign form): reveal effect handles pinning Cancel/Assign.
      if (root.querySelector(`[${COPILOT_REVEAL_ACTIONS_ATTR}]`)) return

      const targets = root.querySelectorAll<HTMLElement>(`[${COPILOT_REVEAL_ATTR}]`)
      const target = targets.length > 0 ? targets[targets.length - 1]! : null
      if (target) {
        scrollChatRevealTarget(root, target)
      } else {
        scrollChatToBottom(root)
      }
    }

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(followGrowth)
    })
    const content = root.firstElementChild
    if (content instanceof HTMLElement) resizeObserver.observe(content)
    resizeObserver.observe(root)

    return () => {
      root.removeEventListener('scroll', onScroll)
      resizeObserver.disconnect()
    }
  }, [copilotTab, drawerView, contentKey])

  useEffect(() => {
    return () => {
      if (chatScrollRef.current) cancelScrollAnim(chatScrollRef.current)
    }
  }, [])

  const handleTabChange = (_: unknown, value: 'chat' | 'history') => {
    setCopilotTab(value)
    setDrawerView(null)
    if (value === 'history') {
      setActiveConversation(null)
      setConversationSource(null)
    }
  }

  const handleSelectHistoryEntry = (entry: CopilotHistoryEntry) => {
    setActiveConversation(entry)
    setConversationSource('history')
    setDrawerView(null)
    setCopilotTab('chat')
  }

  const handlePromptSelected = (message: string) => {
    setComposerMessage(message)
    setDrawerView(null)
    setCopilotTab('chat')
  }

  const handleConversationBack = () => {
    setActiveConversation(null)
    if (conversationSource === 'history') {
      setCopilotTab('history')
    }
    setConversationSource(null)
  }

  const isDefaultChat = copilotTab === 'chat' && !drawerView && !activeConversation
  const showComposer = !hideComposer && !drawerView && copilotTab !== 'history'

  const shellContentKey = [
    copilotTab,
    drawerView ?? (activeConversation ? `conversation:${activeConversation.id}` : 'chat'),
    contentKey ?? 'default',
  ].join(':')

  const body = copilotTab === 'history' ? (
    <CopilotHistoryView onSelectEntry={handleSelectHistoryEntry} />
  ) : drawerView === 'prompts' ? (
    <CopilotPromptsView
      onBack={() => setDrawerView(null)}
      onSelectPrompt={(prompt) => handlePromptSelected(prompt.title)}
      onOpenAgents={() => setDrawerView('agents')}
    />
  ) : drawerView === 'agents' ? (
    <CopilotAgentsView
      onBack={() => setDrawerView(null)}
      onSelectAgent={(agent) => handlePromptSelected(`Run ${agent.title}`)}
      onOpenPrompts={() => setDrawerView('prompts')}
    />
  ) : activeConversation ? (
    <CopilotConversationView
      entry={activeConversation}
      onBack={handleConversationBack}
      backLabel={conversationSource === 'launch' ? 'Daily summary' : undefined}
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
  )

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

      <Box
        ref={chatScrollRef}
        sx={{
          px: 2,
          py: 2,
          flexGrow: 1,
          overflowY: 'auto',
          minHeight: 0,
          // Block layout (not flex) so tall chat content grows scrollHeight.
          // Flex on this node prevents overflow from becoming scrollable.
        }}
      >
        <CopilotContentTransition contentKey={shellContentKey}>{body}</CopilotContentTransition>
      </Box>

      {showComposer && (
        <CopilotComposer
          placeholder={activeConversation ? 'Continue the conversation…' : composerPlaceholder}
          value={composerMessage}
          onChange={setComposerMessage}
          attachRequestKey={attachRequestKey}
          attachmentResetKey={chatFocusKey}
          onSubmit={onComposerSubmit}
        />
      )}
    </Box>
  )
}

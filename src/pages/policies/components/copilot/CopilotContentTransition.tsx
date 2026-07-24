import Box from '@mui/material/Box'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { copilotContentMotion } from '@/design-system/tokens/motion'

type CopilotContentTransitionProps = {
  /** Change this to trigger an out → in content swap. */
  contentKey: string
  children: ReactNode
}

type RenderedContent = {
  key: string
  node: ReactNode
}

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  )
}

/**
 * Subtle Copilot body transition: outgoing fades/slides up slightly,
 * then incoming fades/slides in. ~200–300ms total, reduced-motion safe.
 */
export function CopilotContentTransition({ contentKey, children }: CopilotContentTransitionProps) {
  const [rendered, setRendered] = useState<RenderedContent>({ key: contentKey, node: children })
  const [phase, setPhase] = useState<'idle' | 'exiting' | 'entering'>('idle')
  const pendingRef = useRef<RenderedContent | null>(null)
  const childrenRef = useRef(children)
  const timersRef = useRef<number[]>([])

  childrenRef.current = children

  const clearTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id))
    timersRef.current = []
  }

  useEffect(() => () => clearTimers(), [])

  useEffect(() => {
    if (contentKey === rendered.key) return

    if (prefersReducedMotion()) {
      clearTimers()
      pendingRef.current = null
      setRendered({ key: contentKey, node: childrenRef.current })
      setPhase('idle')
      return
    }

    pendingRef.current = { key: contentKey, node: childrenRef.current }
    clearTimers()
    setPhase('exiting')

    const exitTimer = window.setTimeout(() => {
      const next = pendingRef.current ?? { key: contentKey, node: childrenRef.current }
      pendingRef.current = null
      setRendered(next)
      setPhase('entering')
      const enterTimer = window.setTimeout(() => setPhase('idle'), copilotContentMotion.enterMs)
      timersRef.current.push(enterTimer)
    }, copilotContentMotion.exitMs)
    timersRef.current.push(exitTimer)
  }, [contentKey, rendered.key])

  // Keep live children when idle on the same key (resolve/approve updates) without animating.
  const displayNode =
    phase === 'idle' && contentKey === rendered.key ? children : rendered.node

  // If a newer pending swap arrived mid-exit, refresh its node from the latest children.
  if (pendingRef.current && pendingRef.current.key === contentKey) {
    pendingRef.current = { key: contentKey, node: children }
  }

  const { exitMs, enterMs, offsetPx, easing } = copilotContentMotion
  const isExiting = phase === 'exiting'
  const isEntering = phase === 'entering'

  return (
    <Box sx={{ position: 'relative', minHeight: 0 }}>
      <Box
        sx={{
          transformOrigin: 'top center',
          willChange: isExiting || isEntering ? 'opacity, transform' : 'auto',
          ...(isExiting
            ? {
                opacity: 0,
                transform: `translateY(-${offsetPx}px)`,
                transition: `opacity ${exitMs}ms ${easing}, transform ${exitMs}ms ${easing}`,
                pointerEvents: 'none',
              }
            : isEntering
              ? {
                  opacity: 1,
                  transform: 'translateY(0)',
                  animation: `copilotContentEnter ${enterMs}ms ${easing} both`,
                  '@keyframes copilotContentEnter': {
                    from: {
                      opacity: 0,
                      transform: `translateY(${offsetPx}px)`,
                    },
                    to: {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }
              : {
                  opacity: 1,
                  transform: 'translateY(0)',
                }),
          '@media (prefers-reduced-motion: reduce)': {
            animation: 'none !important',
            transition: 'none !important',
            opacity: 1,
            transform: 'none',
          },
        }}
      >
        {displayNode}
      </Box>
    </Box>
  )
}

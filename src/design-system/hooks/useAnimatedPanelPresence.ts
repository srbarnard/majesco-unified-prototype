import { useEffect, useState } from 'react'
import { drawerMotion } from '@/design-system/tokens/motion'

/**
 * Keeps a panel mounted through its exit animation, then unmounts.
 * Use with `dockedPanelMotionSx` for smooth show/hide.
 */
export function useAnimatedPanelPresence(open: boolean, reducedMotion = false) {
  const [mounted, setMounted] = useState(open)
  const [entered, setEntered] = useState(open)

  useEffect(() => {
    if (reducedMotion) {
      setMounted(open)
      setEntered(open)
      return
    }

    if (open) {
      setMounted(true)
      let frame2 = 0
      const frame1 = window.requestAnimationFrame(() => {
        frame2 = window.requestAnimationFrame(() => setEntered(true))
      })
      return () => {
        window.cancelAnimationFrame(frame1)
        window.cancelAnimationFrame(frame2)
      }
    }

    setEntered(false)
    const timeout = window.setTimeout(() => setMounted(false), drawerMotion.exitMs)
    return () => window.clearTimeout(timeout)
  }, [open, reducedMotion])

  return { mounted, entered }
}

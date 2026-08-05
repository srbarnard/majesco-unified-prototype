import { useEffect, useState } from 'react'
import { drawerMotion } from '@/design-system/tokens/motion'

/**
 * Keeps a panel mounted through its exit animation, then unmounts.
 * Use with `dockedPanelMotionSx` / `bottomSheetMotionSx` for smooth show/hide.
 *
 * Enter waits for two animation frames plus a short timeout so WebKit has a
 * committed "hidden" paint before `entered` flips (needed for CSS transitions).
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
      setEntered(false)
      let frame2 = 0
      let timeout = 0
      const frame1 = window.requestAnimationFrame(() => {
        frame2 = window.requestAnimationFrame(() => {
          // Extra tick after layout — iOS often skips the transition without this.
          timeout = window.setTimeout(() => setEntered(true), 20)
        })
      })
      return () => {
        window.cancelAnimationFrame(frame1)
        window.cancelAnimationFrame(frame2)
        window.clearTimeout(timeout)
      }
    }

    setEntered(false)
    const timeout = window.setTimeout(() => setMounted(false), drawerMotion.exitMs)
    return () => window.clearTimeout(timeout)
  }, [open, reducedMotion])

  return { mounted, entered }
}

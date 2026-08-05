import { useEffect, useState } from 'react'
import { drawerMotion } from '@/design-system/tokens/motion'

export type BottomSheetMotionPhase = 'enter' | 'exit'

/**
 * Mount/unmount a bottom sheet around keyframe enter/exit animations.
 * Unlike transition-based presence, enter can start on the same frame as mount
 * because CSS keyframes always play from their `from` keyframe (needed on iOS).
 */
export function useBottomSheetPresence(open: boolean, reducedMotion = false) {
  const [mounted, setMounted] = useState(open)
  const [phase, setPhase] = useState<BottomSheetMotionPhase>(open ? 'enter' : 'exit')

  useEffect(() => {
    if (reducedMotion) {
      setMounted(open)
      setPhase(open ? 'enter' : 'exit')
      return
    }

    if (open) {
      setPhase('enter')
      setMounted(true)
      return
    }

    setPhase('exit')
    const timeout = window.setTimeout(() => setMounted(false), drawerMotion.exitMs)
    return () => window.clearTimeout(timeout)
  }, [open, reducedMotion])

  return { mounted, phase }
}

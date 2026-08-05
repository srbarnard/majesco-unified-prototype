import { useLayoutEffect, type RefObject } from 'react'
import { drawerMotion } from '@/design-system/tokens/motion'
import type { BottomSheetMotionPhase } from '@/design-system/hooks/useBottomSheetPresence'

/**
 * Drive bottom-sheet transform with the Web Animations API.
 * More reliable than CSS transitions/keyframes inside MUI Modal on iOS Chrome.
 */
export function useBottomSheetElementAnimation(
  ref: RefObject<HTMLElement | null>,
  phase: BottomSheetMotionPhase,
  active: boolean,
  reducedMotion = false,
) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !active) return

    const { enterMs, exitMs, enterEasing, exitEasing, panelFadeFrom } = drawerMotion

    if (reducedMotion) {
      el.style.transform = 'translate3d(0, 0, 0)'
      el.style.opacity = '1'
      return
    }

    const isEnter = phase === 'enter'
    const from = isEnter
      ? { transform: 'translate3d(0, 100%, 0)', opacity: panelFadeFrom }
      : { transform: 'translate3d(0, 0, 0)', opacity: 1 }
    const to = isEnter
      ? { transform: 'translate3d(0, 0, 0)', opacity: 1 }
      : { transform: 'translate3d(0, 100%, 0)', opacity: panelFadeFrom }

    el.style.transform = from.transform
    el.style.opacity = String(from.opacity)
    // Commit the starting frame before the animation runs (critical on iOS).
    void el.getBoundingClientRect()

    const animation = el.animate([from, to], {
      duration: isEnter ? enterMs : exitMs,
      easing: isEnter ? enterEasing : exitEasing,
      fill: 'forwards',
    })

    return () => {
      animation.cancel()
    }
  }, [ref, phase, active, reducedMotion])
}

export function useBottomSheetBackdropAnimation(
  ref: RefObject<HTMLElement | null>,
  phase: BottomSheetMotionPhase,
  active: boolean,
  reducedMotion = false,
) {
  useLayoutEffect(() => {
    const el = ref.current
    if (!el || !active) return

    const { enterMs, exitMs, enterEasing, exitEasing } = drawerMotion
    const duration = Math.round((phase === 'enter' ? enterMs : exitMs) * 0.85)

    if (reducedMotion) {
      el.style.opacity = '1'
      return
    }

    const from = { opacity: phase === 'enter' ? 0 : 1 }
    const to = { opacity: phase === 'enter' ? 1 : 0 }

    el.style.opacity = String(from.opacity)
    void el.getBoundingClientRect()

    const animation = el.animate([from, to], {
      duration,
      easing: phase === 'enter' ? enterEasing : exitEasing,
      fill: 'forwards',
    })

    return () => {
      animation.cancel()
    }
  }, [ref, phase, active, reducedMotion])
}

import { useEffect, useRef, useState } from 'react'

function easeOutCubic(t: number) {
  return 1 - (1 - t) ** 3
}

/** Animates confidence from 0 on focus change, or from the prior value when confidence updates. */
export function useAnimatedConfidence(target: number, focusKey: string | number, durationMs = 700) {
  const [value, setValue] = useState(0)
  const valueRef = useRef(0)
  const prevFocusRef = useRef(focusKey)

  useEffect(() => {
    const fromFocusChange = prevFocusRef.current !== focusKey
    prevFocusRef.current = focusKey

    const start = fromFocusChange ? 0 : valueRef.current
    const end = target
    if (start === end) return

    let frame = 0
    const startTime = performance.now()

    const tick = (now: number) => {
      const t = Math.min((now - startTime) / durationMs, 1)
      const next = start + (end - start) * easeOutCubic(t)
      valueRef.current = next
      setValue(next)
      if (t < 1) {
        frame = requestAnimationFrame(tick)
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, focusKey, durationMs])

  return value
}

import { useEffect, useRef, useState } from 'react'

export function useChartWidth(minWidth = 320) {
  const ref = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(minWidth)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    const update = () => {
      const next = node.getBoundingClientRect().width
      if (next > 0) {
        setWidth(Math.max(next, minWidth))
      }
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(node)
    return () => observer.disconnect()
  }, [minWidth])

  return { ref, width }
}

/** Show every Nth x-axis label so labels stay readable at narrow widths. */
export function getLabelStep(count: number, plotWidth: number, minLabelWidth = 44): number {
  const maxLabels = Math.max(1, Math.floor(plotWidth / minLabelWidth))
  if (count <= maxLabels) return 1
  return Math.ceil(count / maxLabels)
}

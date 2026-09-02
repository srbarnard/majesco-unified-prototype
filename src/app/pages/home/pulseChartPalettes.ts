import { useCallback, useEffect, useState } from 'react'
import type { PulseRange } from '@/app/data/pulseMock'

export type PulseChartPaletteId = 'majestic' | 'terra' | 'classic'

export type PulseChartPalette = {
  id: PulseChartPaletteId
  label: string
  colors: readonly [string, string, string, string, string, string, string, string]
}

export const PULSE_CHART_PALETTES: Record<PulseChartPaletteId, PulseChartPalette> = {
  majestic: {
    id: 'majestic',
    label: 'Majestic',
    colors: ['#0DA3A6', '#00294D', '#137835', '#4B017A', '#5229BC', '#FF7A00', '#D64550', '#D9B300'],
  },
  terra: {
    id: 'terra',
    label: 'Terra',
    colors: ['#56687A', '#5B8E7D', '#2A9D8F', '#8AB17D', '#E9C46A', '#F4A261', '#E76F51', '#A44A3F'],
  },
  classic: {
    id: 'classic',
    label: 'Classic',
    colors: ['#1F77B4', '#AEC7E8', '#FF7F0E', '#FFBB78', '#2CA02C', '#98DF8A', '#9467BD', '#C5B0D5'],
  },
}

export const PULSE_PALETTE_ORDER: PulseChartPaletteId[] = ['majestic', 'terra', 'classic']

const PALETTE_STORAGE_KEY = 'pulse-chart-palette'
const RANGE_STORAGE_KEY = 'pulse-chart-range'

export function getStoredPulsePaletteId(): PulseChartPaletteId {
  try {
    const stored = localStorage.getItem(PALETTE_STORAGE_KEY)
    if (stored === 'majestic' || stored === 'terra' || stored === 'classic') {
      return stored
    }
  } catch {
    // ignore
  }
  return 'majestic'
}

export function getStoredPulseRange(): PulseRange {
  try {
    const stored = localStorage.getItem(RANGE_STORAGE_KEY)
    if (stored === '30D' || stored === '90D' || stored === '6M') {
      return stored
    }
  } catch {
    // ignore
  }
  return '90D'
}

export function usePulsePreferences() {
  const [paletteId, setPaletteIdState] = useState<PulseChartPaletteId>(getStoredPulsePaletteId)
  const [range, setRangeState] = useState<PulseRange>(getStoredPulseRange)

  const setPaletteId = useCallback((id: PulseChartPaletteId) => {
    setPaletteIdState(id)
    try {
      localStorage.setItem(PALETTE_STORAGE_KEY, id)
    } catch {
      // ignore
    }
  }, [])

  const setRange = useCallback((next: PulseRange) => {
    setRangeState(next)
    try {
      localStorage.setItem(RANGE_STORAGE_KEY, next)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    setPaletteIdState(getStoredPulsePaletteId())
    setRangeState(getStoredPulseRange())
  }, [])

  return {
    palette: PULSE_CHART_PALETTES[paletteId],
    paletteId,
    setPaletteId,
    range,
    setRange,
  }
}

/** @deprecated Use usePulsePreferences */
export function usePulseChartPalette() {
  const { palette, paletteId, setPaletteId } = usePulsePreferences()
  return { palette, paletteId, setPaletteId }
}

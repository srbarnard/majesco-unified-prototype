import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useTheme, type Theme } from '@mui/material/styles'
import { useEffect, useState } from 'react'
import {
  Annotation,
  ComposableMap,
  Geographies,
  Geography,
} from 'react-simple-maps'
import { feature } from 'topojson-client'
import type { FeatureCollection, Geometry } from 'geojson'
import type { GeometryCollection, Topology } from 'topojson-specification'
import { analyticsBodySx } from '@/design-system/components/analytics/analyticsStyles'
import { isDarkMode, surfaceMuted, surfaceSubtle } from '@/design-system/theme/themeSurfaces'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

const STATES_TOPOLOGY_URL = '/geo/states-10m.json'
/** Match Home / Transactions chart viewport height. */
const MAP_HEIGHT = 260

/** Alaska + Hawaii — omitted so CONUS fills the viewport. */
const HIDDEN_FIPS = new Set(['02', '15'])

/**
 * Label anchors (lon/lat) for states that appear in exposure demos.
 * Only exposure states are labeled — not every CONUS outline.
 */
const STATE_LABEL_COORDS: Record<string, [number, number]> = {
  '04': [-111.7, 34.2], // AZ
  '06': [-119.5, 37.2], // CA
  '08': [-105.5, 39.0], // CO
  '09': [-72.7, 41.6], // CT
  '12': [-81.7, 27.8], // FL
  '13': [-83.4, 32.7], // GA
  '17': [-89.2, 40.0], // IL
  '18': [-86.3, 39.9], // IN
  '22': [-91.8, 31.0], // LA
  '27': [-94.3, 46.0], // MN
  '32': [-116.6, 39.3], // NV
  '34': [-74.6, 40.2], // NJ
  '35': [-106.0, 34.4], // NM
  '36': [-75.5, 43.0], // NY
  '39': [-82.8, 40.3], // OH
  '40': [-97.5, 35.5], // OK
  '41': [-120.5, 44.0], // OR
  '42': [-77.6, 40.9], // PA
  '48': [-99.3, 31.4], // TX
  '53': [-120.5, 47.4], // WA
  '55': [-89.8, 44.5], // WI
}

/** Light-mode zero-exposure fill — near card / paper surface. */
const NONE_FILL_LIGHT = '#F4F2EE'

export type ExposureLevel = 'none' | 'low' | 'medium' | 'high'

export type ExposureByFips = Record<
  string,
  {
    state: string
    units: number
    level: Exclude<ExposureLevel, 'none'>
  }
>

/** Atlantic Ridge Construction — fleet garaging demo. */
export const EXPOSURE_BY_FIPS: ExposureByFips = {
  '06': { state: 'CA', units: 48, level: 'high' },
  '04': { state: 'AZ', units: 4, level: 'medium' },
  '32': { state: 'NV', units: 2, level: 'medium' },
}

/**
 * Mix `color` toward `toward` by `amount` (0–1). Softens palette fills at rest.
 */
function mixHex(color: string, toward: string, amount: number): string {
  const parse = (hex: string) => {
    const h = hex.replace('#', '')
    const full = h.length === 3 ? h.split('').map((c) => c + c).join('') : h
    return [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16))
  }
  const [r1, g1, b1] = parse(color)
  const [r2, g2, b2] = parse(toward)
  const mix = (a: number, b: number) => Math.round(a + (b - a) * amount)
  const toHex = (n: number) => n.toString(16).padStart(2, '0')
  return `#${toHex(mix(r1, r2))}${toHex(mix(g1, g2))}${toHex(mix(b1, b2))}`
}

/**
 * Choropleth from the active Pulse palette.
 * High / medium / low = palette colors[0] / [1] / [2].
 * None (0 units) = near card background — not Low.
 * Idle = softened; hover + legend = pure palette colors.
 */
function getExposureFills(
  theme: Theme,
  paletteColors: readonly string[],
): {
  idle: Record<ExposureLevel, string>
  hover: Record<ExposureLevel, string>
} {
  const dark = isDarkMode(theme)
  const paper = theme.palette.background.paper
  // Zero-exposure must stay distinct from the map canvas — paper-on-paper vanishes in dark.
  const noneIdle = dark ? surfaceMuted(theme) : NONE_FILL_LIGHT
  const noneHover = dark ? surfaceSubtle(theme) : NONE_FILL_LIGHT

  const high = paletteColors[0] ?? '#0DA3A6'
  const medium = paletteColors[1] ?? '#00294D'
  const low = paletteColors[2] ?? '#137835'

  const softenToward = dark ? '#0A0E12' : paper
  const soften = (c: string) => mixHex(c, softenToward, dark ? 0.35 : 0.42)

  return {
    idle: {
      none: noneIdle,
      low: soften(low),
      medium: soften(medium),
      high: soften(high),
    },
    hover: {
      none: noneHover,
      low,
      medium,
      high,
    },
  }
}

const STROKE_WIDTH = 0.6

const LEVEL_LABEL: Record<ExposureLevel, string> = {
  none: 'None',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

const LEGEND_LEVELS = ['low', 'medium', 'high'] as const

type HoveredState = {
  fips: string
  name: string
  units: number
  level: ExposureLevel
  x: number
  y: number
}

type ExposureMapProps = {
  height?: number
  exposureByFips?: ExposureByFips
  /** Active Pulse palette series colors — high/medium/low use indices 0/1/2. */
  paletteColors: readonly string[]
  ariaLabel?: string
}

function ChartStyleLegend({ fills }: { fills: Record<ExposureLevel, string> }) {
  return (
    <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mb: 0.75 }}>
      {LEGEND_LEVELS.map((level) => (
        <Stack key={level} direction="row" spacing={0.75} alignItems="center">
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: fills[level],
              flexShrink: 0,
            }}
          />
          <Typography
            variant="caption"
            sx={{ ...analyticsBodySx, fontSize: '0.6875rem', color: 'text.secondary' }}
          >
            {LEVEL_LABEL[level]}
          </Typography>
        </Stack>
      ))}
    </Stack>
  )
}

export function ExposureMap({
  height = MAP_HEIGHT,
  exposureByFips = EXPOSURE_BY_FIPS,
  paletteColors,
  ariaLabel = 'Scheduled units by state',
}: ExposureMapProps) {
  const theme = useTheme()
  const fills = getExposureFills(theme, paletteColors)
  // Dark: divider stroke keeps zero-exposure borders visible against paper canvas.
  const stroke = isDarkMode(theme) ? theme.palette.divider : '#FFFFFF'
  const [statesGeo, setStatesGeo] = useState<FeatureCollection<Geometry> | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [hovered, setHovered] = useState<HoveredState | null>(null)

  useEffect(() => {
    let cancelled = false

    fetch(STATES_TOPOLOGY_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`Failed to load states atlas (${response.status})`)
        return response.json()
      })
      .then((topology: Topology) => {
        if (cancelled) return
        const collection = topology.objects.states as GeometryCollection
        const fc = feature(topology, collection) as FeatureCollection<Geometry>
        const conus: FeatureCollection<Geometry> = {
          type: 'FeatureCollection',
          features: fc.features.filter((item) => {
            const fips = String(item.id ?? '').padStart(2, '0')
            return !HIDDEN_FIPS.has(fips)
          }),
        }
        setStatesGeo(conus)
        setLoadError(null)
      })
      .catch((error: unknown) => {
        if (cancelled) return
        setLoadError(error instanceof Error ? error.message : 'Failed to load map')
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <Stack spacing={0} sx={{ width: '100%', minWidth: 0, pt: 0.5, pb: 0.5 }} aria-label={ariaLabel}>
      <ChartStyleLegend fills={fills.hover} />

      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height,
          minHeight: height,
          maxHeight: height,
          bgcolor: 'transparent',
          '& .rsm-svg': {
            background: 'transparent',
            display: 'block',
            width: '100%',
            height: '100%',
          },
        }}
        onMouseLeave={() => setHovered(null)}
      >
        {loadError ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ...analyticsBodySx, py: 1, fontSize: '0.8125rem' }}
          >
            {loadError}
          </Typography>
        ) : !statesGeo ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ...analyticsBodySx, py: 1, fontSize: '0.8125rem' }}
          >
            Loading map…
          </Typography>
        ) : (
          <ComposableMap
            projection="geoAlbers"
            projectionConfig={{
              // Positive rotate — negative values pushed CONUS off-canvas (blank map).
              rotate: [96.5, 0],
              parallels: [29.5, 45.5],
              scale: 1070,
            }}
            width={800}
            height={500}
            preserveAspectRatio="xMidYMid meet"
            style={{ width: '100%', height: '100%', background: 'transparent' }}
          >
            <Geographies geography={statesGeo}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const fips = String(geo.id).padStart(2, '0')
                  if (HIDDEN_FIPS.has(fips)) return null

                  const row = exposureByFips[fips]
                  const level: ExposureLevel = row?.level ?? 'none'
                  const units = row?.units ?? 0
                  const name =
                    (geo.properties as { name?: string } | undefined)?.name ??
                    row?.state ??
                    fips
                  const isHovered = hovered?.fips === fips
                  const fill = isHovered ? fills.hover[level] : fills.idle[level]

                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={STROKE_WIDTH}
                      style={{ outline: 'none', cursor: 'default', transition: 'fill 120ms ease' }}
                      onMouseEnter={(event) => {
                        const rect = (event.currentTarget.ownerSVGElement as SVGSVGElement | null)
                          ?.parentElement
                          ?.getBoundingClientRect()
                        const x = event.clientX - (rect?.left ?? 0)
                        const y = event.clientY - (rect?.top ?? 0)
                        setHovered({ fips, name, units, level, x, y })
                      }}
                      onMouseMove={(event) => {
                        const rect = (event.currentTarget.ownerSVGElement as SVGSVGElement | null)
                          ?.parentElement
                          ?.getBoundingClientRect()
                        const x = event.clientX - (rect?.left ?? 0)
                        const y = event.clientY - (rect?.top ?? 0)
                        setHovered({ fips, name, units, level, x, y })
                      }}
                      onMouseLeave={() => setHovered(null)}
                      onClick={() => {
                        // Optional no-op — reserved for future drill-in.
                      }}
                    />
                  )
                })
              }
            </Geographies>

            {Object.entries(exposureByFips).map(([fips, row]) => {
              const coords = STATE_LABEL_COORDS[fips]
              if (!coords || row.units <= 0) return null
              return (
                <Annotation
                  key={`label-${fips}`}
                  subject={coords}
                  dx={0}
                  dy={0}
                  connectorProps={{ stroke: 'none', strokeWidth: 0 }}
                >
                  <text
                    textAnchor="middle"
                    alignmentBaseline="middle"
                    style={{
                      fontFamily: figmaFontFamilyStack.body,
                      fontSize: 11,
                      fontWeight: 600,
                      fill: '#FFFFFF',
                      pointerEvents: 'none',
                    }}
                  >
                    {row.state}
                  </text>
                </Annotation>
              )
            })}
          </ComposableMap>
        )}

        {hovered ? (
          <Box
            role="tooltip"
            sx={{
              position: 'absolute',
              left: Math.min(Math.max(hovered.x + 12, 8), 240),
              top: Math.min(Math.max(hovered.y + 12, 8), height - 48),
              px: 1.25,
              py: 0.75,
              borderRadius: 1,
              bgcolor: 'background.paper',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: isDarkMode(theme)
                ? '0 4px 16px rgba(0,0,0,0.45)'
                : '0 4px 12px rgba(0,0,0,0.08)',
              pointerEvents: 'none',
              zIndex: 2,
              maxWidth: 220,
              color: 'text.primary',
            }}
          >
            <Typography
              variant="body2"
              sx={{ ...analyticsBodySx, fontSize: '0.75rem', fontWeight: 600, color: 'text.primary' }}
            >
              {hovered.name} · {hovered.units} units · {LEVEL_LABEL[hovered.level]}
            </Typography>
          </Box>
        ) : null}
      </Box>
    </Stack>
  )
}

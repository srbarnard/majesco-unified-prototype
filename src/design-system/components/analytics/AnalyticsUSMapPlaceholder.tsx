import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { analyticsBodySx, type AnalyticsStateValue } from '@/design-system/components/analytics/analyticsStyles'
import { figmaPalette } from '@/design-system/tokens/figma-palette'
import { surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { useTheme } from '@mui/material/styles'

type AnalyticsUSMapPlaceholderProps = {
  states: AnalyticsStateValue[]
  height?: number
  ariaLabel?: string
}

function heatColor(value: number, max: number) {
  const ratio = value / Math.max(max, 1)
  if (ratio >= 0.85) return figmaPalette.red[500]
  if (ratio >= 0.55) return figmaPalette.amber[600]
  if (ratio >= 0.25) return figmaPalette.yellow[400]
  return figmaPalette.yellow[100]
}

// Simplified continental US blocks for prototype choropleth styling.
const stateBlocks: Array<{ code: string; x: number; y: number; w: number; h: number }> = [
  { code: 'WA', x: 48, y: 18, w: 28, h: 24 },
  { code: 'OR', x: 48, y: 46, w: 28, h: 28 },
  { code: 'CA', x: 40, y: 78, w: 34, h: 72 },
  { code: 'NV', x: 78, y: 72, w: 28, h: 34 },
  { code: 'AZ', x: 88, y: 110, w: 28, h: 34 },
  { code: 'TX', x: 150, y: 132, w: 56, h: 48 },
  { code: 'FL', x: 248, y: 168, w: 34, h: 34 },
  { code: 'NY', x: 286, y: 58, w: 28, h: 24 },
  { code: 'ME', x: 318, y: 24, w: 24, h: 28 },
  { code: 'IL', x: 210, y: 82, w: 28, h: 24 },
  { code: 'CO', x: 132, y: 82, w: 34, h: 28 },
  { code: 'GA', x: 248, y: 132, w: 28, h: 24 },
  { code: 'NC', x: 268, y: 108, w: 34, h: 22 },
  { code: 'OH', x: 248, y: 78, w: 28, h: 22 },
  { code: 'PA', x: 278, y: 72, w: 28, h: 22 },
  { code: 'MI', x: 238, y: 52, w: 28, h: 28 },
  { code: 'MN', x: 198, y: 34, w: 34, h: 28 },
  { code: 'MO', x: 198, y: 96, w: 34, h: 24 },
  { code: 'TN', x: 228, y: 112, w: 34, h: 20 },
  { code: 'LA', x: 198, y: 148, w: 28, h: 22 },
]

export function AnalyticsUSMapPlaceholder({ states, height = 280, ariaLabel = 'Geographic map' }: AnalyticsUSMapPlaceholderProps) {
  const theme = useTheme()
  const mapBackground = surfaceMuted(theme)
  const valueByCode = Object.fromEntries(states.map((state) => [state.code, state.value]))
  const maxValue = Math.max(...states.map((state) => state.value), 1)

  return (
    <Stack spacing={1.5} sx={{ height: '100%' }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="flex-end">
        {['Low', 'Medium', 'High'].map((label, index) => (
          <Stack key={label} direction="row" spacing={0.5} alignItems="center">
            <Box
              sx={{
                width: 12,
                height: 12,
                borderRadius: 0.5,
                bgcolor: [figmaPalette.yellow[100], figmaPalette.amber[600], figmaPalette.red[500]][index],
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={analyticsBodySx}>
              {label}
            </Typography>
          </Stack>
        ))}
      </Stack>
      <Box
        component="svg"
        viewBox="0 0 360 220"
        sx={{ width: '100%', height, minHeight: height, display: 'block' }}
        role="img"
        aria-label={ariaLabel}
      >
        <rect x="0" y="0" width="360" height="220" fill={mapBackground} rx="8" />
        {stateBlocks.map((block) => {
          const value = valueByCode[block.code] ?? 0
          return (
            <rect
              key={block.code}
              x={block.x}
              y={block.y}
              width={block.w}
              height={block.h}
              rx="3"
              fill={heatColor(value, maxValue)}
              stroke="#fff"
              strokeWidth="1.5"
            />
          )
        })}
      </Box>
    </Stack>
  )
}

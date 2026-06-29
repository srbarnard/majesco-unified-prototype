import Box from '@mui/material/Box'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
} from 'recharts'
import { figmaPalette } from '@/design-system/tokens/figma-palette'
import type { AnalyticsTimeSeriesPoint } from '@/design-system/components/analytics/analyticsStyles'

type AnalyticsSparklineProps = {
  data: AnalyticsTimeSeriesPoint[]
  height?: number
  color?: string
}

export function AnalyticsSparkline({
  data,
  height = 56,
  color = figmaPalette.teal[500],
}: AnalyticsSparklineProps) {
  const fillColor = figmaPalette.teal[100]

  return (
    <Box sx={{ width: '100%', height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="sparklineFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity={0.9} />
              <stop offset="100%" stopColor={fillColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.75}
            fill="url(#sparklineFill)"
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  )
}

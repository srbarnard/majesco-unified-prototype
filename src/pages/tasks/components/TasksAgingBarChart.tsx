import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  analyticsBodySx,
  getAnalyticsChartAxisStyle,
  getAnalyticsChartGridStroke,
} from '@/design-system/components/analytics/analyticsStyles'
import { useTheme } from '@mui/material/styles'
import type { TasksAgingBucket } from '@/pages/tasks/analytics/tasksAnalyticsData'

type TasksAgingBarChartProps = {
  data: TasksAgingBucket[]
  height?: number
}

function AgingTooltip({
  active,
  payload,
}: {
  active?: boolean
  payload?: Array<{ payload?: TasksAgingBucket }>
}) {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  if (!item) return null

  return (
    <Box
      sx={(theme) => ({
        px: 1.25,
        py: 0.75,
        borderRadius: 1,
        bgcolor: 'background.paper',
        border: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      })}
    >
      <Typography variant="body2" sx={{ ...analyticsBodySx, fontWeight: 600 }}>
        {item.label}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={analyticsBodySx}>
        Avg age: {item.value.toFixed(1)} days
      </Typography>
    </Box>
  )
}

export function TasksAgingBarChart({ data, height = 280 }: TasksAgingBarChartProps) {
  const theme = useTheme()
  const axisStyle = getAnalyticsChartAxisStyle(theme)
  const gridStroke = getAnalyticsChartGridStroke(theme)
  const sorted = [...data].sort((a, b) => b.value - a.value)

  return (
    <Box sx={{ width: '100%', height, minHeight: height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            domain={[0, 'auto']}
            tickFormatter={(value) => `${value}d`}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={axisStyle}
            tickLine={false}
            axisLine={false}
            width={148}
          />
          <Tooltip
            content={({ active, payload }) => (
              <AgingTooltip
                active={active}
                payload={payload as unknown as Array<{ payload?: TasksAgingBucket }> | undefined}
              />
            )}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={18}>
            {sorted.map((entry) => (
              <Cell key={entry.label} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Box>
  )
}

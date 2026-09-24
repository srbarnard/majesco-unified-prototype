import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'
import { getPriorityIndicatorColor } from '@/pages/tasks/utils/taskDisplayUtils'

type TaskPriorityIndicatorProps = {
  priority: TaskRecord['priority']
  showLabel?: boolean
  /** `card` matches homepage priority task cards (`0.6875rem`). */
  size?: 'default' | 'card'
}

/** Subtle priority dot using the same color family as StatusChip variants. */
export function TaskPriorityIndicator({ priority, showLabel = true, size = 'default' }: TaskPriorityIndicatorProps) {
  const fontSize = size === 'card' ? '0.6875rem' : '0.8125rem'

  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ py: size === 'card' ? 0 : 0.25, minWidth: 0 }}>
      <Box
        sx={(theme) => ({
          width: 8,
          height: 8,
          borderRadius: '50%',
          flexShrink: 0,
          bgcolor: getPriorityIndicatorColor(theme, priority),
        })}
      />
      {showLabel && (
        <Typography
          variant={size === 'card' ? 'caption' : 'body2'}
          sx={{
            fontFamily: figmaFontFamilyStack.body,
            fontSize,
            ...(size === 'card' ? { color: 'text.secondary' } : null),
          }}
        >
          {priority}
        </Typography>
      )}
    </Stack>
  )
}

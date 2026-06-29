import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
import type { TaskRecord } from '@/pages/tasks/data/mockTasks'
import { getPriorityIndicatorColor } from '@/pages/tasks/utils/taskDisplayUtils'

type TaskPriorityIndicatorProps = {
  priority: TaskRecord['priority']
  showLabel?: boolean
}

/** Subtle priority dot using the same color family as StatusChip variants. */
export function TaskPriorityIndicator({ priority, showLabel = true }: TaskPriorityIndicatorProps) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ py: 0.25, minWidth: 0 }}>
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
        <Typography variant="body2" sx={{ fontFamily: figmaFontFamilyStack.body, fontSize: '0.8125rem' }}>
          {priority}
        </Typography>
      )}
    </Stack>
  )
}

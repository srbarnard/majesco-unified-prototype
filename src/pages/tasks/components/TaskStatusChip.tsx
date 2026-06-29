import { StatusChip } from '@/design-system/components'
import { getTaskStatusChipVariant } from '@/pages/tasks/utils/taskDisplayUtils'

type TaskStatusChipProps = {
  displayStatus: string
}

export function TaskStatusChip({ displayStatus }: TaskStatusChipProps) {
  return <StatusChip label={displayStatus} status={getTaskStatusChipVariant(displayStatus)} />
}

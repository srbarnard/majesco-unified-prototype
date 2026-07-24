import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import type { MouseEvent } from 'react'
import { StatusChip } from '@/design-system/components'
import type { SubmissionStatus } from '@/pages/submissions/data/mockSubmissions'

type SubmissionStatusChipProps = {
  status: SubmissionStatus
  onClick?: () => void
  selected?: boolean
}

export function SubmissionStatusChip({ status, onClick, selected = false }: SubmissionStatusChipProps) {
  const interactive = Boolean(onClick)

  const commonProps = {
    onClick: onClick
      ? (event: MouseEvent) => {
          event.stopPropagation()
          onClick()
        }
      : undefined,
    onMouseDown: interactive
      ? (event: MouseEvent) => {
          event.stopPropagation()
        }
      : undefined,
    clickable: interactive,
    'aria-pressed': interactive ? selected : undefined,
    'aria-label': interactive
      ? `${status} — ${selected ? 'Copilot open' : 'Open Copilot'}`
      : undefined,
    sx: {
      cursor: interactive ? 'pointer' : undefined,
      outline: selected ? '2px solid' : undefined,
      outlineColor: selected ? 'primary.main' : undefined,
      outlineOffset: selected ? 1 : undefined,
    },
  } as const

  if (status === 'Ready') {
    return (
      <StatusChip
        status="success"
        label="Ready"
        icon={<CheckCircleIcon sx={{ fontSize: '16px !important' }} />}
        {...commonProps}
      />
    )
  }

  return (
    <StatusChip
      status="error"
      label="Blocked"
      icon={<BlockIcon sx={{ fontSize: '16px !important' }} />}
      {...commonProps}
    />
  )
}

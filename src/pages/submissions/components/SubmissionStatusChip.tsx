import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { keyframes } from '@mui/material/styles'
import type { MouseEvent } from 'react'
import { StatusChip } from '@/design-system/components'
import type { SubmissionStatus } from '@/pages/submissions/data/mockSubmissions'

/** Elastic pop — same spring curve family as CopilotConfidenceIndicator. */
const statusChipHoverBounce = keyframes`
  0% { transform: scale(1); }
  45% { transform: scale(1.18); }
  62% { transform: scale(1.06); }
  78% { transform: scale(1.14); }
  90% { transform: scale(1.09); }
  100% { transform: scale(1.11); }
`

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
      ...(interactive
        ? {
            position: 'relative' as const,
            transform: 'scale(1)',
            transformOrigin: 'center center',
            transition:
              'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease, box-shadow 0.25s ease',
            '@media (hover: hover)': {
              '&:hover': {
                animation: `${statusChipHoverBounce} 0.65s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                filter: 'brightness(1.06)',
                boxShadow: (theme: { palette: { mode: string } }) =>
                  theme.palette.mode === 'dark'
                    ? '0 4px 14px rgba(0, 0, 0, 0.45)'
                    : '0 4px 12px rgba(15, 23, 42, 0.18)',
                zIndex: 1,
              },
            },
            '&:active': {
              animation: 'none',
              transform: 'scale(0.94)',
              transition: 'transform 0.12s ease',
              filter: 'brightness(0.98)',
              boxShadow: 'none',
            },
          }
        : {}),
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

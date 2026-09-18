import BlockIcon from '@mui/icons-material/Block'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import FormatQuoteIcon from '@mui/icons-material/FormatQuote'
import { keyframes } from '@mui/material/styles'
import type { MouseEvent } from 'react'
import { StatusChip } from '@/design-system/components'
import { FormatQuoteOffIcon } from '@/design-system/icons/FormatQuoteOff'
import type { SubmissionStatus } from '@/pages/submissions/data/mockSubmissions'

/** Soft elastic hover — lighter than Copilot confidence ring. */
const statusChipHoverBounce = keyframes`
  0% { transform: scale(1); }
  55% { transform: scale(1.07); }
  78% { transform: scale(1.03); }
  100% { transform: scale(1.05); }
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
      ...(interactive
        ? {
            position: 'relative' as const,
            transform: 'scale(1)',
            transformOrigin: 'center center',
            transition: 'transform 0.35s cubic-bezier(0.34, 1.4, 0.64, 1), filter 0.2s ease',
            '@media (hover: hover)': {
              '&:hover': {
                animation: `${statusChipHoverBounce} 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) forwards`,
                filter: 'brightness(1.05)',
                zIndex: 1,
              },
            },
            '&:active': {
              animation: 'none',
              transform: 'scale(0.97)',
              transition: 'transform 0.1s ease',
              filter: 'brightness(0.98)',
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

  if (status === 'Quoted') {
    return (
      <StatusChip
        status="info"
        label="Quoted"
        icon={<FormatQuoteIcon sx={{ fontSize: '16px !important' }} />}
        {...commonProps}
      />
    )
  }

  if (status === 'Declined') {
    return (
      <StatusChip
        status="warning"
        label="Declined"
        icon={<FormatQuoteOffIcon sx={{ fontSize: '16px !important' }} />}
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

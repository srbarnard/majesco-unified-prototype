import MuiChip, { type ChipProps as MuiChipProps } from '@mui/material/Chip'

export type ChipProps = MuiChipProps

export type StatusChipProps = Omit<ChipProps, 'color'> & {
  status: 'success' | 'warning' | 'error' | 'info' | 'default'
}

const statusColorMap = {
  success: 'success',
  warning: 'warning',
  error: 'error',
  info: 'info',
  default: 'default',
} as const satisfies Record<StatusChipProps['status'], ChipProps['color']>

/** Semantic status chip using Figma palette tones. */
export function StatusChip({ status, ...props }: StatusChipProps) {
  return (
    <MuiChip
      size="small"
      variant="filled"
      color={statusColorMap[status]}
      {...props}
    />
  )
}

export function Chip(props: ChipProps) {
  return <MuiChip {...props} />
}

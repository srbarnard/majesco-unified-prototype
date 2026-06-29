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

/** Shared chip sizing from quote / list status patterns. */
export const statusChipSx = {
  borderRadius: '30px',
  fontWeight: 500,
  fontSize: '0.75rem',
  height: 24,
  border: 'none',
  fontFamily: 'inherit',
} as const

/** Semantic status chip using Figma palette tones. */
export function StatusChip({ status, ...props }: StatusChipProps) {
  return (
    <MuiChip
      size="small"
      variant="filled"
      color={statusColorMap[status]}
      sx={statusChipSx}
      {...props}
    />
  )
}

export function Chip(props: ChipProps) {
  return <MuiChip {...props} />
}

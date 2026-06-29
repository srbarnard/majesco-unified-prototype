import MuiButton, { type ButtonProps as MuiButtonProps } from '@mui/material/Button'

export type ButtonProps = MuiButtonProps

/** Majesco-themed button — uses theme defaults (no elevation, brand radius). */
export function Button({ disableElevation = true, ...props }: ButtonProps) {
  return <MuiButton disableElevation={disableElevation} {...props} />
}

import CardActions from '@mui/material/CardActions'
import MuiCard, { type CardProps as MuiCardProps } from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import type { ReactNode } from 'react'

export type CardProps = MuiCardProps & {
  title?: string
  subtitle?: string
  actions?: ReactNode
  headerAction?: ReactNode
}

/** Majesco card with optional header and actions. */
export function Card({
  title,
  subtitle,
  actions,
  headerAction,
  children,
  ...props
}: CardProps) {
  const hasHeader = Boolean(title || subtitle)

  return (
    <MuiCard {...props}>
      {hasHeader && (
        <CardHeader
          title={title}
          subheader={subtitle}
          action={headerAction}
        />
      )}
      <CardContent sx={hasHeader ? { pt: 0 } : undefined}>{children}</CardContent>
      {actions && <CardActions>{actions}</CardActions>}
    </MuiCard>
  )
}

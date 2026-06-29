import type { MouseEvent, ReactNode } from 'react'
import Link from '@mui/material/Link'
import type { SxProps, Theme } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router'
import { tableLinkSx } from './DataTable'

type ListDataGridLinkProps = {
  to: string
  children: ReactNode
  sx?: SxProps<Theme>
  variant?: 'body2' | 'caption'
  fontWeight?: number
}

function stopGridNavigation(event: MouseEvent) {
  event.stopPropagation()
}

export function ListDataGridLink({
  to,
  children,
  sx,
  variant = 'body2',
  fontWeight = 400,
}: ListDataGridLinkProps) {
  return (
    <Link
      component={RouterLink}
      to={to}
      variant={variant}
      underline="hover"
      onClick={stopGridNavigation}
      onMouseDown={stopGridNavigation}
      sx={[
        tableLinkSx,
        { fontWeight, textAlign: 'left', py: 0.25 },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Link>
  )
}

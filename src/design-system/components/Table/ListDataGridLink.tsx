import type { MouseEvent, ReactNode } from 'react'
import Link from '@mui/material/Link'
import type { SxProps, Theme } from '@mui/material/styles'
import { Link as RouterLink } from 'react-router'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'
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
        {
          fontFamily: figmaFontFamilyStack.body,
          fontSize: '0.8125rem',
          fontWeight,
          textAlign: 'left',
          py: 0.25,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      {children}
    </Link>
  )
}

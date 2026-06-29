import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import type { SxProps, Theme } from '@mui/material/styles'
import { analyticsCardSx, analyticsHeadingSx } from '@/design-system/components/analytics/analyticsStyles'

type AnalyticsCardProps = {
  title?: string
  children: ReactNode
  header?: ReactNode
  sx?: SxProps<Theme>
  contentSx?: SxProps<Theme>
}

export function AnalyticsCard({ title, children, header, sx, contentSx }: AnalyticsCardProps) {
  return (
    <Box sx={[(theme) => analyticsCardSx(theme), ...(Array.isArray(sx) ? sx : sx ? [sx] : [])]}>
      {(title || header) && (
        <Box sx={{ px: 2.5, pt: 2, pb: header ? 1 : 0.5, flexShrink: 0 }}>
          {header ?? (
            <Typography variant="subtitle2" sx={{ ...analyticsHeadingSx, fontSize: '0.9375rem' }}>
              {title}
            </Typography>
          )}
        </Box>
      )}
      <Box sx={{ flex: 1, minHeight: 0, px: 2, pb: 2, pt: title || header ? 0 : 2, ...contentSx as object }}>
        {children}
      </Box>
    </Box>
  )
}

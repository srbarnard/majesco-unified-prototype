import CloseIcon from '@mui/icons-material/Close'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import { alpha, type SxProps, type Theme } from '@mui/material/styles'
import type { ReactNode } from 'react'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

/** Info alert: 1px blue-grey border, pale fill, icon + message + optional dismiss. */
export function InfoBanner({
  children,
  onDismiss,
  dismissLabel = 'Dismiss',
  sx,
}: {
  children: ReactNode
  onDismiss?: () => void
  dismissLabel?: string
  sx?: SxProps<Theme>
}) {
  return (
    <Box
      role="status"
      sx={[
        (theme) => {
          const isLight = theme.palette.mode === 'light'
          const blue = theme.figmaPalette.blue
          return {
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pl: 1.5,
            pr: onDismiss ? 0.5 : 1.5,
            py: onDismiss ? 0.25 : 0.75,
            border: 1,
            borderColor: isLight ? blue[200] : alpha(blue[300], 0.4),
            borderRadius: 1,
            bgcolor: isLight ? blue[50] : alpha(blue[900], 0.24),
            color: 'text.primary',
          }
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <InfoOutlinedIcon
        sx={(theme) => ({
          fontSize: 18,
          flexShrink: 0,
          color: theme.palette.mode === 'light' ? theme.figmaPalette.blue[700] : theme.figmaPalette.blue[200],
        })}
      />
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          fontFamily: figmaFontFamilyStack.body,
          fontSize: '0.8125rem',
          lineHeight: 1.5,
        }}
      >
        {children}
      </Box>
      {onDismiss ? (
        <IconButton size="small" onClick={onDismiss} aria-label={dismissLabel} sx={{ color: 'text.secondary' }}>
          <CloseIcon sx={{ fontSize: 16 }} />
        </IconButton>
      ) : null}
    </Box>
  )
}

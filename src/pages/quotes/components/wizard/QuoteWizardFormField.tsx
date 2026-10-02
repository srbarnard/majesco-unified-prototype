import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { accentSubtle, isDarkMode, surfaceMuted } from '@/design-system/theme/themeSurfaces'
import { layoutTokens } from '@/design-system/tokens/layout'
import { figmaFontFamilyStack } from '@/design-system/tokens/figma-typography'

const bodySx = {
  fontFamily: figmaFontFamilyStack.body,
  fontWeight: 400,
} as const

type QuoteWizardFormFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  helperText?: string
  placeholder?: string
  aiFilled?: boolean
  fullWidth?: boolean
  multiline?: boolean
  minRows?: number
  maxRows?: number
  type?: string
  endAdornment?: ReactNode
  autoFocus?: boolean
  disabled?: boolean
}

export function QuoteWizardFormField({
  label,
  value,
  onChange,
  helperText,
  placeholder,
  aiFilled = false,
  fullWidth = false,
  multiline = false,
  minRows = 2,
  maxRows,
  type = 'text',
  endAdornment,
  autoFocus = false,
  disabled = false,
}: QuoteWizardFormFieldProps) {
  return (
    <Box sx={{ gridColumn: fullWidth ? '1 / -1' : undefined }}>
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mb: 0.5 }}>
        <Typography variant="caption" sx={{ ...bodySx, fontWeight: 500, color: 'text.primary' }}>
          {label}
        </Typography>
        {aiFilled && value && (
          <CheckCircleIcon sx={{ fontSize: 14, color: 'success.main' }} aria-label="Pre-filled" />
        )}
      </Stack>
      <TextField
        fullWidth
        size="small"
        value={value}
        disabled={disabled}
        type={type}
        multiline={multiline}
        minRows={multiline ? minRows : undefined}
        maxRows={multiline ? maxRows : undefined}
        placeholder={placeholder}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        slotProps={{
          input: {
            readOnly: disabled,
            endAdornment,
            sx: {
              ...bodySx,
              fontSize: '0.875rem',
              bgcolor: 'background.paper',
            },
          },
        }}
      />
      {helperText && (
        <Typography variant="caption" color="text.secondary" sx={{ ...bodySx, display: 'block', mt: 0.5 }}>
          {helperText}
        </Typography>
      )}
    </Box>
  )
}

export function QuoteWizardFormCard({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={(theme) => ({
        borderRadius: `${layoutTokens.cardRadius}px`,
        bgcolor: isDarkMode(theme) ? surfaceMuted(theme) : accentSubtle(theme),
        border: 'none',
        px: 2,
        py: 2,
        mb: 3,
      })}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  )
}

export function QuoteWizardStepHeading({ children }: { children: ReactNode }) {
  return (
    <Typography
      component="h2"
      sx={{
        fontFamily: figmaFontFamilyStack.heading,
        fontWeight: 500,
        fontSize: { xs: '1.375rem', md: '1.5rem' },
        lineHeight: 1.35,
        color: 'secondary.main',
        textTransform: 'none',
        letterSpacing: 'normal',
        mb: 2,
      }}
    >
      {children}
    </Typography>
  )
}
